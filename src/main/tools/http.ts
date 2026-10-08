import { createHash } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { Readable, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import type { ReadableStream as WebReadableStream } from 'node:stream/web'

export interface DownloadResult {
  sha256: string
  bytes: number
}

export interface Http {
  json<T>(url: string): Promise<T>
  text(url: string): Promise<string>
  /** Streams `url` into `dest`, hashing as it goes. */
  download(url: string, dest: string, onProgress?: (done: number, total: number | null) => void): Promise<DownloadResult>
}

type Fetch = (url: string, init?: RequestInit) => Promise<Response>

export function createHttp(fetchImpl: Fetch, userAgent: string, timeoutMs = 30_000): Http {
  const get = async (url: string, accept: string, signal?: AbortSignal): Promise<Response> => {
    const res = await fetchImpl(url, { headers: { 'User-Agent': userAgent, Accept: accept }, redirect: 'follow', signal })
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
    return res
  }

  return {
    async json<T>(url: string): Promise<T> {
      const res = await get(url, 'application/vnd.github+json, application/json', AbortSignal.timeout(timeoutMs))
      return (await res.json()) as T
    },
    async text(url: string): Promise<string> {
      return (await get(url, 'text/plain, */*', AbortSignal.timeout(timeoutMs))).text()
    },
    async download(url, dest, onProgress) {
      const res = await get(url, 'application/octet-stream')
      if (!res.body) throw new Error(`Empty response for ${url}`)
      const total = Number(res.headers.get('content-length')) || null
      const hash = createHash('sha256')
      let bytes = 0
      const meter = new Transform({
        transform(chunk: Buffer, _enc, done) {
          hash.update(chunk)
          bytes += chunk.length
          onProgress?.(bytes, total)
          done(null, chunk)
        }
      })
      await pipeline(Readable.fromWeb(res.body as WebReadableStream), meter, createWriteStream(dest))
      return { sha256: hash.digest('hex'), bytes }
    }
  }
}
