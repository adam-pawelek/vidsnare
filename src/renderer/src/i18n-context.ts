import { createContext, useContext } from 'react'
import {
  createTranslator,
  formatBytes,
  formatDateTime,
  formatDuration,
  formatPercent,
  formatSpeed,
  type Locale,
  type Translate
} from '@shared/i18n'

// Kept apart from the provider component: a file that exports both a component
// and a hook can't be hot-reloaded cleanly, which left parts of the UI holding
// an old copy of this context (and ignoring language changes) during development.

export interface I18n {
  locale: Locale
  t: Translate
  bytes(n: number): string
  speed(bytesPerSecond: number): string
  duration(seconds: number): string
  dateTime(timestamp: number): string
  percent(fraction: number): string
}

export function createI18n(locale: Locale): I18n {
  return {
    locale,
    t: createTranslator(locale),
    bytes: (n) => formatBytes(n, locale),
    speed: (n) => formatSpeed(n, locale),
    duration: formatDuration,
    dateTime: (ts) => formatDateTime(ts, locale),
    percent: (f) => formatPercent(f, locale)
  }
}

export const I18nContext = createContext<I18n>(createI18n('en'))

export function useI18n(): I18n {
  return useContext(I18nContext)
}
