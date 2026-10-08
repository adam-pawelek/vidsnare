import { EventEmitter } from 'node:events'
import { describe, expect, it, vi } from 'vitest'
import type { UpdateStatus } from '@shared/update'
import { detectUpdateMode, UpdateController, type Updater } from './update-controller'

class FakeUpdater extends EventEmitter implements Updater {
  autoDownload = true
  autoInstallOnAppQuit = false
  checkForUpdates = vi.fn(async () => undefined)
  downloadUpdate = vi.fn(async () => undefined)
  quitAndInstall = vi.fn()
}

function setup(mode: 'auto' | 'manual' | 'disabled' = 'auto') {
  const fake = new FakeUpdater()
  const statuses: UpdateStatus[] = []
  const beforeInstall = vi.fn(async () => {})
  const factory = vi.fn(() => fake)
  const controller = new UpdateController({
    mode,
    updater: factory,
    onStatus: (s) => statuses.push(s),
    beforeInstall
  })
  return { fake, statuses, controller, beforeInstall, factory }
}

describe('UpdateController', () => {
  it('never loads the updater in development', async () => {
    const { controller, factory } = setup('disabled')
    expect(await controller.check()).toEqual({ state: 'idle', mode: 'disabled' })
    expect(factory).not.toHaveBeenCalled()
  })

  it('downloads automatically and becomes ready to install', async () => {
    const { fake, controller, statuses } = setup('auto')
    await controller.check()
    expect(fake.autoDownload).toBe(true)
    expect(fake.autoInstallOnAppQuit).toBe(true)
    fake.emit('checking-for-update')
    fake.emit('update-available', { version: '1.2.0' })
    fake.emit('download-progress', { percent: 40 })
    fake.emit('update-downloaded', { version: '1.2.0' })
    expect(statuses.map((s) => s.state)).toEqual(['checking', 'downloading', 'downloading', 'ready'])
    expect(statuses[2]).toMatchObject({ version: '1.2.0', fraction: 0.4 })
  })

  it('reports when already up to date', async () => {
    const { fake, controller } = setup('auto')
    await controller.check()
    fake.emit('update-not-available')
    expect(controller.getStatus()).toEqual({ state: 'up-to-date', mode: 'auto' })
  })

  it('only announces updates for .deb installs', async () => {
    const { fake, controller } = setup('manual')
    await controller.check()
    expect(fake.autoDownload).toBe(false)
    expect(fake.autoInstallOnAppQuit).toBe(false)
    fake.emit('update-available', { version: '1.2.0' })
    expect(controller.getStatus()).toEqual({ state: 'available', mode: 'manual', version: '1.2.0' })
    expect(fake.downloadUpdate).not.toHaveBeenCalled()
  })

  it('turns a failed check into an error status', async () => {
    const { fake, controller } = setup('auto')
    fake.checkForUpdates.mockRejectedValueOnce(new Error('HTTP 404'))
    expect(await controller.check()).toEqual({ state: 'error', mode: 'auto', message: 'HTTP 404' })
  })

  it('stops downloads before installing', async () => {
    const { fake, controller, beforeInstall } = setup('auto')
    await controller.check()
    await controller.install()
    expect(fake.quitAndInstall).not.toHaveBeenCalled() // nothing downloaded yet
    fake.emit('update-downloaded', { version: '1.2.0' })
    await controller.install()
    expect(beforeInstall).toHaveBeenCalled()
    expect(fake.quitAndInstall).toHaveBeenCalled()
  })
})

describe('detectUpdateMode', () => {
  it.each([
    [{ packaged: false, platform: 'win32', env: {} }, 'disabled'],
    [{ packaged: true, platform: 'win32', env: {} }, 'auto'],
    [{ packaged: true, platform: 'linux', env: { APPIMAGE: '/home/u/VidSnare.AppImage' } }, 'auto'],
    [{ packaged: true, platform: 'linux', env: {} }, 'manual'],
    [{ packaged: true, platform: 'darwin', env: {} }, 'disabled']
  ])('%j → %s', (opts, mode) => {
    expect(detectUpdateMode(opts)).toBe(mode)
  })
})
