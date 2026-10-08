import { randomUUID } from 'node:crypto'
import { access } from 'node:fs/promises'
import type { HistoryEntry, HistoryItem, HistoryQuery } from '@shared/history'
import type { DownloadJob } from '@shared/queue'
import { normalizeDownloadOptions } from '@shared/settings'
import { JsonFile } from '../json-file'

/** Oldest entries are dropped beyond this, so the file stays small. */
export const MAX_HISTORY = 10_000

interface HistoryFile {
  version: 1
  entries: HistoryEntry[]
}

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/

function validEntry(raw: unknown): HistoryEntry | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if (typeof r['id'] !== 'string' || typeof r['videoId'] !== 'string' || !VIDEO_ID.test(r['videoId'])) return null
  if (typeof r['filePath'] !== 'string' || typeof r['finishedAt'] !== 'number') return null
  return {
    id: r['id'],
    videoId: r['videoId'],
    title: typeof r['title'] === 'string' ? r['title'] : r['videoId'],
    channel: typeof r['channel'] === 'string' ? r['channel'] : null,
    thumbnail: typeof r['thumbnail'] === 'string' ? r['thumbnail'] : null,
    duration: typeof r['duration'] === 'number' ? r['duration'] : null,
    options: normalizeDownloadOptions(r['options']),
    filePath: r['filePath'],
    fileSize: typeof r['fileSize'] === 'number' ? r['fileSize'] : null,
    finishedAt: r['finishedAt']
  }
}

/** Folds accents and case so "cafe" finds "Café". */
function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()
}

export class HistoryStore {
  private entries: HistoryEntry[] = []
  private readonly videoIds = new Map<string, number>()
  private readonly file: JsonFile<HistoryFile>
  private readonly listeners = new Set<() => void>()

  constructor(
    path: string,
    private readonly exists: (path: string) => Promise<boolean> = (p) =>
      access(p).then(
        () => true,
        () => false
      ),
    private readonly newId: () => string = randomUUID
  ) {
    this.file = new JsonFile(path)
  }

  async load(): Promise<void> {
    const raw = (await this.file.read()) as Partial<HistoryFile> | undefined
    const list = Array.isArray(raw?.entries) ? raw.entries : []
    this.entries = list.map(validEntry).filter((e): e is HistoryEntry => e !== null)
    this.reindex()
  }

  /** True when this video was downloaded before (in any format). */
  has(videoId: string): boolean {
    return this.videoIds.has(videoId)
  }

  get(id: string): HistoryEntry | undefined {
    return this.entries.find((e) => e.id === id)
  }

  async addFromJob(job: DownloadJob): Promise<HistoryEntry | null> {
    if (job.status !== 'completed' || !job.filePath) return null
    const entry: HistoryEntry = {
      id: this.newId(),
      videoId: job.videoId,
      title: job.title,
      channel: job.channel,
      thumbnail: job.thumbnail,
      duration: job.duration,
      options: job.options,
      filePath: job.filePath,
      fileSize: job.progress?.totalBytes ?? null,
      finishedAt: job.finishedAt ?? Date.now()
    }
    // Newest first; the same file downloaded again replaces its old entry.
    this.entries = [entry, ...this.entries.filter((e) => e.filePath !== entry.filePath)].slice(0, MAX_HISTORY)
    await this.save()
    return entry
  }

  async list(query: HistoryQuery): Promise<HistoryItem[]> {
    const terms = fold(query.search.trim()).split(/\s+/).filter(Boolean)
    const matches = terms.length
      ? this.entries.filter((e) => {
          const haystack = fold(`${e.title} ${e.channel ?? ''} ${e.videoId}`)
          return terms.every((t) => haystack.includes(t))
        })
      : this.entries
    const page = matches.slice(0, Math.max(1, Math.min(query.limit, 1000)))
    return Promise.all(page.map(async (e) => ({ ...e, fileExists: await this.exists(e.filePath) })))
  }

  async remove(id: string): Promise<void> {
    const before = this.entries.length
    this.entries = this.entries.filter((e) => e.id !== id)
    if (this.entries.length !== before) await this.save()
  }

  async clear(): Promise<void> {
    this.entries = []
    await this.save()
  }

  onChange(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private async save(): Promise<void> {
    this.reindex()
    await this.file.write({ version: 1, entries: this.entries })
    for (const listener of this.listeners) listener()
  }

  private reindex(): void {
    this.videoIds.clear()
    for (const e of this.entries) this.videoIds.set(e.videoId, (this.videoIds.get(e.videoId) ?? 0) + 1)
  }
}
