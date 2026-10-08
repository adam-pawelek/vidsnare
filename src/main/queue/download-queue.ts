import { randomUUID } from 'node:crypto'
import { access, rm } from 'node:fs/promises'
import { join } from 'node:path'
import type { DownloadOptions } from '@shared/download'
import type { AppError } from '@shared/errors'
import { FINISHED_STATUSES, type DownloadJob, type QueueItem } from '@shared/queue'
import { classifyError, classifySpawnError } from '../core/errors'
import { filenameBudget, renderFilename } from '../core/filename'
import { parseLine, ProgressTracker } from '../core/progress'
import type { Runner } from '../core/runner'
import { buildDownloadArgs, type ToolPaths } from '../core/ytdlp-args'

export interface QueueTools extends ToolPaths {
  ytdlp: string | null
}

export interface QueueDeps {
  run: Runner
  tools: () => Promise<QueueTools>
  /** Partial files live in `<tempRoot>/<job id>` until finished. */
  tempRoot: string
  maxConcurrent: () => number
  /** yt-dlp archive, when "skip already downloaded" is on. */
  archiveFile: () => string | undefined
  /** Called whenever any job changes (including progress). */
  onChange?: () => void
  /** Called once when a job reaches a final state. */
  onFinished?: (job: DownloadJob) => void
  fileExists?: (path: string) => Promise<boolean>
  now?: () => number
  newId?: () => string
}

export interface NewJob {
  item: QueueItem
  options: DownloadOptions
  outputDir: string
  filenameTemplate: string
  playlistCount: number | null
}

interface Runtime {
  controller: AbortController
}

const defaultExists = (path: string): Promise<boolean> =>
  access(path).then(
    () => true,
    () => false
  )

/** The extension the finished file will have. */
export function finalExtension(options: DownloadOptions): string {
  return options.kind === 'audio' ? options.audioFormat : options.container
}

export class DownloadQueue {
  private readonly jobs: DownloadJob[] = []
  private readonly specs = new Map<string, NewJob>()
  private readonly running = new Map<string, Runtime>()
  /** Final paths claimed by running jobs, so two jobs never write the same file. */
  private readonly reserved = new Set<string>()
  private readonly exists: (path: string) => Promise<boolean>
  private readonly now: () => number
  private readonly newId: () => string

  constructor(private readonly deps: QueueDeps) {
    this.exists = deps.fileExists ?? defaultExists
    this.now = deps.now ?? Date.now
    this.newId = deps.newId ?? randomUUID
  }

  list(): DownloadJob[] {
    return this.jobs.map((job) => ({ ...job }))
  }

  get(id: string): DownloadJob | undefined {
    return this.jobs.find((job) => job.id === id)
  }

  /** True while any download is waiting or running. */
  hasUnfinished(): boolean {
    return this.jobs.some((job) => !FINISHED_STATUSES.includes(job.status))
  }

  add(newJobs: NewJob[]): DownloadJob[] {
    const added = newJobs.map((spec) => {
      const job: DownloadJob = {
        id: this.newId(),
        videoId: spec.item.videoId,
        title: spec.item.title,
        channel: spec.item.channel,
        thumbnail: spec.item.thumbnail,
        duration: spec.item.duration,
        options: spec.options,
        outputDir: spec.outputDir,
        status: 'queued',
        progress: null,
        error: null,
        filePath: null,
        addedAt: this.now(),
        finishedAt: null
      }
      this.specs.set(job.id, spec)
      this.jobs.push(job)
      return job
    })
    this.changed()
    this.pump()
    return added
  }

  cancel(id: string): void {
    const job = this.get(id)
    if (!job || FINISHED_STATUSES.includes(job.status)) return
    const runtime = this.running.get(id)
    if (runtime) {
      // The run finishes asynchronously and records the cancellation.
      runtime.controller.abort()
    } else {
      this.finish(job, 'cancelled', { code: 'CANCELLED', retryable: true, detail: '' })
    }
  }

  cancelAll(): void {
    for (const job of [...this.jobs]) this.cancel(job.id)
  }

  retry(id: string): void {
    const job = this.get(id)
    if (!job || !['failed', 'cancelled'].includes(job.status)) return
    Object.assign(job, { status: 'queued', progress: null, error: null, filePath: null, finishedAt: null })
    this.changed()
    this.pump()
  }

  /** Retries every job that failed with one of `codes` (e.g. after an engine update). */
  retryFailed(codes: AppError['code'][]): number {
    const failed = this.jobs.filter((job) => job.status === 'failed' && job.error && codes.includes(job.error.code))
    for (const job of failed) this.retry(job.id)
    return failed.length
  }

  remove(id: string): void {
    const index = this.jobs.findIndex((job) => job.id === id)
    if (index < 0 || !FINISHED_STATUSES.includes(this.jobs[index]!.status)) return
    this.jobs.splice(index, 1)
    this.specs.delete(id)
    this.changed()
  }

  clearFinished(): void {
    for (let i = this.jobs.length - 1; i >= 0; i--) {
      const job = this.jobs[i]!
      if (FINISHED_STATUSES.includes(job.status)) {
        this.jobs.splice(i, 1)
        this.specs.delete(job.id)
      }
    }
    this.changed()
  }

