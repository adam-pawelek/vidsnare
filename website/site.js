import { LANGUAGE_NAMES, RTL, STRINGS } from './strings.js'

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
    // Traditional Chinese only for Traditional-script regions, not Simplified Chinese.
    if (/^zh\b/i.test(String(tag))) {
      if (/^zh[-_](hant|tw|hk|mo)\b/i.test(String(tag))) return 'zh-TW'
      continue
    }
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
  document.documentElement.dir = RTL.includes(lang) ? 'rtl' : 'ltr'
  document.title = s.title
  const current = document.getElementById('lang-current')
  if (current) {
    current.textContent = LANGUAGE_NAMES[lang]
    current.lang = lang
    document.getElementById('lang-button').setAttribute('aria-label', `${s.language}: ${LANGUAGE_NAMES[lang]}`)
    const search = document.getElementById('lang-search')
    search.placeholder = `${s.language}…`
    search.setAttribute('aria-label', s.language)
    document.getElementById('lang-list').setAttribute('aria-label', s.language)
  }
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

/** Lower-case and strip accents, so "turkce" finds "Türkçe". */
export function fold(text) {
  return String(text).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase()
}

function displayName(names, code) {
  try {
    return names.of(code) || ''
  } catch {
    return ''
  }
}

/**
 * The language list for the page's current language: each entry has its own
 * name, its name in the current language (when different), and search text.
 */
export function languageChoices(uiLang) {
  const local = new Intl.DisplayNames([uiLang], { type: 'language' })
  const english = new Intl.DisplayNames(['en'], { type: 'language' })
  return LANGUAGES.map((code) => {
    const label = LANGUAGE_NAMES[code]
    const inUi = displayName(local, code)
    return {
      code,
      label,
      hint: fold(inUi) === fold(label) ? '' : inUi,
      haystack: fold([label, inUi, displayName(english, code), code].join(' '))
    }
  })
}

/** Choices matching every word of the query. */
export function filterChoices(choices, query) {
  const terms = fold(query.trim()).split(/\s+/).filter(Boolean)
  return terms.length ? choices.filter((c) => terms.every((t) => c.haystack.includes(t))) : choices
}

/** The searchable language menu in the header. */
function setUpPicker(getLang, setLang) {
  const root = document.getElementById('lang-picker')
  const button = document.getElementById('lang-button')
  const popover = document.getElementById('lang-popover')
  const search = document.getElementById('lang-search')
  const list = document.getElementById('lang-list')
  let shown = []
  let active = 0

  const draw = () => {
    list.replaceChildren(
      ...shown.map((choice, i) => {
        const li = document.createElement('li')
        li.id = `lang-option-${i}`
        li.setAttribute('role', 'option')
        li.setAttribute('aria-selected', String(choice.code === getLang()))
        li.className = `lang-option${i === active ? ' active' : ''}`
        const name = document.createElement('span')
        name.lang = choice.code
        name.textContent = choice.label
        li.append(name)
        if (choice.hint) {
          const hint = document.createElement('span')
          hint.className = 'muted'
          hint.textContent = choice.hint
          li.append(hint)
        }
        li.addEventListener('mousedown', (e) => e.preventDefault())
        li.addEventListener('mouseenter', () => {
          active = i
          highlight()
        })
        li.addEventListener('click', () => choose(choice.code))
        return li
      })
    )
    highlight()
  }

  const highlight = () => {
    for (const [i, li] of [...list.children].entries()) li.classList.toggle('active', i === active)
    const current = document.getElementById(`lang-option-${active}`)
    if (current) {
      search.setAttribute('aria-activedescendant', current.id)
      current.scrollIntoView?.({ block: 'nearest' })
    } else {
      search.removeAttribute('aria-activedescendant')
    }
  }

  const refresh = () => {
    shown = filterChoices(languageChoices(getLang()), search.value)
    draw()
  }

  const open = () => {
    popover.hidden = false
    button.setAttribute('aria-expanded', 'true')
    search.value = ''
    shown = languageChoices(getLang())
    active = Math.max(0, shown.findIndex((c) => c.code === getLang()))
    draw()
    search.focus()
  }

  const close = (focusButton) => {
    popover.hidden = true
    button.setAttribute('aria-expanded', 'false')
    if (focusButton) button.focus()
  }

  const choose = (code) => {
    setLang(code)
    close(true)
  }

  button.addEventListener('click', () => (popover.hidden ? open() : close(false)))
  search.addEventListener('input', () => {
    active = 0
    refresh()
  })
  search.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      active = Math.min(shown.length - 1, active + 1)
      highlight()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      active = Math.max(0, active - 1)
      highlight()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (shown[active]) choose(shown[active].code)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close(true)
    } else if (e.key === 'Tab') {
      close(false)
    }
  })
  document.addEventListener('mousedown', (e) => {
    if (!popover.hidden && !root.contains(e.target)) close(false)
  })
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
  let release = null

  setUpPicker(
    () => lang,
    (code) => {
      lang = code
      try {
        localStorage.setItem('vidsnare-lang', lang)
      } catch {
        // Private windows may block storage; the choice just won't be remembered.
      }
      render(lang, release)
    }
  )

  render(lang, release)
  for (const link of document.querySelectorAll('a[data-file]')) {
    link.addEventListener('click', (e) => {
      if (link.getAttribute('aria-disabled') === 'true') e.preventDefault()
    })
  }
  release = await latestVersion()
  render(lang, release)
}

if (typeof document !== 'undefined' && document.getElementById('primary-download')) start()
