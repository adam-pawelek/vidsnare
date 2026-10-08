import type { AppError } from './errors'

/** One video as shown in a preview or playlist. */
export interface VideoEntry {
  id: string
  title: string
  channel: string | null
  /** Seconds; null for live streams or when YouTube doesn't say. */
  duration: number | null
  thumbnail: string | null
  url: string
  /** False for private, deleted or members-only entries in a playlist. */
  available: boolean
  live: boolean
  uploadDate: string | null
  /** Position in the playlist, 1-based. */
  index: number | null
  /** Set when "skip already downloaded" finds it in the history. */
  downloaded?: boolean
}

export type Preview =
  | { kind: 'video'; video: VideoEntry; playlistId: string | null }
  | {
      kind: 'playlist'
      id: string
      title: string
      channel: string | null
      thumbnail: string | null
      entries: VideoEntry[]
    }

export type FetchInfoResult = { ok: true; preview: Preview } | { ok: false; error: AppError }
