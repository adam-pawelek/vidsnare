import type { VidsnareApi } from '../shared/ipc'

declare global {
  interface Window {
    vidsnare: VidsnareApi
  }
}
