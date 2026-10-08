import { en } from './locales/en'
import { pl } from './locales/pl'
import { de } from './locales/de'
import { es } from './locales/es'
import { ptBR } from './locales/pt-BR'
import { ru } from './locales/ru'
import { ja } from './locales/ja'
import { fr } from './locales/fr'
import { tr } from './locales/tr'
import { it } from './locales/it'
import { uk } from './locales/uk'
import { id } from './locales/id'
import { vi } from './locales/vi'
import { ko } from './locales/ko'
import { zhTW } from './locales/zh-TW'
import { hi } from './locales/hi'
import { nl } from './locales/nl'
import { cs } from './locales/cs'
import { ro } from './locales/ro'
import { hu } from './locales/hu'
import { sv } from './locales/sv'
import { el } from './locales/el'
import { th } from './locales/th'
import { ar } from './locales/ar'
import { fa } from './locales/fa'
import { he } from './locales/he'
import type { MessageKey, Messages, Plural, Vars } from './types'

export type { MessageKey, Messages, Vars } from './types'

export const LOCALES = {
  en: { name: 'English', messages: en as Messages },
  pl: { name: 'Polski', messages: pl },
  de: { name: 'Deutsch', messages: de },
  es: { name: 'Español', messages: es },
  'pt-BR': { name: 'Português (Brasil)', messages: ptBR },
  ru: { name: 'Русский', messages: ru },
  ja: { name: '日本語', messages: ja },
  fr: { name: 'Français', messages: fr },
  tr: { name: 'Türkçe', messages: tr },
  it: { name: 'Italiano', messages: it },
  uk: { name: 'Українська', messages: uk },
  id: { name: 'Bahasa Indonesia', messages: id },
  vi: { name: 'Tiếng Việt', messages: vi },
  ko: { name: '한국어', messages: ko },
  'zh-TW': { name: '繁體中文', messages: zhTW },
  hi: { name: 'हिन्दी', messages: hi },
  nl: { name: 'Nederlands', messages: nl },
  cs: { name: 'Čeština', messages: cs },
  ro: { name: 'Română', messages: ro },
  hu: { name: 'Magyar', messages: hu },
  sv: { name: 'Svenska', messages: sv },
  el: { name: 'Ελληνικά', messages: el },
  th: { name: 'ไทย', messages: th },
  ar: { name: 'العربية', messages: ar },
  fa: { name: 'فارسی', messages: fa },
  he: { name: 'עברית', messages: he }
} as const satisfies Record<string, { name: string; messages: Messages }>

export type Locale = keyof typeof LOCALES
export const SUPPORTED_LOCALES = Object.keys(LOCALES) as Locale[]
export const DEFAULT_LOCALE: Locale = 'en'

/** Languages written right to left: the whole layout is mirrored for them. */
export const RTL_LOCALES: readonly Locale[] = ['ar', 'fa', 'he']

export function isRtl(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale)
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && value in LOCALES
}

/** Traditional Chinese is only a match for Traditional-script regions, not Simplified Chinese. */
function isTraditionalChinese(tag: string): boolean {
  return /^zh([-_](hant|tw|hk|mo))(\b|[-_])/i.test(tag) || /^zh[-_]hant/i.test(tag)
}

/** Picks the best supported locale for the system's preferred languages. */
export function resolveLocale(preferred: readonly string[]): Locale {
  for (const tag of preferred) {
    const exact = SUPPORTED_LOCALES.find((l) => l.toLowerCase() === tag.toLowerCase())
    if (exact) return exact
    if (/^zh\b/i.test(tag)) {
      if (isTraditionalChinese(tag)) return 'zh-TW'
      continue
    }
    const language = tag.split(/[-_]/)[0]?.toLowerCase()
    const byLanguage = SUPPORTED_LOCALES.find((l) => l.split('-')[0] === language)
    if (byLanguage) return byLanguage
  }
  return DEFAULT_LOCALE
}

function lookup(messages: Messages, key: string): string | Plural | undefined {
  let node: unknown = messages
  for (const part of key.split('.')) {
    if (node === null || typeof node !== 'object') return undefined
    node = (node as Record<string, unknown>)[part]
  }
  if (typeof node === 'string') return node
  if (node && typeof node === 'object' && typeof (node as Plural).other === 'string') return node as Plural
  return undefined
}

export type Translate = (key: MessageKey, vars?: Vars) => string

export function createTranslator(locale: Locale): Translate {
  const messages = LOCALES[locale].messages
  const plurals = new Intl.PluralRules(locale)
  const numbers = new Intl.NumberFormat(locale)

  return (key, vars = {}) => {
    const entry = lookup(messages, key) ?? lookup(LOCALES.en.messages, key)
    if (entry === undefined) return key
    let template: string
    if (typeof entry === 'string') {
      template = entry
    } else {
      const count = Number(vars['count'] ?? 0)
      template = entry[plurals.select(count)] ?? entry.other
    }
    return template.replace(/\{(\w+)\}/g, (whole, name: string) => {
      const value = vars[name]
      if (value === undefined) return whole
      return typeof value === 'number' ? numbers.format(value) : value
    })
  }
}

const BYTE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const

/** "1.5 MB", "820 kB" in the locale's own number style. */
export function formatBytes(bytes: number, locale: Locale): string {
  let value = Math.max(0, bytes)
  let unit = 0
  while (value >= 1000 && unit < BYTE_UNITS.length - 1) {
    value /= 1000
    unit++
  }
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: BYTE_UNITS[unit],
    // "512 B" rather than "512 byte"; larger units read fine in short form.
    unitDisplay: unit === 0 ? 'narrow' : 'short',
    maximumFractionDigits: value < 10 && unit > 0 ? 1 : 0
  }).format(value)
}

export function formatSpeed(bytesPerSecond: number, locale: Locale): string {
  let value = Math.max(0, bytesPerSecond)
  let unit = 0
  while (value >= 1000 && unit < BYTE_UNITS.length - 1) {
    value /= 1000
    unit++
  }
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: `${BYTE_UNITS[unit]}-per-second`,
    unitDisplay: unit === 0 ? 'narrow' : 'short',
    maximumFractionDigits: value < 10 && unit > 0 ? 1 : 0
  }).format(value)
}

/** "4:05" or "1:02:03". */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}

export function formatDateTime(timestamp: number, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(timestamp)
}

export function formatPercent(fraction: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(fraction)
}
