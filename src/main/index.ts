import { app, BrowserWindow, clipboard, dialog, nativeTheme, Notification, shell } from 'electron'
import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { createTranslator, resolveLocale, type Translate } from '@shared/i18n'
import type { EventChannel, EventMap } from '@shared/ipc'
import { isReleaseRepoConfigured, RELEASES_URL } from '@shared/release'
import type { Settings } from '@shared/settings'
import { handle } from './ipc'
import { Notifier } from './notifier'
import { detectUpdateMode, UpdateController } from './update/update-controller'
import { createServices, type Services } from './services'
import { throttle } from './throttle'
import { createMainWindow, isTrustedFrameUrl } from './window'

const trusted = (event: Electron.IpcMainInvokeEvent): boolean => isTrustedFrameUrl(event.senderFrame?.url ?? '')

function broadcast<C extends EventChannel>(channel: C, payload: EventMap[C]): void {
  for (const win of BrowserWindow.getAllWindows()) win.webContents.send(channel, payload)
}

/** Translator for text the main process shows itself (notifications, dialogs). */
function translatorFor(settings: Settings): Translate {
  const locale = settings.language === 'system' ? resolveLocale(app.getPreferredSystemLanguages()) : settings.language
  return createTranslator(locale)
}

function showWindow(page?: EventMap['app:navigate']['page']): void {
  const win = BrowserWindow.getAllWindows()[0]
  if (!win) return
  if (win.isMinimized()) win.restore()
  win.show()
  win.focus()
  if (page) win.webContents.send('app:navigate', { page })
}

const SIX_HOURS = 6 * 60 * 60 * 1000

function registerIpc(services: Services, updates: UpdateController): void {
  const { settings, history, engine, media, queue, queueService } = services

  handle('update:get-status', trusted, () => updates.getStatus())
  handle('update:check', trusted, () => updates.check())
  handle('update:download', trusted, () => updates.download())
  handle('update:install', trusted, () => updates.install())
  handle('update:open-releases', trusted, () => shell.openExternal(RELEASES_URL))

  handle('app:get-info', trusted, () => ({ name: app.getName(), version: app.getVersion(), platform: process.platform }))
  handle('app:read-clipboard', trusted, async () => (await clipboard.readText()).trim().slice(0, 4096))

  handle('media:fetch-info', trusted, (url) =>
    typeof url === 'string'
      ? media.fetchInfo(url)
      : { ok: false, error: { code: 'INVALID_URL', retryable: false, detail: '' } }
  )

  handle('tools:get-status', trusted, () => engine.status())
  handle('tools:update-engine', trusted, () => engine.update((fraction) => broadcast('tools:update-progress', { fraction })))

  handle('settings:get', trusted, () => settings.get())
  handle('settings:update', trusted, (patch) => {
    // A download folder is only accepted if the user picked it in the folder dialog.
    const p = patch && typeof patch === 'object' ? { ...patch } : {}
    if (typeof p.downloadDir === 'string' && p.downloadDir && !queueService.isApproved(p.downloadDir)) {
      delete p.downloadDir
    }
    return settings.update(p)
  })

  handle('dialog:choose-folder', trusted, async (current) => {
    const win = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0]
    const options: Electron.OpenDialogOptions = {
      properties: ['openDirectory', 'createDirectory'],
      defaultPath: typeof current === 'string' && current ? current : queueService.defaultDirectory()
    }
    const result = win ? await dialog.showOpenDialog(win, options) : await dialog.showOpenDialog(options)
    const folder = result.canceled ? null : (result.filePaths[0] ?? null)
    if (folder) queueService.approveDirectory(folder)
    return folder
  })

  handle('queue:default-folder', trusted, () => queueService.defaultDirectory())
  handle('queue:add', trusted, (request) => queueService.add(request))
  handle('queue:list', trusted, () => queue.list())
  handle('queue:cancel', trusted, (id) => queue.cancel(String(id)))
  handle('queue:cancel-all', trusted, () => queue.cancelAll())
  handle('queue:retry', trusted, (id) => queue.retry(String(id)))
  handle('queue:remove', trusted, (id) => queue.remove(String(id)))
  handle('queue:clear-finished', trusted, () => queue.clearFinished())
  // The renderer names a job, never a path: main decides which file to open.
  handle('queue:open-file', trusted, async (id) => {
    const path = queue.get(String(id))?.filePath
    if (path) await shell.openPath(path)
  })
  handle('queue:show-in-folder', trusted, (id) => {
    const path = queue.get(String(id))?.filePath
    if (path) shell.showItemInFolder(path)
  })

  handle('history:list', trusted, (query) =>
    history.list({
      search: typeof query?.search === 'string' ? query.search.slice(0, 200) : '',
      limit: Number(query?.limit) || 200
    })
  )
  handle('history:remove', trusted, (id) => history.remove(String(id)))
  handle('history:clear', trusted, () => history.clear())
  handle('history:open-file', trusted, async (id) => {
    const entry = history.get(String(id))
    if (entry) await shell.openPath(entry.filePath)
  })
  handle('history:show-in-folder', trusted, (id) => {
    const entry = history.get(String(id))
    if (entry) shell.showItemInFolder(entry.filePath)
  })
  handle('history:download-again', trusted, (id) => {
    const entry = history.get(String(id))
    if (!entry) return { added: 0, skipped: 0 }
    return queueService.requeue(
      {
        videoId: entry.videoId,
        title: entry.title,
        channel: entry.channel,
        thumbnail: entry.thumbnail,
        duration: entry.duration,
        uploadDate: null,
        index: null
      },
      entry.options,
      dirname(entry.filePath)
    )
  })
}

