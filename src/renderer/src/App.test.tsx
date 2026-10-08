// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'
import { describe, expect, it } from 'vitest'
import type { DownloadJob } from '@shared/queue'
import { DEFAULT_SETTINGS } from '@shared/settings'
import { App } from './App'
import { mockApi } from './test-utils'

function setup(settings = DEFAULT_SETTINGS) {
  const listeners = new Map<string, (payload: unknown) => void>()
  const api = mockApi({
    'app:get-info': () => ({ name: 'VidSnare', version: '1.2.3', platform: 'linux' }),
    'settings:get': () => settings,
    'queue:list': () => [],
    'queue:default-folder': () => '/home/u/Downloads',
    'tools:get-status': () => ({ ytdlp: null, ffmpeg: null, deno: null, lastCheck: null }),
    'update:get-status': () => ({ state: 'idle', mode: 'disabled' })
  })
  api.on.mockImplementation((channel: string, listener: (payload: unknown) => void) => {
    listeners.set(channel, listener)
    return () => listeners.delete(channel)
  })
  return { emit: (channel: string, payload: unknown) => act(() => listeners.get(channel)?.(payload)) }
}

describe('App', () => {
  it('shows navigation and the app version', async () => {
    setup()
    render(<App />)
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(await screen.findByText('v1.2.3')).toBeInTheDocument()
  })

  it('switches pages', async () => {
    setup()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute('aria-current', 'page')
    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument()
  })

  it('uses the language from settings', async () => {
    setup({ ...DEFAULT_SETTINGS, language: 'de' })
    render(<App />)
    expect(await screen.findByRole('button', { name: 'Einstellungen' })).toBeInTheDocument()
  })

  it('applies a forced theme and follows the system otherwise', async () => {
    setup({ ...DEFAULT_SETTINGS, theme: 'dark' })
    const { unmount } = render(<App />)
    await screen.findByText('v1.2.3')
    expect(document.documentElement.dataset['theme']).toBe('dark')
    unmount()
    setup()
    render(<App />)
    await screen.findByText('v1.2.3')
    expect(document.documentElement.dataset['theme']).toBeUndefined()
  })

  it('opens the page a notification asks for', async () => {
    const { emit } = setup()
    render(<App />)
    await screen.findByText('v1.2.3')
    emit('app:navigate', { page: 'queue' })
    expect(screen.getByRole('button', { name: 'Queue' })).toHaveAttribute('aria-current', 'page')
  })

  it('shows a banner when an update is ready to install', async () => {
    const { emit } = setup()
    render(<App />)
    await screen.findByText('v1.2.3')
    emit('update:status', { state: 'ready', mode: 'auto', version: '2.0.0' })
    expect(screen.getByText('Version 2.0.0 is ready to install.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Restart and update' })).toBeInTheDocument()
  })

  it('shows how many downloads are active on the Queue tab', async () => {
    const { emit } = setup()
    render(<App />)
    await screen.findByText('v1.2.3')
    const job = (id: string, status: DownloadJob['status']) => ({ id, status }) as DownloadJob
    emit('queue:changed', [job('1', 'downloading'), job('2', 'queued'), job('3', 'completed')])
    expect(screen.getByLabelText('2 active')).toHaveTextContent('2')
  })
})
