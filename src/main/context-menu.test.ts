import { describe, expect, it } from 'vitest'
import { createTranslator } from '@shared/i18n'
import { contextMenuTemplate } from './context-menu'

const flags = { canUndo: false, canRedo: false, canCut: true, canCopy: true, canPaste: true, canDelete: true, canSelectAll: true, canEditRichly: false }

describe('contextMenuTemplate', () => {
  it('offers editing commands in text fields', () => {
    const items = contextMenuTemplate({ isEditable: true, selectionText: '', editFlags: flags }, createTranslator('en'))
    expect(items.map((i) => i.label ?? i.type)).toEqual(['Cut', 'Copy', 'Paste', 'separator', 'Select all'])
    expect(items.map((i) => i.role).filter(Boolean)).toEqual(['cut', 'copy', 'paste', 'selectAll'])
  })

  it('disables commands that do not apply', () => {
    const items = contextMenuTemplate(
      { isEditable: true, selectionText: '', editFlags: { ...flags, canCut: false, canCopy: false } },
      createTranslator('en')
    )
    expect(items.find((i) => i.role === 'cut')?.enabled).toBe(false)
    expect(items.find((i) => i.role === 'paste')?.enabled).toBe(true)
  })

  it('offers Copy for selected text outside fields', () => {
    const items = contextMenuTemplate({ isEditable: false, selectionText: 'a title', editFlags: flags }, createTranslator('en'))
    expect(items).toEqual([{ role: 'copy', label: 'Copy' }])
  })

  it('shows nothing elsewhere', () => {
    expect(contextMenuTemplate({ isEditable: false, selectionText: '  ', editFlags: flags }, createTranslator('en'))).toEqual([])
  })

  it('uses the app language', () => {
    const items = contextMenuTemplate({ isEditable: true, selectionText: '', editFlags: flags }, createTranslator('pl'))
    expect(items.find((i) => i.role === 'paste')?.label).toBe('Wklej')
  })
})
