import { describe, expect, it, vi } from 'vitest'
import { EngineService } from './engine-service'
import type { ToolManager } from './tool-manager'

function fakeTools(overrides: Partial<Record<keyof ToolManager, unknown>> = {}): ToolManager {
  return {
    resolve: vi.fn(async () => ({
      'yt-dlp': { name: 'yt-dlp', path: '/b/yt-dlp', version: '2026.01.01', source: 'bundled' },
      ffmpeg: null,
      deno: { name: 'deno', path: '/b/deno', version: '2.5.0', source: 'updated' }
    })),
    lastCheck: vi.fn(async () => null),
    update: vi.fn(async (tool: string) =>
      tool === 'yt-dlp' ? { status: 'updated', version: '2026.08.19', previous: '2026.01.01' } : { status: 'up-to-date', version: '2.5.0' }
    ),
    ...overrides
  } as unknown as ToolManager
}

describe('EngineService', () => {
  it('reports tool status for the UI', async () => {
    expect(await new EngineService(fakeTools()).status()).toEqual({
      ytdlp: { version: '2026.01.01', source: 'bundled' },
      ffmpeg: null,
      deno: { version: '2.5.0', source: 'updated' },
      lastCheck: null
    })
  })

  it('updates yt-dlp and deno', async () => {
    const tools = fakeTools()
    expect(await new EngineService(tools).update()).toEqual({ status: 'updated', version: '2026.08.19' })
    expect(tools.update).toHaveBeenCalledWith('yt-dlp', undefined)
    expect(tools.update).toHaveBeenCalledWith('deno')
  })

  it('reports failure instead of throwing', async () => {
    const tools = fakeTools({ update: vi.fn(async () => Promise.reject(new Error('HTTP 503'))) })
    expect(await new EngineService(tools).update()).toEqual({ status: 'failed', message: 'HTTP 503' })
  })

  it('keeps a yt-dlp update even if deno fails', async () => {
    const tools = fakeTools({
      update: vi.fn(async (tool: string) =>
        tool === 'deno' ? Promise.reject(new Error('nope')) : { status: 'updated', version: '2026.08.19', previous: null }
      )
    })
    expect((await new EngineService(tools).update()).status).toBe('updated')
  })

  it('checks automatically at most once a day', async () => {
    const now = 1_000_000_000_000
    const recent = fakeTools({ lastCheck: vi.fn(async () => now - 60_000) })
    expect(await new EngineService(recent).updateIfDue(now)).toBeNull()
    const stale = fakeTools({ lastCheck: vi.fn(async () => now - 2 * 24 * 3600_000) })
    expect(await new EngineService(stale).updateIfDue(now)).toMatchObject({ status: 'updated' })
  })

  it('retries after engine errors at most once an hour', async () => {
    const tools = fakeTools()
    const service = new EngineService(tools)
    const t0 = Date.now()
    expect(await service.updateAfterEngineError(t0)).not.toBeNull()
    expect(await service.updateAfterEngineError(t0 + 60_000)).toBeNull()
    expect(await service.updateAfterEngineError(t0 + 2 * 3600_000)).not.toBeNull()
  })
})
