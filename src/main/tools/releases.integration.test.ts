/** Talks to the real GitHub API. Opt-in: VIDSNARE_NETWORK=1 npm test */
import { describe, expect, it } from 'vitest'
import { createHttp } from './http'
import { latestRelease } from './releases'

describe.runIf(process.env['VIDSNARE_NETWORK'])('latestRelease (live)', () => {
  const http = createHttp(fetch, 'VidSnare-tests')

  it.each([
    ['yt-dlp', 'linux', 'x64'],
    ['yt-dlp', 'win32', 'x64'],
    ['deno', 'linux', 'x64'],
    ['deno', 'win32', 'x64']
  ] as const)('finds a verifiable %s for %s-%s', async (tool, platform, arch) => {
    const release = await latestRelease(http, tool, { platform, arch })
    expect(release.version).toMatch(/^\d+\.\d+/)
    expect(release.sha256).toMatch(/^[0-9a-f]{64}$/)
    expect(release.url).toMatch(/^https:\/\/github\.com\//)
  })
})
