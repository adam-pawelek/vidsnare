import { join, resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import type { AddDownloadsRequest } from '@shared/queue'
import { DEFAULT_SETTINGS, type Settings } from '@shared/settings'
import type { DownloadQueue, NewJob } from './download-queue'
import { QueueService, sanitizeItem } from './queue-service'

const DOWNLOADS = resolve('/home/u/Downloads')

function setup(settings: Partial<Settings> = {}, isDownloaded?: (id: string) => boolean) {
  const added: NewJob[] = []
  const queue = { add: vi.fn((jobs: NewJob[]) => added.push(...jobs)) } as unknown as DownloadQueue
  const service = new QueueService({
    queue,
    settings: () => ({ ...DEFAULT_SETTINGS, ...settings }),
    systemDownloads: DOWNLOADS,
    isDownloaded
  })
  return { service, added }
}

const item = (id: string, title = 'T') => ({
  videoId: id,
  title,
  channel: 'C',
  thumbnail: null,
  duration: 10,
  uploadDate: null,
  index: 1
})

const request = (overrides: Partial<AddDownloadsRequest> = {}): AddDownloadsRequest => ({
  items: [item('aaaaaaaaaaa')],
  options: DEFAULT_SETTINGS.defaults,
  outputDir: '',
  playlistTitle: null,
  ...overrides
})

describe('QueueService.add', () => {
  it('queues into the system Downloads folder by default', () => {
    const { service, added } = setup()
    expect(service.add(request())).toEqual({ added: 1, skipped: 0 })
    expect(added[0]).toMatchObject({ outputDir: DOWNLOADS, filenameTemplate: '{title} [{id}]', playlistCount: null })
  })

  it('uses the folder from settings', () => {
    const { service, added } = setup({ downloadDir: resolve('/media/videos') })
    service.add(request())
    expect(added[0]!.outputDir).toBe(resolve('/media/videos'))
  })

  it('accepts a folder only after the user picked it', () => {
    const { service, added } = setup()
    const picked = resolve('/mnt/usb')
    service.add(request({ outputDir: picked }))
    expect(added[0]!.outputDir).toBe(DOWNLOADS)
    service.approveDirectory(picked)
    service.add(request({ outputDir: picked }))
    expect(added[1]!.outputDir).toBe(picked)
  })

  it('ignores relative folders', () => {
    const { service, added } = setup()
    service.add(request({ outputDir: '../../etc' }))
    expect(added[0]!.outputDir).toBe(DOWNLOADS)
  })

  it('puts playlists into a sanitized subfolder', () => {
    const { service, added } = setup()
    service.add(request({ items: [item('aaaaaaaaaaa'), item('bbbbbbbbbbb')], playlistTitle: 'Mix: 2024/25' }))
    expect(added[0]!.outputDir).toBe(join(DOWNLOADS, 'Mix： 2024／25'))
    expect(added[0]!.playlistCount).toBe(2)
  })

  it('skips the subfolder when disabled', () => {
    const { service, added } = setup({ playlistSubfolder: false })
    service.add(request({ playlistTitle: 'Mix' }))
    expect(added[0]!.outputDir).toBe(DOWNLOADS)
  })

  it('skips videos already downloaded when adding a playlist', () => {
    const { service, added } = setup({}, (id) => id === 'bbbbbbbbbbb')
    const result = service.add(request({ items: [item('aaaaaaaaaaa'), item('bbbbbbbbbbb'), item('ccccccccccc')] }))
    expect(result).toEqual({ added: 2, skipped: 1 })
    expect(added.map((j) => j.item.videoId)).toEqual(['aaaaaaaaaaa', 'ccccccccccc'])
  })

  it('downloads a single video again when asked explicitly', () => {
    const { service } = setup({}, () => true)
    expect(service.add(request())).toEqual({ added: 1, skipped: 0 })
  })

  it('does not skip when the setting is off', () => {
    const { service } = setup({ skipDownloaded: false }, () => true)
    expect(service.add(request({ items: [item('aaaaaaaaaaa'), item('bbbbbbbbbbb')] }))).toEqual({ added: 2, skipped: 0 })
  })

  it('drops invalid and duplicate items', () => {
    const { service, added } = setup()
    const result = service.add(
      request({ items: [item('aaaaaaaaaaa'), item('aaaaaaaaaaa'), { videoId: '../../x' } as never, null as never] })
    )
    expect(result.added).toBe(1)
    expect(added).toHaveLength(1)
  })

  it('validates options against settings defaults', () => {
    const { service, added } = setup()
    service.add(request({ options: { kind: 'audio', audioFormat: 'flac' } as never }))
    expect(added[0]!.options).toMatchObject({ kind: 'audio', audioFormat: 'mp3' })
  })

  it('survives a malformed request', () => {
    const { service } = setup()
    expect(service.add(null as never)).toEqual({ added: 0, skipped: 0 })
  })
})

describe('QueueService.requeue', () => {
  it('queues into the given folder with the given options', () => {
    const { service, added } = setup()
    const folder = resolve('/old/place')
    service.requeue(item('aaaaaaaaaaa'), { ...DEFAULT_SETTINGS.defaults, kind: 'audio' }, folder)
    expect(added[0]).toMatchObject({ outputDir: folder, options: { kind: 'audio' } })
  })
})

describe('sanitizeItem', () => {
  it('keeps only safe fields', () => {
    expect(
      sanitizeItem({
        videoId: 'aaaaaaaaaaa',
        title: 'x'.repeat(1000),
        thumbnail: 'https://evil.example/a.jpg',
        duration: -5,
        uploadDate: '2024-01-01',
        extra: 'ignored'
      })
    ).toEqual({
      videoId: 'aaaaaaaaaaa',
      title: 'x'.repeat(500),
      channel: null,
      thumbnail: null,
      duration: null,
      uploadDate: null,
      index: null
    })
  })

  it('accepts YouTube thumbnails', () => {
    expect(sanitizeItem({ videoId: 'aaaaaaaaaaa', thumbnail: 'https://i.ytimg.com/vi/a/b.jpg' })?.thumbnail).toBe(
      'https://i.ytimg.com/vi/a/b.jpg'
    )
  })
})
