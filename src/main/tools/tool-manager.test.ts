import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { zipSync } from 'fflate'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Http } from './http'
import type { Target } from './platform'
import { ffmpegLocation, ToolManager, type Probe } from './tool-manager'

const target: Target = { platform: 'linux', arch: 'x64' }
const sha = (data: Uint8Array | string): string => createHash('sha256').update(data).digest('hex')

/**
 * Fake binaries are text files whose content is the version they report.
 * The probe "runs" them by reading that text, so tests work on any OS.
 */
const probe: Probe = async (path) => {
  try {
    const content = await readFile(path, 'utf8')
    if (content.startsWith('BROKEN')) return null
    return content
  } catch {
    return null
  }
}

interface FakeRelease {
  tag: string
  assets: Record<string, Uint8Array | string>
  digests?: boolean
}

function fakeHttp(releases: Record<string, FakeRelease>): Http & { downloads: string[] } {
  const files = new Map<string, Uint8Array | string>()
  const downloads: string[] = []
  return {
    downloads,
    async json<T>(url: string) {
      const repo = url.match(/repos\/(.+)\/releases\/latest/)?.[1]
      const release = repo ? releases[repo] : undefined
      if (!release) throw new Error(`HTTP 404 for ${url}`)
      return {
        tag_name: release.tag,
        draft: false,
        prerelease: false,
        assets: Object.entries(release.assets).map(([name, data]) => {
          const url = `https://dl/${repo}/${release.tag}/${name}`
          files.set(url, data)
          return { name, browser_download_url: url, digest: release.digests === false ? null : `sha256:${sha(data)}` }
        })
      } as T
    },
    async text(url) {
      const data = files.get(url)
      if (data === undefined) throw new Error(`HTTP 404 for ${url}`)
      return typeof data === 'string' ? data : new TextDecoder().decode(data)
    },
    async download(url, dest, onProgress) {
      const data = files.get(url)
      if (data === undefined) throw new Error(`HTTP 404 for ${url}`)
      downloads.push(url)
      await writeFile(dest, data)
      const size = typeof data === 'string' ? Buffer.byteLength(data) : data.length
      onProgress?.(size, size)
      return { sha256: sha(data), bytes: size }
    }
  }
}

let root: string
let bundledDir: string
let dataDir: string

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'vidsnare-tools-'))
  bundledDir = join(root, 'bundled')
  dataDir = join(root, 'data')
  await mkdir(bundledDir, { recursive: true })
  await writeFile(join(bundledDir, 'yt-dlp'), '2026.01.01\n')
  await writeFile(join(bundledDir, 'ffmpeg'), 'ffmpeg version n7.1-lgpl Copyright\n')
  await writeFile(join(bundledDir, 'deno'), 'deno 2.5.0 (stable)\n')
})

afterEach(async () => {
  await rm(root, { recursive: true, force: true })
})

function manager(http: Http = fakeHttp({})): ToolManager {
  return new ToolManager({ bundledDir, dataDir, target, http, probe })
}

describe('ToolManager.resolve', () => {
  it('uses the bundled tools when nothing was updated', async () => {
    const tools = await manager().resolve()
    expect(tools['yt-dlp']).toEqual({
      name: 'yt-dlp',
      version: '2026.01.01',
      source: 'bundled',
      path: join(bundledDir, 'yt-dlp')
    })
    expect(tools.ffmpeg?.version).toBe('n7.1-lgpl')
    expect(tools.deno?.version).toBe('2.5.0')
    expect(ffmpegLocation(tools)).toBe(bundledDir)
  })

  it('reports a missing tool as null', async () => {
    await rm(join(bundledDir, 'deno'))
    expect((await manager().resolve()).deno).toBeNull()
  })

  it('skips a bundled tool that does not run', async () => {
    await writeFile(join(bundledDir, 'yt-dlp'), 'BROKEN')
    expect((await manager().resolve())['yt-dlp']).toBeNull()
  })
})

