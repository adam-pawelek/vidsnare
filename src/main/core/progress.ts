import { MARK } from './ytdlp-args'

export type YtdlpEvent =
  | {
      type: 'download'
      status: 'downloading' | 'finished' | 'error'
      downloadedBytes: number | null
      totalBytes: number | null
      /** Bytes per second. */
      speed: number | null
      /** Seconds remaining for the current stream. */
      eta: number | null
      formatId: string | null
    }
  | { type: 'postprocess'; status: 'started' | 'processing' | 'finished'; name: string }
  | { type: 'file'; path: string }
  | { type: 'archived' }
  | { type: 'log'; level: 'error' | 'warning' | 'info'; text: string }

// eslint-disable-next-line no-control-regex
const ANSI = /\u001b\[[0-9;]*[A-Za-z]/g

function num(value: string | undefined): number | null {
  if (value === undefined || value === '' || value === 'NA' || value === 'None') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/** Turns one line of yt-dlp output into a structured event. */
export function parseLine(raw: string): YtdlpEvent | null {
  const line = raw.replace(ANSI, '').replace(/\r$/, '')
  if (!line.trim()) return null

  if (line.startsWith(`${MARK.download} `)) {
    const [status, done, total, estimate, speed, eta, formatId] = line.slice(MARK.download.length + 1).split('|')
    return {
      type: 'download',
      status: status === 'finished' || status === 'error' ? status : 'downloading',
      downloadedBytes: num(done),
      totalBytes: num(total) ?? num(estimate),
      speed: num(speed),
      eta: num(eta),
      formatId: formatId && formatId !== 'NA' ? formatId : null
    }
  }

  if (line.startsWith(`${MARK.postprocess} `)) {
    const [status, name] = line.slice(MARK.postprocess.length + 1).split('|')
    return {
      type: 'postprocess',
      status: status === 'started' || status === 'finished' ? status : 'processing',
      name: name ?? ''
    }
  }

  if (line.startsWith(`${MARK.file} `)) {
    return { type: 'file', path: line.slice(MARK.file.length + 1) }
  }

  if (/has already been recorded in the archive/.test(line)) return { type: 'archived' }
  if (line.startsWith('ERROR:')) return { type: 'log', level: 'error', text: line.slice(6).trim() }
  if (line.startsWith('WARNING:')) return { type: 'log', level: 'warning', text: line.slice(8).trim() }
  return { type: 'log', level: 'info', text: line }
}

/** Splits a stream of chunks into complete lines. */
export class LineSplitter {
  private buffer = ''

  push(chunk: string): string[] {
    this.buffer += chunk
    const parts = this.buffer.split(/\r?\n|\r/)
    this.buffer = parts.pop() ?? ''
    return parts
  }

  flush(): string[] {
    const rest = this.buffer
    this.buffer = ''
    return rest ? [rest] : []
  }
}

export interface ProgressSnapshot {
  phase: 'downloading' | 'processing'
  /** 0–1 across all streams; null until anything is known. */
  fraction: number | null
  downloadedBytes: number
  totalBytes: number | null
  speed: number | null
  eta: number | null
}

/**
 * Combines per-stream progress into one bar. A video download is usually two
 * streams (video, then audio); each stream reports progress from zero.
 */
export class ProgressTracker {
  private finishedBytes = 0
  private finishedStreams = 0
  private current: { formatId: string | null; done: number; total: number | null } | null = null
  private snapshot: ProgressSnapshot = {
    phase: 'downloading',
    fraction: null,
    downloadedBytes: 0,
    totalBytes: null,
    speed: null,
    eta: null
  }

  /**
   * @param streamSizes expected size of each stream when known (from metadata),
   *   used to weight the bar; equal weights otherwise.
   */
  constructor(private readonly streamSizes: (number | null)[] = [null]) {}

  get value(): ProgressSnapshot {
    return this.snapshot
  }

  update(event: YtdlpEvent): ProgressSnapshot {
    if (event.type === 'postprocess') {
      this.snapshot = { ...this.snapshot, phase: 'processing', fraction: 1, speed: null, eta: null }
      return this.snapshot
    }
    if (event.type !== 'download') return this.snapshot

    const done = event.downloadedBytes ?? 0
    // A new stream begins when the format changes or the byte count resets.
    if (this.current && (event.formatId !== this.current.formatId || done < this.current.done)) {
      this.completeCurrent()
    }
    this.current = { formatId: event.formatId, done, total: event.totalBytes }

    const streamCount = Math.max(this.streamSizes.length, this.finishedStreams + 1)
    const streamFraction = event.totalBytes ? Math.min(1, done / event.totalBytes) : null
    const knownSizes = this.streamSizes.every((s): s is number => typeof s === 'number' && s > 0)
    let fraction: number | null = null
    if (knownSizes && this.streamSizes.length === streamCount) {
      const all = (this.streamSizes as number[]).reduce((a, b) => a + b, 0)
      fraction = Math.min(1, (this.finishedBytes + done) / all)
    } else if (streamFraction !== null) {
      fraction = (this.finishedStreams + streamFraction) / streamCount
    }

    const totalBytes = knownSizes
      ? (this.streamSizes as number[]).reduce((a, b) => a + b, 0)
      : event.totalBytes !== null
        ? this.finishedBytes + event.totalBytes
        : null

    if (event.status === 'finished') this.completeCurrent()

    this.snapshot = {
      phase: 'downloading',
      fraction,
      downloadedBytes: this.finishedBytes + (this.current?.done ?? 0),
      totalBytes,
      speed: event.speed,
      eta: event.eta
    }
    return this.snapshot
  }

  private completeCurrent(): void {
    if (!this.current) return
    this.finishedBytes += this.current.done
    this.finishedStreams += 1
    this.current = null
  }
}
