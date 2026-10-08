/** Recognises YouTube links and turns them into canonical URLs for yt-dlp. */

export type ParsedYouTubeUrl =
  | { kind: 'video'; videoId: string; playlistId?: string; url: string }
  | { kind: 'playlist'; playlistId: string; url: string }
  | { kind: 'channel'; url: string }

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/
const PLAYLIST_ID = /^[A-Za-z0-9_-]{2,64}$/
const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com'
])

export function videoUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}

export function playlistUrl(playlistId: string): string {
  return `https://www.youtube.com/playlist?list=${playlistId}`
}

export function parseYouTubeUrl(input: string): ParsedYouTubeUrl | null {
  const text = input.trim()
  if (!text || /\s/.test(text)) return null

  let url: URL
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `https://${text}`)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  if (url.username || url.password) return null

  const host = url.hostname.toLowerCase()
  const segments = url.pathname.split('/').filter(Boolean)
  const listParam = url.searchParams.get('list') ?? undefined
  const playlistId = listParam && PLAYLIST_ID.test(listParam) ? listParam : undefined

  const video = (id: string | undefined | null): ParsedYouTubeUrl | null => {
    if (!id || !VIDEO_ID.test(id)) return null
    return playlistId
      ? { kind: 'video', videoId: id, playlistId, url: videoUrl(id) }
      : { kind: 'video', videoId: id, url: videoUrl(id) }
  }

  if (host === 'youtu.be') return video(segments[0])
  if (!YOUTUBE_HOSTS.has(host)) return null

  const [first, second] = segments
  switch (first) {
    case 'watch':
      return video(url.searchParams.get('v')) ?? (playlistId ? playlist(playlistId) : null)
    case 'shorts':
    case 'live':
    case 'embed':
    case 'v':
    case 'e':
      return video(second)
    case 'playlist':
      return playlistId ? playlist(playlistId) : null
    case 'channel':
    case 'c':
    case 'user':
      return second ? { kind: 'channel', url: `https://www.youtube.com/${first}/${second}/videos` } : null
    default:
      if (first?.startsWith('@') && first.length > 1) {
        return { kind: 'channel', url: `https://www.youtube.com/${first}/videos` }
      }
      return null
  }
}

function playlist(playlistId: string): ParsedYouTubeUrl {
  return { kind: 'playlist', playlistId, url: playlistUrl(playlistId) }
}
