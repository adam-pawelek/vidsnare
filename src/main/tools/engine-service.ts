import type { EngineStatus, EngineUpdateResult } from '@shared/ipc'
import type { ToolInfo, ToolManager } from './tool-manager'

const DAY = 24 * 60 * 60 * 1000
const HOUR = 60 * 60 * 1000

function status(info: ToolInfo | null): EngineStatus['ytdlp'] {
  return info ? { version: info.version, source: info.source } : null
}

/**
 * The renderer-facing side of the tool manager: status, manual updates, and
 * the automatic daily check.
 */
export class EngineService {
  private lastAttempt = 0

  constructor(
    private readonly tools: ToolManager,
    private readonly log: (message: string) => void = () => {}
  ) {}

  async status(): Promise<EngineStatus> {
    const resolved = await this.tools.resolve()
    return {
      ytdlp: status(resolved['yt-dlp']),
      ffmpeg: status(resolved.ffmpeg),
      deno: status(resolved.deno),
      lastCheck: await this.tools.lastCheck()
    }
  }

  /** Updates yt-dlp (the part YouTube breaks), then Deno if needed. */
  async update(onProgress?: (fraction: number | null) => void): Promise<EngineUpdateResult> {
    this.lastAttempt = Date.now()
    try {
      const result = await this.tools.update('yt-dlp', onProgress)
      // Deno rarely changes; a failure there must not hide a good yt-dlp update.
      await this.tools.update('deno').catch((error: unknown) => this.log(`deno update failed: ${String(error)}`))
      return result.status === 'updated'
        ? { status: 'updated', version: result.version }
        : { status: 'up-to-date', version: result.version }
    } catch (error) {
      this.log(`engine update failed: ${String(error)}`)
      return { status: 'failed', message: error instanceof Error ? error.message : String(error) }
    }
  }

  /** Called on startup: checks at most once a day. */
  async updateIfDue(now = Date.now()): Promise<EngineUpdateResult | null> {
    const last = await this.tools.lastCheck()
    if (last !== null && now - last < DAY) return null
    return this.update()
  }

  /**
   * Called when a download fails in a way that suggests YouTube changed.
   * Checks at most once an hour so a broken playlist doesn't hammer GitHub.
   */
  async updateAfterEngineError(now = Date.now()): Promise<EngineUpdateResult | null> {
    if (now - this.lastAttempt < HOUR) return null
    return this.update()
  }
}
