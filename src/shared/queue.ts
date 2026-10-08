import type { DownloadOptions } from './download'
import type { AppError } from './errors'

export type JobStatus = 'queued' | 'downloading' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'skipped'

export const FINISHED_STATUSES: readonly JobStatus[] = ['completed', 'failed', 'cancelled', 'skipped']
export const ACTIVE_STATUSES: readonly JobStatus[] = ['downloading', 'processing']

export interface JobProgress {
  /** 0–1, or null while the size is unknown. */
  fraction: number | null
  downloadedBytes: number
  totalBytes: number | null
  /** Bytes per second. */
  speed: number | null
  /** Seconds left for the current stream. */
  eta: number | null
}

export interface DownloadJob {
  id: string
  videoId: string
  title: string
  channel: string | null
  thumbnail: string | null
  duration: number | null
  options: DownloadOptions
  outputDir: string
  status: JobStatus
  progress: JobProgress | null
  error: AppError | null
  filePath: string | null
  addedAt: number
  finishedAt: number | null
}

/** One video the user picked, as sent by the renderer. */
export interface QueueItem {
  videoId: string
  title: string
  channel: string | null
  thumbnail: string | null
  duration: number | null
  uploadDate: string | null
  index: number | null
}

export interface AddDownloadsRequest {
  items: QueueItem[]
  options: DownloadOptions
  /** Folder chosen on the download screen; empty uses the default from settings. */
  outputDir: string
  /** Set for playlists, so files can go into a folder named after it. */
  playlistTitle: string | null
}

export interface AddDownloadsResult {
  added: number
  /** Already in the history and "skip already downloaded" is on. */
  skipped: number
}
