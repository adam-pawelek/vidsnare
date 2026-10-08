import { spawn, spawnSync } from 'node:child_process'
import { LineSplitter } from './progress'

export interface RunOptions {
  /** Called for each complete line from stdout and stderr. */
  onLine?: (line: string, stream: 'stdout' | 'stderr') => void
  signal?: AbortSignal
  timeoutMs?: number
  /** Keep at most this many characters of each stream (for error messages). */
  maxBuffer?: number
}

export interface RunResult {
  code: number | null
  stdout: string
  stderr: string
  cancelled: boolean
  timedOut: boolean
}

export type Runner = (command: string, args: string[], options?: RunOptions) => Promise<RunResult>

function keepTail(text: string, max: number): string {
  return text.length > max ? text.slice(text.length - max) : text
}

/**
 * Stops a process and everything it started. yt-dlp's standalone builds start
 * a second process and launch ffmpeg, so killing only the parent isn't enough.
 */
export function killTree(pid: number, platform: string = process.platform): void {
  if (platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(pid), '/T', '/F'], { windowsHide: true })
    return
  }
  try {
    // The child was started in its own process group (detached), so -pid reaches all of it.
    process.kill(-pid, 'SIGTERM')
  } catch {
    try {
      process.kill(pid, 'SIGTERM')
    } catch {
      // Already gone.
    }
  }
}

export const spawnRunner: Runner = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const { onLine, signal, timeoutMs, maxBuffer = 1_000_000 } = options
    if (signal?.aborted) {
      resolve({ code: null, stdout: '', stderr: '', cancelled: true, timedOut: false })
      return
    }

    const child = spawn(command, args, {
      windowsHide: true,
      detached: process.platform !== 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
      // Python defaults to the ANSI code page on Windows, which mangles non-Latin titles.
      env: { ...process.env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' }
    })

    let stdout = ''
    let stderr = ''
    let cancelled = false
    let timedOut = false
    const splitters = { stdout: new LineSplitter(), stderr: new LineSplitter() }

    const collect = (stream: 'stdout' | 'stderr') => (chunk: Buffer) => {
      const text = chunk.toString('utf8')
      if (stream === 'stdout') stdout = keepTail(stdout + text, maxBuffer)
      else stderr = keepTail(stderr + text, maxBuffer)
      for (const line of splitters[stream].push(text)) onLine?.(line, stream)
    }
    child.stdout.on('data', collect('stdout'))
    child.stderr.on('data', collect('stderr'))

    const stop = (): void => {
      if (child.pid !== undefined && child.exitCode === null) killTree(child.pid)
    }
    const onAbort = (): void => {
      cancelled = true
      stop()
    }
    signal?.addEventListener('abort', onAbort, { once: true })
    const timer = timeoutMs
      ? setTimeout(() => {
          timedOut = true
          stop()
        }, timeoutMs)
      : null

    child.once('error', (error) => {
      signal?.removeEventListener('abort', onAbort)
      if (timer) clearTimeout(timer)
      reject(error)
    })
    child.once('close', (code) => {
      signal?.removeEventListener('abort', onAbort)
      if (timer) clearTimeout(timer)
      for (const stream of ['stdout', 'stderr'] as const) {
        for (const line of splitters[stream].flush()) onLine?.(line, stream)
      }
      resolve({ code, stdout, stderr, cancelled, timedOut })
    })
  })
