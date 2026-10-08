/** Where each external tool comes from, per operating system and CPU. */

export type ToolName = 'yt-dlp' | 'ffmpeg' | 'deno'
export type UpdatableTool = 'yt-dlp' | 'deno'
export const UPDATABLE_TOOLS: readonly UpdatableTool[] = ['yt-dlp', 'deno']

export interface Target {
  platform: string
  arch: string
}

export function currentTarget(): Target {
  return { platform: process.platform, arch: process.arch }
}

/** Folder name for a target's bundled binaries, e.g. `linux-x64`. */
export function targetDir(target: Target): string {
  return `${target.platform}-${target.arch}`
}

export function executableName(tool: ToolName | 'ffprobe', target: Target): string {
  return target.platform === 'win32' ? `${tool}.exe` : tool
}

export const REPOS: Record<UpdatableTool, string> = {
  'yt-dlp': 'yt-dlp/yt-dlp',
  deno: 'denoland/deno'
}

/** Release asset for a tool, or null when no official build exists for the target. */
export function releaseAsset(tool: UpdatableTool, target: Target): string | null {
  const { platform, arch } = target
  if (tool === 'yt-dlp') {
    if (platform === 'linux') return { x64: 'yt-dlp_linux', arm64: 'yt-dlp_linux_aarch64' }[arch] ?? null
    if (platform === 'win32') return { x64: 'yt-dlp.exe', arm64: 'yt-dlp_arm64.exe', ia32: 'yt-dlp_x86.exe' }[arch] ?? null
    return null
  }
  const cpu = { x64: 'x86_64', arm64: 'aarch64' }[arch]
  if (!cpu) return null
  if (platform === 'linux') return `deno-${cpu}-unknown-linux-gnu.zip`
  if (platform === 'win32') return `deno-${cpu}-pc-windows-msvc.zip`
  return null
}

/** Name of the checksum file that covers `asset` in its release. */
export function checksumAsset(tool: UpdatableTool, asset: string): string {
  return tool === 'yt-dlp' ? 'SHA2-256SUMS' : `${asset}.sha256sum`
}

/** Arguments that make each tool print its version. */
export const VERSION_ARGS: Record<ToolName, string[]> = {
  'yt-dlp': ['--version'],
  ffmpeg: ['-version'],
  deno: ['--version']
}