// Tests run the app against a throwaway data folder instead of the user's real one.
if (process.env['VIDSNARE_USER_DATA']) app.setPath('userData', process.env['VIDSNARE_USER_DATA'])

// Only one instance may run, so two queues never write to the same files.
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => showWindow())

  let services: Services | null = null
  let quitConfirmed = false
  // The queue changes many times a second while downloading; the UI needs ~4 updates/s.
  const pushQueue = throttle(() => {
    if (services) broadcast('queue:changed', services.queue.list())
  }, 250)

  const notifier = new Notifier({
    enabled: () => Boolean(services?.settings.get().notifications) && Notification.isSupported(),
    translate: () => translatorFor(services!.settings.get()),
    show: (title, body) => {
      const notification = new Notification({ title, body })
      notification.on('click', () => showWindow('queue'))
      notification.show()
    }
  })

  /** Asks before closing while downloads are running. */
  function guardClose(win: BrowserWindow): void {
    win.on('close', (event) => {
      if (quitConfirmed || !services?.queue.hasUnfinished()) return
      event.preventDefault()
      const t = translatorFor(services.settings.get())
      const choice = dialog.showMessageBoxSync(win, {
        type: 'question',
        title: t('app.quitTitle'),
        message: t('app.quitTitle'),
        detail: t('app.quitMessage'),
        buttons: [t('app.keepDownloading'), t('app.quitAnyway')],
        defaultId: 0,
        cancelId: 0,
        noLink: true
      })
      if (choice === 1) {
        quitConfirmed = true
        app.quit()
      }
    })
  }

  app.whenReady().then(async () => {
    app.setAppUserModelId('com.vidsnare.app')
    services = await createServices({ onQueueChange: pushQueue, onJobFinished: (job) => notifier.jobFinished(job) })
    const live = services
    const updates = new UpdateController({
      mode: isReleaseRepoConfigured()
        ? detectUpdateMode({ packaged: app.isPackaged, platform: process.platform, env: process.env })
        : 'disabled',
      // Loaded only in packaged builds; electron-updater reads app-update.yml from resources.
      updater: () => createRequire(import.meta.url)('electron-updater').autoUpdater,
      autoUpdate: () => live.settings.get().autoUpdateApp,
      onStatus: (status) => broadcast('update:status', status),
      beforeInstall: async () => {
        quitConfirmed = true
        await live.queue.shutdown()
      }
    })
    registerIpc(services, updates)

    // Native parts (dialogs, title bar) and the page's prefers-color-scheme follow the theme setting.
    nativeTheme.themeSource = services.settings.get().theme
    services.settings.onChange((s) => {
      nativeTheme.themeSource = s.theme
      broadcast('settings:changed', s)
    })
    services.history.onChange(() => broadcast('history:changed', null))
    guardClose(createMainWindow())

    if (services.settings.get().autoUpdateEngine) void services.engine.updateIfDue()

    // App updates: shortly after start (not to slow it down), then every six hours.
    const checkApp = (): void => {
      if (live.settings.get().autoUpdateApp) void updates.check()
    }
    setTimeout(checkApp, 10_000)
    setInterval(checkApp, SIX_HOURS)

    nativeTheme.on('updated', () => broadcast('app:theme-changed', { dark: nativeTheme.shouldUseDarkColors }))
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) guardClose(createMainWindow())
    })
  })

  // Stop yt-dlp and ffmpeg before quitting so nothing keeps running in the background.
  let shuttingDown = false
  app.on('before-quit', (event) => {
    if (shuttingDown || !services?.queue.hasUnfinished()) return
    event.preventDefault()
    shuttingDown = true
    void services.queue.shutdown().finally(() => app.quit())
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
