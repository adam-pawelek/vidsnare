import { useEffect, useState } from 'react'
import type { AppInfo } from '@shared/ipc'
import { resolveLocale, type MessageKey } from '@shared/i18n'
import { I18nProvider, useI18n } from './i18n'
import { DownloadPage } from './pages/DownloadPage'

type Page = 'download' | 'queue' | 'history' | 'settings'
const PAGES: { id: Page; label: MessageKey }[] = [
  { id: 'download', label: 'nav.download' },
  { id: 'queue', label: 'nav.queue' },
  { id: 'history', label: 'nav.history' },
  { id: 'settings', label: 'nav.settings' }
]

function Shell(): React.JSX.Element {
  const { t } = useI18n()
  const [page, setPage] = useState<Page>('download')
  const [info, setInfo] = useState<AppInfo | null>(null)

  useEffect(() => {
    void window.vidsnare.invoke('app:get-info').then(setInfo)
  }, [])

  return (
    <div className="layout">
      <nav className="sidebar" aria-label="Main">
        <div className="brand">VidSnare</div>
        {PAGES.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`nav-item ${page === p.id ? 'active' : ''}`}
            aria-current={page === p.id ? 'page' : undefined}
            onClick={() => setPage(p.id)}
          >
            {t(p.label)}
          </button>
        ))}
        {info && <div className="version muted">v{info.version}</div>}
      </nav>
      <main className="content">
        {page === 'download' && <DownloadPage />}
        {page !== 'download' && <h1>{t(PAGES.find((p) => p.id === page)!.label)}</h1>}
      </main>
    </div>
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
