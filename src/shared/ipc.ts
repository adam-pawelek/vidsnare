/**
 * The contract between the renderer and the main process.
 *
 * Every request the renderer can make is listed in `InvokeMap`, and every event
 * the main process can push is listed in `EventMap`. The preload script only
 * forwards channels named here, so the renderer cannot reach anything else.
 */
import type { FetchInfoResult } from './media'

export interface AppInfo {
  name: string
  version: string
  platform: 'win32' | 'linux' | 'darwin' | (string & {})
}

export type ToolSource = 'updated' | 'bundled' | 'system'

export interface ToolStatus {
  version: string
  source: ToolSource
}

export interface EngineStatus {
  ytdlp: ToolStatus | null
  ffmpeg: ToolStatus | null
  deno: ToolStatus | null
  /** When we last asked GitHub for a new engine (ms since epoch). */
  lastCheck: number | null
}

export type EngineUpdateResult =
  | { status: 'updated'; version: string }
  | { status: 'up-to-date'; version: string | null }
  | { status: 'failed'; message: string }

/** Request channels: channel name -> [argument tuple, resolved value]. */
export interface InvokeMap {
  'app:get-info': [[], AppInfo]
  'tools:get-status': [[], EngineStatus]
  'tools:update-engine': [[], EngineUpdateResult]
  'app:read-clipboard': [[], string]
  'media:fetch-info': [[url: string], FetchInfoResult]
}

/** Push channels from main to renderer: channel name -> payload. */
export interface EventMap {
  'app:theme-changed': { dark: boolean }
  'tools:update-progress': { fraction: number | null }
}

export type InvokeChannel = keyof InvokeMap
export type EventChannel = keyof EventMap
export type InvokeArgs<C extends InvokeChannel> = InvokeMap[C][0]
export type InvokeResult<C extends InvokeChannel> = InvokeMap[C][1]

export const INVOKE_CHANNELS = [
  'app:get-info',
  'tools:get-status',
  'tools:update-engine',
  'app:read-clipboard',
  'media:fetch-info'
] as const satisfies readonly InvokeChannel[]
export const EVENT_CHANNELS = ['app:theme-changed', 'tools:update-progress'] as const satisfies readonly EventChannel[]

export function isInvokeChannel(value: unknown): value is InvokeChannel {
  return typeof value === 'string' && (INVOKE_CHANNELS as readonly string[]).includes(value)
}

export function isEventChannel(value: unknown): value is EventChannel {
  return typeof value === 'string' && (EVENT_CHANNELS as readonly string[]).includes(value)
}

/** The API object the preload script exposes as `window.vidsnare`. */
export interface VidsnareApi {
  invoke<C extends InvokeChannel>(channel: C, ...args: InvokeArgs<C>): Promise<InvokeResult<C>>
  on<C extends EventChannel>(channel: C, listener: (payload: EventMap[C]) => void): () => void
}
