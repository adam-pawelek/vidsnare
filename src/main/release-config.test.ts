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

  it('ships the bundled tools and the third-party notice', () => {
    expect(yml).toContain('from: resources/bin/${platform}-${arch}')
    expect(yml).toContain('from: docs/THIRD_PARTY.md')
  })
})
