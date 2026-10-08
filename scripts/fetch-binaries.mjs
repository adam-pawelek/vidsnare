#!/usr/bin/env node
/**
 * Downloads the tools VidSnare ships with into resources/bin/<platform>-<arch>/:
 *
 *   yt-dlp[.exe]                 official standalone build
 *   deno[.exe]                   JavaScript runtime yt-dlp needs for YouTube
 *   ffmpeg/bin/ffmpeg[.exe]      LGPL "shared" build from BtbN/FFmpeg-Builds,
 *   ffmpeg/bin/ffprobe[.exe]     with its libraries in ffmpeg/lib (Linux) or
 *                                next to the executables (Windows)
 *
 * Every download is checked against the SHA-256 GitHub publishes for it.
 * Usage: node scripts/fetch-binaries.mjs [--platform linux|win32] [--arch x64|arm64] [--force]
 */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { chmodSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { unzipSync } from 'fflate'

const FFMPEG_BRANCH = process.env.FFMPEG_BRANCH ?? '9.0'

const args = process.argv.slice(2)
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : fallback
}
const platform = option('platform', process.platform)
const arch = option('arch', process.arch)
const force = args.includes('--force')
const win = platform === 'win32'
const exe = (name) => (win ? `${name}.exe` : name)

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'resources', 'bin', `${platform}-${arch}`)
const versionsFile = join(outDir, 'VERSIONS.json')

const ASSETS = {
  'yt-dlp': {
    'linux-x64': 'yt-dlp_linux',
    'linux-arm64': 'yt-dlp_linux_aarch64',
    'win32-x64': 'yt-dlp.exe',
    'win32-arm64': 'yt-dlp_arm64.exe'
  },
  deno: {
    'linux-x64': 'deno-x86_64-unknown-linux-gnu.zip',
    'linux-arm64': 'deno-aarch64-unknown-linux-gnu.zip',
    'win32-x64': 'deno-x86_64-pc-windows-msvc.zip',
    'win32-arm64': 'deno-aarch64-pc-windows-msvc.zip'
  },
  ffmpeg: {
    'linux-x64': `ffmpeg-n${FFMPEG_BRANCH}-latest-linux64-lgpl-shared-${FFMPEG_BRANCH}.tar.xz`,
    'linux-arm64': `ffmpeg-n${FFMPEG_BRANCH}-latest-linuxarm64-lgpl-shared-${FFMPEG_BRANCH}.tar.xz`,
    'win32-x64': `ffmpeg-n${FFMPEG_BRANCH}-latest-win64-lgpl-shared-${FFMPEG_BRANCH}.zip`,
    'win32-arm64': `ffmpeg-n${FFMPEG_BRANCH}-latest-winarm64-lgpl-shared-${FFMPEG_BRANCH}.zip`
  }
}
const REPOS = { 'yt-dlp': 'yt-dlp/yt-dlp', deno: 'denoland/deno', ffmpeg: 'BtbN/FFmpeg-Builds' }

const headers = { 'User-Agent': 'vidsnare-build', Accept: 'application/vnd.github+json' }
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

async function release(tool) {
  const res = await fetch(`https://api.github.com/repos/${REPOS[tool]}/releases/latest`, { headers })
  if (!res.ok) throw new Error(`${tool}: GitHub API returned ${res.status}`)
  const data = await res.json()
  const name = ASSETS[tool][`${platform}-${arch}`]
  if (!name) throw new Error(`${tool}: no build for ${platform}-${arch}`)
  const asset = data.assets.find((a) => a.name === name)
  if (!asset) throw new Error(`${tool}: release ${data.tag_name} has no ${name}`)
  const sha256 = asset.digest?.startsWith('sha256:') ? asset.digest.slice(7) : null
  if (!sha256) throw new Error(`${tool}: no checksum published for ${name}`)
  return { tag: data.tag_name, name, url: asset.browser_download_url, sha256 }
}

async function download(info, dest) {
  console.log(`  downloading ${info.name}`)
  const res = await fetch(info.url, { headers: { 'User-Agent': headers['User-Agent'] } })
  if (!res.ok) throw new Error(`${info.name}: download returned ${res.status}`)
  const data = Buffer.from(await res.arrayBuffer())
  const actual = createHash('sha256').update(data).digest('hex')
  if (actual !== info.sha256) throw new Error(`${info.name}: checksum mismatch (expected ${info.sha256}, got ${actual})`)
  writeFileSync(dest, data)
  return data
}

