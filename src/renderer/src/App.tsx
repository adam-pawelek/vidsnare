import { useEffect, useState } from 'react'
import type { AppInfo } from '@shared/ipc'
import { resolveLocale } from '@shared/i18n'
import { I18nProvider, useI18n } from './i18n'

function Shell(): React.JSX.Element {
  const { t } = useI18n()
  const [info, setInfo] = useState<AppInfo | null>(null)

  useEffect(() => {
    void window.vidsnare.invoke('app:get-info').then(setInfo)
  }, [])

  return (
    <main className="app">
      <h1>VidSnare</h1>
      <nav aria-label="Main">
        {t('nav.download')} · {t('nav.queue')} · {t('nav.history')} · {t('nav.settings')}
      </nav>
      {info && <p className="muted">v{info.version}</p>}
    </main>
  )
}

export function App(): React.JSX.Element {
  // Replaced by the saved language setting once settings exist.
  const locale = resolveLocale(navigator.languages)
  return (
    <I18nProvider locale={locale}>
      <Shell />
    </I18nProvider>
  )
}
