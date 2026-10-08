import { describe, expect, it } from 'vitest'
import { classifyError, classifySpawnError, pickErrorLine } from './errors'

describe('classifyError', () => {
  it.each([
    ['ERROR: [youtube] abc: Private video. Sign in if you\'ve been granted access to this video', 'PRIVATE_VIDEO'],
    ['ERROR: [youtube] abc: Video unavailable. This video has been removed by the uploader', 'VIDEO_UNAVAILABLE'],
    [
      'ERROR: [youtube] abc: Video unavailable. This video is no longer available because the YouTube account associated with this video has been terminated.',
      'VIDEO_UNAVAILABLE'
    ],
    ['ERROR: [youtube] abc: This video has been removed for violating YouTube\'s Terms of Service', 'VIDEO_UNAVAILABLE'],
    ['ERROR: [youtube] abc: Sign in to confirm your age. This video may be inappropriate for some users.', 'AGE_RESTRICTED'],
    ['ERROR: [youtube] abc: Join this channel to get access to members-only content like this video, and other exclusive perks.', 'MEMBERS_ONLY'],
    ['ERROR: [youtube] abc: This video requires payment to watch.', 'PAID_CONTENT'],
    ['ERROR: [youtube] abc: The uploader has not made this video available in your country', 'REGION_BLOCKED'],
    ['ERROR: [youtube] abc: Video unavailable. This video contains content from SomeLabel, who has blocked it on copyright grounds.', 'COPYRIGHT_BLOCKED'],
    ['ERROR: [youtube] abc: Video unavailable. This video contains content from X, who has blocked it in your country on copyright grounds.', 'COPYRIGHT_BLOCKED'],
    ['ERROR: [youtube] abc: This live event will begin in 3 hours.', 'LIVE_NOT_STARTED'],
    ['ERROR: [youtube] abc: Premieres in 2 days', 'LIVE_NOT_STARTED'],
    ['ERROR: [youtube] abc: This video is DRM protected', 'DRM_PROTECTED'],
    ['ERROR: [youtube] abc: Sign in to confirm you’re not a bot. Use --cookies-from-browser', 'BOT_CHECK'],
    ['ERROR: unable to download video data: HTTP Error 429: Too Many Requests', 'RATE_LIMITED'],
    [
      'ERROR: [youtube] abc: Unable to download API page: <urlopen error [Errno -3] Temporary failure in name resolution> (caused by TransportError(...))',
      'NO_INTERNET'
    ],
    ['ERROR: [youtube] abc: Unable to download webpage: <urlopen error [Errno 11001] getaddrinfo failed>', 'NO_INTERNET'],
    ['ERROR: The read operation timed out', 'NO_INTERNET'],
    ['ERROR: unable to write data: [Errno 28] No space left on device', 'DISK_FULL'],
    ['ERROR: unable to write data: [WinError 112] There is not enough space on the disk', 'DISK_FULL'],
    ["ERROR: unable to open for writing: [Errno 13] Permission denied: '/root/x.mp4'", 'PERMISSION_DENIED'],
    ['ERROR: unable to open for writing: [WinError 5] Access is denied', 'PERMISSION_DENIED'],
    ['ERROR: [youtube] abc: Requested format is not available. Use --list-formats for a list of available formats', 'FORMAT_UNAVAILABLE'],
    ['ERROR: [youtube] abc: Signature extraction failed: Some formats may be missing', 'ENGINE_OUTDATED'],
    ['ERROR: [youtube] abc: No video formats found!; please report this issue on https://github.com/yt-dlp/yt-dlp/issues', 'ENGINE_OUTDATED'],
    ['ERROR: Postprocessing: ffmpeg not found. Please install or provide the path using --ffmpeg-location', 'TOOL_MISSING'],
    ['ERROR: Postprocessing: Conversion failed!', 'POSTPROCESSING_FAILED'],
    ["ERROR: 'not-a-url' is not a valid URL. Set --default-search \"ytsearch\" (or run  yt-dlp \"ytsearch:not-a-url\" ) to search YouTube", 'INVALID_URL'],
    ['ERROR: Unsupported URL: https://example.com/', 'UNSUPPORTED_URL'],
    ['ERROR: [youtube:tab] PLxyz: The playlist does not exist.', 'VIDEO_UNAVAILABLE'],
    ['ERROR: [youtube] aaaaaaaaaaa: This video is unavailable', 'VIDEO_UNAVAILABLE']
  ])('%s → %s', (output, code) => {
    expect(classifyError(output).code).toBe(code)
  })

  it('uses the last ERROR line and ignores earlier warnings', () => {
    const output = [
      'WARNING: [youtube] No supported JavaScript runtime could be found.',
      '[youtube] abc: Downloading webpage',
      'ERROR: [youtube] abc: Private video. Sign in if you\'ve been granted access to this video'
    ].join('\n')
    const error = classifyError(output)
    expect(error.code).toBe('PRIVATE_VIDEO')
    expect(error.detail).toBe("[youtube] abc: Private video. Sign in if you've been granted access to this video")
  })

  it('marks transient problems as retryable', () => {
    expect(classifyError('ERROR: HTTP Error 429: Too Many Requests').retryable).toBe(true)
    expect(classifyError('ERROR: Private video').retryable).toBe(false)
  })

  it('falls back to UNKNOWN but keeps the message', () => {
    expect(classifyError('ERROR: something entirely new')).toEqual({
      code: 'UNKNOWN',
      retryable: true,
      detail: 'something entirely new'
    })
    expect(classifyError('').detail).toMatch(/without a message/)
  })
})

describe('pickErrorLine', () => {
  it('falls back to the last line when there is no ERROR line', () => {
    expect(pickErrorLine('first\nsecond\n')).toBe('second')
  })
})

describe('classifySpawnError', () => {
  const err = (code: string): NodeJS.ErrnoException => Object.assign(new Error('spawn failed'), { code })

  it.each([
    ['ENOENT', 'TOOL_MISSING'],
    ['EACCES', 'PERMISSION_DENIED'],
    ['ENOSPC', 'DISK_FULL'],
    ['EWHATEVER', 'UNKNOWN']
  ])('%s → %s', (code, expected) => {
    expect(classifySpawnError(err(code)).code).toBe(expected)
  })
})
