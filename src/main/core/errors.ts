import type { AppError, ErrorCode } from '@shared/errors'

interface Rule {
  code: ErrorCode
  retryable: boolean
  pattern: RegExp
}

/**
 * Ordered from most to least specific: the first match wins. yt-dlp's wording
 * changes from time to time, so patterns match short, stable fragments.
 */
const RULES: Rule[] = [
  { code: 'DRM_PROTECTED', retryable: false, pattern: /DRM[ -]protected/i },
  { code: 'PRIVATE_VIDEO', retryable: false, pattern: /private video|this video is private/i },
  { code: 'MEMBERS_ONLY', retryable: false, pattern: /members[- ]only|join this channel|available to this channel'?s members/i },
  { code: 'PAID_CONTENT', retryable: false, pattern: /requires payment|purchase this video|rent this video/i },
  { code: 'AGE_RESTRICTED', retryable: false, pattern: /confirm your age|age[- ]restricted|inappropriate for some users/i },
  { code: 'BOT_CHECK', retryable: true, pattern: /confirm you[’']re not a bot/i },
  { code: 'COPYRIGHT_BLOCKED', retryable: false, pattern: /blocked it (?:in your country )?on copyright grounds|copyright claim/i },
  {
    code: 'REGION_BLOCKED',
    retryable: false,
    pattern: /not (?:made this video )?available in your country|geo[- ]?restrict|blocked in your country/i
  },
  {
    code: 'LIVE_NOT_STARTED',
    retryable: true,
    pattern: /live event will begin|premieres in|this live stream (?:recording )?is not available|is upcoming/i
  },
  {
    code: 'VIDEO_UNAVAILABLE',
    retryable: false,
    pattern: /video (?:is )?unavailable|video is not available|has been removed|no longer available|account .* terminated|does not exist|playlist .* unavailable|violating youtube'?s terms/i
  },
  { code: 'RATE_LIMITED', retryable: true, pattern: /HTTP Error 429|too many requests/i },
  {
    code: 'NO_INTERNET',
    retryable: true,
    pattern:
      /name resolution|getaddrinfo|Errno -[23]\b|Errno 11001|nodename nor servname|network is unreachable|no route to host|connection (?:refused|reset|aborted)|timed out|unable to download (?:webpage|api page)|failed to resolve|ssl: |certificate verify failed|remote end closed connection/i
  },
  { code: 'DISK_FULL', retryable: false, pattern: /no space left on device|Errno 28\b|not enough space on the disk|WinError 112\b/i },
  { code: 'PERMISSION_DENIED', retryable: false, pattern: /permission denied|Errno 13\b|access is denied|WinError 5\b|read-only file system/i },
  {
    code: 'ENGINE_OUTDATED',
    retryable: true,
    pattern:
      /signature extraction failed|nsig extraction failed|n challenge solving failed|unable to extract|no video formats found|only images are available|please report this issue|confirm you are on the latest version/i
  },
  { code: 'FORMAT_UNAVAILABLE', retryable: false, pattern: /requested format is not available/i },
  { code: 'TOOL_MISSING', retryable: false, pattern: /ffmpeg (?:is )?not found|ffprobe (?:is )?not found|ffmpeg could not be found/i },
  { code: 'POSTPROCESSING_FAILED', retryable: true, pattern: /postprocessing|conversion failed|error opening (?:input|output) file/i },
  { code: 'INVALID_URL', retryable: false, pattern: /is not a valid URL|incomplete youtube id|invalid url/i },
  { code: 'UNSUPPORTED_URL', retryable: false, pattern: /unsupported url/i }
]

/** The most useful line of yt-dlp's output: the last ERROR, else the last line. */
export function pickErrorLine(output: string): string {
  const lines = output.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const errors = lines.filter((l) => l.startsWith('ERROR:'))
  return (errors.at(-1) ?? lines.at(-1) ?? '').replace(/^ERROR:\s*/, '')
}

/** Maps yt-dlp's error output to an error code the UI can explain. */
export function classifyError(output: string): AppError {
  const line = pickErrorLine(output)
  // Prefer the ERROR line; fall back to the whole output for multi-line messages.
  for (const text of [line, output]) {
    for (const rule of RULES) {
      if (rule.pattern.test(text)) return { code: rule.code, retryable: rule.retryable, detail: line || output.trim() }
    }
  }
  return { code: 'UNKNOWN', retryable: true, detail: line || output.trim() || 'yt-dlp exited without a message' }
}

/** Errors raised by Node when the tool can't even be started. */
export function classifySpawnError(error: NodeJS.ErrnoException): AppError {
  const detail = `${error.code ?? 'ERROR'}: ${error.message}`
  switch (error.code) {
    case 'ENOENT':
      return { code: 'TOOL_MISSING', retryable: false, detail }
    case 'EACCES':
    case 'EPERM':
      return { code: 'PERMISSION_DENIED', retryable: false, detail }
    case 'ENOSPC':
      return { code: 'DISK_FULL', retryable: false, detail }
    default:
      return { code: 'UNKNOWN', retryable: true, detail }
  }
}

/** True when the failure suggests yt-dlp itself needs updating. */
export function suggestsEngineUpdate(error: AppError): boolean {
  return error.code === 'ENGINE_OUTDATED' || error.code === 'BOT_CHECK'
}