describe('ToolManager.update', () => {
  it('installs a newer yt-dlp after verifying its checksum', async () => {
    const http = fakeHttp({ 'yt-dlp/yt-dlp': { tag: '2026.08.19', assets: { yt_dlp_unused: 'x', 'yt-dlp_linux': '2026.08.19\n' } } })
    const m = manager(http)
    const progress = vi.fn()

    const result = await m.update('yt-dlp', progress)

    expect(result).toEqual({ status: 'updated', version: '2026.08.19', previous: '2026.01.01' })
    expect(progress).toHaveBeenCalledWith(1)
    const tools = await m.resolve()
    expect(tools['yt-dlp']).toMatchObject({ version: '2026.08.19', source: 'updated' })
    expect(tools['yt-dlp']!.path).toBe(join(dataDir, 'yt-dlp', '2026.08.19', 'yt-dlp'))
    expect(await m.lastCheck()).toBeTypeOf('number')
  })

  it('does nothing when already up to date', async () => {
    const http = fakeHttp({ 'yt-dlp/yt-dlp': { tag: '2026.01.01', assets: { 'yt-dlp_linux': '2026.01.01\n' } } })
    expect(await manager(http).update('yt-dlp')).toEqual({ status: 'up-to-date', version: '2026.01.01' })
    expect(http.downloads).toHaveLength(0)
  })

  it('falls back to the checksum file when the API has no digest', async () => {
    const binary = '2026.08.19\n'
    const http = fakeHttp({
      'yt-dlp/yt-dlp': {
        tag: '2026.08.19',
        digests: false,
        assets: { 'yt-dlp_linux': binary, 'SHA2-256SUMS': `${sha(binary)}  yt-dlp_linux\n` }
      }
    })
    expect((await manager(http).update('yt-dlp')).status).toBe('updated')
  })

  it('refuses a download whose checksum does not match', async () => {
    const http = fakeHttp({
      'yt-dlp/yt-dlp': {
        tag: '2026.08.19',
        digests: false,
        assets: { 'yt-dlp_linux': '2026.08.19\n', 'SHA2-256SUMS': `${'0'.repeat(64)}  yt-dlp_linux\n` }
      }
    })
    const m = manager(http)
    await expect(m.update('yt-dlp')).rejects.toThrow(/Checksum mismatch/)
    expect((await m.resolve())['yt-dlp']?.source).toBe('bundled')
    // No staging leftovers.
    expect(await readdir(join(dataDir, 'yt-dlp'))).toEqual([])
  })

  it('refuses an update with no checksum at all', async () => {
    const http = fakeHttp({ 'yt-dlp/yt-dlp': { tag: '2026.08.19', digests: false, assets: { 'yt-dlp_linux': 'x' } } })
    await expect(manager(http).update('yt-dlp')).rejects.toThrow(/no checksum/)
  })

  it('refuses a binary that does not start', async () => {
    const http = fakeHttp({ 'yt-dlp/yt-dlp': { tag: '2026.08.19', assets: { 'yt-dlp_linux': 'BROKEN' } } })
    const m = manager(http)
    await expect(m.update('yt-dlp')).rejects.toThrow(/does not run/)
    expect((await m.resolve())['yt-dlp']?.version).toBe('2026.01.01')
  })

  it('extracts deno from its zip', async () => {
    const zip = zipSync({ deno: new TextEncoder().encode('deno 2.9.7 (stable)\n') })
    const http = fakeHttp({ 'denoland/deno': { tag: 'v2.9.7', assets: { 'deno-x86_64-unknown-linux-gnu.zip': zip } } })
    const m = manager(http)
    expect(await m.update('deno')).toEqual({ status: 'updated', version: '2.9.7', previous: '2.5.0' })
    expect((await m.resolve()).deno).toMatchObject({ version: '2.9.7', source: 'updated' })
    expect(existsSync(join(dataDir, 'deno', '2.9.7', 'deno-x86_64-unknown-linux-gnu.zip'))).toBe(false)
  })

  it('shares one update between concurrent callers', async () => {
    const http = fakeHttp({ 'yt-dlp/yt-dlp': { tag: '2026.08.19', assets: { 'yt-dlp_linux': '2026.08.19\n' } } })
    const m = manager(http)
    const [a, b] = await Promise.all([m.update('yt-dlp'), m.update('yt-dlp')])
    expect(a).toEqual(b)
    expect(http.downloads).toHaveLength(1)
  })

  it('keeps only the current and previous downloaded versions', async () => {
    const m1 = manager(fakeHttp({ 'yt-dlp/yt-dlp': { tag: '2026.02.01', assets: { 'yt-dlp_linux': '2026.02.01\n' } } }))
    await m1.update('yt-dlp')
    const m2 = manager(fakeHttp({ 'yt-dlp/yt-dlp': { tag: '2026.03.01', assets: { 'yt-dlp_linux': '2026.03.01\n' } } }))
    await m2.update('yt-dlp')
    const m3 = manager(fakeHttp({ 'yt-dlp/yt-dlp': { tag: '2026.04.01', assets: { 'yt-dlp_linux': '2026.04.01\n' } } }))
    await m3.update('yt-dlp')
    expect((await readdir(join(dataDir, 'yt-dlp'))).sort()).toEqual(['2026.03.01', '2026.04.01'])
  })
})

