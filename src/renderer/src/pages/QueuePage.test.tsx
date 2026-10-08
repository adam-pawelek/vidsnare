// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { DownloadJob } from '@shared/queue'
import { DEFAULT_SETTINGS } from '@shared/settings'
import { mockApi, renderWithI18n } from '../test-utils'
import { QueuePage } from './QueuePage'

const job = (overrides: Partial<DownloadJob>): DownloadJob => ({
  id: 'j1',
  videoId: 'aaaaaaaaaaa',
  title: 'A video',
  channel: 'C',
  thumbnail: null,
  duration: 60,
  options: DEFAULT_SETTINGS.defaults,
  outputDir: '/d',
  status: 'queued',
  progress: null,
  error: null,
  filePath: null,
  addedAt: 0,
  finishedAt: null,
  ...overrides
})

describe('QueuePage', () => {
  it('shows an empty state', () => {
    mockApi()
    renderWithI18n(<QueuePage jobs={[]} />)
    expect(screen.getByText(/No downloads yet/)).toBeInTheDocument()
  })

  it('shows progress, size, speed and time left', () => {
    mockApi()
    renderWithI18n(
      <QueuePage
        jobs={[
          job({
            status: 'downloading',
            progress: { fraction: 0.42, downloadedBytes: 4_200_000, totalBytes: 10_000_000, speed: 2_500_000, eta: 75 }
          })
        ]}
      />
    )
    expect(screen.getByText('Downloading')).toBeInTheDocument()
    expect(screen.getByText('4.2 MB of 10 MB')).toBeInTheDocument()
    expect(screen.getByText('2.5 MB/s')).toBeInTheDocument()
    expect(screen.getByText('1:15 left')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '42')
  })

  it('shows an indeterminate bar while processing', () => {
    mockApi()
    renderWithI18n(<QueuePage jobs={[job({ status: 'processing', progress: { fraction: 1, downloadedBytes: 1, totalBytes: 1, speed: null, eta: null } })]} />)
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow')
  })

  it('cancels a running download', () => {
    const api = mockApi({ 'queue:cancel': () => undefined })
    renderWithI18n(<QueuePage jobs={[job({ status: 'downloading' })]} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(api.invoke).toHaveBeenCalledWith('queue:cancel', 'j1')
  })

  it('explains a failure and offers retry', () => {
    const api = mockApi({ 'queue:retry': () => undefined })
    renderWithI18n(
      <QueuePage jobs={[job({ status: 'failed', error: { code: 'REGION_BLOCKED', retryable: false, detail: '' } })]} />,
      'fr'
    )
    expect(screen.getByText('Cette vidéo n’est pas disponible dans votre pays.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }))
    expect(api.invoke).toHaveBeenCalledWith('queue:retry', 'j1')
  })

  it('opens finished files by job ID', () => {
    const api = mockApi({ 'queue:open-file': () => undefined, 'queue:show-in-folder': () => undefined })
    renderWithI18n(<QueuePage jobs={[job({ status: 'completed', filePath: '/d/a.mp4' })]} />)
    fireEvent.click(screen.getByRole('button', { name: 'Open file' }))
    fireEvent.click(screen.getByRole('button', { name: 'Show in folder' }))
    expect(api.invoke).toHaveBeenCalledWith('queue:open-file', 'j1')
    expect(api.invoke).toHaveBeenCalledWith('queue:show-in-folder', 'j1')
  })

  it('offers bulk actions only when they apply', () => {
    const api = mockApi({ 'queue:clear-finished': () => undefined, 'queue:cancel-all': () => undefined })
    const { rerender } = renderWithI18n(<QueuePage jobs={[job({ status: 'completed' })]} />)
    expect(screen.queryByRole('button', { name: 'Cancel all' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Clear finished' }))
    expect(api.invoke).toHaveBeenCalledWith('queue:clear-finished')
    rerender(<QueuePage jobs={[job({ status: 'queued' })]} />)
    expect(screen.queryByRole('button', { name: 'Clear finished' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Cancel all' })).toBeInTheDocument()
  })
})
