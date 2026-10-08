// @vitest-environment jsdom
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { FetchInfoResult, VideoEntry } from '@shared/media'
import type { AddDownloadsRequest } from '@shared/queue'
import { DEFAULT_SETTINGS } from '@shared/settings'
import { mockApi as baseMockApi, renderWithI18n } from '../test-utils'
import { DownloadPage as Page } from './DownloadPage'

// Channels every test needs; individual tests add or override the rest.
const mockApi = (handlers: Parameters<typeof baseMockApi>[0] = {}) =>
  baseMockApi({ 'queue:default-folder': () => '/home/u/Downloads', ...handlers })
const DownloadPage = (): React.JSX.Element => <Page settings={DEFAULT_SETTINGS} onOpenQueue={() => {}} />

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
    expect(api.invoke).not.toHaveBeenCalledWith('media:fetch-info', expect.anything())
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

describe('starting downloads', () => {
  function setup(preview: FetchInfoResult) {
    const requests: AddDownloadsRequest[] = []
    const api = mockApi({
      'media:fetch-info': () => preview,
      'dialog:choose-folder': () => '/mnt/usb',
      'queue:add': (req) => {
        requests.push(req as AddDownloadsRequest)
        return { added: (req as AddDownloadsRequest).items.length, skipped: 0 }
      }
    })
    return { api, requests }
  }

  it('downloads a single video with the default options', async () => {
    const { requests } = setup({ ok: true, preview: { kind: 'video', playlistId: null, video: entry('aaaaaaaaaaa', 'V') } })
    renderWithI18n(<DownloadPage />)
    load(VIDEO_URL)
    fireEvent.click(await screen.findByRole('button', { name: 'Download' }))
    await screen.findByText('Added 1 download to the queue')
    expect(screen.getByText('Click “Queue” on the left to see the progress and open your file when it’s ready.')).toBeInTheDocument()
    expect(requests[0]).toMatchObject({
      items: [{ videoId: 'aaaaaaaaaaa', title: 'V' }],
      options: DEFAULT_SETTINGS.defaults,
      outputDir: '/home/u/Downloads',
      playlistTitle: null
    })
  })

  it('sends only the selected playlist videos and the playlist title', async () => {
    const { requests } = setup({
      ok: true,
      preview: {
        kind: 'playlist',
        id: 'PL1',
        title: 'Mix',
        channel: null,
        thumbnail: null,
        entries: [entry('aaaaaaaaaaa', 'One'), entry('bbbbbbbbbbb', 'Two'), entry('ccccccccccc', 'Three')]
      }
    })
    renderWithI18n(<DownloadPage />)
    load(PLAYLIST_URL)
    await screen.findByRole('heading', { name: 'Mix' })
    fireEvent.click(screen.getByRole('checkbox', { name: /Two/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Download 2 videos' }))
    await screen.findByText('Added 2 downloads to the queue')
    expect(requests[0]!.items.map((i) => i.videoId)).toEqual(['aaaaaaaaaaa', 'ccccccccccc'])
    expect(requests[0]!.playlistTitle).toBe('Mix')
  })

  it('disables the button when nothing is selected', async () => {
    setup({
      ok: true,
      preview: { kind: 'playlist', id: 'PL1', title: 'Mix', channel: null, thumbnail: null, entries: [entry('aaaaaaaaaaa', 'One')] }
    })
    renderWithI18n(<DownloadPage />)
    load(PLAYLIST_URL)
    await screen.findByRole('heading', { name: 'Mix' })
    fireEvent.click(screen.getByRole('button', { name: 'Select none' }))
    expect(screen.getByRole('button', { name: 'Download 0 videos' })).toBeDisabled()
  })

  it('switches to audio and sends the chosen format and folder', async () => {
    const { requests } = setup({ ok: true, preview: { kind: 'video', playlistId: null, video: entry('aaaaaaaaaaa', 'V') } })
    renderWithI18n(<DownloadPage />)
    load(VIDEO_URL)
    fireEvent.click(await screen.findByRole('radio', { name: 'Audio only' }))
    expect(screen.queryByRole('combobox', { name: 'Quality' })).toBeNull()
    fireEvent.change(screen.getByRole('combobox', { name: 'Audio format' }), { target: { value: 'opus' } })
    fireEvent.click(screen.getByRole('button', { name: 'Change download folder…' }))
    await screen.findByText('/mnt/usb')
    fireEvent.click(screen.getByRole('button', { name: 'Download' }))
    await screen.findByText(/Added 1 download/)
    expect(requests[0]).toMatchObject({ options: { kind: 'audio', audioFormat: 'opus' }, outputDir: '/mnt/usb' })
  })

  it('lets you pick subtitle languages', async () => {
    const { requests } = setup({ ok: true, preview: { kind: 'video', playlistId: null, video: entry('aaaaaaaaaaa', 'V') } })
    renderWithI18n(<DownloadPage />)
    load(VIDEO_URL)
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Download subtitles' }))
    const picker = screen.getByRole('combobox', { name: 'Languages' })
    fireEvent.change(picker, { target: { value: 'pl' } })
    fireEvent.change(picker, { target: { value: 'ja' } })
    expect(screen.getByText('Polish')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Remove Japanese' }))
    fireEvent.click(screen.getByRole('button', { name: 'Download' }))
    await screen.findByText(/Added 1 download/)
    expect(requests[0]!.options.subtitles).toMatchObject({ enabled: true, languages: ['pl'] })
  })

  it('reports videos skipped as already downloaded', async () => {
    mockApi({
      'media:fetch-info': (): FetchInfoResult => ({
        ok: true,
        preview: { kind: 'playlist', id: 'PL1', title: 'Mix', channel: null, thumbnail: null, entries: [entry('aaaaaaaaaaa', 'One')] }
      }),
      'queue:add': () => ({ added: 0, skipped: 3 })
    })
    renderWithI18n(<DownloadPage />)
    load(PLAYLIST_URL)
    fireEvent.click(await screen.findByRole('button', { name: 'Download 1 video' }))
    expect(await screen.findByText(/Skipped 3 videos you already downloaded/)).toBeInTheDocument()
    // Nothing was added, so there is nothing to go and look at.
    expect(screen.queryByText(/on the left to see the progress/)).toBeNull()
  })
})
