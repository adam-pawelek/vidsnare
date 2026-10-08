import { useId } from 'react'
import { LOCALES, SUPPORTED_LOCALES } from '@shared/i18n'
import type { Settings } from '@shared/settings'
import { useI18n } from '../i18n-context'

interface Props {
  value: Settings['language']
  onChange: (language: Settings['language']) => void
}

/** Language switcher for the sidebar; each language is listed in its own name. */
export function LanguagePicker({ value, onChange }: Props): React.JSX.Element {
  const { t, locale } = useI18n()
  const id = useId()
  return (
    <div className="language-picker">
      <label htmlFor={id} className="language-label">
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        {t('nav.changeLanguage')}
        {/* An English hint helps anyone who switched to a language they can't read. */}
        {locale !== 'en' && <span lang="en"> (Language)</span>}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as Settings['language'])}>
        <option value="system">{t('settings.systemLanguage')}</option>
        {SUPPORTED_LOCALES.map((l) => (
          <option key={l} value={l} lang={l}>
            {LOCALES[l].name}
          </option>
        ))}
      </select>
    </div>
  )
}
