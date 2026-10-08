import { describe, expect, it, vi } from 'vitest'
import { createApi, type IpcRendererLike } from './api'

function fakeIpc() {
  const listeners = new Map<string, Set<(event: unknown, ...args: unknown[]) => void>>()
  const ipc: IpcRendererLike & { emit(channel: string, payload: unknown): void } = {
    invoke: vi.fn(async (_channel: string, ..._args: unknown[]) => 'ok' as unknown),
    on: vi.fn((channel: string, listener: (event: unknown, ...args: unknown[]) => void) => {
      if (!listeners.has(channel)) listeners.set(channel, new Set())
      listeners.get(channel)!.add(listener)
    }),
    removeListener: vi.fn((channel: string, listener: (event: unknown, ...args: unknown[]) => void) => {
      listeners.get(channel)?.delete(listener)
    }),
    emit(channel, payload) {
      for (const l of listeners.get(channel) ?? []) l({ sender: 'secret' }, payload)
    }
  }
  return ipc
}

describe('createApi', () => {
  it('forwards known invoke channels', async () => {
    const ipc = fakeIpc()
    const api = createApi(ipc)
    await expect(api.invoke('app:get-info')).resolves.toBe('ok')
    expect(ipc.invoke).toHaveBeenCalledWith('app:get-info')
  })

  it('rejects unknown invoke channels without touching ipc', async () => {
    const ipc = fakeIpc()
    const api = createApi(ipc)
    await expect((api.invoke as (c: string) => Promise<unknown>)('fs:delete-everything')).rejects.toThrow(/Unknown IPC channel/)
    expect(ipc.invoke).not.toHaveBeenCalled()
  })

  it('delivers only the payload to listeners, never the raw event', () => {
    const ipc = fakeIpc()
    const api = createApi(ipc)
    const listener = vi.fn()
    api.on('app:theme-changed', listener)
    ipc.emit('app:theme-changed', { dark: true })
    expect(listener).toHaveBeenCalledWith({ dark: true })
    expect(listener.mock.calls[0]).toHaveLength(1)
  })

  it('unsubscribes', () => {
    const ipc = fakeIpc()
    const api = createApi(ipc)
    const listener = vi.fn()
    const off = api.on('app:theme-changed', listener)
    off()
    ipc.emit('app:theme-changed', { dark: false })
    expect(listener).not.toHaveBeenCalled()
  })

  it('refuses to subscribe to unknown events', () => {
    const api = createApi(fakeIpc())
    expect(() => api.on('evil' as never, () => {})).toThrow(/Unknown IPC event/)
  })
})
