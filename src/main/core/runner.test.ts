import { describe, expect, it } from 'vitest'
import { spawnRunner } from './runner'

// Use Node itself as the child program so the tests run on every OS.
const node = process.execPath

function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

describe('spawnRunner', () => {
  it('collects output and exit code', async () => {
    const result = await spawnRunner(node, ['-e', 'console.log("out"); console.error("err"); process.exit(3)'])
    expect(result).toMatchObject({ code: 3, cancelled: false, timedOut: false })
    expect(result.stdout.trim()).toBe('out')
    expect(result.stderr.trim()).toBe('err')
  })

  it('reports lines from both streams as they arrive', async () => {
    const lines: string[] = []
    await spawnRunner(node, ['-e', 'process.stdout.write("a\\nb"); process.stderr.write("c\\n")'], {
      onLine: (line, stream) => lines.push(`${stream}:${line}`)
    })
    expect(lines.sort()).toEqual(['stderr:c', 'stdout:a', 'stdout:b'])
  })

  it('passes arguments verbatim, without a shell', async () => {
    const tricky = 'a b; echo pwned & "q" $(x) %PATH%'
    const result = await spawnRunner(node, ['-e', 'console.log(process.argv[1])', tricky])
    expect(result.stdout.trim()).toBe(tricky)
  })

  it('decodes UTF-8 output', async () => {
    const result = await spawnRunner(node, ['-e', 'console.log("Zażółć 日本語 🎵")'])
    expect(result.stdout.trim()).toBe('Zażółć 日本語 🎵')
  })

  it('keeps only the tail of very long output', async () => {
    const result = await spawnRunner(node, ['-e', 'console.log("x".repeat(5000) + "END")'], { maxBuffer: 100 })
    expect(result.stdout.length).toBeLessThanOrEqual(100)
    expect(result.stdout.trim().endsWith('END')).toBe(true)
  })

  it('cancels the process and its children', async () => {
    const controller = new AbortController()
    let grandchild = 0
    const script = `
      const { spawn } = require('node:child_process');
      const c = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });
      console.log('child ' + c.pid);
      setInterval(() => {}, 1000);
    `
    const run = spawnRunner(node, ['-e', script], {
      signal: controller.signal,
      onLine: (line) => {
        const m = line.match(/^child (\d+)/)
        if (m) {
          grandchild = Number(m[1])
          controller.abort()
        }
      }
    })
    const result = await run
    expect(result.cancelled).toBe(true)
    expect(grandchild).toBeGreaterThan(0)
    // Give the OS a moment to reap it.
    for (let i = 0; i < 20 && isAlive(grandchild); i++) await new Promise((r) => setTimeout(r, 100))
    expect(isAlive(grandchild)).toBe(false)
  })

  it('does not start when already cancelled', async () => {
    const controller = new AbortController()
    controller.abort()
    expect((await spawnRunner(node, ['-e', ''], { signal: controller.signal })).cancelled).toBe(true)
  })

  it('stops a process that runs too long', async () => {
    const result = await spawnRunner(node, ['-e', 'setInterval(() => {}, 1000)'], { timeoutMs: 300 })
    expect(result.timedOut).toBe(true)
  })

  it('rejects when the program does not exist', async () => {
    await expect(spawnRunner('/definitely/not/here', [])).rejects.toMatchObject({ code: 'ENOENT' })
  })
})
