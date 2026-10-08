import { parseChecksumFile, parseDigest } from './checksums'
import type { Http } from './http'
import { checksumAsset, releaseAsset, REPOS, type Target, type UpdatableTool } from './platform'
import { normalizeTag } from './versions'

interface GitHubAsset {
  name: string
  browser_download_url: string
  digest?: string | null
}

interface GitHubRelease {
  tag_name: string
  draft: boolean
  prerelease: boolean
  assets: GitHubAsset[]
}

export interface ReleaseInfo {
  version: string
  asset: string
  url: string
  sha256: string
}

/**
 * Finds the newest stable release of `tool` for `target` and its expected
 * SHA-256. Refuses to return anything it can't verify.
 */
export async function latestRelease(http: Http, tool: UpdatableTool, target: Target): Promise<ReleaseInfo> {
  const assetName = releaseAsset(tool, target)
  if (!assetName) throw new Error(`No ${tool} build for ${target.platform}-${target.arch}`)

  const release = await http.json<GitHubRelease>(`https://api.github.com/repos/${REPOS[tool]}/releases/latest`)
  if (release.draft || release.prerelease) throw new Error(`Latest ${tool} release is not stable`)
  const asset = release.assets.find((a) => a.name === assetName)
  if (!asset) throw new Error(`${tool} ${release.tag_name} has no ${assetName}`)

  let sha256 = parseDigest(asset.digest)
  if (!sha256) {
    const sumsName = checksumAsset(tool, assetName)
    const sums = release.assets.find((a) => a.name === sumsName)
    if (!sums) throw new Error(`${tool} ${release.tag_name} has no checksum for ${assetName}`)
    sha256 = parseChecksumFile(await http.text(sums.browser_download_url)).get(assetName) ?? null
  }
  if (!sha256) throw new Error(`${tool} ${release.tag_name}: checksum for ${assetName} not found`)

  return { version: normalizeTag(release.tag_name), asset: assetName, url: asset.browser_download_url, sha256 }
}
