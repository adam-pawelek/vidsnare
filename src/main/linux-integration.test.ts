import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { desktopEntry, integrateLinux, quoteExec, systemEnv } from './linux-integration'

let root: string
let home: string
let downloads: string
let resources: string

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'vidsnare-linux-'))
  home = join(root, 'home')
  downloads = join(home, 'Downloads')
  resources = join(root, 'resources')
  await mkdir(downloads, { recursive: true })
  await mkdir(resources, { recursive: true })
  await writeFile(join(resources, 'icon.png'), 'PNG')
})
afterEach(async () => {
  await rm(root, { recursive: true, force: true })
})

const gioCalls = (run: ReturnType<typeof vi.fn>): string[] =>
  run.mock.calls.filter(([cmd]) => cmd === 'gio').map(([, args]) => (args as string[])[1]!)

describe('integrateLinux', () => {
  it('gives downloaded VidSnare installers the VidSnare icon', async () => {
    for (const name of ['VidSnare_amd64.deb', 'VidSnare-x86_64.AppImage', 'VidSnare_amd64 (1).deb', 'other.deb', 'notes.txt']) {
      await writeFile(join(downloads, name), '')
    }
    const run = vi.fn(async (_command: string, _args: string[]) => true)
    await integrateLinux({ home, downloadsDir: downloads, resourcesDir: resources, version: '0.1.1', run })
    expect(gioCalls(run).sort()).toEqual(
      ['VidSnare-x86_64.AppImage', 'VidSnare_amd64 (1).deb', 'VidSnare_amd64.deb'].map((n) => join(downloads, n)).sort()
    )
    const [, args] = run.mock.calls[0]!
    expect(args).toEqual(expect.arrayContaining(['metadata::custom-icon', pathToFileURL(join(home, '.local/share/vidsnare/icon.png')).href]))
  })

  it('keeps a stable copy of the icon', async () => {
    await integrateLinux({ home, downloadsDir: downloads, resourcesDir: resources, version: '0.1.1', run: async () => true })
    expect(await readFile(join(home, '.local/share/vidsnare/icon.png'), 'utf8')).toBe('PNG')
  })

  it('adds the AppImage to the applications menu and gives it the icon', async () => {
    const appImage = join(home, 'Apps', 'VidSnare-x86_64.AppImage')
    const run = vi.fn(async (_command: string, _args: string[]) => true)
    await integrateLinux({ home, downloadsDir: downloads, resourcesDir: resources, appImage, version: '0.1.1', run })
    const entry = await readFile(join(home, '.local/share/applications/vidsnare.desktop'), 'utf8')
    // quoteExec escapes backslashes, so compare through it (paths use \ on Windows test runners).
    expect(entry).toContain(`Exec=${quoteExec(appImage)} %U`)
    expect(entry).toContain(`Icon=${join(home, '.local/share/vidsnare/icon.png')}`)
    expect(gioCalls(run)).toContain(appImage)
  })

  it('does not add a menu entry for the .deb (it installs its own)', async () => {
    await integrateLinux({ home, downloadsDir: downloads, resourcesDir: resources, version: '0.1.1', run: async () => true })
    await expect(readFile(join(home, '.local/share/applications/vidsnare.desktop'), 'utf8')).rejects.toThrow()
  })

  it('does nothing in development builds without a shipped icon', async () => {
    await rm(join(resources, 'icon.png'))
    await writeFile(join(downloads, 'VidSnare_amd64.deb'), '')
    const run = vi.fn(async (_command: string, _args: string[]) => true)
    await integrateLinux({ home, downloadsDir: downloads, resourcesDir: resources, version: '0.1.1', run })
    expect(run).not.toHaveBeenCalled()
  })

  it('survives a missing Downloads folder and a missing gio', async () => {
    await rm(downloads, { recursive: true })
    await expect(
      integrateLinux({ home, downloadsDir: downloads, resourcesDir: resources, appImage: '/x/V.AppImage', version: '1', run: async () => false })
    ).resolves.toBeUndefined()
  })
})

describe('systemEnv', () => {
  it('removes the AppImage’s own library and data paths', () => {
    const env = systemEnv({
      APPDIR: '/tmp/.mount_Vid123',
      LD_LIBRARY_PATH: '/tmp/.mount_Vid123/usr/lib',
      GSETTINGS_SCHEMA_DIR: '/tmp/.mount_Vid123/usr/share/glib-2.0/schemas',
      PATH: '/tmp/.mount_Vid123:/tmp/.mount_Vid123/usr/sbin:/usr/local/bin:/usr/bin',
      XDG_DATA_DIRS: '/tmp/.mount_Vid123/usr/share/::/usr/share/gnome:/usr/share/',
      HOME: '/home/u'
    })
    expect(env['LD_LIBRARY_PATH']).toBeUndefined()
    expect(env['GSETTINGS_SCHEMA_DIR']).toBeUndefined()
    expect(env['PATH']).toBe('/usr/local/bin:/usr/bin')
    expect(env['XDG_DATA_DIRS']).toBe('/usr/share/gnome:/usr/share/')
    expect(env['HOME']).toBe('/home/u')
  })

  it('leaves the environment alone outside an AppImage', () => {
    const env = { PATH: '/usr/bin', LD_LIBRARY_PATH: '/opt/lib' }
    expect(systemEnv(env)).toBe(env)
  })
})

describe('desktop entry', () => {
  it('quotes paths with spaces and special characters', () => {
    expect(quoteExec('/home/u/My Apps/Vid"Snare$1.AppImage')).toBe('"/home/u/My Apps/Vid\\"Snare\\$1.AppImage"')
  })

  it('names the app, its icon and its window class', () => {
    const entry = desktopEntry('/a/VidSnare.AppImage', '/icon.png', '0.1.1')
    expect(entry).toMatch(/^\[Desktop Entry\]\n/)
    expect(entry).toContain('Name=VidSnare')
    expect(entry).toContain('Icon=/icon.png')
    expect(entry).toContain('StartupWMClass=vidsnare')
  })
})
