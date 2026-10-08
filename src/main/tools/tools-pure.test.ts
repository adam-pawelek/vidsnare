import { describe, expect, it } from 'vitest'
import { parseChecksumFile, parseDigest } from './checksums'
import { bundledPath, checksumAsset, executableName, releaseAsset } from './platform'
import { compareVersions, normalizeTag, parseVersionOutput } from './versions'

describe('compareVersions', () => {
  it.each([
    ['2026.08.19', '2026.08.19', 0],
    ['2026.08.19', '2026.09.01', -1],
    ['2026.08.19.1', '2026.08.19', 1],
    ['2025.12.31', '2026.01.01', -1],
    ['v2.9.7', '2.9.10', -1],
    ['2.10.0', '2.9.7', 1],
    ['n7.1', 'n7.0.2', 1]
  ])('%s vs %s', (a, b, sign) => {
    expect(Math.sign(compareVersions(a, b))).toBe(sign)
  })
})

describe('parseVersionOutput', () => {
  it('reads yt-dlp', () => {
    expect(parseVersionOutput('yt-dlp', '2026.08.19\n')).toBe('2026.08.19')
    expect(parseVersionOutput('yt-dlp', '2026.08.19.232\n')).toBe('2026.08.19.232')
  })

  it('reads deno', () => {
    expect(
      parseVersionOutput('deno', 'deno 2.9.7 (stable, release, x86_64-unknown-linux-gnu)\nv8 14.0\ntypescript 5.9.2\n')
    ).toBe('2.9.7')
  })

  it('reads ffmpeg', () => {
    expect(parseVersionOutput('ffmpeg', 'ffmpeg version n7.1.1-lgpl Copyright (c) 2000-2025\n')).toBe('n7.1.1-lgpl')
  })

  it('rejects junk', () => {
    expect(parseVersionOutput('yt-dlp', 'Traceback (most recent call last):')).toBeNull()
  })
})

describe('normalizeTag', () => {
  it('drops a leading v', () => {
    expect(normalizeTag('v2.9.7')).toBe('2.9.7')
    expect(normalizeTag('2026.08.19')).toBe('2026.08.19')
  })
})

describe('platform', () => {
  it.each([
    ['yt-dlp', 'linux', 'x64', 'yt-dlp_linux'],
    ['yt-dlp', 'linux', 'arm64', 'yt-dlp_linux_aarch64'],
    ['yt-dlp', 'win32', 'x64', 'yt-dlp.exe'],
    ['yt-dlp', 'win32', 'arm64', 'yt-dlp_arm64.exe'],
    ['yt-dlp', 'win32', 'ia32', 'yt-dlp_x86.exe'],
    ['deno', 'linux', 'x64', 'deno-x86_64-unknown-linux-gnu.zip'],
    ['deno', 'win32', 'x64', 'deno-x86_64-pc-windows-msvc.zip'],
    ['deno', 'win32', 'ia32', null],
    ['yt-dlp', 'freebsd', 'x64', null]
  ] as const)('%s on %s-%s → %s', (tool, platform, arch, asset) => {
    expect(releaseAsset(tool, { platform, arch })).toBe(asset)
  })

  it('names executables per platform', () => {
    expect(executableName('yt-dlp', { platform: 'win32', arch: 'x64' })).toBe('yt-dlp.exe')
    expect(executableName('ffprobe', { platform: 'linux', arch: 'x64' })).toBe('ffprobe')
  })

  it('locates bundled tools', () => {
    expect(bundledPath('ffmpeg', { platform: 'win32', arch: 'x64' })).toEqual(['ffmpeg', 'bin', 'ffmpeg.exe'])
    expect(bundledPath('yt-dlp', { platform: 'linux', arch: 'x64' })).toEqual(['yt-dlp'])
  })

  it('knows where each project publishes checksums', () => {
    expect(checksumAsset('yt-dlp', 'yt-dlp_linux')).toBe('SHA2-256SUMS')
    expect(checksumAsset('deno', 'deno-x.zip')).toBe('deno-x.zip.sha256sum')
  })
})

describe('checksums', () => {
  const hash = 'a'.repeat(64)

  it('parses sha256sum files in text and binary mode', () => {
    const sums = parseChecksumFile(`${hash}  yt-dlp_linux\n${'B'.repeat(64)} *yt-dlp.exe\r\ngarbage line\n`)
    expect(sums.get('yt-dlp_linux')).toBe(hash)
    expect(sums.get('yt-dlp.exe')).toBe('b'.repeat(64))
    expect(sums.size).toBe(2)
  })

  it('parses GitHub digests', () => {
    expect(parseDigest(`sha256:${hash}`)).toBe(hash)
    expect(parseDigest('md5:abc')).toBeNull()
    expect(parseDigest(null)).toBeNull()
  })
})
