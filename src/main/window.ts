import { app, BrowserWindow, Menu, nativeTheme, session, shell } from 'electron'
import { existsSync } from 'node:fs'
import type { Translate } from '@shared/i18n'
import { contextMenuTemplate } from './context-menu'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { contentSecurityPolicy, createWebPreferences, isAppUrl, isSafeExternalUrl } from './security'

const devServerUrl = process.env['ELECTRON_RENDERER_URL']
export const rendererFileUrl = pathToFileURL(join(__dirname, '../renderer/index.html')).href

export function isTrustedFrameUrl(url: string): boolean {
  return isAppUrl(url, rendererFileUrl, devServerUrl)
}

let cspInstalled = false
function installCsp(): void {
  if (cspInstalled) return
  cspInstalled = true
  const csp = contentSecurityPolicy(Boolean(devServerUrl))
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({ responseHeaders: { ...details.responseHeaders, 'Content-Security-Policy': [csp] } })
  })
  // The app never needs camera, microphone, location, etc.
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false))
}

/**
 * The window/taskbar icon. Installers also embed it, but Linux window managers
 * and development runs only show it when the window names it explicitly.
 */
function windowIcon(): string | undefined {
  const path = app.isPackaged ? join(process.resourcesPath, 'icon.png') : join(app.getAppPath(), 'build', 'icon.png')
  return existsSync(path) ? path : undefined
}

export function createMainWindow(translate: () => Translate): BrowserWindow {
  installCsp()

  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 760,
    minHeight: 520,
    show: false,
    title: 'VidSnare',
    icon: windowIcon(),
    autoHideMenuBar: true,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#16181d' : '#f7f8fa',
    webPreferences: createWebPreferences(join(__dirname, '../preload/index.cjs'))
  })

  win.once('ready-to-show', () => win.show())

  // Links open in the system browser; the app window never leaves its own page.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isSafeExternalUrl(url)) void shell.openExternal(url)
    return { action: 'deny' }
  })
  win.webContents.on('will-navigate', (event, url) => {
    if (!isTrustedFrameUrl(url)) event.preventDefault()
  })
  win.webContents.on('will-attach-webview', (event) => event.preventDefault())

  win.webContents.on('context-menu', (_event, params) => {
    const template = contextMenuTemplate(params, translate())
    if (template.length) Menu.buildFromTemplate(template).popup({ window: win })
  })

  if (devServerUrl) {
    void win.loadURL(devServerUrl)
  } else {
    void win.loadFile(join(__dirname, '../renderer/index.html'))
  }
  return win
}
