import { isAbsolute, join, resolve } from 'node:path'
import type { AddDownloadsRequest, AddDownloadsResult, QueueItem } from '@shared/queue'
import { normalizeDownloadOptions, type Settings } from '@shared/settings'
import { sanitizeFilename } from '../core/filename'
import type { DownloadQueue } from './download-queue'

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/
const MAX_ITEMS = 5000

export interface QueueServiceDeps {
  queue: DownloadQueue
  settings: () => Settings
  /** The system Downloads folder. */
  systemDownloads: string
  /** True when the video is already in the download history. */
  isDownloaded?: (videoId: string) => boolean
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.slice(0, max) : ''
}

function nullableText(value: unknown, max: number): string | null {
  return typeof value === 'string' && value ? value.slice(0, max) : null
}

function nullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

/** Rebuilds an item from untrusted input, keeping only well-formed fields. */
export function sanitizeItem(raw: unknown): QueueItem | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if (typeof r['videoId'] !== 'string' || !VIDEO_ID.test(r['videoId'])) return null
  const thumbnail = nullableText(r['thumbnail'], 2048)
  return {
    videoId: r['videoId'],
    title: text(r['title'], 500) || r['videoId'],
    channel: nullableText(r['channel'], 200),
    thumbnail: thumbnail && /^https:\/\/([a-z0-9-]+\.)*(ytimg|ggpht)\.com\//i.test(thumbnail) ? thumbnail : null,
    duration: nullableNumber(r['duration']),
    uploadDate: typeof r['uploadDate'] === 'string' && /^\d{8}$/.test(r['uploadDate']) ? r['uploadDate'] : null,
    index: nullableNumber(r['index'])
  }
}

/** Turns requests from the download screen into queue jobs. */
export class QueueService {
  /** Folders the user picked in a dialog this session; only these (or the default) are accepted. */
  private readonly approvedDirs = new Set<string>()

  constructor(private readonly deps: QueueServiceDeps) {}

  approveDirectory(dir: string): void {
    this.approvedDirs.add(resolve(dir))
  }

  defaultDirectory(): string {
    const configured = this.deps.settings().downloadDir
    return configured && isAbsolute(configured) ? configured : this.deps.systemDownloads
  }

  private outputDirectory(requested: unknown): string {
    if (typeof requested === 'string' && requested && isAbsolute(requested)) {
      const dir = resolve(requested)
      if (this.approvedDirs.has(dir) || dir === resolve(this.defaultDirectory())) return dir
    }
    return this.defaultDirectory()
  }

  add(request: AddDownloadsRequest): AddDownloadsResult {
    const settings = this.deps.settings()
    const options = normalizeDownloadOptions(request?.options, settings.defaults)
    const rawItems = Array.isArray(request?.items) ? request.items.slice(0, MAX_ITEMS) : []
    const items = rawItems.map(sanitizeItem).filter((i): i is QueueItem => i !== null)

    let outputDir = this.outputDirectory(request?.outputDir)
    const playlistTitle = typeof request?.playlistTitle === 'string' ? request.playlistTitle.trim() : ''
    if (playlistTitle && settings.playlistSubfolder) {
      outputDir = join(outputDir, sanitizeFilename(playlistTitle, { maxBytes: 100, fallback: 'Playlist' }))
    }

    // Only skip for playlists: picking a single video you already have means "download it again".
    const skipping = settings.skipDownloaded && items.length > 1 && this.deps.isDownloaded
    const wanted = skipping ? items.filter((i) => !this.deps.isDownloaded!(i.videoId)) : items

    const seen = new Set<string>()
    const unique = wanted.filter((i) => !seen.has(i.videoId) && seen.add(i.videoId))

    this.deps.queue.add(
      unique.map((item) => ({
        item,
        options,
        outputDir,
        filenameTemplate: settings.filenameTemplate,
        playlistCount: playlistTitle ? items.length : null
      }))
    )
    return { added: unique.length, skipped: items.length - wanted.length }
  }
}
