import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
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

export interface I18n {
  locale: Locale
  t: Translate
  bytes(n: number): string
  speed(bytesPerSecond: number): string
  duration(seconds: number): string
  dateTime(timestamp: number): string
  percent(fraction: number): string
}

function createI18n(locale: Locale): I18n {
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

const I18nContext = createContext<I18n>(createI18n('en'))

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }): React.JSX.Element {
  const value = useMemo(() => createI18n(locale), [locale])
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18n {
  return useContext(I18nContext)
}
