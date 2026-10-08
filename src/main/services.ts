import { app, net } from 'electron'
import { join } from 'node:path'
import { spawnRunner } from './core/runner'
import { MediaService } from './media-service'
import { EngineService } from './tools/engine-service'
import { createHttp } from './tools/http'
import { currentTarget, targetDir } from './tools/platform'
import { execProbe } from './tools/probe'
import { ToolManager } from './tools/tool-manager'

/** Long-lived main-process services, created once the app is ready. */
export interface Services {
  tools: ToolManager
  engine: EngineService
  media: MediaService
}

export function createServices(): Services {
  const target = currentTarget()
  // Packaged: electron-builder copies resources/bin/<target> to <resources>/bin.
  const bundledDir = app.isPackaged
    ? join(process.resourcesPath, 'bin')
    : join(app.getAppPath(), 'resources', 'bin', targetDir(target))
  const http = createHttp((url, init) => net.fetch(url, init), `VidSnare/${app.getVersion()}`)
  const tools = new ToolManager({
    bundledDir,
    dataDir: join(app.getPath('userData'), 'tools'),
    target,
    http,
    probe: execProbe,
    allowSystem: !app.isPackaged
  })
  const engine = new EngineService(tools, (message) => console.warn(`[engine] ${message}`))
  const media = new MediaService(tools, spawnRunner)
  return { tools, engine, media }
}
