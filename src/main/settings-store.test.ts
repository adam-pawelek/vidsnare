import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS } from '@shared/settings'
import { SettingsStore } from './settings-store'

let dir: string
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'vidsnare-settings-'))
})
afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe('SettingsStore', () => {
  it('starts with defaults when there is no file', async () => {
    expect(await new SettingsStore(join(dir, 's.json')).load()).toEqual(DEFAULT_SETTINGS)
  })

  it('survives a corrupt file', async () => {
    await writeFile(join(dir, 's.json'), '{oops')
    expect(await new SettingsStore(join(dir, 's.json')).load()).toEqual(DEFAULT_SETTINGS)
  })

  it('saves updates and reloads them', async () => {
    const path = join(dir, 's.json')
    const store = new SettingsStore(path)
    await store.load()
    await store.update({ maxConcurrent: 5, defaults: { kind: 'audio' } })
    const reloaded = await new SettingsStore(path).load()
    expect(reloaded.maxConcurrent).toBe(5)
    expect(reloaded.defaults.kind).toBe('audio')
    // Partial defaults keep the other fields.
    expect(reloaded.defaults.audioFormat).toBe('mp3')
    expect(JSON.parse(await readFile(path, 'utf8')).maxConcurrent).toBe(5)
  })

  it('validates updates', async () => {
    const store = new SettingsStore(join(dir, 's.json'))
    await store.load()
    expect((await store.update({ maxConcurrent: -3, theme: 'neon' })).maxConcurrent).toBe(1)
    expect(store.get().theme).toBe('system')
  })

  it('notifies listeners', async () => {
    const store = new SettingsStore(join(dir, 's.json'))
    await store.load()
    const listener = vi.fn()
    const off = store.onChange(listener)
    await store.update({ theme: 'dark' })
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ theme: 'dark' }))
    off()
    await store.update({ theme: 'light' })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('keeps the last of many quick writes', async () => {
    const path = join(dir, 's.json')
    const store = new SettingsStore(path)
    await store.load()
    await Promise.all([1, 2, 3, 4, 5, 6].map((n) => store.update({ maxConcurrent: n })))
    expect((await new SettingsStore(path).load()).maxConcurrent).toBe(6)
  })
})
