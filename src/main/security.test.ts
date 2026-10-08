import { describe, expect, it } from 'vitest'
import { contentSecurityPolicy, createWebPreferences, isAppUrl, isSafeExternalUrl } from './security'

describe('createWebPreferences', () => {
  it('isolates and sandboxes the renderer', () => {
    const prefs = createWebPreferences('/app/preload.cjs')
    expect(prefs).toMatchObject({
      preload: '/app/preload.cjs',
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true,
      webviewTag: false
    })
  })
})

describe('isAppUrl', () => {
  const rendererFile = 'file:///opt/VidSnare/resources/app.asar/out/renderer/index.html'

  it('accepts the bundled renderer, with or without a hash', () => {
    expect(isAppUrl(rendererFile, rendererFile)).toBe(true)
    expect(isAppUrl(`${rendererFile}#/settings`, rendererFile)).toBe(true)
  })

  it('rejects other local files', () => {
    expect(isAppUrl('file:///etc/passwd', rendererFile)).toBe(false)
  })

  it('rejects remote pages', () => {
    expect(isAppUrl('https://www.youtube.com/', rendererFile)).toBe(false)
  })

  it('accepts the dev server only when one is configured', () => {
    expect(isAppUrl('http://localhost:5173/', rendererFile, 'http://localhost:5173')).toBe(true)
    expect(isAppUrl('http://localhost:5173/', rendererFile)).toBe(false)
    expect(isAppUrl('http://localhost:9999/', rendererFile, 'http://localhost:5173')).toBe(false)
  })

  it('rejects garbage', () => {
    expect(isAppUrl('not a url', rendererFile)).toBe(false)
  })
})

describe('isSafeExternalUrl', () => {
  it.each([
    ['https://github.com/', true],
    ['http://example.com', true],
    ['file:///etc/passwd', false],
    ['javascript:alert(1)', false],
    ['smb://host/share', false],
    ['nonsense', false]
  ])('%s -> %s', (url, expected) => {
    expect(isSafeExternalUrl(url)).toBe(expected)
  })
})

describe('contentSecurityPolicy', () => {
  it('forbids inline scripts in production', () => {
    const csp = contentSecurityPolicy(false)
    expect(csp).toContain("script-src 'self'")
    expect(csp).toMatch(/script-src 'self';/)
    expect(csp).toContain("object-src 'none'")
  })

  it('allows YouTube thumbnails', () => {
    expect(contentSecurityPolicy(false)).toContain('https://i.ytimg.com')
  })
})
