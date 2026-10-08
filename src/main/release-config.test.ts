import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { RELEASE_REPO } from '@shared/release'

describe('release configuration', () => {
  const yml = readFileSync(join(__dirname, '../../electron-builder.yml'), 'utf8')

  it('publishes to the repository the app checks for updates', () => {
    expect(yml).toMatch(new RegExp(`owner: ${RELEASE_REPO.owner}\\b`))
    expect(yml).toMatch(new RegExp(`repo: ${RELEASE_REPO.repo}\\b`))
  })

  it('gives the Windows installer, uninstaller and app the multi-size icon', () => {
    expect(yml).toContain('icon: build/icon.ico')
    expect(yml).toContain('installerIcon: build/icon.ico')
    expect(yml).toContain('uninstallerIcon: build/icon.ico')
    const ico = readFileSync(join(__dirname, '../../build/icon.ico'))
    // ICO header: reserved 0, type 1 (icon), then the number of images.
    expect(ico.readUInt16LE(0)).toBe(0)
    expect(ico.readUInt16LE(2)).toBe(1)
    const sizes = Array.from({ length: ico.readUInt16LE(4) }, (_, i) => ico[6 + i * 16] || 256)
    expect(sizes).toEqual(expect.arrayContaining([16, 32, 48, 256]))
  })

  it('ships the bundled tools and the third-party notice', () => {
    expect(yml).toContain('from: resources/bin/${platform}-${arch}')
    expect(yml).toContain('from: docs/THIRD_PARTY.md')
  })
})
