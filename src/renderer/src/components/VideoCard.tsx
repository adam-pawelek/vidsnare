import type { VideoEntry } from '@shared/media'
import { useI18n } from '../i18n-context'
import { Thumbnail } from './Thumbnail'

interface Props {
  video: VideoEntry
  playlistId: string | null
  onLoadPlaylist?: () => void
}

export function VideoCard({ video, playlistId, onLoadPlaylist }: Props): React.JSX.Element {
  const { t, duration } = useI18n()
  return (
    <article className="video-card">
      <Thumbnail src={video.thumbnail} className="thumb-large" />
      <div className="video-card-body">
        <h2>{video.title}</h2>
        {video.channel && <p className="muted">{t('preview.by', { channel: video.channel })}</p>}
        <p className="muted">
          {video.live ? (
            <span className="badge badge-live">{t('preview.live')}</span>
          ) : (
            video.duration !== null && (
              <>
                {t('preview.duration')}: {duration(video.duration)}
              </>
            )
          )}
          {video.downloaded && <span className="badge">{t('preview.alreadyDownloaded')}</span>}
        </p>
        {playlistId && onLoadPlaylist && (
          <div className="notice">
            <p>{t('preview.partOfPlaylist')}</p>
            <button type="button" className="btn" onClick={onLoadPlaylist}>
              {t('preview.wholePlaylist')}
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
