import type { Preview, VideoEntry } from '@shared/media'
import { videoUrl } from '@shared/youtube-url'

interface RawThumbnail {
  url?: string
  width?: number
  height?: number
}

/** The subset of yt-dlp's `--dump-single-json` output we use. */
interface RawInfo {
  _type?: string
  id?: string
  title?: string
  channel?: string | null
  uploader?: string | null
  duration?: number | null
  thumbnail?: string | null
  thumbnails?: RawThumbnail[] | null
  upload_date?: string | null
  live_status?: string | null
  availability?: string | null
  entries?: (RawInfo | null)[] | null
  playlist_index?: number | null
}

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/
const UNAVAILABLE_TITLE = /^\[(?:private|deleted|unavailable) video\]$/i
const UNAVAILABLE = new Set(['private', 'needs_auth', 'premium_only', 'subscriber_only'])

/** Only YouTube's own image hosts; anything else would be blocked by the CSP anyway. */
export function safeThumbnail(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    const host = u.hostname
    if (u.protocol !== 'https:') return null
    if (host === 'i.ytimg.com' || host.endsWith('.ytimg.com') || host.endsWith('.ggpht.com')) return u.href
  } catch {
    // Fall through.
  }
  return null
}

/** Picks the smallest thumbnail at least `minWidth` wide, preferring JPEG. */
export function pickThumbnail(info: RawInfo, minWidth: number): string | null {
  const thumbs = (info.thumbnails ?? []).filter((t) => safeThumbnail(t.url))
  const sized = thumbs
    .filter((t) => (t.width ?? 0) >= minWidth)
    .sort((a, b) => (a.width ?? 0) - (b.width ?? 0))
  const pick = sized[0] ?? thumbs.filter((t) => t.width).sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]
  if (pick) return safeThumbnail(pick.url)
  const fallback = safeThumbnail(info.thumbnail)
  if (fallback) return fallback
  // Flat playlist entries sometimes carry no thumbnails; YouTube's default URL always exists.
  return info.id && VIDEO_ID.test(info.id) ? `https://i.ytimg.com/vi/${info.id}/mqdefault.jpg` : null
}

function toEntry(info: RawInfo, index: number | null, minThumbWidth: number): VideoEntry | null {
  if (!info.id || !VIDEO_ID.test(info.id)) return null
  const title = info.title?.trim() || info.id
  const available = !UNAVAILABLE_TITLE.test(title) && !UNAVAILABLE.has(info.availability ?? '')
  return {
    id: info.id,
    title,
    channel: info.channel ?? info.uploader ?? null,
    duration: typeof info.duration === 'number' && info.duration > 0 ? info.duration : null,
    thumbnail: available ? pickThumbnail(info, minThumbWidth) : null,
    url: videoUrl(info.id),
    available,
    live: info.live_status === 'is_live' || info.live_status === 'is_upcoming',
    uploadDate: info.upload_date ?? null,
    index
  }
}

/** Turns yt-dlp's JSON into what the preview screen shows. */
export function parseInfo(json: string, playlistId: string | null = null): Preview {
  const info = JSON.parse(json) as RawInfo

  if (info._type === 'playlist') {
    const entries: VideoEntry[] = []
    const seen = new Set<string>()
    for (const raw of info.entries ?? []) {
      if (!raw) continue
      const entry = toEntry(raw, raw.playlist_index ?? entries.length + 1, 160)
      // Playlists can contain the same video twice; download it once.
      if (entry && !seen.has(entry.id)) {
        seen.add(entry.id)
        entries.push(entry)
      }
    }
    return {
      kind: 'playlist',
      id: info.id ?? '',
      title: info.title?.trim() || info.id || '',
      channel: info.channel ?? info.uploader ?? null,
      thumbnail: entries.find((e) => e.thumbnail)?.thumbnail ?? null,
      entries
    }
  }

  const video = toEntry(info, null, 480)
  if (!video) throw new Error('yt-dlp returned no video ID')
  return { kind: 'video', video, playlistId }
}
