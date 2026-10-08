import { useCallback, useRef, useState } from 'react'
import type { AppError } from '@shared/errors'
import type { Preview } from '@shared/media'
import { parseYouTubeUrl } from '@shared/youtube-url'

export type PreviewState =
  | { status: 'idle' }
  | { status: 'loading'; url: string }
  | { status: 'ready'; url: string; preview: Preview }
  | { status: 'error'; url: string; error: AppError }

/** Loads previews; a newer request always wins over a slower older one. */
export function useLinkPreview(): { state: PreviewState; load: (url: string) => void; reset: () => void } {
  const [state, setState] = useState<PreviewState>({ status: 'idle' })
  const latest = useRef(0)

  const load = useCallback((url: string) => {
    const request = ++latest.current
    if (!parseYouTubeUrl(url)) {
      setState({ status: 'error', url, error: { code: 'INVALID_URL', retryable: false, detail: url } })
      return
    }
    setState({ status: 'loading', url })
    window.vidsnare.invoke('media:fetch-info', url).then(
      (result) => {
        if (request !== latest.current) return
        setState(result.ok ? { status: 'ready', url, preview: result.preview } : { status: 'error', url, error: result.error })
      },
      (error: unknown) => {
        if (request !== latest.current) return
        setState({ status: 'error', url, error: { code: 'UNKNOWN', retryable: true, detail: String(error) } })
      }
    )
  }, [])

  const reset = useCallback(() => {
    latest.current++
    setState({ status: 'idle' })
  }, [])

  return { state, load, reset }
}
