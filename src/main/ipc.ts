import { ipcMain, type IpcMainInvokeEvent } from 'electron'
import type { InvokeArgs, InvokeChannel, InvokeResult } from '@shared/ipc'

export type Handler<C extends InvokeChannel> = (
  ...args: InvokeArgs<C>
) => InvokeResult<C> | Promise<InvokeResult<C>>

/**
 * Registers a typed IPC handler. Requests from any frame other than our own
 * app page are refused, so injected or navigated content cannot call in.
 */
export function handle<C extends InvokeChannel>(
  channel: C,
  isTrustedSender: (event: IpcMainInvokeEvent) => boolean,
  handler: Handler<C>
): void {
  ipcMain.handle(channel, async (event, ...args) => {
    if (!isTrustedSender(event)) {
      throw new Error('IPC request from an untrusted frame was refused')
    }
    return handler(...(args as InvokeArgs<C>))
  })
}
