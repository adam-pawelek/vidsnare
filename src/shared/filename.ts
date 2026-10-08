/**
 * File names that are valid, readable and the same on Windows and Linux.
 *
 * Characters Windows forbids are swapped for their full-width look-alikes
 * (the same approach yt-dlp uses), so "Q&A: part 1/2" stays readable.
 */

const FORBIDDEN: Record<string, string> = {
  '<': '＜',
  '>': '＞',
  ':': '：',
  '"': '＂',
  '/': '／',
  '\\': '＼',
  '|': '｜',
  '?': '？',
  '*': '＊'
}

// Device names Windows reserves regardless of extension ("con.mp4" is invalid too).
const RESERVED = /^(con|prn|aux|nul|com[0-9¹²³]|lpt[0-9¹²³])$/i

/** Longest file name, in UTF-8 bytes, before the extension. ext4 and NTFS allow 255. */
export const DEFAULT_MAX_BYTES = 150

const encoder = new TextEncoder()
const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

export function utf8Length(text: string): number {
  return encoder.encode(text).length
}

/** Cuts `text` to at most `maxBytes` UTF-8 bytes without splitting a character or emoji. */
export function truncateUtf8(text: string, maxBytes: number): string {
  if (utf8Length(text) <= maxBytes) return text
  let out = ''
  let used = 0
  for (const { segment } of segmenter.segment(text)) {
    const size = utf8Length(segment)
    if (used + size > maxBytes) break
    out += segment
    used += size
  }
  return out
}

function trimEdges(text: string): string {
  // Windows drops trailing dots and spaces; a leading dot hides the file on Linux.
  return text.replace(/^[\s.]+/u, '').replace(/[\s.]+$/u, '')
}

export interface SanitizeOptions {
  maxBytes?: number
  fallback?: string
}

/** Makes one path segment (no directories) safe on Windows and Linux. */
export function sanitizeFilename(input: string, options: SanitizeOptions = {}): string {
  const { maxBytes = DEFAULT_MAX_BYTES, fallback = 'untitled' } = options

  let name = input
    .normalize('NFC')
    // Lone surrogates can't be encoded on either file system.
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '')
    // Control characters, including newlines and tabs from titles.
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
    // Invisible direction overrides can disguise extensions ("txt.exe").
    .replace(/[\u202A-\u202E\u2066-\u2069]/g, '')
    .replace(/[<>:"/\\|?*]/g, (ch) => FORBIDDEN[ch] ?? '_')
    .replace(/\s+/gu, ' ')

  name = trimEdges(truncateUtf8(trimEdges(name), maxBytes))
  if (!name) name = fallback
  const stem = name.split('.')[0] ?? ''
  if (RESERVED.test(stem.trim())) name = `_${name}`
  return name
}

export interface FilenameFields {
  title: string
  id: string
  channel?: string
  /** yt-dlp's `upload_date`, `YYYYMMDD`. */
  uploadDate?: string
  playlistIndex?: number
  playlistCount?: number
}

export const DEFAULT_FILENAME_TEMPLATE = '{title} [{id}]'
export const FILENAME_TOKENS = ['title', 'id', 'channel', 'date', 'index'] as const

function formatDate(uploadDate: string | undefined): string {
  const m = uploadDate?.match(/^(\d{4})(\d{2})(\d{2})$/)
  return m ? `${m[1]}-${m[2]}-${m[3]}` : ''
}

function formatIndex(index: number | undefined, count: number | undefined): string {
  if (index === undefined) return ''
  const width = Math.max(2, String(count ?? index).length)
  return String(index).padStart(width, '0')
}

/**
 * Fills a template such as `{title} [{id}]` and sanitizes the result. When the
 * name is too long only the title is shortened, so the video ID survives.
 */
export function renderFilename(
  template: string,
  fields: FilenameFields,
  maxBytes: number = DEFAULT_MAX_BYTES
): string {
  const values: Record<string, string> = {
    id: fields.id,
    channel: fields.channel ?? '',
    date: formatDate(fields.uploadDate),
    index: formatIndex(fields.playlistIndex, fields.playlistCount)
  }
  const fill = (title: string): string =>
    template
      .replace(/\{(\w+)\}/g, (whole, key: string) =>
        key === 'title' ? title : key in values ? sanitizeFilename(values[key]!, { fallback: '' }) : whole
      )
      // Separators left dangling by empty fields, e.g. "{index} - {title}" with no index.
      .replace(/\s*\[\s*\]|\s*\(\s*\)/g, '')
      .replace(/^\s*[-–_.]\s+/, '')

  const title = sanitizeFilename(fields.title, { maxBytes, fallback: fields.id })
  // Measure everything except the title with a one-byte stand-in, so separator
  // cleanup that only applies to an empty title doesn't skew the count.
  const overhead = utf8Length(fill('X')) - 1
  const titleBudget = Math.max(20, maxBytes - overhead)
  return sanitizeFilename(fill(truncateUtf8(title, titleBudget).trim()), { maxBytes, fallback: fields.id })
}

/**
 * How many bytes a file name may use in `directory`. Windows programs that
 * don't opt into long paths fail past 260 characters, so leave room for the
 * extension and yt-dlp's temporary suffixes (".f137.webm.part", ".en.srt").
 */
export function filenameBudget(directory: string, platform: string): number {
  if (platform !== 'win32') return DEFAULT_MAX_BYTES
  const reserved = 1 /* separator */ + 24 /* extension and temp suffixes */
  return Math.max(40, Math.min(DEFAULT_MAX_BYTES, 259 - directory.length - reserved))
}

/** yt-dlp output templates treat `%` as special; a literal one must be doubled. */
export function escapeOutputTemplate(text: string): string {
  return text.replace(/%/g, '%%')
}
