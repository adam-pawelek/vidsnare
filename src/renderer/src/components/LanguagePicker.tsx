import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { LOCALES, SUPPORTED_LOCALES } from '@shared/i18n'
import type { Settings } from '@shared/settings'
import { useI18n } from '../i18n-context'

interface Props {
  value: Settings['language']
  onChange: (language: Settings['language']) => void
}

interface Choice {
  value: Settings['language']
  /** The language's own name, e.g. "Deutsch". */
  label: string
  /** Its name in the current UI language, e.g. "German", when that differs. */
  hint: string
  /** Everything a search may match. */
  haystack: string
}

/** Lower-case and strip accents, so "francais" finds "Français". */
export function fold(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase()
}

function displayName(names: Intl.DisplayNames, code: string): string {
  try {
    return names.of(code) ?? ''
  } catch {
    return ''
  }
}

/**
 * Sidebar language switcher: a button that opens a searchable list. Each
 * language is shown in its own name, with its name in the current language
 * beside it; search matches either, the English name, or the code.
 */
export function LanguagePicker({ value, onChange }: Props): React.JSX.Element {
  const { t, locale } = useI18n()
  const id = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const search = useRef<HTMLInputElement>(null)

  const choices = useMemo<Choice[]>(() => {
    const local = new Intl.DisplayNames([locale], { type: 'language' })
    const english = new Intl.DisplayNames(['en'], { type: 'language' })
    const system: Choice = {
      value: 'system',
      label: t('settings.systemLanguage'),
      hint: '',
      haystack: fold(`${t('settings.systemLanguage')} system default`)
    }
    return [
      system,
      ...SUPPORTED_LOCALES.map((code) => {
        const label = LOCALES[code].name
        const inUiLanguage = displayName(local, code)
        return {
          value: code,
          label,
          hint: fold(inUiLanguage) === fold(label) ? '' : inUiLanguage,
          haystack: fold([label, inUiLanguage, displayName(english, code), code].join(' '))
        }
      })
    ]
  }, [locale, t])

  const shown = useMemo(() => {
    const terms = fold(query.trim()).split(/\s+/).filter(Boolean)
    return terms.length ? choices.filter((c) => terms.every((term) => c.haystack.includes(term))) : choices
  }, [choices, query])

  const current = choices.find((c) => c.value === value) ?? choices[0]!

  const close = (focusButton: boolean): void => {
    setOpen(false)
    setQuery('')
    if (focusButton) button.current?.focus()
  }

  const pick = (choice: Choice): void => {
    onChange(choice.value)
    close(true)
  }

  // Start on the current language; keep the highlighted row in view.
  useEffect(() => {
    if (!open) return
    setActive(Math.max(0, shown.findIndex((c) => c.value === value)))
    search.current?.focus()
    // Runs only when the list opens, so typing does not reset the highlight.
  }, [open])
  useEffect(() => {
    // Optional call: some environments (tests) have no scrollIntoView.
    document.getElementById(`${id}-option-${active}`)?.scrollIntoView?.({ block: 'nearest' })
  }, [active, id])

  // Clicking anywhere else closes the list.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent): void => {
      if (root.current && !root.current.contains(e.target as Node)) close(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const onKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(shown.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const choice = shown[active]
      if (choice) pick(choice)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close(true)
    } else if (e.key === 'Tab') {
      close(false)
    }
  }

  return (
    <div className="language-picker" ref={root}>
      <span className="language-label" id={`${id}-label`}>
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        {t('nav.changeLanguage')}
        {/* An English hint helps anyone who switched to a language they can't read. */}
        {locale !== 'en' && <span lang="en"> (Language)</span>}
      </span>
      <button
        ref={button}
        type="button"
        className="language-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-button`}
        id={`${id}-button`}
        onClick={() => (open ? close(false) : setOpen(true))}
      >
        <span lang={current.value === 'system' ? undefined : current.value}>{current.label}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="language-popover">
          <input
            ref={search}
            type="search"
            className="language-search"
            role="combobox"
            aria-expanded="true"
            aria-controls={`${id}-list`}
            aria-autocomplete="list"
            aria-activedescendant={shown[active] ? `${id}-option-${active}` : undefined}
            aria-label={t('settings.language')}
            placeholder={`${t('settings.language')}…`}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
          />
          <ul className="language-list" role="listbox" id={`${id}-list`} aria-label={t('settings.language')}>
            {shown.map((choice, i) => (
              <li
                key={choice.value}
                id={`${id}-option-${i}`}
                role="option"
                aria-selected={choice.value === value}
                className={`language-option ${i === active ? 'active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(choice)}
              >
                <span lang={choice.value === 'system' ? undefined : choice.value}>{choice.label}</span>
                {choice.hint && <span className="muted">{choice.hint}</span>}
              </li>
            ))}
            {shown.length === 0 && <li className="language-empty muted">{t('history.noResults')}</li>}
          </ul>
        </div>
      )}
    </div>
  )
}
