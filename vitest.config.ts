import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
      '@renderer': resolve(__dirname, 'src/renderer/src')
    }
  },
  test: {
    globals: true,
    include: ['src/**/*.test.{ts,tsx}', 'tests/*.test.ts'],
    environment: 'node',
    setupFiles: ['./vitest.setup.ts']
  }
})
