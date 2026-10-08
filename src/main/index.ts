import { app, BrowserWindow, nativeTheme } from 'electron'
import type { EventChannel, EventMap } from '@shared/ipc'
import { handle } from './ipc'
import { createServices, type Services } from './services'
import { createMainWindow, isTrustedFrameUrl } from './window'

const trusted = (event: Electron.IpcMainInvokeEvent): boolean =>
  isTrustedFrameUrl(event.senderFrame?.url ?? '')

function registerIpc(services: Services): void {
  handle('app:get-info', trusted, () => ({
    name: app.getName(),
    version: app.getVersion(),
    platform: process.platform
  }))
  handle('tools:get-status', trusted, () => services.engine.status())
  handle('tools:update-engine', trusted, () =>
    services.engine.update((fraction) => broadcast('tools:update-progress', { fraction }))
  )
}

function broadcast<C extends EventChannel>(channel: C, payload: EventMap[C]): void {
  for (const win of BrowserWindow.getAllWindows()) win.webContents.send(channel, payload)
}

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

  app.whenReady().then(() => {
    app.setAppUserModelId('com.vidsnare.app')
    const services = createServices()
    registerIpc(services)
    createMainWindow()
    // Automatic engine check (at most daily); the settings toggle arrives with the settings screen.
    void services.engine.updateIfDue()
    nativeTheme.on('updated', () => {
      broadcast('app:theme-changed', { dark: nativeTheme.shouldUseDarkColors })
    })
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
