import { describe, expect, it } from 'vitest'
import { LineSplitter, parseLine, ProgressTracker, type YtdlpEvent } from './progress'

describe('parseLine', () => {
  it('parses a download progress line (captured from yt-dlp 2026.08.19)', () => {
    expect(parseLine('__VS_DL__ downloading|130048|252182|NA|2810002.6097653955|0|251')).toEqual({
      type: 'download',
      status: 'downloading',
      downloadedBytes: 130048,
      totalBytes: 252182,
      speed: 2810002.6097653955,
      eta: 0,
      formatId: '251'
    })
  })

  it('falls back to the estimated total', () => {
    const e = parseLine('__VS_DL__ downloading|10|NA|5000|NA|NA|137') as Extract<YtdlpEvent, { type: 'download' }>
    expect(e.totalBytes).toBe(5000)
    expect(e.speed).toBeNull()
    expect(e.eta).toBeNull()
  })

  it('parses the finished line', () => {
    expect(parseLine('__VS_DL__ finished|252182|252182|NA|431674.78|NA|251')).toMatchObject({
      type: 'download',
      status: 'finished'
    })
  })

  it('parses post-processing', () => {
    expect(parseLine('__VS_PP__ started|Merger')).toEqual({ type: 'postprocess', status: 'started', name: 'Merger' })
  })

  it('parses the final file path, including spaces and pipes', () => {
    expect(parseLine('__VS_FILE__ /home/u/Downloads/A ｜ B [id].mp4')).toEqual({
      type: 'file',
      path: '/home/u/Downloads/A ｜ B [id].mp4'
    })
  })

  it('handles Windows line endings and colour codes', () => {
    expect(parseLine('\u001b[0;31mERROR:\u001b[0m [youtube] abc: Private video\r')).toEqual({
      type: 'log',
      level: 'error',
      text: '[youtube] abc: Private video'
    })
  })

  it('recognises archive skips', () => {
    expect(parseLine('[download] Title has already been recorded in the archive')).toEqual({ type: 'archived' })
  })

  it('classifies warnings and ignores blank lines', () => {
    expect(parseLine('WARNING: something')).toEqual({ type: 'log', level: 'warning', text: 'something' })
    expect(parseLine('   ')).toBeNull()
  })
})

describe('LineSplitter', () => {
  it('joins lines split across chunks', () => {
    const s = new LineSplitter()
    expect(s.push('one\ntw')).toEqual(['one'])
    expect(s.push('o\r\nthree\rfour')).toEqual(['two', 'three'])
    expect(s.flush()).toEqual(['four'])
    expect(s.flush()).toEqual([])
  })
})

function dl(done: number, total: number | null, formatId: string, status: 'downloading' | 'finished' = 'downloading'): YtdlpEvent {
  return { type: 'download', status, downloadedBytes: done, totalBytes: total, speed: 1000, eta: 5, formatId }
}

describe('ProgressTracker', () => {
  it('tracks a single stream', () => {
    const t = new ProgressTracker()
    expect(t.update(dl(50, 200, '251')).fraction).toBeCloseTo(0.25)
    expect(t.update(dl(200, 200, '251', 'finished')).fraction).toBe(1)
  })

  it('splits the bar evenly across two streams with unknown sizes', () => {
    const t = new ProgressTracker([null, null])
    expect(t.update(dl(500, 1000, '137')).fraction).toBeCloseTo(0.25)
    t.update(dl(1000, 1000, '137', 'finished'))
    const s = t.update(dl(50, 100, '140'))
    expect(s.fraction).toBeCloseTo(0.75)
    expect(s.downloadedBytes).toBe(1050)
    expect(s.totalBytes).toBe(1100)
  })

  it('weights streams by their known sizes', () => {
    const t = new ProgressTracker([900, 100])
    expect(t.update(dl(900, 900, '137', 'finished')).fraction).toBeCloseTo(0.9)
    expect(t.update(dl(50, 100, '140')).fraction).toBeCloseTo(0.95)
  })

  it('detects a new stream when bytes reset without a finished line', () => {
    const t = new ProgressTracker([null, null])
    t.update(dl(1000, 1000, 'x'))
    expect(t.update(dl(10, 100, 'x')).fraction).toBeCloseTo(0.55)
  })

  it('switches to processing after downloads', () => {
    const t = new ProgressTracker()
    t.update(dl(10, 10, '1', 'finished'))
    const s = t.update({ type: 'postprocess', status: 'started', name: 'Merger' })
    expect(s.phase).toBe('processing')
    expect(s.fraction).toBe(1)
    expect(s.speed).toBeNull()
  })

  it('reports unknown progress as null rather than guessing', () => {
    expect(new ProgressTracker().update(dl(10, null, '1')).fraction).toBeNull()
  })
})
