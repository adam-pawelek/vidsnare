import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default tseslint.config(
  { ignores: ['out/**', 'dist/**', 'release/**', 'node_modules/**', 'resources/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Small CommonJS helpers for website screenshots (Electron main/preload scripts).
    files: ['scripts/screenshots/*.cjs'],
    rules: { '@typescript-eslint/no-require-imports': 'off' }
  },
  {
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  }
)
