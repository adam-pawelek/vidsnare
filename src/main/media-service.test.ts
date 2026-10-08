import { describe, expect, it, vi } from 'vitest'
import type { RunResult, Runner } from './core/runner'
import { MediaService } from './media-service'
import type { ResolvedTools, ToolManager } from './tools/tool-manager'

const tools = (overrides: Partial<ResolvedTools> = {}): ToolManager =>
  ({
    resolve: async () => ({
      'yt-dlp': { name: 'yt-dlp', path: '/t/yt-dlp', version: '2026.08.19', source: 'updated' },
      ffmpeg: { name: 'ffmpeg', path: '/t/bin/ffmpeg', version: 'n7.1', source: 'bundled' },
      deno: { name: 'deno', path: '/t/deno', version: '2.9.7', source: 'updated' },
      ...overrides
    })
  }) as unknown as ToolManager

const ok = (stdout: string): RunResult => ({ code: 0, stdout, stderr: '', cancelled: false, timedOut: false })
const videoJson = JSON.stringify({ _type: 'video', id: 'dQw4w9WgXcQ', title: 'T', channel: 'C', duration: 10 })

describe('MediaService.fetchInfo', () => {
  it('runs yt-dlp on the canonical URL with the bundled tools', async () => {
    const run = vi.fn<Runner>(async () => ok(videoJson))
    const result = await new MediaService(tools(), run).fetchInfo('youtu.be/dQw4w9WgXcQ?si=track')
    expect(result.ok).toBe(true)
    const [command, args] = run.mock.calls[0]!
    expect(command).toBe('/t/yt-dlp')
    expect(args.slice(-2)).toEqual(['--', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'])
    expect(args).toContain('/t/bin')
    expect(args).toContain('deno:/t/deno')
  })

  it('keeps the playlist ID of a video opened from a playlist', async () => {
    const run = vi.fn<Runner>(async () => ok(videoJson))
    const result = await new MediaService(tools(), run).fetchInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL1')
    expect(result.ok && result.preview.kind === 'video' && result.preview.playlistId).toBe('PL1')
  })

  it('rejects non-YouTube links without running anything', async () => {
    const run = vi.fn<Runner>()
    const result = await new MediaService(tools(), run).fetchInfo('https://example.com/video')
    expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_URL' } })
    expect(run).not.toHaveBeenCalled()
  })

  it('reports a missing engine', async () => {
    const result = await new MediaService(tools({ 'yt-dlp': null }), vi.fn<Runner>()).fetchInfo('youtu.be/dQw4w9WgXcQ')
    expect(result).toMatchObject({ ok: false, error: { code: 'TOOL_MISSING' } })
  })

  it('explains yt-dlp errors', async () => {
    const run = vi.fn<Runner>(async () => ({
      ...ok(''),
      code: 1,
      stderr: 'ERROR: [youtube] dQw4w9WgXcQ: Private video. Sign in if you have access'
    }))
    expect(await new MediaService(tools(), run).fetchInfo('youtu.be/dQw4w9WgXcQ')).toMatchObject({
      ok: false,
      error: { code: 'PRIVATE_VIDEO', retryable: false }
    })
  })

  it('reports cancellation and timeouts', async () => {
    const cancelled = vi.fn<Runner>(async () => ({ ...ok(''), code: null, cancelled: true }))
    expect(await new MediaService(tools(), cancelled).fetchInfo('youtu.be/dQw4w9WgXcQ')).toMatchObject({
      error: { code: 'CANCELLED' }
    })
    const slow = vi.fn<Runner>(async () => ({ ...ok(''), code: null, timedOut: true }))
    expect(await new MediaService(tools(), slow).fetchInfo('youtu.be/dQw4w9WgXcQ')).toMatchObject({
      error: { code: 'NO_INTERNET' }
    })
  })

  it('handles a spawn failure', async () => {
    const run = vi.fn<Runner>(async () => Promise.reject(Object.assign(new Error('x'), { code: 'EACCES' })))
    expect(await new MediaService(tools(), run).fetchInfo('youtu.be/dQw4w9WgXcQ')).toMatchObject({
      error: { code: 'PERMISSION_DENIED' }
    })
  })

  it('handles unreadable output', async () => {
    const run = vi.fn<Runner>(async () => ok('not json'))
    expect(await new MediaService(tools(), run).fetchInfo('youtu.be/dQw4w9WgXcQ')).toMatchObject({
      error: { code: 'UNKNOWN' }
    })
  })

  it('marks already-downloaded videos', async () => {
    const playlist = JSON.stringify({
      _type: 'playlist',
      id: 'PL1',
      title: 'P',
      entries: [
        { id: 'aaaaaaaaaaa', title: 'a' },
        { id: 'bbbbbbbbbbb', title: 'b' }
      ]
    })
    const run = vi.fn<Runner>(async () => ok(playlist))
    const service = new MediaService(tools(), run, (id) => id === 'bbbbbbbbbbb')
    const result = await service.fetchInfo('https://www.youtube.com/playlist?list=PL1')
    expect(result.ok && result.preview.kind === 'playlist' && result.preview.entries.map((e) => e.downloaded)).toEqual([
      false,
      true
    ])
  })
})
