import { useEffect, useState } from 'react'
import type { DownloadOptions } from '@shared/download'
import type { Preview, VideoEntry } from '@shared/media'
import type { AddDownloadsResult, QueueItem } from '@shared/queue'
import type { Settings } from '@shared/settings'
import { playlistUrl } from '@shared/youtube-url'
import { ErrorNotice } from '../components/ErrorNotice'
import { OptionsPanel } from '../components/OptionsPanel'
import { defaultSelection, PlaylistPicker } from '../components/PlaylistPicker'
import { UrlInput } from '../components/UrlInput'
import { VideoCard } from '../components/VideoCard'
import { useLinkPreview } from '../hooks/useLinkPreview'
import { useI18n } from '../i18n-context'

function toItem(entry: VideoEntry): QueueItem {
  return {
    videoId: entry.id,
    title: entry.title,
    channel: entry.channel,
    thumbnail: entry.thumbnail,
    duration: entry.duration,
    uploadDate: entry.uploadDate,
    index: entry.index
  }
}

interface Props {
  settings: Settings | null
  onOpenQueue: () => void
}

export function DownloadPage({ settings, onOpenQueue }: Props): React.JSX.Element {
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

  // Options start from the defaults in Settings; changes here apply to this download only.
  const [options, setOptions] = useState<DownloadOptions | null>(null)
  const [folder, setFolder] = useState('')
  const [result, setResult] = useState<AddDownloadsResult | null>(null)
  useEffect(() => {
    if (settings && !options) setOptions(settings.defaults)
  }, [settings, options])
  useEffect(() => {
    void window.vidsnare.invoke('queue:default-folder').then(setFolder)
  }, [settings?.downloadDir])

  const chooseFolder = async (): Promise<void> => {
    const picked = await window.vidsnare.invoke('dialog:choose-folder', folder)
    if (picked) setFolder(picked)
  }

  const items: QueueItem[] =
    preview?.kind === 'video'
      ? [toItem(preview.video)]
      : preview?.kind === 'playlist'
        ? preview.entries.filter((e) => selected.has(e.id)).map(toItem)
        : []

  const download = async (): Promise<void> => {
    if (!options || items.length === 0 || !preview) return
    const added = await window.vidsnare.invoke('queue:add', {
      items,
      options,
      outputDir: folder,
      playlistTitle: preview.kind === 'playlist' ? preview.title : null
    })
    setResult(added)
  }

  return (
    <div className="page download-page">
      <UrlInput
        onSubmit={(url) => {
          setResult(null)
          load(url)
        }}
        busy={state.status === 'loading'}
      />
      {state.status === 'idle' && !result && <p className="muted hint">{t('input.hint')}</p>}
      {state.status === 'loading' && (
        <p className="muted loading" role="status">
          <span className="spinner" aria-hidden="true" /> {t('common.loading')}
        </p>
      )}
      {state.status === 'error' && <ErrorNotice error={state.error} onRetry={() => load(state.url)} />}
      {preview?.kind === 'video' && (
        <VideoCard
          video={preview.video}
          playlistId={preview.playlistId}
          onLoadPlaylist={() => preview.playlistId && load(playlistUrl(preview.playlistId))}
        />
      )}
      {preview?.kind === 'playlist' && (
        <PlaylistPicker
          title={preview.title}
          channel={preview.channel}
          entries={preview.entries}
          selected={selected}
          onChange={setSelected}
        />
      )}
      {preview && options && (
        <>
          <OptionsPanel options={options} onChange={setOptions} folder={folder} onChooseFolder={() => void chooseFolder()} />
          <div className="actions">
            <button
              type="button"
              className="btn btn-primary btn-large"
              disabled={items.length === 0}
              onClick={() => void download()}
            >
              {preview.kind === 'playlist' ? t('options.downloadMany', { count: items.length }) : t('options.download')}
            </button>
          </div>
        </>
      )}
      {result && (
        <div className="notice" role="status">
          <p>
            {t('options.added', { count: result.added })}
            {result.skipped > 0 && <> · {t('options.skippedExisting', { count: result.skipped })}</>}
          </p>
          <button type="button" className="btn" onClick={onOpenQueue}>
            {t('nav.queue')}
          </button>
        </div>
      )}
    </div>
  )
}
