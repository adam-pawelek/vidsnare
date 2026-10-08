import type { DownloadOptions } from './download'

export interface HistoryEntry {
  id: string
  videoId: string
  title: string
  channel: string | null
  thumbnail: string | null
  duration: number | null
  options: DownloadOptions
  filePath: string
  fileSize: number | null
  finishedAt: number
}

/** An entry as shown in the History screen. */
export interface HistoryItem extends HistoryEntry {
  /** False when the file was moved or deleted since the download. */
  fileExists: boolean
}

export interface HistoryQuery {
  search: string
  limit: number
}
