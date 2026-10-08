import { describe, expect, it } from 'vitest'
// @ts-expect-error plain JavaScript module served as-is by the website
import { detectOs, detectSystem, FILES, filterChoices, fold, format, languageChoices, pickLanguage, releaseFromResponse } from '../website/site.js'
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

  it('offers the same languages as the app', async () => {
    const { SUPPORTED_LOCALES } = await import('../src/shared/i18n')
    expect(Object.keys(STRINGS).sort()).toEqual([...SUPPORTED_LOCALES].sort())
  })
})

describe('website helpers', () => {
  it.each([
    [['pl-PL'], 'pl'],
    [['pt-PT'], 'pt-BR'],
    [['zh-CN', 'de'], 'de'],
    [['zh-CN'], 'en'],
    [['zh-TW'], 'zh-TW'],
    [['zh-HK'], 'zh-TW'],
    [['ar-SA'], 'ar'],
    [['uk-UA'], 'uk']
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

  it.each([
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'windows'],
    ['Mozilla/5.0 (X11; Linux x86_64) Chrome/140', 'deb'],
    ['Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:140.0) Firefox/140.0', 'deb'],
    ['Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:140.0) Firefox/140.0', 'appimage'],
    ['Mozilla/5.0 (X11; Linux x86_64; Arch Linux) Firefox/140', 'appimage'],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)', 'windows']
  ])('suggests the right download for %s', (ua, system) => {
    expect(detectSystem(ua)).toBe(system)
  })

  it.each([
    [200, { tag_name: 'v0.1.2' }, { state: 'ready', version: '0.1.2' }],
    [404, null, { state: 'none' }],
    [403, null, { state: 'unknown' }],
    [500, null, { state: 'unknown' }],
    [200, {}, { state: 'unknown' }]
  ])('reads a GitHub answer %i as %j', (status, data, expected) => {
    expect(releaseFromResponse(status, data)).toEqual(expected)
  })

  it('fills placeholders', () => {
    expect(format('Version {version}', { version: '1.2.0' })).toBe('Version 1.2.0')
  })
})

describe('language search', () => {
  const labels = (choices: { label: string }[]): string[] => choices.map((c) => c.label)

  it('lists every language in its own name', () => {
    expect(labels(languageChoices('en'))).toHaveLength(Object.keys(STRINGS).length)
  })

  it.each([
    ['ger', ['Deutsch']],
    ['deutsch', ['Deutsch']],
    ['turkce', ['Türkçe']],
    ['zh-tw', ['繁體中文']],
    ['hebrew', ['עברית']],
    ['portug', ['Português (Brasil)']]
  ])('finds %s', (query, expected) => {
    expect(labels(filterChoices(languageChoices('en'), query))).toEqual(expected)
  })

  it('matches names in the page language', () => {
    expect(labels(filterChoices(languageChoices('pl'), 'niemiecki'))).toEqual(['Deutsch'])
  })

  it('shows the name in the page language beside the own name', () => {
    const german = languageChoices('en').find((c: { code: string }) => c.code === 'de')
    expect(german.hint).toBe('German')
    const english = languageChoices('en').find((c: { code: string }) => c.code === 'en')
    expect(english.hint).toBe('')
  })

  it('returns nothing for nonsense and everything for an empty query', () => {
    expect(filterChoices(languageChoices('en'), 'klingon')).toEqual([])
    expect(filterChoices(languageChoices('en'), '  ')).toHaveLength(Object.keys(STRINGS).length)
  })

  it('ignores case and accents', () => {
    expect(fold('Français ČEŠTINA')).toBe('francais cestina')
  })
})

describe('install guide', () => {
  it('names the app’s own buttons in every language', async () => {
    const { LOCALES } = await import('../src/shared/i18n')
    for (const [lang, strings] of Object.entries(STRINGS) as [string, Record<string, string>][]) {
      const app = (LOCALES as Record<string, { messages: { nav: { queue: string }; queue: { openFile: string } } }>)[lang]!
      expect(strings.use4, lang).toContain(app.messages.nav.queue)
      expect(strings.use4, lang).toContain(app.messages.queue.openFile)
    }
  })

  it('has every guide step in the page', async () => {
    const { readFileSync } = await import('node:fs')
    const html = readFileSync(new URL('../website/index.html', import.meta.url), 'utf8')
    for (const key of ['winStep1', 'debStep1', 'debStep2', 'appStep1', 'troubleFuse', 'use1', 'use4', 'installHelp']) {
      expect(html, key).toContain(`data-t="${key}"`)
    }
    expect(html).toContain('sudo apt install ./VidSnare_amd64.deb')
    expect(html).toContain('chmod +x VidSnare-x86_64.AppImage')
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