describe('interrupted updates', () => {
  it('does not count a failed download as a completed check', async () => {
    const http = fakeHttp({ 'yt-dlp/yt-dlp': { tag: '2026.08.19', assets: { 'yt-dlp_linux': '2026.08.19\n' } } })
    http.download = async () => {
      throw new Error('connection reset')
    }
    const m = manager(http)
    await expect(m.update('yt-dlp')).rejects.toThrow(/connection reset/)
    expect(await m.lastCheck()).toBeNull()
  })

  it('records the check when already up to date', async () => {
    const http = fakeHttp({ 'yt-dlp/yt-dlp': { tag: '2026.01.01', assets: { 'yt-dlp_linux': '2026.01.01\n' } } })
    const m = manager(http)
    await m.update('yt-dlp')
    expect(await m.lastCheck()).toBeTypeOf('number')
  })

  it('cleans up staging folders left by a previous crash', async () => {
    const stale = join(dataDir, 'yt-dlp', '.staging-deadbeef')
    await mkdir(stale, { recursive: true })
    await writeFile(join(stale, 'yt-dlp_linux'), 'partial')
    const m = manager(fakeHttp({ 'yt-dlp/yt-dlp': { tag: '2026.08.19', assets: { 'yt-dlp_linux': '2026.08.19\n' } } }))
    await m.update('yt-dlp')
    expect(existsSync(stale)).toBe(false)
  })
})

describe('falling back', () => {
  it('uses the bundled copy if the updated one stops working', async () => {
    const m = manager(fakeHttp({ 'yt-dlp/yt-dlp': { tag: '2026.08.19', assets: { 'yt-dlp_linux': '2026.08.19\n' } } }))
    await m.update('yt-dlp')
    await writeFile(join(dataDir, 'yt-dlp', '2026.08.19', 'yt-dlp'), 'BROKEN')
    m.invalidate()
    expect((await m.resolve())['yt-dlp']).toMatchObject({ source: 'bundled', version: '2026.01.01' })
  })

  it('prefers a newer bundled copy after the app itself was updated', async () => {
    const m = manager(fakeHttp({ 'yt-dlp/yt-dlp': { tag: '2026.02.01', assets: { 'yt-dlp_linux': '2026.02.01\n' } } }))
    await m.update('yt-dlp')
    await writeFile(join(bundledDir, 'yt-dlp'), '2026.09.01\n')
    m.invalidate()
    expect((await m.resolve())['yt-dlp']).toMatchObject({ source: 'bundled', version: '2026.09.01' })
  })

  it('rollback returns to the bundled copy', async () => {
    const m = manager(fakeHttp({ 'yt-dlp/yt-dlp': { tag: '2026.08.19', assets: { 'yt-dlp_linux': '2026.08.19\n' } } }))
    await m.update('yt-dlp')
    await m.rollback('yt-dlp')
    expect((await m.resolve())['yt-dlp']?.source).toBe('bundled')
  })

  it('survives a corrupt manifest', async () => {
    await mkdir(dataDir, { recursive: true })
    await writeFile(join(dataDir, 'tools.json'), '{not json')
    expect((await manager().resolve())['yt-dlp']?.source).toBe('bundled')
  })
})

describe('system tools', () => {
  it('finds a tool on PATH when allowed and nothing is bundled', async () => {
    await rm(join(bundledDir, 'ffmpeg'))
    const sys = join(root, 'sysbin')
    await mkdir(sys)
    await writeFile(join(sys, 'ffmpeg'), 'ffmpeg version 6.1 Copyright\n', { mode: 0o755 })
    const m = new ToolManager({ bundledDir, dataDir, target, http: fakeHttp({}), probe, allowSystem: true, env: { PATH: sys } })
    expect((await m.resolve()).ffmpeg).toMatchObject({ source: 'system', version: '6.1' })
  })
})
