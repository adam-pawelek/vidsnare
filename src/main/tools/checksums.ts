/** Parses `sha256sum`-style files: "<hex>  <name>" or "<hex> *<name>" per line. */
export function parseChecksumFile(text: string): Map<string, string> {
  const sums = new Map<string, string>()
  for (const line of text.split(/\r?\n/)) {
    const m = line.trim().match(/^([0-9a-fA-F]{64})\s+\*?(.+)$/)
    if (m) sums.set(m[2]!.trim(), m[1]!.toLowerCase())
  }
  return sums
}

/** GitHub's asset digest looks like `sha256:<hex>`. */
export function parseDigest(digest: string | null | undefined): string | null {
  const m = digest?.match(/^sha256:([0-9a-fA-F]{64})$/)
  return m ? m[1]!.toLowerCase() : null
}
