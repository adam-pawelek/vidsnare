import { useState } from 'react'
import { parseYouTubeUrl } from '@shared/youtube-url'
import { useI18n } from '../i18n'

export function UrlInput({ onSubmit, busy }: { onSubmit: (url: string) => void; busy: boolean }): React.JSX.Element {
  const { t } = useI18n()
  const [value, setValue] = useState('')

  const submit = (url: string): void => {
    const trimmed = url.trim()
    if (trimmed) onSubmit(trimmed)
  }

  const paste = async (): Promise<void> => {
    const text = await window.vidsnare.invoke('app:read-clipboard')
    setValue(text)
    submit(text)
  }

  return (
    <form
      className="url-input"
      aria-busy={busy}
      onSubmit={(e) => {
        e.preventDefault()
        submit(value)
      }}
    >
      <input
        type="text"
        inputMode="url"
        spellCheck={false}
        autoFocus
        aria-label={t('input.placeholder')}
        placeholder={t('input.placeholder')}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onPaste={(e) => {
          // Pasting a link loads it straight away.
          const text = e.clipboardData.getData('text')
          if (parseYouTubeUrl(text)) {
            e.preventDefault()
            setValue(text.trim())
            submit(text)
          }
        }}
      />
      <button type="button" className="btn" onClick={() => void paste()}>
        {t('input.paste')}
      </button>
      <button type="submit" className="btn btn-primary" disabled={!value.trim()}>
        {t('input.load')}
      </button>
    </form>
  )
}
