import { app, BrowserWindow, clipboard, dialog, nativeTheme, shell } from 'electron'
import { dirname } from 'node:path'
import type { EventChannel, EventMap } from '@shared/ipc'
import { handle } from './ipc'
import { createServices, type Services } from './services'
import { throttle } from './throttle'
import { createMainWindow, isTrustedFrameUrl } from './window'

const trusted = (event: Electron.IpcMainInvokeEvent): boolean => isTrustedFrameUrl(event.senderFrame?.url ?? '')

function broadcast<C extends EventChannel>(channel: C, payload: EventMap[C]): void {
  for (const win of BrowserWindow.getAllWindows()) win.webContents.send(channel, payload)
}

function registerIpc(services: Services): void {
  const { settings, history, engine, media, queue, queueService } = services

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
  handle('settings:update', trusted, (patch) => settings.update(patch))

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
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  let services: Services | null = null
  // The queue changes many times a second while downloading; the UI needs ~4 updates/s.
  const pushQueue = throttle(() => {
    if (services) broadcast('queue:changed', services.queue.list())
  }, 250)

  app.whenReady().then(async () => {
    app.setAppUserModelId('com.vidsnare.app')
    services = await createServices({ onQueueChange: pushQueue })
    registerIpc(services)
    services.settings.onChange((s) => broadcast('settings:changed', s))
    services.history.onChange(() => broadcast('history:changed', null))
    createMainWindow()

    if (services.settings.get().autoUpdateEngine) void services.engine.updateIfDue()

    nativeTheme.on('updated', () => broadcast('app:theme-changed', { dark: nativeTheme.shouldUseDarkColors }))
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
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
