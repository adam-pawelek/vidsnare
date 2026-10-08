import { describe, expect, it } from 'vitest'
// @ts-expect-error plain JavaScript module served as-is by the website
import { detectOs, FILES, format, pickLanguage } from '../website/site.js'
// @ts-expect-error plain JavaScript module served as-is by the website
import { LANGUAGE_NAMES, STRINGS } from '../website/strings.js'

const placeholders = (text: string): string[] => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!).sort()

describe('website text', () => {
  const english = STRINGS.en as Record<string, string>

  it.each(Object.keys(STRINGS))('%s has every English key and placeholder', (lang) => {
    const strings = STRINGS[lang] as Record<string, string>
    expect(Object.keys(strings).sort()).toEqual(Object.keys(english).sort())
    for (const [key, value] of Object.entries(english)) {
      expect(strings[key]!.trim(), `${lang}.${key}`).not.toBe('')
      expect(placeholders(strings[key]!), `${lang}.${key}`).toEqual(placeholders(value))
    }
  })

  it('names every language', () => {
    expect(Object.keys(LANGUAGE_NAMES).sort()).toEqual(Object.keys(STRINGS).sort())
  })
})

describe('website helpers', () => {
  it.each([
    [['pl-PL'], 'pl'],
    [['pt-PT'], 'pt-BR'],
    [['zh-CN', 'de'], 'de'],
    [['zh-CN'], 'en']
  ])('picks %j → %s', (prefs, lang) => {
    expect(pickLanguage(prefs)).toBe(lang)
  })

  it.each([
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'windows'],
    ['Mozilla/5.0 (X11; Linux x86_64)', 'linux'],
    ['Mozilla/5.0 (Linux; Android 14)', 'other'],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)', 'other'],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)', 'other']
  ])('detects %s', (ua, os) => {
    expect(detectOs(ua)).toBe(os)
  })

  it('fills placeholders', () => {
    expect(format('Version {version}', { version: '1.2.0' })).toBe('Version 1.2.0')
  })
})

describe('download links', () => {
  it('match the stable file names the installers are built with', async () => {
    const { readFileSync } = await import('node:fs')
    const yml = readFileSync(new URL('../electron-builder.yml', import.meta.url), 'utf8')
    expect(yml).toContain('artifactName: ${productName}-Setup.${ext}')
    expect(yml).toContain('artifactName: ${productName}-${arch}.${ext}')
    expect(yml).toContain('artifactName: ${productName}_${arch}.${ext}')
    expect(FILES.windows.name).toBe('VidSnare-Setup.exe')
    expect(FILES.appimage.name).toBe('VidSnare-x86_64.AppImage')
    expect(FILES.deb.name).toBe('VidSnare_amd64.deb')
  })
})
