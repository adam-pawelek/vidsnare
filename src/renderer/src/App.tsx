import { useEffect, useState } from 'react'
import type { AppInfo } from '@shared/ipc'
import { resolveLocale, type MessageKey } from '@shared/i18n'
import { ACTIVE_STATUSES } from '@shared/queue'
import { useQueue } from './hooks/useQueue'
import { useSettings } from './hooks/useSettings'
import { I18nProvider, useI18n } from './i18n'
import { DownloadPage } from './pages/DownloadPage'
import { QueuePage } from './pages/QueuePage'

type Page = 'download' | 'queue' | 'history' | 'settings'
const PAGES: { id: Page; label: MessageKey }[] = [
  { id: 'download', label: 'nav.download' },
  { id: 'queue', label: 'nav.queue' },
  { id: 'history', label: 'nav.history' },
  { id: 'settings', label: 'nav.settings' }
]

function Shell({ settings }: { settings: ReturnType<typeof useSettings>['settings'] }): React.JSX.Element {
  const { t } = useI18n()
  const [page, setPage] = useState<Page>('download')
  const [info, setInfo] = useState<AppInfo | null>(null)
  const jobs = useQueue()
  const active = jobs.filter((j) => ACTIVE_STATUSES.includes(j.status) || j.status === 'queued').length

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
            {p.id === 'queue' && active > 0 && (
              <span className="nav-badge" aria-label={t('queue.active', { count: active })}>
                {active}
              </span>
            )}
          </button>
        ))}
        {info && <div className="version muted">v{info.version}</div>}
      </nav>
      <main className="content">
        {/* The download page stays mounted so a loaded playlist survives switching tabs. */}
        <div hidden={page !== 'download'}>
          <DownloadPage settings={settings} onOpenQueue={() => setPage('queue')} />
        </div>
        {page === 'queue' && <QueuePage jobs={jobs} />}
        {(page === 'history' || page === 'settings') && <h1>{t(PAGES.find((p) => p.id === page)!.label)}</h1>}
      </main>
    </div>
  )
}

export function App(): React.JSX.Element {
  const { settings } = useSettings()
  const language = settings?.language ?? 'system'
  const locale = language === 'system' ? resolveLocale(navigator.languages) : language
  return (
    <I18nProvider locale={locale}>
      <Shell settings={settings} />
    </I18nProvider>
  )
}
