import type { ContextMenuParams, MenuItemConstructorOptions } from 'electron'
import type { Translate } from '@shared/i18n'

type Params = Pick<ContextMenuParams, 'isEditable' | 'selectionText' | 'editFlags'>

/**
 * The right-click menu: editing commands in text fields, Copy on selected
 * text elsewhere, nothing otherwise. Roles let Chromium do the actual work,
 * so pasting fires the page's normal paste event.
 */
export function contextMenuTemplate(params: Params, t: Translate): MenuItemConstructorOptions[] {
  const flags = params.editFlags
  if (params.isEditable) {
    return [
      { role: 'cut', label: t('contextMenu.cut'), enabled: flags.canCut },
      { role: 'copy', label: t('contextMenu.copy'), enabled: flags.canCopy },
      { role: 'paste', label: t('contextMenu.paste'), enabled: flags.canPaste },
      { type: 'separator' },
      { role: 'selectAll', label: t('contextMenu.selectAll'), enabled: flags.canSelectAll }
    ]
  }
  if (params.selectionText.trim()) {
    return [{ role: 'copy', label: t('contextMenu.copy') }]
  }
  return []
}
