import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { DownloadJob } from '@shared/queue'
import { DEFAULT_SETTINGS } from '@shared/settings'
import { HistoryStore, MAX_HISTORY } from './history-store'

let dir: string
let path: string
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'vidsnare-history-'))
  path = join(dir, 'history.json')
})
afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

let n = 0
const job = (overrides: Partial<DownloadJob> = {}): DownloadJob => ({
  id: `job${++n}`,
  videoId: 'aaaaaaaaaaa',
  title: 'Café del Mar',
  channel: 'Chill Channel',
  thumbnail: null,
  duration: 300,
  options: DEFAULT_SETTINGS.defaults,
  outputDir: '/d',
  status: 'completed',
  progress: { fraction: 1, downloadedBytes: 5000, totalBytes: 5000, speed: null, eta: null },
  error: null,
  filePath: `/d/file${n}.mp4`,
  addedAt: 1,
  finishedAt: 1000 + n,
  ...overrides
})

function store(existing: Set<string> = new Set()): HistoryStore {
  let id = 0
  return new HistoryStore(path, async (p) => existing.has(p), () => `h${++id}`)
}

describe('HistoryStore', () => {
  it('records completed downloads, newest first', async () => {
    const s = store()
    await s.load()
    await s.addFromJob(job({ title: 'First' }))
    await s.addFromJob(job({ title: 'Second', videoId: 'bbbbbbbbbbb' }))
    const items = await s.list({ search: '', limit: 50 })
    expect(items.map((i) => i.title)).toEqual(['Second', 'First'])
    expect(items[0]).toMatchObject({ fileSize: 5000, fileExists: false })
  })

  it('ignores jobs that did not complete', async () => {
    const s = store()
    await s.load()
    expect(await s.addFromJob(job({ status: 'failed' }))).toBeNull()
    expect(await s.addFromJob(job({ filePath: null }))).toBeNull()
    expect(await s.list({ search: '', limit: 50 })).toEqual([])
  })

  it('knows which videos were downloaded', async () => {
    const s = store()
    await s.load()
    await s.addFromJob(job())
    expect(s.has('aaaaaaaaaaa')).toBe(true)
    expect(s.has('zzzzzzzzzzz')).toBe(false)
  })

  it('persists across restarts', async () => {
    const s1 = store()
    await s1.load()
    await s1.addFromJob(job())
    const s2 = store()
    await s2.load()
    expect(s2.has('aaaaaaaaaaa')).toBe(true)
    expect(JSON.parse(await readFile(path, 'utf8')).version).toBe(1)
  })

  it('survives a corrupt or hand-edited file', async () => {
    await writeFile(path, JSON.stringify({ entries: [{ id: 'x', videoId: 'bad' }, null, { nonsense: true }] }))
    const s = store()
    await s.load()
    expect(await s.list({ search: '', limit: 50 })).toEqual([])
    await writeFile(path, '{broken')
    await s.load()
    expect(await s.list({ search: '', limit: 50 })).toEqual([])
  })

  it('reports files that were moved or deleted', async () => {
    const s = store(new Set(['/d/kept.mp4']))
    await s.load()
    await s.addFromJob(job({ filePath: '/d/kept.mp4' }))
    await s.addFromJob(job({ filePath: '/d/gone.mp4' }))
    const items = await s.list({ search: '', limit: 50 })
    expect(Object.fromEntries(items.map((i) => [i.filePath, i.fileExists]))).toEqual({
      '/d/kept.mp4': true,
      '/d/gone.mp4': false
    })
  })

  it('replaces the entry when the same file is downloaded again', async () => {
    const s = store()
    await s.load()
    await s.addFromJob(job({ filePath: '/d/same.mp4', finishedAt: 1 }))
    await s.addFromJob(job({ filePath: '/d/same.mp4', finishedAt: 2 }))
    const items = await s.list({ search: '', limit: 50 })
    expect(items).toHaveLength(1)
    expect(items[0]!.finishedAt).toBe(2)
  })

  it('searches title, channel and ID, ignoring case and accents', async () => {
    const s = store()
    await s.load()
    await s.addFromJob(job({ title: 'Café del Mar', channel: 'Chill' }))
    await s.addFromJob(job({ title: 'Rock night', channel: 'Loud', videoId: 'bbbbbbbbbbb' }))
    expect((await s.list({ search: 'cafe', limit: 50 })).map((i) => i.title)).toEqual(['Café del Mar'])
    expect((await s.list({ search: 'LOUD', limit: 50 })).map((i) => i.title)).toEqual(['Rock night'])
    expect((await s.list({ search: 'bbbbbbbbbbb', limit: 50 }))).toHaveLength(1)
    expect((await s.list({ search: 'mar chill', limit: 50 }))).toHaveLength(1)
    expect((await s.list({ search: 'mar loud', limit: 50 }))).toHaveLength(0)
  })

  it('limits results', async () => {
    const s = store()
    await s.load()
    for (let i = 0; i < 5; i++) await s.addFromJob(job())
    expect(await s.list({ search: '', limit: 2 })).toHaveLength(2)
  })

  it('removes single entries and clears everything', async () => {
    const s = store()
    await s.load()
    const a = await s.addFromJob(job())
    await s.addFromJob(job({ videoId: 'bbbbbbbbbbb' }))
    await s.remove(a!.id)
    expect(s.has('aaaaaaaaaaa')).toBe(false)
    expect(s.has('bbbbbbbbbbb')).toBe(true)
    await s.clear()
    expect(s.has('bbbbbbbbbbb')).toBe(false)
  })

  it('keeps a video marked as downloaded while any entry for it remains', async () => {
    const s = store()
    await s.load()
    const mp4 = await s.addFromJob(job({ filePath: '/d/a.mp4' }))
    await s.addFromJob(job({ filePath: '/d/a.mp3' }))
    await s.remove(mp4!.id)
    expect(s.has('aaaaaaaaaaa')).toBe(true)
  })

  it('notifies listeners on change', async () => {
    const s = store()
    await s.load()
    const listener = vi.fn()
    s.onChange(listener)
    await s.addFromJob(job())
    await s.clear()
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('caps the number of entries', async () => {
    const entries = Array.from({ length: MAX_HISTORY }, (_, i) => ({
      id: `old${i}`,
      videoId: 'ccccccccccc',
      title: 'old',
      filePath: `/d/old${i}`,
      finishedAt: i,
      options: DEFAULT_SETTINGS.defaults
    }))
    await writeFile(path, JSON.stringify({ version: 1, entries }))
    const s = store()
    await s.load()
    await s.addFromJob(job())
    const all = await s.list({ search: '', limit: 1000 })
    expect(all[0]!.videoId).toBe('aaaaaaaaaaa')
    const saved = JSON.parse(await readFile(path, 'utf8'))
    expect(saved.entries).toHaveLength(MAX_HISTORY)
  })
})
