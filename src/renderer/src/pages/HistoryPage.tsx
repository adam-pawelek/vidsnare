import { useState } from 'react'
import type { HistoryItem } from '@shared/history'
import { Thumbnail } from '../components/Thumbnail'
import { useHistory } from '../hooks/useHistory'
import { useI18n } from '../i18n-context'

function formatLabel(item: HistoryItem): string {
  const ext = item.filePath.match(/\.([A-Za-z0-9]+)$/)?.[1]
  return (ext ?? (item.options.kind === 'audio' ? item.options.audioFormat : item.options.container)).toUpperCase()
}

function Row({ item, onAgain }: { item: HistoryItem; onAgain: () => void }): React.JSX.Element {
  const { t, bytes, dateTime } = useI18n()
  const call = (channel: 'history:open-file' | 'history:show-in-folder' | 'history:remove'): void =>
    void window.vidsnare.invoke(channel, item.id)

  return (
    <li className="job">
      <Thumbnail src={item.thumbnail} className="thumb-small" />
      <div className="job-body">
        <div className="job-title" title={item.title}>
          {item.title}
        </div>
        <div className="job-meta muted">
          {item.channel && <span>{item.channel}</span>}
          <span>{dateTime(item.finishedAt)}</span>
          <span className="badge">{formatLabel(item)}</span>
          {item.fileSize !== null && <span>{bytes(item.fileSize)}</span>}
        </div>
        {!item.fileExists && <p className="job-error">{t('history.fileMissing')}</p>}
      </div>
      <div className="job-actions">
        {item.fileExists ? (
          <>
            <button type="button" className="btn" onClick={() => call('history:open-file')}>
              {t('queue.openFile')}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => call('history:show-in-folder')}>
              {t('queue.showInFolder')}
            </button>
          </>
        ) : (
          <button type="button" className="btn" onClick={onAgain}>
            {t('history.downloadAgain')}
          </button>
        )}
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          aria-label={t('common.remove')}
          title={t('common.remove')}
          onClick={() => call('history:remove')}
        >
          ×
        </button>
      </div>
    </li>
  )
}

export function HistoryPage({ onQueued }: { onQueued: () => void }): React.JSX.Element {
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const [confirming, setConfirming] = useState(false)
  const items = useHistory(search)

  const again = async (id: string): Promise<void> => {
    await window.vidsnare.invoke('history:download-again', id)
    onQueued()
  }

  return (
    <div className="page history-page">
      <header className="page-header">
        <h1>{t('nav.history')}</h1>
        {items !== null && (items.length > 0 || search) && !confirming && (
          <button type="button" className="btn btn-ghost" onClick={() => setConfirming(true)}>
            {t('history.clear')}
          </button>
        )}
      </header>

      {confirming && (
        <div className="notice notice-error" role="alertdialog" aria-label={t('history.clear')}>
          <p>{t('history.clearConfirm')}</p>
          <div className="notice-actions">
            <button type="button" className="btn" onClick={() => setConfirming(false)}>
              {t('common.cancel')}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setConfirming(false)
                void window.vidsnare.invoke('history:clear')
              }}
            >
              {t('history.clear')}
            </button>
          </div>
        </div>
      )}

      {(items === null || items.length > 0 || search) && (
        <input
          type="search"
          className="search"
          placeholder={t('history.search')}
          aria-label={t('history.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {items !== null && items.length === 0 && (
        <p className="muted empty">{search ? t('history.noResults') : t('history.empty')}</p>
      )}
      {items !== null && items.length > 0 && (
        <ul className="jobs">
          {items.map((item) => (
            <Row key={item.id} item={item} onAgain={() => void again(item.id)} />
          ))}
        </ul>
      )}
    </div>
  )
}
