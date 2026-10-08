import type { AppError } from '@shared/errors'
import type { FetchInfoResult } from '@shared/media'
import { parseYouTubeUrl } from '@shared/youtube-url'
import { classifyError, classifySpawnError } from './core/errors'
import { parseInfo } from './core/metadata'
import type { Runner } from './core/runner'
import { buildInfoArgs } from './core/ytdlp-args'
import { ffmpegLocation, type ToolManager } from './tools/tool-manager'

const FETCH_TIMEOUT_MS = 120_000

export class MediaService {
  constructor(
    private readonly tools: ToolManager,
    private readonly run: Runner,
    /** Marks entries the user already has (wired to the history later). */
    private readonly isDownloaded: (videoId: string) => boolean = () => false
  ) {}

  /** Loads the preview for a link the user pasted. Never throws. */
  async fetchInfo(input: string, signal?: AbortSignal): Promise<FetchInfoResult> {
    // The renderer validated this too, but main never trusts it.
    const parsed = parseYouTubeUrl(input)
    if (!parsed) return failure({ code: 'INVALID_URL', retryable: false, detail: input })

    const resolved = await this.tools.resolve()
    const ytdlp = resolved['yt-dlp']
    if (!ytdlp) return failure({ code: 'TOOL_MISSING', retryable: false, detail: 'yt-dlp not found' })

    const args = buildInfoArgs(parsed.url, { ffmpeg: ffmpegLocation(resolved), deno: resolved.deno?.path })
    let result
    try {
      result = await this.run(ytdlp.path, args, { signal, timeoutMs: FETCH_TIMEOUT_MS, maxBuffer: 50_000_000 })
    } catch (error) {
      return failure(classifySpawnError(error as NodeJS.ErrnoException))
    }

    if (result.cancelled) return failure({ code: 'CANCELLED', retryable: true, detail: '' })
    if (result.timedOut) return failure({ code: 'NO_INTERNET', retryable: true, detail: 'Timed out loading the link' })
    if (result.code !== 0) return failure(classifyError(result.stderr))

    try {
      const preview = parseInfo(result.stdout, parsed.kind === 'video' ? (parsed.playlistId ?? null) : null)
      if (preview.kind === 'video') preview.video.downloaded = this.isDownloaded(preview.video.id)
      else for (const entry of preview.entries) entry.downloaded = this.isDownloaded(entry.id)
      return { ok: true, preview }
    } catch (error) {
      return failure({ code: 'UNKNOWN', retryable: true, detail: `Could not read yt-dlp output: ${String(error)}` })
    }
  }
}

function failure(error: AppError): FetchInfoResult {
  return { ok: false, error }
}