  /** Starts waiting jobs while there is room. Call again when the limit changes. */
  pump(): void {
    const limit = Math.max(1, this.deps.maxConcurrent())
    for (const job of this.jobs) {
      if (this.running.size >= limit) break
      if (job.status === 'queued' && !this.running.has(job.id)) void this.start(job)
    }
  }

  /** Stops everything; used when the app quits. Resolves once processes are gone. */
  async shutdown(): Promise<void> {
    const pending = [...this.running.keys()]
    this.cancelAll()
    await Promise.all(pending.map((id) => this.waitFor(id)))
  }

  private waitFor(id: string): Promise<void> {
    return new Promise((resolve) => {
      const check = (): void => (this.running.has(id) ? void setTimeout(check, 20) : resolve())
      check()
    })
  }

  private async start(job: DownloadJob): Promise<void> {
    const spec = this.specs.get(job.id)!
    const runtime: Runtime = { controller: new AbortController() }
    this.running.set(job.id, runtime)
    Object.assign(job, { status: 'downloading', progress: null, error: null })
    this.changed()

    const tempDir = join(this.deps.tempRoot, job.id)
    let finalPath: string | null = null
    try {
      const tools = await this.deps.tools()
      if (!tools.ytdlp) {
        this.finish(job, 'failed', { code: 'TOOL_MISSING', retryable: false, detail: 'yt-dlp not found' })
        return
      }

      const ext = finalExtension(job.options)
      // uniqueBase reserves the name; it is released in `finally`.
      const base = await this.uniqueBase(job, spec, ext)
      finalPath = join(job.outputDir, `${base}.${ext}`)

      const twoStreams = job.options.kind === 'video'
      const tracker = new ProgressTracker(twoStreams ? [null, null] : [null])
      let reportedPath: string | null = null
      let archived = false

      const args = buildDownloadArgs({
        url: `https://www.youtube.com/watch?v=${job.videoId}`,
        outputDir: job.outputDir,
        fileBase: base,
        options: job.options,
        tools: { ffmpeg: tools.ffmpeg, deno: tools.deno },
        archiveFile: this.deps.archiveFile(),
        tempDir
      })

      const result = await this.deps.run(tools.ytdlp, args, {
        signal: runtime.controller.signal,
        onLine: (line) => {
          const event = parseLine(line)
          if (!event) return
          if (event.type === 'file') reportedPath = event.path
          else if (event.type === 'archived') archived = true
          else if (event.type === 'download' || event.type === 'postprocess') {
            const snapshot = tracker.update(event)
            job.status = snapshot.phase === 'processing' ? 'processing' : 'downloading'
            job.progress = {
              fraction: snapshot.fraction,
              downloadedBytes: snapshot.downloadedBytes,
              totalBytes: snapshot.totalBytes,
              speed: snapshot.speed,
              eta: snapshot.eta
            }
            this.changed()
          }
        }
      })

      if (result.cancelled) {
        this.finish(job, 'cancelled', { code: 'CANCELLED', retryable: true, detail: '' })
      } else if (result.code === 0 && archived && !reportedPath) {
        this.finish(job, 'skipped', null)
      } else if (result.code === 0) {
        job.filePath = reportedPath ?? finalPath
        this.finish(job, 'completed', null)
      } else {
        this.finish(job, 'failed', classifyError(result.stderr || result.stdout))
      }
    } catch (error) {
      this.finish(job, 'failed', classifySpawnError(error as NodeJS.ErrnoException))
    } finally {
      if (finalPath) this.reserved.delete(finalPath)
      this.running.delete(job.id)
      await rm(tempDir, { recursive: true, force: true }).catch(() => {})
      this.pump()
    }
  }

  /** A file name in the output folder that neither exists nor is claimed by another job. */
  private async uniqueBase(job: DownloadJob, spec: NewJob, ext: string): Promise<string> {
    const budget = filenameBudget(job.outputDir) - 4 // room for " (9)"
    const base = renderFilename(
      spec.filenameTemplate,
      {
        title: job.title,
        id: job.videoId,
        channel: job.channel ?? undefined,
        uploadDate: spec.item.uploadDate ?? undefined,
        playlistIndex: spec.item.index ?? undefined,
        playlistCount: spec.playlistCount ?? undefined
      },
      budget
    )
    for (let n = 1; n < 1000; n++) {
      const candidate = n === 1 ? base : `${base} (${n})`
      const path = join(job.outputDir, `${candidate}.${ext}`)
      if (this.reserved.has(path)) continue
      // Claim the name before the (async) disk check, so a job starting at the
      // same moment can't pick it too.
      this.reserved.add(path)
      if (!(await this.exists(path))) return candidate
      this.reserved.delete(path)
    }
    const fallback = `${base} (${this.newId().slice(0, 8)})`
    this.reserved.add(join(job.outputDir, `${fallback}.${ext}`))
    return fallback
  }

  private finish(job: DownloadJob, status: DownloadJob['status'], error: AppError | null): void {
    job.status = status
    job.error = error
    job.finishedAt = this.now()
    if (status === 'completed' && job.progress) job.progress = { ...job.progress, fraction: 1, speed: null, eta: null }
    this.changed()
    this.deps.onFinished?.({ ...job })
  }

  private changed(): void {
    this.deps.onChange?.()
  }
}
