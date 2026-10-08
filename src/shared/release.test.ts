import { describe, expect, it } from 'vitest'
import { isReleaseRepoConfigured } from './release'

describe('isReleaseRepoConfigured', () => {
  it('treats the placeholder owner as not configured', () => {
    expect(isReleaseRepoConfigured('OWNER')).toBe(false)
    expect(isReleaseRepoConfigured('')).toBe(false)
    expect(isReleaseRepoConfigured('someone')).toBe(true)
  })
})
