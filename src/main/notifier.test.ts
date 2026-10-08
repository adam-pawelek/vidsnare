import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTranslator } from '@shared/i18n'
import type { DownloadJob } from '@shared/queue'
import { Notifier } from './notifier'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

const job = (title: string, status: DownloadJob['status'], code?: string): DownloadJob =>
  ({ title, status, error: code ? { code, retryable: false, detail: '' } : null }) as DownloadJob

function setup(enabled = true, locale: 'en' | 'pl' = 'en') {
  const show = vi.fn()
  const notifier = new Notifier({ show, enabled: () => enabled, translate: () => createTranslator(locale), delayMs: 1000 })
  return { show, notifier }
}

describe('Notifier', () => {
  it('announces a single finished download by title', () => {
    const { show, notifier } = setup()
    notifier.jobFinished(job('My video', 'completed'))
    expect(show).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1000)
    expect(show).toHaveBeenCalledWith('Download finished', 'My video')
  })

  it('summarizes downloads that finish close together', () => {
    const { show, notifier } = setup()
    for (const n of [1, 2, 3, 4, 5]) notifier.jobFinished(job(`Video ${n}`, 'completed'))
    vi.advanceTimersByTime(1000)
    expect(show).toHaveBeenCalledTimes(1)
    expect(show).toHaveBeenCalledWith('5 downloads finished', 'Video 1\nVideo 2\nVideo 3\n…')
  })

  it('explains a failure', () => {
    const { show, notifier } = setup()
    notifier.jobFinished(job('Secret', 'failed', 'PRIVATE_VIDEO'))
    vi.advanceTimersByTime(1000)
    expect(show).toHaveBeenCalledWith('Download failed', 'Secret\nThis video is private.')
  })

  it('reports successes and failures separately', () => {
    const { show, notifier } = setup()
    notifier.jobFinished(job('A', 'completed'))
    notifier.jobFinished(job('B', 'failed', 'NO_INTERNET'))
    notifier.jobFinished(job('C', 'failed', 'NO_INTERNET'))
    vi.advanceTimersByTime(1000)
    expect(show.mock.calls.map((c) => c[0])).toEqual(['Download finished', '2 downloads failed'])
  })

  it('ignores cancelled and skipped downloads', () => {
    const { show, notifier } = setup()
    notifier.jobFinished(job('A', 'cancelled'))
    notifier.jobFinished(job('B', 'skipped'))
    vi.advanceTimersByTime(5000)
    expect(show).not.toHaveBeenCalled()
  })

  it('stays quiet when notifications are off', () => {
    const { show, notifier } = setup(false)
    notifier.jobFinished(job('A', 'completed'))
    vi.advanceTimersByTime(1000)
    expect(show).not.toHaveBeenCalled()
  })

  it('uses the app language', () => {
    const { show, notifier } = setup(true, 'pl')
    notifier.jobFinished(job('A', 'completed'))
    notifier.jobFinished(job('B', 'completed'))
    vi.advanceTimersByTime(1000)
    expect(show).toHaveBeenCalledWith('Zakończono 2 pobierania', 'A\nB')
  })

  it('starts a new batch after flushing', () => {
    const { show, notifier } = setup()
    notifier.jobFinished(job('A', 'completed'))
    vi.advanceTimersByTime(1000)
    notifier.jobFinished(job('B', 'completed'))
    vi.advanceTimersByTime(1000)
    expect(show).toHaveBeenCalledTimes(2)
  })
})
