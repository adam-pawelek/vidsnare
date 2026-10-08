/**
 * Calls `fn` at most once per `ms`, always delivering the latest state: a call
 * during the quiet period schedules one trailing run.
 */
export function throttle(fn: () => void, ms: number): (() => void) & { flush(): void } {
  let last = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  const run = (): void => {
    timer = null
    last = Date.now()
    fn()
  }
  const throttled = (): void => {
    if (timer) return
    const wait = ms - (Date.now() - last)
    if (wait <= 0) run()
    else timer = setTimeout(run, wait)
  }
  throttled.flush = (): void => {
    if (timer) clearTimeout(timer)
    run()
  }
  return throttled
}
