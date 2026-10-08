import { app, net } from 'electron'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { spawnRunner } from './core/runner'
import { MediaService } from './media-service'
import { DownloadQueue } from './queue/download-queue'
import { QueueService } from './queue/queue-service'
import { SettingsStore } from './settings-store'
import { EngineService } from './tools/engine-service'
import { createHttp } from './tools/http'
import { currentTarget, targetDir } from './tools/platform'
import { execProbe } from './tools/probe'
import { ffmpegLocation, ToolManager } from './tools/tool-manager'

/** Long-lived main-process services, created once the app is ready. */
export interface Services {
  settings: SettingsStore
  tools: ToolManager
  engine: EngineService
  media: MediaService
  queue: DownloadQueue
  queueService: QueueService
}

export interface ServiceHooks {
  onQueueChange: () => void
}

export async function createServices(hooks: ServiceHooks): Promise<Services> {
  const userData = app.getPath('userData')
  const settings = new SettingsStore(join(userData, 'settings.json'))
  await settings.load()

  const target = currentTarget()
  // Packaged: electron-builder copies resources/bin/<target> to <resources>/bin.
  const bundledDir = app.isPackaged
    ? join(process.resourcesPath, 'bin')
    : join(app.getAppPath(), 'resources', 'bin', targetDir(target))
  const http = createHttp((url, init) => net.fetch(url, init), `VidSnare/${app.getVersion()}`)
  const tools = new ToolManager({
    bundledDir,
    dataDir: join(userData, 'tools'),
    target,
    http,
    probe: execProbe,
    allowSystem: !app.isPackaged
  })
  const engine = new EngineService(tools, (message) => console.warn(`[engine] ${message}`))
  const media = new MediaService(tools, spawnRunner)

  // Partial downloads from a previous session that crashed or was killed.
  const tempRoot = join(userData, 'partial')
  await rm(tempRoot, { recursive: true, force: true }).catch(() => {})

  const queue: DownloadQueue = new DownloadQueue({
    run: spawnRunner,
    tools: async () => {
      const resolved = await tools.resolve()
      return { ytdlp: resolved['yt-dlp']?.path ?? null, ffmpeg: ffmpegLocation(resolved), deno: resolved.deno?.path }
    },
    tempRoot,
    maxConcurrent: () => settings.get().maxConcurrent,
    archiveFile: () => undefined,
    onChange: hooks.onQueueChange,
    onFinished: (job) => {
      // YouTube changed something: fetch a new engine, then retry what failed because of it.
      if (job.error?.code === 'ENGINE_OUTDATED' || job.error?.code === 'BOT_CHECK') {
        void engine.updateAfterEngineError().then((result) => {
          if (result?.status === 'updated') {
            tools.invalidate()
            queue.retryFailed(['ENGINE_OUTDATED'])
          }
        })
      }
    }
  })
  const queueService = new QueueService({ queue, settings: () => settings.get(), systemDownloads: app.getPath('downloads') })

  // A higher limit takes effect at once.
  settings.onChange(() => queue.pump())

  return { settings, tools, engine, media, queue, queueService }
}
