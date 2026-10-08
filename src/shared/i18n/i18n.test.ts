import { describe, expect, it } from 'vitest'
import { ERROR_CODES } from '../errors'
import {
  createTranslator,
  formatBytes,
  formatDuration,
  formatSpeed,
  isRtl,
  LOCALES,
  resolveLocale,
  SUPPORTED_LOCALES,
  type Locale
} from './index'
import type { Plural } from './types'

type Tree = { [key: string]: string | Plural | Tree }

function isPlural(node: unknown): node is Plural {
  return typeof node === 'object' && node !== null && typeof (node as Plural).other === 'string'
}

/** Flattens messages into `path -> string | Plural`. */
function flatten(tree: Tree, prefix = ''): Map<string, string | Plural> {
  const out = new Map<string, string | Plural>()
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string' || isPlural(value)) out.set(path, value)
    else for (const [k, v] of flatten(value, path)) out.set(k, v)
  }
  return out
}

function placeholders(value: string | Plural): string[] {
  const texts = typeof value === 'string' ? [value] : Object.values(value).filter((v): v is string => !!v)
  const names = new Set<string>()
  for (const text of texts) for (const m of text.matchAll(/\{(\w+)\}/g)) names.add(m[1]!)
  return [...names].sort()
}

const english = flatten(LOCALES.en.messages as unknown as Tree)

describe.each(SUPPORTED_LOCALES.filter((l) => l !== 'en'))('locale %s', (locale) => {
  const messages = flatten(LOCALES[locale].messages as unknown as Tree)

  it('has exactly the same keys as English', () => {
    expect([...messages.keys()].sort()).toEqual([...english.keys()].sort())
  })

  it('uses the same placeholders as English', () => {
    for (const [key, value] of english) {
      expect(placeholders(messages.get(key)!), key).toEqual(placeholders(value))
    }
  })

  it('has every plural form the language needs', () => {
    const categories = new Intl.PluralRules(locale).resolvedOptions().pluralCategories
    for (const [key, value] of messages) {
      if (!isPlural(value)) continue
      for (const category of categories) {
        expect(value[category as keyof Plural], `${key}.${category}`).toBeTypeOf('string')
      }
    }
  })

  it('has no empty strings', () => {
    for (const [key, value] of messages) {
      const texts = typeof value === 'string' ? [value] : Object.values(value)
      for (const text of texts) expect(String(text).trim(), key).not.toBe('')
    }
  })
})

describe('English', () => {
  it('has a message for every error code', () => {
    for (const code of ERROR_CODES) expect(english.has(`errors.${code}`), code).toBe(true)
  })

  it('covers the plural categories it uses', () => {
    for (const [key, value] of english) if (isPlural(value)) expect(value.one, key).toBeTypeOf('string')
  })
})

describe('createTranslator', () => {
  it('fills placeholders', () => {
    const t = createTranslator('en')
    expect(t('preview.by', { channel: 'Some Channel' })).toBe('by Some Channel')
  })

  it('formats numbers in the locale style', () => {
    expect(createTranslator('en')('preview.videos', { count: 1234 })).toBe('1,234 videos')
    expect(createTranslator('de')('preview.videos', { count: 1234 })).toBe('1.234 Videos')
  })

  it.each([
    [1, 'Pobierz 1 film'],
    [3, 'Pobierz 3 filmy'],
    [5, 'Pobierz 5 filmów'],
    [22, 'Pobierz 22 filmy'],
    [25, 'Pobierz 25 filmów']
  ])('picks the Polish plural for %i', (count, expected) => {
    expect(createTranslator('pl')('options.downloadMany', { count })).toBe(expected)
  })

  it.each([
    [1, 'В очередь добавлена 1 загрузка'],
    [2, 'В очередь добавлены 2 загрузки'],
    [5, 'В очередь добавлено 5 загрузок'],
    [21, 'В очередь добавлена 21 загрузка']
  ])('picks the Russian plural for %i', (count, expected) => {
    expect(createTranslator('ru')('options.added', { count })).toBe(expected)
  })

  it('leaves unknown placeholders visible rather than dropping them', () => {
    expect(createTranslator('en')('preview.by')).toBe('by {channel}')
  })

  it('returns the key for a missing message', () => {
    expect(createTranslator('en')('does.not.exist' as never)).toBe('does.not.exist')
  })
})

describe('resolveLocale', () => {
  it.each<[string[], Locale]>([
    [['pl-PL'], 'pl'],
    [['pl'], 'pl'],
    [['de-AT', 'en'], 'de'],
    [['pt-BR'], 'pt-BR'],
    [['pt-PT'], 'pt-BR'],
    [['pt_BR'], 'pt-BR'],
    [['ja-JP'], 'ja'],
    [['es-419'], 'es'],
    [['fr-CA'], 'fr'],
    [['ru'], 'ru'],
    [['zh-CN', 'fr-FR'], 'fr'],
    [['zh-CN'], 'en'],
    [['zh-Hans-CN'], 'en'],
    [['zh-TW'], 'zh-TW'],
    [['zh-HK'], 'zh-TW'],
    [['zh-Hant'], 'zh-TW'],
    [['zh_TW'], 'zh-TW'],
    [['uk-UA'], 'uk'],
    [['ar-EG'], 'ar'],
    [['he-IL'], 'he'],
    [['nb-NO', 'sv-SE'], 'sv'],
    [[], 'en']
  ])('%j → %s', (preferred, expected) => {
    expect(resolveLocale(preferred)).toBe(expected)
  })
})

describe('isRtl', () => {
  it('marks only right-to-left languages', () => {
    expect(SUPPORTED_LOCALES.filter(isRtl).sort()).toEqual(['ar', 'fa', 'he'])
  })
})

describe('formatters', () => {
  it('formats sizes with decimal units', () => {
    expect(formatBytes(512, 'en')).toBe('512B')
    expect(formatBytes(512, 'pl')).toBe('512 B')
    expect(formatBytes(1_500_000, 'en')).toBe('1.5 MB')
    expect(formatBytes(250_000_000, 'en')).toBe('250 MB')
    expect(formatBytes(1_500_000, 'pl')).toBe('1,5 MB')
  })

  it('formats speeds', () => {
    expect(formatSpeed(2_400_000, 'en')).toBe('2.4 MB/s')
  })

  it('formats durations', () => {
    expect(formatDuration(5)).toBe('0:05')
    expect(formatDuration(245)).toBe('4:05')
    expect(formatDuration(3723)).toBe('1:02:03')
  })
})
