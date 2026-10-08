import { describe, expect, it } from 'vitest'
import {
  escapeOutputTemplate,
  filenameBudget,
  renderFilename,
  sanitizeFilename,
  truncateUtf8,
  utf8Length
} from './filename'

describe('sanitizeFilename', () => {
  it('keeps ordinary titles unchanged', () => {
    expect(sanitizeFilename('My holiday video 2024')).toBe('My holiday video 2024')
  })

  it('replaces characters Windows forbids with readable look-alikes', () => {
    expect(sanitizeFilename('Q&A: part 1/2 <live> "final" | what? *yes* back\\slash')).toBe(
      'Q&A： part 1／2 ＜live＞ ＂final＂ ｜ what？ ＊yes＊ back＼slash'
    )
  })

  it('never produces path separators', () => {
    const name = sanitizeFilename('../../etc/passwd')
    expect(name).not.toMatch(/[/\\]/)
    expect(name.startsWith('.')).toBe(false)
  })

  it('removes control characters and collapses whitespace', () => {
    expect(sanitizeFilename('line one\nline\ttwo\u0000  end')).toBe('line one line two end')
  })

  it('removes bidirectional override characters', () => {
    expect(sanitizeFilename('harmless\u202Egpj.exe')).toBe('harmlessgpj.exe')
  })

  it('strips trailing dots and spaces, and leading dots', () => {
    expect(sanitizeFilename('  ...hidden title...  ')).toBe('hidden title')
  })

  it.each(['CON', 'con', 'Nul', 'COM1', 'lpt9', 'AUX.mp4', 'prn.tar.gz'])('escapes reserved name %s', (name) => {
    expect(sanitizeFilename(name)).toBe(`_${name}`)
  })

  it('does not touch names that merely contain a reserved word', () => {
    expect(sanitizeFilename('Console wars')).toBe('Console wars')
  })

  it('falls back when nothing is left', () => {
    expect(sanitizeFilename('...')).toBe('untitled')
    expect(sanitizeFilename('', { fallback: 'abc' })).toBe('abc')
  })

  it('normalizes to NFC so the same title gives the same bytes', () => {
    const decomposed = 'Cafe\u0301'
    expect(sanitizeFilename(decomposed)).toBe('Caf\u00e9')
  })

  it('drops lone surrogates', () => {
    expect(sanitizeFilename('bad\uD800name')).toBe('badname')
  })

  it('keeps emoji and non-Latin scripts', () => {
    expect(sanitizeFilename('日本語のタイトル 🎵 Привет')).toBe('日本語のタイトル 🎵 Привет')
  })

  it('limits length in UTF-8 bytes', () => {
    const name = sanitizeFilename('ą'.repeat(500), { maxBytes: 100 })
    expect(utf8Length(name)).toBeLessThanOrEqual(100)
    expect(name).toBe('ą'.repeat(50))
  })
})

describe('truncateUtf8', () => {
  it('never splits a multi-code-point emoji', () => {
    const family = '👨‍👩‍👧‍👦'
    expect(truncateUtf8(`ab${family}`, 10)).toBe('ab')
    expect(truncateUtf8(`ab${family}`, 100)).toBe(`ab${family}`)
  })
})

describe('renderFilename', () => {
  const fields = { title: 'Never: Gonna/Give', id: 'dQw4w9WgXcQ', channel: 'Some Channel', uploadDate: '20091025' }

  it('renders the default template', () => {
    expect(renderFilename('{title} [{id}]', fields)).toBe('Never： Gonna／Give [dQw4w9WgXcQ]')
  })

  it('supports channel, date and playlist index', () => {
    expect(
      renderFilename('{index} - {channel} - {date} - {title}', { ...fields, playlistIndex: 7, playlistCount: 120 })
    ).toBe('007 - Some Channel - 2009-10-25 - Never： Gonna／Give')
  })

  it('cleans up separators left by empty fields', () => {
    expect(renderFilename('{index} - {title}', fields)).toBe('Never： Gonna／Give')
    expect(renderFilename('{title} [{channel}]', { title: 'x', id: 'abcdefghijk' })).toBe('x')
  })

  it('shortens only the title so the ID survives', () => {
    const name = renderFilename('{title} [{id}]', { ...fields, title: 'word '.repeat(100) }, 80)
    expect(utf8Length(name)).toBeLessThanOrEqual(80)
    expect(name.endsWith('[dQw4w9WgXcQ]')).toBe(true)
  })

  it('uses the ID when the title is empty', () => {
    expect(renderFilename('{title}', { title: '???'.replace(/\?/g, ''), id: 'dQw4w9WgXcQ' })).toBe('dQw4w9WgXcQ')
  })

  it('leaves unknown tokens literally', () => {
    expect(renderFilename('{title} {nope}', { title: 'a', id: 'abcdefghijk' })).toBe('a {nope}')
  })
})

describe('filenameBudget', () => {
  it('uses the default on Linux', () => {
    expect(filenameBudget('/home/user/Downloads', 'linux')).toBe(150)
  })

  it('shrinks for deep Windows folders', () => {
    const deep = 'C:\\Users\\someone\\' + 'nested\\'.repeat(20)
    const budget = filenameBudget(deep, 'win32')
    expect(budget).toBeLessThan(150)
    expect(deep.length + 1 + budget + 24).toBeLessThanOrEqual(260)
  })

  it('never goes below a usable minimum', () => {
    expect(filenameBudget('C:\\' + 'x'.repeat(300), 'win32')).toBe(40)
  })
})

describe('escapeOutputTemplate', () => {
  it('doubles percent signs', () => {
    expect(escapeOutputTemplate('100% real %(title)s')).toBe('100%% real %%(title)s')
  })
})
