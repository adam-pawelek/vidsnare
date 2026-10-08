import { isEventChannel, isInvokeChannel, type VidsnareApi } from '@shared/ipc'

/** The subset of Electron's `ipcRenderer` the API needs; injectable for tests. */
export interface IpcRendererLike {
  invoke(channel: string, ...args: unknown[]): Promise<unknown>
  on(channel: string, listener: (event: unknown, ...args: unknown[]) => void): unknown
  removeListener(channel: string, listener: (event: unknown, ...args: unknown[]) => void): unknown
}

export function createApi(ipc: IpcRendererLike): VidsnareApi {
  return {
    invoke(channel, ...args) {
      if (!isInvokeChannel(channel)) {
        return Promise.reject(new Error(`Unknown IPC channel: ${String(channel)}`))
      }
      return ipc.invoke(channel, ...args) as never
    },
    on(channel, listener) {
      if (!isEventChannel(channel)) {
        throw new Error(`Unknown IPC event: ${String(channel)}`)
      }
      // Never hand the raw IpcRendererEvent to the page: it exposes `sender`.
      const wrapped = (_event: unknown, payload: unknown): void => listener(payload as never)
      ipc.on(channel, wrapped)
      return () => {
        ipc.removeListener(channel, wrapped)
      }
    }
  }
}
