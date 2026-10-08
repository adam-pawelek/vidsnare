import { useMemo, useState } from 'react'
import type { VideoEntry } from '@shared/media'
import { useI18n } from '../i18n'
import { Thumbnail } from './Thumbnail'

interface Props {
  title: string
  channel: string | null
  entries: VideoEntry[]
  selected: ReadonlySet<string>
  onChange: (selected: Set<string>) => void
}

export function selectable(entry: VideoEntry): boolean {
  return entry.available
}

/** What a fresh playlist starts with: everything downloadable you don't have yet. */
export function defaultSelection(entries: VideoEntry[]): Set<string> {
  return new Set(entries.filter((e) => selectable(e) && !e.downloaded).map((e) => e.id))
}

export function PlaylistPicker({ title, channel, entries, selected, onChange }: Props): React.JSX.Element {
  const { t, duration } = useI18n()
  const [hideDownloaded, setHideDownloaded] = useState(false)
  const anyDownloaded = entries.some((e) => e.downloaded)
  const visible = useMemo(
    () => (hideDownloaded ? entries.filter((e) => !e.downloaded) : entries),
    [entries, hideDownloaded]
  )

  const toggle = (id: string): void => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(next)
  }

  return (
    <section className="playlist" aria-label={title}>
      <header className="playlist-header">
        <div>
          <h2>{title}</h2>
          <p className="muted">
            {channel && <>{t('preview.by', { channel })} · </>}
            {t('preview.videos', { count: entries.length })}
          </p>
        </div>
        <div className="playlist-tools">
          <span className="muted" aria-live="polite">
            {t('preview.selected', { selected: selected.size, total: entries.filter(selectable).length })}
          </span>
          <button type="button" className="btn btn-ghost" onClick={() => onChange(new Set(entries.filter(selectable).map((e) => e.id)))}>
            {t('preview.selectAll')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => onChange(new Set())}>
            {t('preview.selectNone')}
          </button>
          {anyDownloaded && (
            <label className="checkbox">
              <input type="checkbox" checked={hideDownloaded} onChange={(e) => setHideDownloaded(e.target.checked)} />
              {t('preview.hideDownloaded')}
            </label>
          )}
        </div>
      </header>
      <ul className="playlist-list">
        {visible.map((entry) => {
          const enabled = selectable(entry)
          return (
            <li key={entry.id} className={enabled ? '' : 'disabled'}>
              <label>
                <input
                  type="checkbox"
                  checked={selected.has(entry.id)}
                  disabled={!enabled}
                  onChange={() => toggle(entry.id)}
                />
                <span className="index muted">{entry.index}</span>
                <Thumbnail src={entry.thumbnail} className="thumb-small" />
                <span className="entry-text">
                  <span className="entry-title">{entry.title}</span>
                  <span className="muted">
                    {entry.channel}
                    {!enabled && <span className="badge">{t('preview.unavailableEntry')}</span>}
                    {entry.downloaded && <span className="badge">{t('preview.alreadyDownloaded')}</span>}
                    {entry.live && <span className="badge badge-live">{t('preview.live')}</span>}
                  </span>
                </span>
                <span className="muted duration">{entry.duration !== null ? duration(entry.duration) : ''}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
