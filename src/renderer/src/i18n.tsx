import { useEffect, useMemo, type ReactNode } from 'react'
import type { Locale } from '@shared/i18n'
import { createI18n, I18nContext } from './i18n-context'

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }): React.JSX.Element {
  const value = useMemo(() => createI18n(locale), [locale])
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
