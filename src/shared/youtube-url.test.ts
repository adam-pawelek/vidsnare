import { describe, expect, it } from 'vitest'
import { parseYouTubeUrl } from './youtube-url'

const ID = 'dQw4w9WgXcQ'
const canonical = `https://www.youtube.com/watch?v=${ID}`

describe('parseYouTubeUrl', () => {
  it.each([
    `https://www.youtube.com/watch?v=${ID}`,
    `http://youtube.com/watch?v=${ID}&t=42s`,
    `www.youtube.com/watch?v=${ID}`,
    `youtube.com/watch?feature=share&v=${ID}`,
    `https://m.youtube.com/watch?v=${ID}`,
    `https://music.youtube.com/watch?v=${ID}`,
    `https://youtu.be/${ID}`,
    `https://youtu.be/${ID}?si=tracking`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://www.youtube.com/live/${ID}?feature=share`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube-nocookie.com/embed/${ID}`,
    `  https://www.youtube.com/watch?v=${ID}  `
  ])('recognises video link %s', (input) => {
    expect(parseYouTubeUrl(input)).toEqual({ kind: 'video', videoId: ID, url: canonical })
  })

  it('keeps the playlist of a video opened from a playlist', () => {
    expect(parseYouTubeUrl(`https://www.youtube.com/watch?v=${ID}&list=PLabc123_-`)).toEqual({
      kind: 'video',
      videoId: ID,
      playlistId: 'PLabc123_-',
      url: canonical
    })
  })

  it('recognises playlists', () => {
    expect(parseYouTubeUrl('https://www.youtube.com/playlist?list=PLabc123')).toEqual({
      kind: 'playlist',
      playlistId: 'PLabc123',
      url: 'https://www.youtube.com/playlist?list=PLabc123'
    })
  })

  it('treats a watch link with only a list as a playlist', () => {
    expect(parseYouTubeUrl('https://www.youtube.com/watch?list=PLabc123')?.kind).toBe('playlist')
  })

  it.each([
    ['https://www.youtube.com/@SomeHandle', 'https://www.youtube.com/@SomeHandle/videos'],
    ['https://www.youtube.com/@SomeHandle/shorts', 'https://www.youtube.com/@SomeHandle/videos'],
    ['https://www.youtube.com/channel/UCabc', 'https://www.youtube.com/channel/UCabc/videos'],
    ['https://www.youtube.com/c/Name', 'https://www.youtube.com/c/Name/videos']
  ])('recognises channel %s', (input, url) => {
    expect(parseYouTubeUrl(input)).toEqual({ kind: 'channel', url })
  })

  it.each([
    '',
    'hello world',
    'https://vimeo.com/123',
    'https://notyoutube.com/watch?v=dQw4w9WgXcQ',
    'https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=short',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ<script>',
    'https://www.youtube.com/feed/subscriptions',
    'javascript:alert(1)',
    'file:///etc/passwd',
    'https://user:pass@www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/'
  ])('rejects %s', (input) => {
    expect(parseYouTubeUrl(input)).toBeNull()
  })

  it('drops tracking and time parameters from the canonical URL', () => {
    expect(parseYouTubeUrl(`https://youtu.be/${ID}?si=abc&t=10`)?.url).toBe(canonical)
  })
})
