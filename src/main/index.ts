import { app, BrowserWindow, nativeTheme } from 'electron'
import { handle } from './ipc'
import { createMainWindow, isTrustedFrameUrl } from './window'

const trusted = (event: Electron.IpcMainInvokeEvent): boolean =>
  isTrustedFrameUrl(event.senderFrame?.url ?? '')

function registerIpc(): void {
  handle('app:get-info', trusted, () => ({
    name: app.getName(),
    version: app.getVersion(),
    platform: process.platform
  }))
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
    registerIpc()
    const win = createMainWindow()
    nativeTheme.on('updated', () => {
      win.webContents.send('app:theme-changed', { dark: nativeTheme.shouldUseDarkColors })
    })
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
