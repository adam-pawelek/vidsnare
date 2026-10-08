import type { ToolName } from './platform'

/**
 * Compares versions like `2026.08.19`, `2026.08.19.1`, `v2.9.7` or `n7.1`.
 * Returns a negative number when `a` is older than `b`.
 */
export function compareVersions(a: string, b: string): number {
  const parts = (v: string): number[] =>
    v
      .trim()
      .replace(/^[a-z]+/i, '')
      .split(/[.\-+]/)
      .map((p) => Number.parseInt(p, 10))
      .map((n) => (Number.isFinite(n) ? n : 0))
  const pa = parts(a)
  const pb = parts(b)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

/** Extracts the version from a tool's `--version` output. */
export function parseVersionOutput(tool: ToolName, output: string): string | null {
  const text = output.trim()
  const match =
    tool === 'yt-dlp'
      ? text.match(/^(\d{4}\.\d{2}\.\d{2}(?:\.\d+)?)/m)
      : tool === 'deno'
        ? text.match(/^deno (\d+\.\d+\.\d+)/m)
        : text.match(/^ffmpeg version (\S+)/m)
  return match?.[1] ?? null
}

/** `v2.9.7` → `2.9.7`; yt-dlp tags are already bare. */
export function normalizeTag(tag: string): string {
  return tag.replace(/^v/, '')
}
