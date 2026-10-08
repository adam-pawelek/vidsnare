import { normalizeSettings, type Settings } from '@shared/settings'
import { JsonFile } from './json-file'

export class SettingsStore {
  private current: Settings = normalizeSettings(undefined)
  private readonly listeners = new Set<(settings: Settings) => void>()
  private readonly file: JsonFile<Settings>

  constructor(path: string) {
    this.file = new JsonFile(path)
  }

  async load(): Promise<Settings> {
    this.current = normalizeSettings(await this.file.read())
    return this.current
  }

  get(): Settings {
    return this.current
  }

  /** Merges a partial change, validates it, saves, and notifies listeners. */
  async update(patch: unknown): Promise<Settings> {
    const p = patch && typeof patch === 'object' ? (patch as Record<string, unknown>) : {}
    const merged = {
      ...this.current,
      ...p,
      defaults: { ...this.current.defaults, ...(typeof p['defaults'] === 'object' ? (p['defaults'] as object) : {}) }
    }
    this.current = normalizeSettings(merged, this.current)
    await this.file.write(this.current)
    for (const listener of this.listeners) listener(this.current)
    return this.current
  }

  onChange(listener: (settings: Settings) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}
