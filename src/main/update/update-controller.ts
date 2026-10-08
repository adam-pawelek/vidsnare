import type { UpdateMode, UpdateStatus } from '@shared/update'

/** The parts of electron-updater's autoUpdater we use; a fake in tests. */
export interface Updater {
  autoDownload: boolean
  autoInstallOnAppQuit: boolean
  on(event: 'checking-for-update', listener: () => void): unknown
  on(event: 'update-available', listener: (info: { version: string }) => void): unknown
  on(event: 'update-not-available', listener: () => void): unknown
  on(event: 'download-progress', listener: (progress: { percent: number }) => void): unknown
  on(event: 'update-downloaded', listener: (info: { version: string }) => void): unknown
  on(event: 'error', listener: (error: Error) => void): unknown
  checkForUpdates(): Promise<unknown>
  downloadUpdate(): Promise<unknown>
  quitAndInstall(): void
}

export interface UpdateControllerDeps {
  mode: UpdateMode
  /** Created lazily so development builds never touch electron-updater. */
  updater: () => Updater
  onStatus: (status: UpdateStatus) => void
  /** Stops running downloads before the installer replaces the app. */
  beforeInstall: () => Promise<void>
}

export class UpdateController {
  private status: UpdateStatus
  private updater: Updater | null = null

  constructor(private readonly deps: UpdateControllerDeps) {
    this.status = { state: 'idle', mode: deps.mode }
  }

  getStatus(): UpdateStatus {
    return this.status
  }

  private set(status: UpdateStatus): void {
    this.status = status
    this.deps.onStatus(status)
  }

  private instance(): Updater {
    if (this.updater) return this.updater
    const u = this.deps.updater()
    const mode = this.deps.mode
    // Updates are always automatic where we can install them; .deb users get a notice instead.
    u.autoDownload = mode === 'auto'
    u.autoInstallOnAppQuit = mode === 'auto'
    u.on('checking-for-update', () => this.set({ state: 'checking', mode }))
    u.on('update-not-available', () => this.set({ state: 'up-to-date', mode }))
    u.on('update-available', ({ version }) =>
      this.set(u.autoDownload ? { state: 'downloading', mode, version, fraction: null } : { state: 'available', mode, version })
    )
    u.on('download-progress', ({ percent }) => {
      const version = 'version' in this.status ? this.status.version : ''
      this.set({ state: 'downloading', mode, version, fraction: Math.min(1, Math.max(0, percent / 100)) })
    })
    u.on('update-downloaded', ({ version }) => this.set({ state: 'ready', mode, version }))
    u.on('error', (error) => this.set({ state: 'error', mode, message: error.message }))
    this.updater = u
    return u
  }

  /** Asks the release server for a newer version. Never throws. */
  async check(): Promise<UpdateStatus> {
    if (this.deps.mode === 'disabled') return this.status
    const u = this.instance()
    try {
      await u.checkForUpdates()
    } catch (error) {
      this.set({ state: 'error', mode: this.deps.mode, message: error instanceof Error ? error.message : String(error) })
    }
    return this.status
  }

  async install(): Promise<void> {
    if (this.status.state !== 'ready') return
    await this.deps.beforeInstall()
    this.instance().quitAndInstall()
  }
}

/** Works out how this copy of the app was installed. */
export function detectUpdateMode(opts: { packaged: boolean; platform: string; env: NodeJS.ProcessEnv }): UpdateMode {
  if (!opts.packaged) return 'disabled'
  if (opts.platform === 'win32') return 'auto'
  if (opts.platform === 'linux') return opts.env['APPIMAGE'] ? 'auto' : 'manual'
  return 'disabled'
}
