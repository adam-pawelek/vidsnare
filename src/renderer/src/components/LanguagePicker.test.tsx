// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SUPPORTED_LOCALES } from '@shared/i18n'
import { renderWithI18n } from '../test-utils'
import { fold, LanguagePicker } from './LanguagePicker'

function open(value = 'system' as Parameters<typeof LanguagePicker>[0]['value'], locale: 'en' | 'pl' = 'en') {
  const onChange = vi.fn()
  renderWithI18n(<LanguagePicker value={value} onChange={onChange} />, locale)
  fireEvent.click(screen.getByRole('button', { name: /Change language|Zmień język/ }))
  const search = screen.getByRole('combobox')
  const type = (text: string): void => {
    fireEvent.change(search, { target: { value: text } })
  }
  const names = (): string[] => screen.queryAllByRole('option').map((o) => o.querySelector('span')!.textContent!)
  return { onChange, search, type, names }
}

describe('LanguagePicker', () => {
  it('lists every language in its own name, plus the system default', () => {
    const { names } = open()
    expect(names()).toHaveLength(SUPPORTED_LOCALES.length + 1)
    expect(names()).toEqual(expect.arrayContaining(['System default', 'Deutsch', '日本語', 'العربية', 'Українська']))
  })

  it('shows each name in the current language too', () => {
    open()
    const german = screen.getByRole('option', { name: /Deutsch/ })
    expect(german).toHaveTextContent('German')
  })

  it.each([
    ['ital', 'Italiano'],
    ['Italiano', 'Italiano'],
    ['zh-tw', '繁體中文'],
    ['turkce', 'Türkçe'],
    ['ukrain', 'Українська'],
    ['hebrew', 'עברית'],
    ['portug', 'Português (Brasil)']
  ])('finds %s', (query, expected) => {
    const { type, names } = open()
    type(query)
    expect(names()).toContain(expected)
  })

  it('searches names in the current UI language', () => {
    const { type, names } = open('system', 'pl')
    type('niemiecki')
    expect(names()).toEqual(['Deutsch'])
  })

  it('says when nothing matches', () => {
    const { type, names } = open()
    type('klingon')
    expect(names()).toEqual([])
    expect(screen.getByText('Nothing matches your search.')).toBeInTheDocument()
  })

  it('picks with the mouse', () => {
    const { type, onChange } = open()
    type('svenska')
    fireEvent.click(screen.getByRole('option', { name: /Svenska/ }))
    expect(onChange).toHaveBeenCalledWith('sv')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('picks with the keyboard', () => {
    const { search, type, onChange } = open()
    type('a')
    fireEvent.keyDown(search, { key: 'ArrowDown' })
    fireEvent.keyDown(search, { key: 'ArrowUp' })
    fireEvent.keyDown(search, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('starts on the current language', () => {
    open('fr')
    const highlighted = document.querySelector('.language-option.active')
    expect(highlighted).toHaveTextContent('Français')
    expect(screen.getByRole('option', { name: /Français/ })).toHaveAttribute('aria-selected', 'true')
  })

  it('closes with Escape and returns focus to the button', () => {
    const { search, onChange } = open()
    fireEvent.keyDown(search, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(screen.getByRole('button', { name: /Change language/ })).toHaveFocus()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('closes when clicking elsewhere', () => {
    open()
    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})

describe('fold', () => {
  it('ignores case and accents', () => {
    expect(fold('Français Čeština')).toBe('francais cestina')
  })
})
