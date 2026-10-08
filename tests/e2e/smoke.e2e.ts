/// <reference lib="dom" />
/**
 * Launches the real, built app with a throwaway profile and checks the main
 * screens work. Needs no network: nothing is downloaded.
 */
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { _electron as electron, type ElectronApplication, type Page } from 'playwright'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { VidsnareApi } from '../../src/shared/ipc'

// The API the preload script exposes; used inside page.evaluate().
declare global {
  interface Window {
    vidsnare: VidsnareApi
  }
}

const appDir = resolve(__dirname, '../..')
let app: ElectronApplication
let page: Page
let userData: string

beforeAll(async () => {
  userData = mkdtempSync(join(tmpdir(), 'vidsnare-e2e-'))
  // Start in English and keep the test offline.
  writeFileSync(
    join(userData, 'settings.json'),
    JSON.stringify({ language: 'en' })
  )
  app = await electron.launch({ args: [appDir], cwd: appDir, env: { ...process.env, VIDSNARE_USER_DATA: userData, VIDSNARE_NO_AUTO_UPDATE: '1' } })
  page = await app.firstWindow()
  await page.waitForSelector('.brand')
})

afterAll(async () => {
  await app?.close()
  rmSync(userData, { recursive: true, force: true })
})

describe('VidSnare', () => {
  it('opens on the download screen', async () => {
    expect(await page.title()).toBe('VidSnare')
    expect(await page.locator('nav button[aria-current=page]').textContent()).toBe('Download')
  })

  it('runs the renderer sandboxed, without Node', async () => {
    expect(await page.evaluate(() => typeof (globalThis as { require?: unknown }).require)).toBe('undefined')
    expect(await page.evaluate(() => typeof (globalThis as { process?: unknown }).process)).toBe('undefined')
    expect(await page.evaluate(() => Object.keys(window.vidsnare).sort())).toEqual(['invoke', 'on'])
  })

  it('rejects a link that is not from YouTube', async () => {
    await page.fill('input[type=text]', 'https://example.com/video')
    await page.click('button[type=submit]')
    expect(await page.locator('[role=alert]').textContent()).toContain("doesn't look like a YouTube link")
  })

  it('refuses IPC channels that are not in the contract', async () => {
    const error = await page.evaluate(() =>
      (window.vidsnare.invoke as (c: string) => Promise<unknown>)('fs:read').then(
        () => null,
        (e: Error) => e.message
      )
    )
    expect(error).toMatch(/Unknown IPC channel/)
  })

  it('shows the empty queue and history', async () => {
    await page.click('nav >> text=Queue')
    await page.waitForSelector('text=No downloads yet')
    await page.click('nav >> text=History')
    await page.waitForSelector('text=Finished downloads will appear here.')
  })

  it('shows a translated right-click menu in text fields', async () => {
    await page.click('nav >> text=Download')
    const labels = await app.evaluate(async ({ BrowserWindow, Menu }) => {
      const win = BrowserWindow.getAllWindows()[0]!
      const shown = new Promise<string[]>((resolve) => {
        const original = Menu.prototype.popup
        Menu.prototype.popup = function (this: Electron.Menu) {
          Menu.prototype.popup = original
          resolve(this.items.map((i) => i.label).filter(Boolean))
        }
      })
      win.webContents.emit('context-menu', {}, {
        isEditable: true,
        selectionText: '',
        editFlags: { canCut: true, canCopy: true, canPaste: true, canSelectAll: true }
      })
      return shown
    })
    expect(labels).toEqual(['Cut', 'Copy', 'Paste', 'Select all'])
  })

  it('finds the bundled download engine', { timeout: 120_000 }, async () => {
    await page.click('nav >> text=Settings')
    await page.waitForSelector('.settings-page')
    // The first version check starts yt-dlp, which unpacks itself first; that is slow on busy machines.
    await page.waitForSelector('text=/yt-dlp \\d{4}\\.\\d{2}\\.\\d{2}/', { timeout: 90_000 })
  })

  it('switches language from the sidebar and remembers it', async () => {
    await page.selectOption('nav .language-picker select', 'pl')
    await page.waitForSelector('nav >> text=Ustawienia')
    const saved = await page.evaluate(() => window.vidsnare.invoke('settings:get'))
    expect(saved.language).toBe('pl')
  })
})
