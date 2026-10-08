import { describe, expect, it } from 'vitest'
import { parseInfo, pickThumbnail, safeThumbnail } from './metadata'

// Shaped like real yt-dlp 2026.08.19 output, trimmed to the fields we read.
const video = {
  _type: 'video',
  id: 'aaaaaaaaaaa',
  title: 'A test video',
  channel: 'Test Channel',
  uploader: 'Test Channel',
  duration: 19,
  thumbnail: 'https://i.ytimg.com/vi/aaaaaaaaaaa/hqdefault.jpg?sqp=x',
  thumbnails: [
    { url: 'https://i.ytimg.com/vi/aaaaaaaaaaa/default.jpg', width: 120, height: 90 },
    { url: 'https://i.ytimg.com/vi/aaaaaaaaaaa/sddefault.jpg', width: 640, height: 480 },
    { url: 'https://i.ytimg.com/vi/aaaaaaaaaaa/hqdefault.jpg', width: 480, height: 360 },
    { url: 'https://i.ytimg.com/vi_webp/aaaaaaaaaaa/maxresdefault.webp', preference: 0 }
  ],
  upload_date: '20050424',
  live_status: 'not_live',
  availability: 'public'
}

const entry = (id: string, title: string, extra: Record<string, unknown> = {}) => ({
  _type: 'url',
  ie_key: 'Youtube',
  id,
  url: `https://www.youtube.com/watch?v=${id}`,
  title,
  duration: 235,
  channel: 'Some Artist',
  uploader: 'Some Artist',
  live_status: null,
  availability: null,
  thumbnails: [
    { url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg?a`, width: 168, height: 94 },
    { url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg?b`, width: 336, height: 188 }
  ],
  ...extra
})

const playlist = {
  _type: 'playlist',
  id: 'PLtest',
  title: 'My playlist',
  channel: 'Curator',
  entries: [
    entry('bbbbbbbbbbb', 'First'),
    entry('ccccccccccc', '[Private video]', { duration: null, thumbnails: null }),
    entry('ddddddddddd', '[Deleted video]', { duration: null }),
    entry('bbbbbbbbbbb', 'First again'),
    entry('eeeeeeeeeee', 'Live now', { live_status: 'is_live', duration: null }),
    entry('fffffffffff', 'Members', { availability: 'subscriber_only' }),
    null,
    { _type: 'url', id: 'not-a-video-id', title: 'junk' }
  ]
}

describe('parseInfo: video', () => {
  it('extracts the preview fields', () => {
    expect(parseInfo(JSON.stringify(video), 'PLx')).toEqual({
      kind: 'video',
      playlistId: 'PLx',
      video: {
        id: 'aaaaaaaaaaa',
        title: 'A test video',
        channel: 'Test Channel',
        duration: 19,
        thumbnail: 'https://i.ytimg.com/vi/aaaaaaaaaaa/hqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=aaaaaaaaaaa',
        available: true,
        live: false,
        uploadDate: '20050424',
        index: null
      }
    })
  })

  it('falls back to the uploader and ID', () => {
    const preview = parseInfo(JSON.stringify({ id: 'aaaaaaaaaaa', uploader: 'Up', title: '  ' }))
    expect(preview.kind === 'video' && preview.video.channel).toBe('Up')
    expect(preview.kind === 'video' && preview.video.title).toBe('aaaaaaaaaaa')
  })

  it('rejects output without a valid ID', () => {
    expect(() => parseInfo(JSON.stringify({ title: 'x' }))).toThrow(/no video ID/)
  })
})

describe('parseInfo: playlist', () => {
  const preview = parseInfo(JSON.stringify(playlist))
  if (preview.kind !== 'playlist') throw new Error('expected playlist')

  it('keeps playlist details', () => {
    expect(preview).toMatchObject({ id: 'PLtest', title: 'My playlist', channel: 'Curator' })
  })

  it('drops duplicates, nulls and invalid IDs', () => {
    expect(preview.entries.map((e) => e.id)).toEqual([
      'bbbbbbbbbbb',
      'ccccccccccc',
      'ddddddddddd',
      'eeeeeeeeeee',
      'fffffffffff'
    ])
  })

  it('marks private, deleted and members-only entries unavailable', () => {
    const availability = Object.fromEntries(preview.entries.map((e) => [e.title, e.available]))
    expect(availability).toEqual({
      First: true,
      '[Private video]': false,
      '[Deleted video]': false,
      'Live now': true,
      Members: false
    })
  })

  it('flags live streams', () => {
    expect(preview.entries.find((e) => e.title === 'Live now')?.live).toBe(true)
  })

  it('numbers entries by position', () => {
    expect(preview.entries[0]?.index).toBe(1)
  })

  it('uses a small thumbnail for list rows', () => {
    expect(preview.entries[0]?.thumbnail).toBe('https://i.ytimg.com/vi/bbbbbbbbbbb/hqdefault.jpg?a')
    expect(preview.thumbnail).toBe(preview.entries[0]?.thumbnail)
  })
})

describe('thumbnails', () => {
  it('only allows https YouTube image hosts', () => {
    expect(safeThumbnail('https://i.ytimg.com/vi/x/a.jpg')).toBe('https://i.ytimg.com/vi/x/a.jpg')
    expect(safeThumbnail('https://yt3.ggpht.com/a.jpg')).toBe('https://yt3.ggpht.com/a.jpg')
    expect(safeThumbnail('http://i.ytimg.com/vi/x/a.jpg')).toBeNull()
    expect(safeThumbnail('https://evil.example/a.jpg')).toBeNull()
    expect(safeThumbnail('https://i.ytimg.com.evil.example/a.jpg')).toBeNull()
    expect(safeThumbnail('not a url')).toBeNull()
  })

  it('uses YouTube default thumbnail when none are listed', () => {
    expect(pickThumbnail({ id: 'aaaaaaaaaaa' }, 160)).toBe('https://i.ytimg.com/vi/aaaaaaaaaaa/mqdefault.jpg')
  })

  it('takes the largest available when none is big enough', () => {
    expect(
      pickThumbnail({ thumbnails: [{ url: 'https://i.ytimg.com/a', width: 100 }, { url: 'https://i.ytimg.com/b', width: 120 }] }, 480)
    ).toBe('https://i.ytimg.com/b')
  })
})
