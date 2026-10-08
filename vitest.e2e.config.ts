import { defineConfig } from 'vitest/config'

/** End-to-end tests drive the built app (`npm run build` first; `npm run test:e2e` does both). */
export default defineConfig({
  test: {
    include: ['tests/e2e/**/*.e2e.ts'],
    testTimeout: 60_000,
    hookTimeout: 60_000,
    fileParallelism: false
  }
})
