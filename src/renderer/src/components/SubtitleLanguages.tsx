import { useMemo } from 'react'
import { useI18n } from '../i18n-context'

/** Languages YouTube commonly has subtitles for; any code can still be typed in Settings. */
export const COMMON_SUBTITLE_LANGUAGES = [
  'en', 'pl', 'de', 'es', 'pt', 'pt-BR', 'ru', 'ja', 'fr', 'it', 'nl', 'uk', 'cs', 'sk',
  'tr', 'sv', 'no', 'da', 'fi', 'hu', 'ro', 'el', 'ar', 'he', 'hi', 'ko', 'zh-Hans', 'zh-Hant', 'id', 'vi', 'th'
]

export function SubtitleLanguages({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }): React.JSX.Element {
  const { t, locale } = useI18n()
  const names = useMemo(() => new Intl.DisplayNames([locale], { type: 'language' }), [locale])
  const name = (code: string): string => {
    try {
      return names.of(code) ?? code
    } catch {
      return code
    }
  }
  const available = COMMON_SUBTITLE_LANGUAGES.filter((c) => !value.includes(c)).sort((a, b) =>
    name(a).localeCompare(name(b), locale)
  )

  return (
    <div className="languages">
      <span className="field-label">{t('options.subtitleLanguages')}</span>
      <ul className="chips">
        {value.map((code) => (
          <li key={code} className="chip">
            {name(code)}
            <button
              type="button"
              aria-label={`${t('common.remove')} ${name(code)}`}
              onClick={() => onChange(value.filter((c) => c !== code))}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <select
        aria-label={t('options.subtitleLanguages')}
        value=""
        onChange={(e) => e.target.value && onChange([...value, e.target.value])}
      >
        <option value="">+</option>
        {available.map((code) => (
          <option key={code} value={code}>
            {name(code)}
          </option>
        ))}
      </select>
    </div>
  )
}
