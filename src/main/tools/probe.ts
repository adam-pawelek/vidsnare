import { execFile } from 'node:child_process'
import type { Probe } from './tool-manager'

/** Runs a tool briefly (e.g. `--version`); null if it fails or hangs. */
export const execProbe: Probe = (path, args) =>
  new Promise((resolve) => {
    execFile(
      path,
      args,
      { timeout: 30_000, windowsHide: true, encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } },
      (error, stdout) => resolve(error ? null : stdout)
    )
  })
