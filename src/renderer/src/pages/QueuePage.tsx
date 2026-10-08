import { ACTIVE_STATUSES, FINISHED_STATUSES, type DownloadJob } from '@shared/queue'
import { Thumbnail } from '../components/Thumbnail'
import { useI18n } from '../i18n-context'

function ProgressBar({ fraction }: { fraction: number | null }): React.JSX.Element {
  return (
    <div
      className={`progress ${fraction === null ? 'indeterminate' : ''}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={fraction === null ? undefined : Math.round(fraction * 100)}
    >
      <div className="progress-fill" style={fraction === null ? undefined : { width: `${fraction * 100}%` }} />
    </div>
  )
}

function JobRow({ job }: { job: DownloadJob }): React.JSX.Element {
  const { t, bytes, speed, duration } = useI18n()
  const invoke = (channel: 'queue:cancel' | 'queue:retry' | 'queue:remove' | 'queue:open-file' | 'queue:show-in-folder'): void =>
    void window.vidsnare.invoke(channel, job.id)
  const p = job.progress
  const active = ACTIVE_STATUSES.includes(job.status)

  return (
    <li className={`job job-${job.status}`}>
      <Thumbnail src={job.thumbnail} className="thumb-small" />
      <div className="job-body">
        <div className="job-title" title={job.title}>
          {job.title}
        </div>
        <div className="job-meta muted">
          <span className={`status status-${job.status}`}>{t(`queue.status.${job.status}`)}</span>
          {active && p && p.totalBytes !== null && (
            <span>{t('queue.progress', { done: bytes(p.downloadedBytes), total: bytes(p.totalBytes) })}</span>
          )}
          {job.status === 'downloading' && p?.speed != null && <span>{speed(p.speed)}</span>}
          {job.status === 'downloading' && p?.eta != null && <span>{t('queue.eta', { time: duration(p.eta) })}</span>}
          {job.status === 'completed' && p?.totalBytes != null && <span>{bytes(p.totalBytes)}</span>}
        </div>
        {(active || job.status === 'queued') && (
          <ProgressBar fraction={job.status === 'queued' ? 0 : job.status === 'processing' ? null : (p?.fraction ?? null)} />
        )}
        {job.status === 'failed' && job.error && <p className="job-error">{t(`errors.${job.error.code}`)}</p>}
      </div>
      <div className="job-actions">
        {!FINISHED_STATUSES.includes(job.status) && (
          <button type="button" className="btn btn-ghost" onClick={() => invoke('queue:cancel')}>
            {t('queue.cancel')}
          </button>
        )}
        {(job.status === 'failed' || job.status === 'cancelled') && (
          <button type="button" className="btn" onClick={() => invoke('queue:retry')}>
            {t('queue.retry')}
          </button>
        )}
        {job.status === 'completed' && job.filePath && (
          <>
            <button type="button" className="btn" onClick={() => invoke('queue:open-file')}>
              {t('queue.openFile')}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => invoke('queue:show-in-folder')}>
              {t('queue.showInFolder')}
            </button>
          </>
        )}
        {FINISHED_STATUSES.includes(job.status) && (
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            aria-label={t('common.remove')}
            title={t('common.remove')}
            onClick={() => invoke('queue:remove')}
          >
            ×
          </button>
        )}
      </div>
    </li>
  )
}

export function QueuePage({ jobs }: { jobs: DownloadJob[] }): React.JSX.Element {
  const { t } = useI18n()
  const unfinished = jobs.filter((j) => !FINISHED_STATUSES.includes(j.status)).length
  const finished = jobs.length - unfinished

  return (
    <div className="page queue-page">
      <header className="page-header">
        <h1>{t('nav.queue')}</h1>
        <div className="page-tools">
          {unfinished > 0 && (
            <button type="button" className="btn btn-ghost" onClick={() => void window.vidsnare.invoke('queue:cancel-all')}>
              {t('queue.cancelAll')}
            </button>
          )}
          {finished > 0 && (
            <button type="button" className="btn" onClick={() => void window.vidsnare.invoke('queue:clear-finished')}>
              {t('queue.clearFinished')}
            </button>
          )}
        </div>
      </header>
      {jobs.length === 0 ? (
        <p className="muted empty">{t('queue.empty')}</p>
      ) : (
        <ul className="jobs">
          {jobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </ul>
      )}
    </div>
  )
}
