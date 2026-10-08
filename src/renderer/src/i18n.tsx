import { useEffect, useMemo, type ReactNode } from 'react'
import { isRtl, type Locale } from '@shared/i18n'
import { createI18n, I18nContext } from './i18n-context'

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }): React.JSX.Element {
  const value = useMemo(() => createI18n(locale), [locale])
  useEffect(() => {
    document.documentElement.lang = locale
    // Arabic, Persian and Hebrew read right to left; the whole layout mirrors.
    document.documentElement.dir = isRtl(locale) ? 'rtl' : 'ltr'
  }, [locale])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
