import type { UpdateStatus } from '@shared/update'
import { useI18n } from '../i18n'

const invoke = (channel: 'update:check' | 'update:download' | 'update:install' | 'update:open-releases'): void =>
  void window.vidsnare.invoke(channel)

/** Status line and buttons for the Updates section in Settings. */
export function AppUpdateControls({ status }: { status: UpdateStatus | null }): React.JSX.Element | null {
  const { t, percent } = useI18n()
  if (!status || status.mode === 'disabled') return null

  return (
    <div className="row">
      {status.state === 'checking' ? (
        <span className="muted" role="status">
          {t('settings.checking')}
        </span>
      ) : (
        status.state !== 'downloading' &&
        status.state !== 'ready' && (
          <button type="button" className="btn" onClick={() => invoke('update:check')}>
            {t('settings.checkForUpdates')}
          </button>
        )
      )}
      {status.state === 'up-to-date' && <span className="muted" role="status">{t('settings.upToDate')}</span>}
      {status.state === 'error' && (
        <span className="error-text" role="alert">
          {t('settings.updateFailed')}
        </span>
      )}
      <UpdateMessage status={status} percent={percent} />
    </div>
  )
}

function UpdateMessage({ status, percent }: { status: UpdateStatus; percent: (f: number) => string }): React.JSX.Element | null {
  const { t } = useI18n()
  if (status.state === 'available') {
    return (
      <>
        <span role="status">{t('settings.updateAvailable', { version: status.version })}</span>
        {status.mode === 'manual' ? (
          <>
            <span className="muted">{t('settings.manualUpdate')}</span>
            <button type="button" className="btn btn-primary" onClick={() => invoke('update:open-releases')}>
              {t('settings.openReleases')}
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => invoke('update:download')}>
            {t('options.download')}
          </button>
        )}
      </>
    )
  }
  if (status.state === 'downloading') {
    return <span role="status">{t('settings.updateDownloading', { percent: status.fraction === null ? '' : percent(status.fraction) })}</span>
  }
  if (status.state === 'ready') {
    return (
      <>
        <span role="status">{t('settings.updateReady', { version: status.version })}</span>
        <button type="button" className="btn btn-primary" onClick={() => invoke('update:install')}>
          {t('settings.restartToUpdate')}
        </button>
      </>
    )
  }
  return null
}

/** Shown across the app when there is something to do about an update. */
export function UpdateBanner({ status }: { status: UpdateStatus | null }): React.JSX.Element | null {
  const { t } = useI18n()
  if (!status) return null
  if (status.state === 'ready') {
    return (
      <div className="banner" role="status">
        <span>{t('settings.updateReady', { version: status.version })}</span>
        <button type="button" className="btn btn-primary" onClick={() => invoke('update:install')}>
          {t('settings.restartToUpdate')}
        </button>
      </div>
    )
  }
  if (status.state === 'available' && status.mode === 'manual') {
    return (
      <div className="banner" role="status">
        <span>{t('settings.updateAvailable', { version: status.version })}</span>
        <button type="button" className="btn" onClick={() => invoke('update:open-releases')}>
          {t('settings.openReleases')}
        </button>
      </div>
    )
  }
  return null
}
