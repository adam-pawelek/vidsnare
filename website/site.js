import { LANGUAGE_NAMES, STRINGS } from './strings.js'

const REPO = 'adam-pawelek/vidsnare'
const DOWNLOAD = `https://github.com/${REPO}/releases/latest/download`

/** Stable file names (see electron-builder.yml), so these links always fetch the newest release. */
export const FILES = {
  windows: { name: 'VidSnare-Setup.exe', label: 'fileWindows' },
  appimage: { name: 'VidSnare-x86_64.AppImage', label: 'fileAppImage' },
  deb: { name: 'VidSnare_amd64.deb', label: 'fileDeb' }
}

export const LANGUAGES = Object.keys(STRINGS)

/** Best supported language for the browser's preferences. */
export function pickLanguage(preferred) {
  for (const tag of preferred) {
    const exact = LANGUAGES.find((l) => l.toLowerCase() === String(tag).toLowerCase())
    if (exact) return exact
    const base = String(tag).split(/[-_]/)[0].toLowerCase()
    const byBase = LANGUAGES.find((l) => l.split('-')[0] === base)
    if (byBase) return byBase
  }
  return 'en'
}

/** 'windows', 'linux' or 'other' (macOS, phones…). */
export function detectOs(userAgent, platform = '') {
  const text = `${platform} ${userAgent}`
  if (/android|iphone|ipad/i.test(text)) return 'other'
  if (/windows|win32|win64/i.test(text)) return 'windows'
  if (/linux|x11|ubuntu|fedora/i.test(text)) return 'linux'
  return 'other'
}

export function format(template, vars = {}) {
  return template.replace(/\{(\w+)\}/g, (whole, key) => (key in vars ? vars[key] : whole))
}

function render(lang, release) {
  const s = STRINGS[lang]
  document.documentElement.lang = lang
  document.title = s.title
  for (const el of document.querySelectorAll('[data-t]')) el.textContent = s[el.dataset.t]
  for (const el of document.querySelectorAll('[data-t-alt]')) el.alt = s[el.dataset.tAlt]

  const os = detectOs(navigator.userAgent, navigator.userAgentData?.platform)
  const primary = document.getElementById('primary-download')
  const note = document.getElementById('release-note')
  const main = os === 'linux' ? 'appimage' : 'windows'
  primary.textContent = format(s.downloadFor, { os: main === 'windows' ? 'Windows' : 'Linux' })

  const available = release !== null
  for (const link of document.querySelectorAll('a[data-file]')) {
    const file = FILES[link.dataset.file]
    link.href = available ? `${DOWNLOAD}/${file.name}` : '#'
    link.setAttribute('aria-disabled', String(!available))
    if (link !== primary) link.textContent = s[file.label]
  }
  primary.dataset.file = main
  primary.href = available ? `${DOWNLOAD}/${FILES[main].name}` : '#'

  note.textContent = available
    ? [format(s.version, { version: release }), os === 'other' ? s.onlyWinLinux : ''].filter(Boolean).join(' · ')
    : s.comingSoon
}

async function latestVersion() {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' }
    })
    if (!res.ok) return null
    const data = await res.json()
    return String(data.tag_name || '').replace(/^v/, '') || null
  } catch {
    return null
  }
}

export async function start() {
  const saved = (() => {
    try {
      return localStorage.getItem('vidsnare-lang')
    } catch {
      return null
    }
  })()
  let lang = saved && STRINGS[saved] ? saved : pickLanguage(navigator.languages || [navigator.language])

  const picker = document.getElementById('language')
  for (const [code, name] of Object.entries(LANGUAGE_NAMES)) picker.add(new Option(name, code))
  picker.value = lang

  let release = null
  render(lang, release)
  picker.addEventListener('change', () => {
    lang = picker.value
    try {
      localStorage.setItem('vidsnare-lang', lang)
    } catch {
      // Private windows may block storage; the choice just won't be remembered.
    }
    render(lang, release)
  })
  for (const link of document.querySelectorAll('a[data-file]')) {
    link.addEventListener('click', (e) => {
      if (link.getAttribute('aria-disabled') === 'true') e.preventDefault()
    })
  }
  release = await latestVersion()
  render(lang, release)
}

if (typeof document !== 'undefined' && document.getElementById('primary-download')) start()
