import { useState } from 'react'
import type { Preview } from '@shared/media'
import { playlistUrl } from '@shared/youtube-url'
import { ErrorNotice } from '../components/ErrorNotice'
import { defaultSelection, PlaylistPicker } from '../components/PlaylistPicker'
import { UrlInput } from '../components/UrlInput'
import { VideoCard } from '../components/VideoCard'
import { useLinkPreview } from '../hooks/useLinkPreview'
import { useI18n } from '../i18n'

export function DownloadPage(): React.JSX.Element {
  const { t } = useI18n()
  const { state, load } = useLinkPreview()
  const preview = state.status === 'ready' ? state.preview : null
  // The selection belongs to one preview. A newly loaded playlist starts with every
  // downloadable, not-yet-downloaded video ticked, from its very first render.
  const [choice, setChoice] = useState<{ preview: Preview | null; ids: Set<string> }>({ preview: null, ids: new Set() })
  const selected =
    choice.preview === preview
      ? choice.ids
      : preview?.kind === 'playlist'
        ? defaultSelection(preview.entries)
        : new Set<string>()
  const setSelected = (ids: Set<string>): void => setChoice({ preview, ids })

  return (
    <div className="page download-page">
      <UrlInput onSubmit={load} busy={state.status === 'loading'} />
      {state.status === 'idle' && <p className="muted hint">{t('input.hint')}</p>}
      {state.status === 'loading' && (
        <p className="muted loading" role="status">
          <span className="spinner" aria-hidden="true" /> {t('common.loading')}
        </p>
      )}
      {state.status === 'error' && <ErrorNotice error={state.error} onRetry={() => load(state.url)} />}
      {state.status === 'ready' && state.preview.kind === 'video' && (
        <VideoCard
          video={state.preview.video}
          playlistId={state.preview.playlistId}
          onLoadPlaylist={() => state.preview.kind === 'video' && state.preview.playlistId && load(playlistUrl(state.preview.playlistId))}
        />
      )}
      {state.status === 'ready' && state.preview.kind === 'playlist' && (
        <PlaylistPicker
          title={state.preview.title}
          channel={state.preview.channel}
          entries={state.preview.entries}
          selected={selected}
          onChange={setSelected}
        />
      )}
    </div>
  )
}
