import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { throttle } from './throttle'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('throttle', () => {
  it('runs immediately, then at most once per interval with a trailing call', () => {
    const fn = vi.fn()
    const t = throttle(fn, 250)
    t()
    expect(fn).toHaveBeenCalledTimes(1)
    t()
    t()
    t()
    expect(fn).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(250)
    expect(fn).toHaveBeenCalledTimes(2)
    vi.advanceTimersByTime(1000)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('flushes a pending call immediately', () => {
    const fn = vi.fn()
    const t = throttle(fn, 250)
    t()
    t()
    t.flush()
    expect(fn).toHaveBeenCalledTimes(2)
    vi.advanceTimersByTime(500)
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