function version(path, args, pattern) {
  if (platform !== process.platform || arch !== process.arch) return null // can't run a foreign binary
  const out = execFileSync(path, args, { encoding: 'utf8' })
  return out.match(pattern)?.[1] ?? null
}

async function fetchYtdlp() {
  const info = await release('yt-dlp')
  const dest = join(outDir, exe('yt-dlp'))
  await download(info, dest)
  chmodSync(dest, 0o755)
  return { ...info, version: version(dest, ['--version'], /^(\S+)/) ?? info.tag }
}

async function fetchDeno(work) {
  const info = await release('deno')
  const zip = await download(info, join(work, info.name))
  const files = unzipSync(new Uint8Array(zip), { filter: (f) => f.name === exe('deno') })
  if (!files[exe('deno')]) throw new Error(`deno: ${info.name} has no ${exe('deno')}`)
  const dest = join(outDir, exe('deno'))
  writeFileSync(dest, files[exe('deno')])
  chmodSync(dest, 0o755)
  return { ...info, version: info.tag.replace(/^v/, '') }
}

async function fetchFfmpeg(work) {
  const info = await release('ffmpeg')
  const archive = await download(info, join(work, info.name))
  const target = join(outDir, 'ffmpeg')
  rmSync(target, { recursive: true, force: true })
  mkdirSync(join(target, 'bin'), { recursive: true })

  if (info.name.endsWith('.zip')) {
    // Windows: executables and their DLLs live together in bin/.
    const files = unzipSync(new Uint8Array(archive), {
      filter: (f) => /\/bin\/(ffmpeg\.exe|ffprobe\.exe|[^/]+\.dll)$/i.test(f.name) || /\/LICENSE\.txt$/.test(f.name)
    })
    for (const [name, data] of Object.entries(files)) {
      const out = name.endsWith('LICENSE.txt') ? join(target, 'LICENSE.txt') : join(target, 'bin', basename(name))
      writeFileSync(out, data)
    }
  } else {
    // Linux: the executables find their libraries through RPATH $ORIGIN/../lib.
    execFileSync('tar', ['-xJf', join(work, info.name), '-C', work])
    const extracted = join(work, readdirSync(work).find((d) => d.startsWith('ffmpeg-') && !d.endsWith('.tar.xz')))
    for (const tool of ['ffmpeg', 'ffprobe']) {
      copyFileSync(join(extracted, 'bin', tool), join(target, 'bin', tool))
      chmodSync(join(target, 'bin', tool), 0o755)
    }
    mkdirSync(join(target, 'lib'))
    // Copy each library once, under the name the executables ask for (libavcodec.so.63),
    // so the installers don't depend on symlinks surviving packaging.
    for (const name of readdirSync(join(extracted, 'lib'))) {
      if (/\.so\.\d+$/.test(name)) copyFileSync(realpathSync(join(extracted, 'lib', name)), join(target, 'lib', name))
    }
    copyFileSync(join(extracted, 'LICENSE.txt'), join(target, 'LICENSE.txt'))
  }

  const binary = join(target, 'bin', exe('ffmpeg'))
  if (!existsSync(binary)) throw new Error('ffmpeg: executable missing after extraction')
  return { ...info, version: version(binary, ['-version'], /^ffmpeg version (\S+)/m) ?? info.tag }
}

async function main() {
  if (!force && existsSync(versionsFile)) {
    console.log(`${outDir} is already populated (use --force to refresh)`)
    return
  }
  mkdirSync(outDir, { recursive: true })
  const work = mkdtempSync(join(tmpdir(), 'vidsnare-bin-'))
  try {
    const versions = {}
    for (const [tool, fn] of [['yt-dlp', fetchYtdlp], ['deno', fetchDeno], ['ffmpeg', fetchFfmpeg]]) {
      console.log(`${tool}:`)
      versions[tool] = await fn(work)
      console.log(`  ${versions[tool].version} ✓ sha256 ${versions[tool].sha256.slice(0, 16)}…`)
    }
    writeFileSync(versionsFile, JSON.stringify({ platform, arch, fetchedAt: new Date().toISOString(), tools: versions }, null, 2))
  } finally {
    rmSync(work, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
