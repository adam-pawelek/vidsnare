// @vitest-environment jsdom
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { act } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { HistoryItem, HistoryQuery } from '@shared/history'
import { DEFAULT_SETTINGS } from '@shared/settings'
import { mockApi, renderWithI18n } from '../test-utils'
import { HistoryPage } from './HistoryPage'

const item = (overrides: Partial<HistoryItem>): HistoryItem => ({
  id: 'h1',
  videoId: 'aaaaaaaaaaa',
  title: 'Saved video',
  channel: 'Channel',
  thumbnail: null,
  duration: 60,
  options: DEFAULT_SETTINGS.defaults,
  filePath: '/d/Saved video [aaaaaaaaaaa].mp4',
  fileSize: 12_300_000,
  finishedAt: Date.UTC(2026, 9, 8, 12, 0),
  fileExists: true,
  ...overrides
})

function setup(items: HistoryItem[]) {
  let onChanged: (() => void) | undefined
  const queries: HistoryQuery[] = []
  const api = mockApi({
    'history:list': (q) => {
      const query = q as HistoryQuery
      queries.push(query)
      return items.filter((i) => i.title.toLowerCase().includes(query.search.toLowerCase()))
    },
    'history:open-file': () => undefined,
    'history:show-in-folder': () => undefined,
    'history:remove': () => undefined,
    'history:clear': () => {
      items = []
    },
    'history:download-again': () => ({ added: 1, skipped: 0 })
  })
  api.on.mockImplementation((_channel: string, listener: () => void) => {
    onChanged = listener
    return () => {}
  })
  return { api, queries, changed: () => act(() => onChanged?.()) }
}

describe('HistoryPage', () => {
  it('shows an empty state', async () => {
    setup([])
    renderWithI18n(<HistoryPage onQueued={() => {}} />)
    expect(await screen.findByText('Finished downloads will appear here.')).toBeInTheDocument()
  })

  it('lists downloads with format, size and date', async () => {
    setup([item({})])
    renderWithI18n(<HistoryPage onQueued={() => {}} />)
    expect(await screen.findByText('Saved video')).toBeInTheDocument()
    expect(screen.getByText('MP4')).toBeInTheDocument()
    expect(screen.getByText('12 MB')).toBeInTheDocument()
    expect(screen.getByText(/2026/)).toBeInTheDocument()
  })

  it('opens files and folders by entry ID', async () => {
    const { api } = setup([item({})])
    renderWithI18n(<HistoryPage onQueued={() => {}} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Open file' }))
    fireEvent.click(screen.getByRole('button', { name: 'Show in folder' }))
    expect(api.invoke).toHaveBeenCalledWith('history:open-file', 'h1')
    expect(api.invoke).toHaveBeenCalledWith('history:show-in-folder', 'h1')
  })

  it('offers to download again when the file is gone', async () => {
    const onQueued = vi.fn()
    const { api } = setup([item({ fileExists: false })])
    renderWithI18n(<HistoryPage onQueued={onQueued} />)
    expect(await screen.findByText('File was moved or deleted')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Open file' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Download again' }))
    await waitFor(() => expect(onQueued).toHaveBeenCalled())
    expect(api.invoke).toHaveBeenCalledWith('history:download-again', 'h1')
  })

  it('searches', async () => {
    const { queries } = setup([item({ title: 'Alpha' }), item({ id: 'h2', title: 'Beta' })])
    renderWithI18n(<HistoryPage onQueued={() => {}} />)
    await screen.findByText('Alpha')
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'bet' } })
    await waitFor(() => expect(screen.queryByText('Alpha')).toBeNull())
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(queries.at(-1)).toEqual({ search: 'bet', limit: 200 })
  })

  it('says when nothing matches', async () => {
    setup([item({})])
    renderWithI18n(<HistoryPage onQueued={() => {}} />)
    await screen.findByText('Saved video')
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzz' } })
    expect(await screen.findByText('Nothing matches your search.')).toBeInTheDocument()
  })

  it('asks before clearing and can be cancelled', async () => {
    const { api, changed } = setup([item({})])
    renderWithI18n(<HistoryPage onQueued={() => {}} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Clear history' }))
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveTextContent('Downloaded files are not deleted.')
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(api.invoke).not.toHaveBeenCalledWith('history:clear')

    fireEvent.click(screen.getByRole('button', { name: 'Clear history' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Clear history' }).at(-1)!)
    expect(api.invoke).toHaveBeenCalledWith('history:clear')
    changed()
    expect(await screen.findByText('Finished downloads will appear here.')).toBeInTheDocument()
  })

  it('refreshes when the history changes', async () => {
    const items = [item({ title: 'First' })]
    const { changed } = setup(items)
    renderWithI18n(<HistoryPage onQueued={() => {}} />)
    await screen.findByText('First')
    items.unshift(item({ id: 'h2', title: 'Newer' }))
    changed()
    expect(await screen.findByText('Newer')).toBeInTheDocument()
  })
})
