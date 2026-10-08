// @vitest-environment jsdom
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { FetchInfoResult, VideoEntry } from '@shared/media'
import { mockApi, renderWithI18n } from '../test-utils'
import { DownloadPage } from './DownloadPage'

const entry = (id: string, title: string, extra: Partial<VideoEntry> = {}): VideoEntry => ({
  id,
  title,
  channel: 'Channel',
  duration: 125,
  thumbnail: null,
  url: `https://www.youtube.com/watch?v=${id}`,
  available: true,
  live: false,
  uploadDate: null,
  index: 1,
  ...extra
})

const VIDEO_URL = 'https://www.youtube.com/watch?v=aaaaaaaaaaa'
const PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PL1'

function load(url: string): void {
  const input = screen.getByRole('textbox')
  fireEvent.change(input, { target: { value: url } })
  fireEvent.click(screen.getByRole('button', { name: 'Load' }))
}

describe('DownloadPage', () => {
  it('rejects a non-YouTube link without asking the main process', () => {
    const api = mockApi()
    renderWithI18n(<DownloadPage />)
    load('https://example.com/x')
    expect(screen.getByRole('alert')).toHaveTextContent("That doesn't look like a YouTube link.")
    expect(api.invoke).not.toHaveBeenCalled()
  })

  it('shows a video preview', async () => {
    mockApi({
      'media:fetch-info': (): FetchInfoResult => ({
        ok: true,
        preview: { kind: 'video', playlistId: null, video: entry('aaaaaaaaaaa', 'My Video') }
      })
    })
    renderWithI18n(<DownloadPage />)
    load(VIDEO_URL)
    expect(screen.getByRole('status')).toHaveTextContent('Loading')
    expect(await screen.findByRole('heading', { name: 'My Video' })).toBeInTheDocument()
    expect(screen.getByText('by Channel')).toBeInTheDocument()
    expect(screen.getByText(/2:05/)).toBeInTheDocument()
  })

  it('offers the whole playlist for a video opened from one', async () => {
    const api = mockApi({
      'media:fetch-info': (url): FetchInfoResult =>
        url === VIDEO_URL
          ? { ok: true, preview: { kind: 'video', playlistId: 'PL1', video: entry('aaaaaaaaaaa', 'My Video') } }
          : {
              ok: true,
              preview: { kind: 'playlist', id: 'PL1', title: 'The List', channel: null, thumbnail: null, entries: [] }
            }
    })
    renderWithI18n(<DownloadPage />)
    load(VIDEO_URL)
    fireEvent.click(await screen.findByRole('button', { name: 'Whole playlist' }))
    expect(await screen.findByRole('heading', { name: 'The List' })).toBeInTheDocument()
    expect(api.invoke).toHaveBeenLastCalledWith('media:fetch-info', PLAYLIST_URL)
  })

  it('shows translated errors with a retry for transient problems', async () => {
    let calls = 0
    mockApi({
      'media:fetch-info': (): FetchInfoResult =>
        ++calls === 1
          ? { ok: false, error: { code: 'NO_INTERNET', retryable: true, detail: 'getaddrinfo failed' } }
          : { ok: true, preview: { kind: 'video', playlistId: null, video: entry('aaaaaaaaaaa', 'Back online') } }
    })
    renderWithI18n(<DownloadPage />, 'pl')
    fireEvent.change(screen.getByRole('textbox'), { target: { value: VIDEO_URL } })
    fireEvent.click(screen.getByRole('button', { name: 'Wczytaj' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Nie można połączyć się z YouTube.')
    fireEvent.click(screen.getByRole('button', { name: 'Ponów' }))
    expect(await screen.findByRole('heading', { name: 'Back online' })).toBeInTheDocument()
  })

  it('does not offer retry for permanent problems', async () => {
    mockApi({
      'media:fetch-info': (): FetchInfoResult => ({
        ok: false,
        error: { code: 'PRIVATE_VIDEO', retryable: false, detail: 'Private video' }
      })
    })
    renderWithI18n(<DownloadPage />)
    load(VIDEO_URL)
    expect(await screen.findByRole('alert')).toHaveTextContent('This video is private.')
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Copy details' })).toBeInTheDocument()
  })

  it('ignores a slow earlier response once a newer link was loaded', async () => {
    let releaseFirst: (value: FetchInfoResult) => void = () => {}
    mockApi({
      'media:fetch-info': (url) =>
        url === VIDEO_URL
          ? new Promise<FetchInfoResult>((resolve) => (releaseFirst = resolve))
          : { ok: true, preview: { kind: 'video', playlistId: null, video: entry('bbbbbbbbbbb', 'Second') } }
    })
    renderWithI18n(<DownloadPage />)
    load(VIDEO_URL)
    load('https://youtu.be/bbbbbbbbbbb')
    expect(await screen.findByRole('heading', { name: 'Second' })).toBeInTheDocument()
    releaseFirst({ ok: true, preview: { kind: 'video', playlistId: null, video: entry('aaaaaaaaaaa', 'First') } })
    await new Promise((r) => setTimeout(r, 10))
    expect(screen.queryByRole('heading', { name: 'First' })).toBeNull()
  })

  it('loads a link immediately when pasted', async () => {
    const api = mockApi({
      'media:fetch-info': (): FetchInfoResult => ({
        ok: true,
        preview: { kind: 'video', playlistId: null, video: entry('aaaaaaaaaaa', 'Pasted') }
      })
    })
    renderWithI18n(<DownloadPage />)
    fireEvent.paste(screen.getByRole('textbox'), { clipboardData: { getData: () => VIDEO_URL } })
    expect(await screen.findByRole('heading', { name: 'Pasted' })).toBeInTheDocument()
    expect(api.invoke).toHaveBeenCalledWith('media:fetch-info', VIDEO_URL)
  })

  it('pastes from the clipboard with the Paste button', async () => {
    const api = mockApi({
      'app:read-clipboard': () => VIDEO_URL,
      'media:fetch-info': (): FetchInfoResult => ({
        ok: true,
        preview: { kind: 'video', playlistId: null, video: entry('aaaaaaaaaaa', 'From clipboard') }
      })
    })
    renderWithI18n(<DownloadPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Paste' }))
    expect(await screen.findByRole('heading', { name: 'From clipboard' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('textbox')).toHaveValue(VIDEO_URL))
    expect(api.invoke).toHaveBeenCalledWith('app:read-clipboard')
  })
})

describe('playlist picker', () => {
  const entries = [
    entry('aaaaaaaaaaa', 'One', { index: 1 }),
    entry('bbbbbbbbbbb', 'Two', { index: 2, downloaded: true }),
    entry('ccccccccccc', '[Private video]', { index: 3, available: false }),
    entry('ddddddddddd', 'Four', { index: 4 })
  ]

  async function openPlaylist(): Promise<void> {
    mockApi({
      'media:fetch-info': (): FetchInfoResult => ({
        ok: true,
        preview: { kind: 'playlist', id: 'PL1', title: 'Mix', channel: 'Curator', thumbnail: null, entries }
      })
    })
    renderWithI18n(<DownloadPage />)
    load(PLAYLIST_URL)
    await screen.findByRole('heading', { name: 'Mix' })
  }

  const box = (name: string): HTMLInputElement => screen.getByRole('checkbox', { name: new RegExp(name) }) as HTMLInputElement

  it('lists all entries with a count', async () => {
    await openPlaylist()
    expect(screen.getByText('by Curator · 4 videos')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })

  it('pre-selects downloadable videos you do not have yet', async () => {
    await openPlaylist()
    expect(box('One').checked).toBe(true)
    expect(box('Two').checked).toBe(false)
    expect(box('Private').checked).toBe(false)
    expect(box('Private').disabled).toBe(true)
    expect(screen.getByText('2 of 3 selected')).toBeInTheDocument()
  })

  it('selects all and none, never including unavailable videos', async () => {
    await openPlaylist()
    fireEvent.click(screen.getByRole('button', { name: 'Select all' }))
    expect(screen.getByText('3 of 3 selected')).toBeInTheDocument()
    expect(box('Private').checked).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'Select none' }))
    expect(screen.getByText('0 of 3 selected')).toBeInTheDocument()
  })

  it('toggles single videos', async () => {
    await openPlaylist()
    fireEvent.click(box('Four'))
    expect(box('Four').checked).toBe(false)
    expect(screen.getByText('1 of 3 selected')).toBeInTheDocument()
  })

  it('can hide already-downloaded videos', async () => {
    await openPlaylist()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Hide already downloaded' }))
    expect(screen.queryByText('Two')).toBeNull()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })
})
