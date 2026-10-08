// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { I18nProvider, useI18n } from './i18n'

function Probe(): React.JSX.Element {
  const { t, bytes } = useI18n()
  return (
    <p>
      {t('nav.settings')} · {bytes(1_500_000)}
    </p>
  )
}

describe('I18nProvider', () => {
  it('translates and formats for the chosen locale', () => {
    render(
      <I18nProvider locale="pl">
        <Probe />
      </I18nProvider>
    )
    expect(screen.getByText('Ustawienia · 1,5 MB')).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('pl')
  })

  it('switches language when the locale changes', () => {
    const { rerender } = render(
      <I18nProvider locale="en">
        <Probe />
      </I18nProvider>
    )
    expect(screen.getByText(/^Settings/)).toBeInTheDocument()
    rerender(
      <I18nProvider locale="ja">
        <Probe />
      </I18nProvider>
    )
    expect(screen.getByText(/^設定/)).toBeInTheDocument()
  })
})
