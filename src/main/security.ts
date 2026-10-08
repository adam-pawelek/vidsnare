import type { WebPreferences } from 'electron'

/** Hardened web preferences for every app window. */
export function createWebPreferences(preloadPath: string): WebPreferences {
  return {
    preload: preloadPath,
    contextIsolation: true,
    sandbox: true,
    nodeIntegration: false,
    nodeIntegrationInWorker: false,
    nodeIntegrationInSubFrames: false,
    webSecurity: true,
    allowRunningInsecureContent: false,
    experimentalFeatures: false,
    webviewTag: false,
    spellcheck: false
  }
}

/**
 * True when `url` is the app's own UI: the bundled renderer file, or the
 * electron-vite dev server while developing.
 */
export function isAppUrl(url: string, rendererFileUrl: string, devServerUrl?: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return false
  }
  if (devServerUrl) {
    try {
      if (parsed.origin === new URL(devServerUrl).origin) return true
    } catch {
      // Ignore a malformed dev server URL and fall through.
    }
  }
  if (parsed.protocol !== 'file:') return false
  const expected = new URL(rendererFileUrl)
  return parsed.pathname === expected.pathname
}

/** Only these links may be opened in the user's browser. */
export function isSafeExternalUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url)
    return protocol === 'https:' || protocol === 'http:'
  } catch {
    return false
  }
}

/** Content-Security-Policy for the renderer. Thumbnails come from YouTube's image CDNs. */
export function contentSecurityPolicy(dev: boolean): string {
  const scriptSrc = dev ? "'self' 'unsafe-inline'" : "'self'"
  const connectSrc = dev ? "'self' ws: http://localhost:*" : "'self'"
  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://i.ytimg.com https://*.ytimg.com https://yt3.ggpht.com https://*.ggpht.com",
    "font-src 'self' data:",
    `connect-src ${connectSrc}`,
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'"
  ].join('; ')
}
