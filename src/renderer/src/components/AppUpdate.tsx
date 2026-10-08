import type { UpdateStatus } from '@shared/update'
import { useI18n } from '../i18n-context'

const invoke = (channel: 'update:install' | 'update:open-releases'): void => void window.vidsnare.invoke(channel)

/** Update state in Settings. Checking and downloading happen on their own; this only reports. */
export function AppUpdateControls({ status }: { status: UpdateStatus | null }): React.JSX.Element | null {
  const { percent } = useI18n()
  if (!status || status.mode === 'disabled') return null
  if (status.state !== 'available' && status.state !== 'downloading' && status.state !== 'ready') return null
  return (
    <div className="row">
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
        {status.mode === 'manual' && (
          <>
            <span className="muted">{t('settings.manualUpdate')}</span>
            <button type="button" className="btn btn-primary" onClick={() => invoke('update:open-releases')}>
              {t('settings.openReleases')}
            </button>
          </>
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
