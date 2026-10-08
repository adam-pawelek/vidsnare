import { execFile } from 'node:child_process'
import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * Linux desktop integration, done once at startup:
 *
 * - The AppImage gets an applications-menu entry with the VidSnare icon (the
 *   .deb installs its own), so searching "VidSnare" shows it with its icon.
 * - Downloaded VidSnare installers (and the running AppImage) get the
 *   VidSnare icon as their file icon in GNOME-based file managers.
 *
 * A file's icon can't be set before it has been opened once, so this is the
 * earliest possible moment. Everything here is best effort and silent.
 */

export interface LinuxIntegrationDeps {
  home: string
  downloadsDir: string
  /** Folder with the shipped icon.png (the app's resources folder). */
  resourcesDir: string
  /** Path of the running AppImage, when started from one. */
  appImage?: string
  version: string
  /** Runs a command; resolves false if it fails or doesn't exist. */
  run?: (command: string, args: string[]) => Promise<boolean>
}

const INSTALLER_NAME = /^VidSnare.*\.(deb|AppImage)$/i

/**
 * The environment for system tools. An AppImage points library and data
 * paths at its own bundled files; system programs like gio break with those
 * (the AppImage's own launcher clears them the same way for zenity/kdialog).
 */
export function systemEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const appDir = env['APPDIR']
  if (!appDir) return env
  const clean = { ...env }
  delete clean['LD_LIBRARY_PATH']
  delete clean['LD_PRELOAD']
  delete clean['GSETTINGS_SCHEMA_DIR']
  for (const key of ['PATH', 'XDG_DATA_DIRS']) {
    const value = clean[key]
    if (value) clean[key] = value.split(':').filter((part) => part && !part.startsWith(appDir)).join(':')
  }
  return clean
}

const defaultRun = (command: string, args: string[]): Promise<boolean> =>
  new Promise((resolve) =>
    execFile(command, args, { timeout: 10_000, env: systemEnv(process.env) }, (error) => resolve(!error))
  )

/** Quotes a path for the Exec key of a .desktop file (Desktop Entry spec). */
export function quoteExec(path: string): string {
  return `"${path.replace(/[\\"`$]/g, (ch) => `\\${ch}`)}"`
}

export function desktopEntry(appImage: string, icon: string, version: string): string {
  return [
    '[Desktop Entry]',
    'Type=Application',
    'Name=VidSnare',
    'Comment=Download videos and audio from YouTube',
    `Exec=${quoteExec(appImage)} %U`,
    `Icon=${icon}`,
    'Terminal=false',
    'Categories=AudioVideo;Network;',
    // Lets the dock match the running window to this entry (see desktopName in package.json).
    'StartupWMClass=vidsnare',
    `X-AppImage-Version=${version}`,
    ''
  ].join('\n')
}

async function writeIfChanged(path: string, content: string): Promise<void> {
  const current = await readFile(path, 'utf8').catch(() => null)
  if (current !== content) await writeFile(path, content)
}

export async function integrateLinux(deps: LinuxIntegrationDeps): Promise<void> {
  const run = deps.run ?? defaultRun
  const dataDir = join(deps.home, '.local', 'share')

  // A stable copy of the icon: the AppImage's own files vanish when it exits.
  const icon = join(dataDir, 'vidsnare', 'icon.png')
  try {
    await mkdir(join(dataDir, 'vidsnare'), { recursive: true })
    await copyFile(join(deps.resourcesDir, 'icon.png'), icon)
  } catch {
    return // no shipped icon (development build): nothing to integrate
  }
  const iconUri = `file://${icon.split('/').map(encodeURIComponent).join('/')}`
  const setFileIcon = (path: string): Promise<boolean> => run('gio', ['set', path, 'metadata::custom-icon', iconUri])

  if (deps.appImage) {
    await mkdir(join(dataDir, 'applications'), { recursive: true })
    await writeIfChanged(join(dataDir, 'applications', 'vidsnare.desktop'), desktopEntry(deps.appImage, icon, deps.version))
    await setFileIcon(deps.appImage)
  }

  const downloads = await readdir(deps.downloadsDir).catch(() => [] as string[])
  for (const name of downloads.filter((n) => INSTALLER_NAME.test(n))) {
    await setFileIcon(join(deps.downloadsDir, name))
  }
}
