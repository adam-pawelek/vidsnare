import { randomBytes } from 'node:crypto'
import { constants } from 'node:fs'
import { access, chmod, mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { delimiter, dirname, join } from 'node:path'
import { unzipSync } from 'fflate'
import type { Http } from './http'
import { bundledPath, executableName, VERSION_ARGS, type Target, type ToolName, type UpdatableTool } from './platform'
import { latestRelease } from './releases'
import { compareVersions, parseVersionOutput } from './versions'

export type ToolSource = 'updated' | 'bundled' | 'system'

export interface ToolInfo {
  name: ToolName
  path: string
  version: string
  source: ToolSource
}

export type ResolvedTools = Record<ToolName, ToolInfo | null>

export type UpdateResult =
  | { status: 'up-to-date'; version: string | null }
  | { status: 'updated'; version: string; previous: string | null }

/** Runs `path args…` and returns stdout, or null if it can't be run. */
export type Probe = (path: string, args: string[]) => Promise<string | null>

interface Manifest {
  tools: Partial<Record<UpdatableTool, { version: string; file: string }>>
  lastCheck?: number
}

export interface ToolManagerOptions {
  /** Binaries shipped with the app (read-only). */
  bundledDir: string
  /** Writable folder for downloaded updates. */
  dataDir: string
  target: Target
  http: Http
  probe: Probe
  /** Search PATH as a last resort (handy in development). */
  allowSystem?: boolean
  env?: NodeJS.ProcessEnv
}

const MANIFEST = 'tools.json'

export class ToolManager {
  private resolved: Promise<ResolvedTools> | null = null
  private readonly updating = new Map<UpdatableTool, Promise<UpdateResult>>()

  constructor(private readonly opts: ToolManagerOptions) {}

  /** Finds the best working copy of every tool. Cached until something changes. */
  resolve(): Promise<ResolvedTools> {
    this.resolved ??= (async () => ({
      'yt-dlp': await this.resolveTool('yt-dlp'),
      ffmpeg: await this.resolveTool('ffmpeg'),
      deno: await this.resolveTool('deno')
    }))()
    return this.resolved
  }

  invalidate(): void {
    this.resolved = null
  }

  /** The newest candidate that actually runs wins; broken updates are skipped. */
  private async resolveTool(name: ToolName): Promise<ToolInfo | null> {
    const candidates: { path: string; source: ToolSource }[] = []
    const manifest = await this.readManifest()
    const entry = name === 'ffmpeg' ? undefined : manifest.tools[name]
    if (entry) candidates.push({ path: join(this.opts.dataDir, entry.file), source: 'updated' })
    candidates.push({ path: join(this.opts.bundledDir, ...bundledPath(name, this.opts.target)), source: 'bundled' })
    if (this.opts.allowSystem) {
      const system = await this.findOnPath(name)
      if (system) candidates.push({ path: system, source: 'system' })
    }

    let best: ToolInfo | null = null
    for (const candidate of candidates) {
      const version = await this.versionOf(name, candidate.path)
      if (!version) continue
      // Prefer updated over bundled over system when versions tie.
      if (!best || compareVersions(version, best.version) > 0) best = { name, version, ...candidate }
    }
    return best
  }

  private async versionOf(name: ToolName, path: string): Promise<string | null> {
    try {
      await access(path, constants.F_OK)
    } catch {
      return null
    }
    const output = await this.opts.probe(path, VERSION_ARGS[name])
    return output === null ? null : parseVersionOutput(name, output)
  }

  private async findOnPath(name: ToolName): Promise<string | null> {
    const dirs = (this.opts.env?.['PATH'] ?? process.env['PATH'] ?? '').split(delimiter).filter(Boolean)
    for (const dir of dirs) {
      const candidate = join(dir, executableName(name, this.opts.target))
      try {
        await access(candidate, constants.X_OK)
        return candidate
      } catch {
        // Not here.
      }
    }
    return null
  }

  async lastCheck(): Promise<number | null> {
    return (await this.readManifest()).lastCheck ?? null
  }

  /**
   * Installs the latest release of `tool` if it is newer than what we have.
   * Concurrent calls share one update.
   */
  update(tool: UpdatableTool, onProgress?: (fraction: number | null) => void): Promise<UpdateResult> {
    const running = this.updating.get(tool)
    if (running) return running
    const job = this.doUpdate(tool, onProgress).finally(() => this.updating.delete(tool))
    this.updating.set(tool, job)
    return job
  }

  private async doUpdate(tool: UpdatableTool, onProgress?: (fraction: number | null) => void): Promise<UpdateResult> {
    const current = (await this.resolve())[tool]
    const release = await latestRelease(this.opts.http, tool, this.opts.target)

    if (current && compareVersions(release.version, current.version) <= 0) {
      await this.markChecked()
      return { status: 'up-to-date', version: current.version }
    }

    const toolDir = join(this.opts.dataDir, tool)
    await this.removeStaleStaging(toolDir)
    const staging = join(toolDir, `.staging-${randomBytes(6).toString('hex')}`)
    const exe = executableName(tool, this.opts.target)
    await mkdir(staging, { recursive: true })
    try {
      const downloaded = join(staging, release.asset)
      const result = await this.opts.http.download(release.url, downloaded, (done, total) =>
        onProgress?.(total ? done / total : null)
      )
      if (result.sha256 !== release.sha256) {
        throw new Error(`Checksum mismatch for ${release.asset}: expected ${release.sha256}, got ${result.sha256}`)
      }

      const binary = join(staging, exe)
      if (release.asset.endsWith('.zip')) {
        const files = unzipSync(new Uint8Array(await readFile(downloaded)), { filter: (f) => f.name === exe })
        const data = files[exe]
        if (!data) throw new Error(`${release.asset} does not contain ${exe}`)
        await writeFile(binary, data)
        await rm(downloaded)
      } else {
        await rename(downloaded, binary)
      }
      await chmod(binary, 0o755)

      // Never switch to a binary that doesn't start.
      const version = await this.versionOf(tool, binary)
      if (!version) throw new Error(`Downloaded ${tool} ${release.version} does not run`)

      const finalDir = join(toolDir, version)
      await rm(finalDir, { recursive: true, force: true })
      await rename(staging, finalDir)

      const manifest = await this.readManifest()
      manifest.tools[tool] = { version, file: join(tool, version, exe) }
      // Only a completed check counts; an interrupted download retries next start.
      manifest.lastCheck = Date.now()
      await this.writeManifest(manifest)
      this.invalidate()
      await this.prune(tool, version, current?.source === 'updated' ? current.version : null)
      return { status: 'updated', version, previous: current?.version ?? null }
    } catch (error) {
      await rm(staging, { recursive: true, force: true })
      throw error
    }
  }

  /** Drops the downloaded update so the bundled copy is used again. */
  async rollback(tool: UpdatableTool): Promise<void> {
    const manifest = await this.readManifest()
    delete manifest.tools[tool]
    await this.writeManifest(manifest)
    this.invalidate()
  }

  private async markChecked(): Promise<void> {
    await this.writeManifest({ ...(await this.readManifest()), lastCheck: Date.now() })
  }

  /** Staging folders left behind when the app quit mid-download. */
  private async removeStaleStaging(toolDir: string): Promise<void> {
    const entries = await readdir(toolDir).catch(() => [] as string[])
    for (const entry of entries.filter((e) => e.startsWith('.staging-'))) {
      await rm(join(toolDir, entry), { recursive: true, force: true }).catch(() => {})
    }
  }

  /** Keeps the current and previous versions; older ones and failed stagings go. */
  private async prune(tool: UpdatableTool, keep: string, previous: string | null): Promise<void> {
    const toolDir = join(this.opts.dataDir, tool)
    let entries: string[]
    try {
      entries = await readdir(toolDir)
    } catch {
      return
    }
    for (const entry of entries) {
      if (entry === keep || entry === previous) continue
      // A running download may still hold an old binary open on Windows; try again next time.
      await rm(join(toolDir, entry), { recursive: true, force: true }).catch(() => {})
    }
  }

  private async readManifest(): Promise<Manifest> {
    try {
      const parsed = JSON.parse(await readFile(join(this.opts.dataDir, MANIFEST), 'utf8')) as Partial<Manifest>
      return { tools: parsed.tools ?? {}, lastCheck: parsed.lastCheck }
    } catch {
      return { tools: {} }
    }
  }

  private async writeManifest(manifest: Manifest): Promise<void> {
    const file = join(this.opts.dataDir, MANIFEST)
    await mkdir(dirname(file), { recursive: true })
    const tmp = `${file}.${randomBytes(4).toString('hex')}.tmp`
    await writeFile(tmp, JSON.stringify(manifest, null, 2))
    await rename(tmp, file)
  }
}

/** yt-dlp's `--ffmpeg-location` takes the folder, so it also finds ffprobe there. */
export function ffmpegLocation(tools: ResolvedTools): string | undefined {
  return tools.ffmpeg ? dirname(tools.ffmpeg.path) : undefined
}
