/**
 * Where VidSnare's own releases are published. Keep in sync with `publish` in
 * electron-builder.yml. While the owner is the placeholder, app self-update is
 * switched off (engine updates are unaffected: they come from yt-dlp and Deno).
 */
export const RELEASE_REPO = { owner: 'OWNER', repo: 'vidsnare' } as const

export const REPO_URL = `https://github.com/${RELEASE_REPO.owner}/${RELEASE_REPO.repo}`
export const RELEASES_URL = `${REPO_URL}/releases/latest`

export function isReleaseRepoConfigured(owner: string = RELEASE_REPO.owner): boolean {
  return owner !== 'OWNER' && owner.trim() !== ''
}
