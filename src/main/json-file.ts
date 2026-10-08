import { randomBytes } from 'node:crypto'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

/**
 * A JSON file that is replaced atomically, so a crash mid-write never leaves
 * a half-written file. Writes are serialized; the last one wins.
 */
export class JsonFile<T> {
  private chain: Promise<void> = Promise.resolve()

  constructor(private readonly path: string) {}

  async read(): Promise<unknown> {
    try {
      return JSON.parse(await readFile(this.path, 'utf8')) as unknown
    } catch {
      return undefined
    }
  }

  write(value: T): Promise<void> {
    const data = JSON.stringify(value, null, 2)
    const next = this.chain.then(async () => {
      await mkdir(dirname(this.path), { recursive: true })
      const tmp = `${this.path}.${randomBytes(4).toString('hex')}.tmp`
      try {
        await writeFile(tmp, data)
        await rename(tmp, this.path)
      } catch (error) {
        await rm(tmp, { force: true })
        throw error
      }
    })
    // Keep the chain alive after a failed write.
    this.chain = next.catch(() => {})
    return next
  }
}
