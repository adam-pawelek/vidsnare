// @vitest-environment jsdom
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { EngineStatus, EngineUpdateResult } from '@shared/ipc'
import type { UpdateStatus } from '@shared/update'
import { DEFAULT_SETTINGS, type Settings } from '@shared/settings'
import { mockApi, renderWithI18n } from '../test-utils'
import { SettingsPage } from './SettingsPage'

const status: EngineStatus = {
  ytdlp: { version: '2026.08.19', source: 'updated' },
  ffmpeg: { version: 'n7.1', source: 'bundled' },
  deno: { version: '2.9.7', source: 'updated' },
  lastCheck: null
}

function setup(
  settings: Partial<Settings> = {},
  engineResult: EngineUpdateResult = { status: 'up-to-date', version: '2026.08.19' },
  updateStatus: UpdateStatus = { state: 'idle', mode: 'disabled' }
) {
  const api = mockApi({
    'update:get-status': () => updateStatus,
    'update:check': () => updateStatus,
    'update:install': () => undefined,
    'update:open-releases': () => undefined,
    'queue:default-folder': () => '/home/u/Downloads',
    'app:get-info': () => ({ name: 'VidSnare', version: '0.1.0', platform: 'linux' }),
    'tools:get-status': () => status,
    'tools:update-engine': () => engineResult,
    'dialog:choose-folder': () => '/mnt/media'
  })
  const update = vi.fn(async () => {})
  renderWithI18n(<SettingsPage settings={{ ...DEFAULT_SETTINGS, ...settings }} update={update} />)
  return { api, update }
}

describe('SettingsPage', () => {
  it('shows the download folder and changes it through the dialog', async () => {
    const { update } = setup()
    expect(await screen.findByText('/home/u/Downloads')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Use the system Downloads folder' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Change…' }))
    await waitFor(() => expect(update).toHaveBeenCalledWith({ downloadDir: '/mnt/media' }))
  })

  it('can go back to the system Downloads folder', async () => {
    const { update } = setup({ downloadDir: '/mnt/media' })
    fireEvent.click(await screen.findByRole('button', { name: 'Use the system Downloads folder' }))
    expect(update).toHaveBeenCalledWith({ downloadDir: '' })
  })

  it('changes the number of simultaneous downloads', () => {
    const { update } = setup()
    fireEvent.change(screen.getByRole('combobox', { name: 'Simultaneous downloads' }), { target: { value: '5' } })
    expect(update).toHaveBeenCalledWith({ maxConcurrent: 5 })
  })

  it('toggles skipping and notifications', () => {
    const { update } = setup()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Skip videos I have already downloaded' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Show a notification when a download finishes' }))
    expect(update).toHaveBeenCalledWith({ skipDownloaded: false })
    expect(update).toHaveBeenCalledWith({ notifications: false })
  })

  it('previews the file name template', () => {
    setup()
    expect(screen.getByText('Example: Example video [dQw4w9WgXcQ].mp4')).toBeInTheDocument()
  })

  it('saves a valid template and refuses one without title or ID', () => {
    const { update } = setup()
    const input = screen.getByRole('textbox', { name: 'File name' })
    fireEvent.change(input, { target: { value: '{index} - {title}' } })
    expect(update).toHaveBeenLastCalledWith({ filenameTemplate: '{index} - {title}' })
    expect(screen.getByText('Example: 03 - Example video.mp4')).toBeInTheDocument()

    update.mockClear()
    fireEvent.change(input, { target: { value: '{channel}' } })
    expect(update).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('The file name must include the title or the video ID.')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('changes language and theme', () => {
    const { update } = setup()
    fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), { target: { value: 'ja' } })
    fireEvent.change(screen.getByRole('combobox', { name: 'Theme' }), { target: { value: 'dark' } })
    expect(update).toHaveBeenCalledWith({ language: 'ja' })
    expect(update).toHaveBeenCalledWith({ theme: 'dark' })
  })

  it('lists every language by its own name', () => {
    setup()
    const options = Array.from((screen.getByRole('combobox', { name: 'Language' }) as HTMLSelectElement).options).map(
      (o) => o.text
    )
    expect(options).toEqual(['System default', 'English', 'Polski', 'Deutsch', 'Español', 'Português (Brasil)', 'Русский', '日本語', 'Français'])
  })

  it('changes default download options', () => {
    const { update } = setup()
    fireEvent.click(screen.getByRole('radio', { name: 'Audio only' }))
    expect(update).toHaveBeenCalledWith({ defaults: { ...DEFAULT_SETTINGS.defaults, kind: 'audio' } })
  })

  it('shows the engine version and updates it', async () => {
    const { api } = setup({}, { status: 'updated', version: '2026.09.01' })
    expect(await screen.findByText(/yt-dlp 2026\.08\.19/)).toBeInTheDocument()
    expect(screen.getByText(/Last checked: Never/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Update engine' }))
    expect(await screen.findByText('Engine updated to 2026.09.01.')).toBeInTheDocument()
    expect(api.invoke).toHaveBeenCalledWith('tools:update-engine')
  })

  it('says when the engine is already current', async () => {
    setup()
    fireEvent.click(await screen.findByRole('button', { name: 'Update engine' }))
    expect(await screen.findByText('The engine is up to date.')).toBeInTheDocument()
  })

  it('reports a failed engine update', async () => {
    setup({}, { status: 'failed', message: 'HTTP 503' })
    fireEvent.click(await screen.findByRole('button', { name: 'Update engine' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not update the engine')
  })

  describe('app updates', () => {
    const engine: EngineUpdateResult = { status: 'up-to-date', version: '2026.08.19' }

    it('hides update controls in development builds', async () => {
      setup()
      await screen.findByText(/yt-dlp 2026/)
      expect(screen.queryByRole('button', { name: 'Check for updates' })).toBeNull()
    })

    it('checks for updates', async () => {
      const { api } = setup({}, engine, { state: 'up-to-date', mode: 'auto' })
      expect(await screen.findByText('You have the latest version.')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Check for updates' }))
      expect(api.invoke).toHaveBeenCalledWith('update:check')
    })

    it('installs a downloaded update', async () => {
      const { api } = setup({}, engine, { state: 'ready', mode: 'auto', version: '2.0.0' })
      fireEvent.click(await screen.findByRole('button', { name: 'Restart and update' }))
      expect(api.invoke).toHaveBeenCalledWith('update:install')
    })

    it('sends .deb users to the releases page', async () => {
      const { api } = setup({}, engine, { state: 'available', mode: 'manual', version: '2.0.0' })
      expect(await screen.findByText('Version 2.0.0 is available.')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Open releases page' }))
      expect(api.invoke).toHaveBeenCalledWith('update:open-releases')
    })

    it('reports a failed check', async () => {
      setup({}, engine, { state: 'error', mode: 'auto', message: 'HTTP 404' })
      expect(await screen.findByText('Could not check for updates.')).toBeInTheDocument()
    })
  })

  it('shows the disclaimer', () => {
    setup()
    expect(screen.getByText(/responsible for complying with YouTube's Terms of Service/)).toBeInTheDocument()
  })
})
