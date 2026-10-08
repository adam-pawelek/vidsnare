// @vitest-environment jsdom
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { EngineStatus } from '@shared/ipc'
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

function setup(settings: Partial<Settings> = {}, updateStatus: UpdateStatus = { state: 'idle', mode: 'disabled' }) {
  const api = mockApi({
    'update:get-status': () => updateStatus,
    'update:install': () => undefined,
    'update:open-releases': () => undefined,
    'queue:default-folder': () => '/home/u/Downloads',
    'app:get-info': () => ({ name: 'VidSnare', version: '0.1.0', platform: 'linux' }),
    'tools:get-status': () => status,
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
    fireEvent.click(screen.getByRole('button', { name: 'Change download folder…' }))
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

  it('does not offer to change the file name format', () => {
    setup()
    expect(screen.queryByRole('textbox', { name: 'File name' })).toBeNull()
  })

  it('changes the theme', () => {
    const { update } = setup()
    fireEvent.change(screen.getByRole('combobox', { name: 'Theme' }), { target: { value: 'dark' } })
    expect(update).toHaveBeenCalledWith({ theme: 'dark' })
  })

  it('no longer has a language picker (it lives in the sidebar)', () => {
    setup()
    expect(screen.queryByRole('combobox', { name: 'Language' })).toBeNull()
  })

  it('changes default download options', () => {
    const { update } = setup()
    fireEvent.click(screen.getByRole('radio', { name: 'Audio only' }))
    expect(update).toHaveBeenCalledWith({ defaults: { ...DEFAULT_SETTINGS.defaults, kind: 'audio' } })
  })

  it('shows the engine version and says updates are automatic, with no buttons', async () => {
    setup()
    expect(await screen.findByText(/yt-dlp 2026\.08\.19/)).toBeInTheDocument()
    expect(screen.getByText(/Last checked: Never/)).toBeInTheDocument()
    expect(screen.getByText('VidSnare keeps itself and its download engine up to date automatically.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /update engine|check for updates/i })).toBeNull()
  })

  describe('app updates', () => {
    it('shows nothing while there is nothing to do', async () => {
      setup({}, { state: 'up-to-date', mode: 'auto' })
      await screen.findByText(/yt-dlp 2026/)
      expect(screen.queryByRole('status')).toBeNull()
    })

    it('stays quiet about failed checks (it retries on its own)', async () => {
      setup({}, { state: 'error', mode: 'auto', message: 'HTTP 404' })
      await screen.findByText(/yt-dlp 2026/)
      expect(screen.queryByRole('alert')).toBeNull()
    })

    it('shows download progress of an update', async () => {
      setup({}, { state: 'downloading', mode: 'auto', version: '2.0.0', fraction: 0.5 })
      expect(await screen.findByText('Downloading update… 50%')).toBeInTheDocument()
    })

    it('offers to restart once an update is downloaded', async () => {
      const { api } = setup({}, { state: 'ready', mode: 'auto', version: '2.0.0' })
      fireEvent.click(await screen.findByRole('button', { name: 'Restart and update' }))
      expect(api.invoke).toHaveBeenCalledWith('update:install')
    })

    it('sends .deb users to the releases page', async () => {
      const { api } = setup({}, { state: 'available', mode: 'manual', version: '2.0.0' })
      expect(await screen.findByText('Version 2.0.0 is available.')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Open releases page' }))
      expect(api.invoke).toHaveBeenCalledWith('update:open-releases')
    })
  })

  it('shows the disclaimer', () => {
    setup()
    expect(screen.getByText(/responsible for complying with YouTube's Terms of Service/)).toBeInTheDocument()
  })
})
