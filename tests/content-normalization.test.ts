import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizeContentRows } from '../server/utils/content-normalization.ts'
import { contentKeys, defaultSiteContent, legacyContentKeys } from '../types/content.ts'

const keys = [
  'home_title',
  'home_subtitle',
  'home_text',
  'project_title',
  'project_content',
  'products_title',
  'products_intro',
]
const validRows = (): unknown[][] => [
  ['clau', 'valor'],
  ...keys.map((key) => [key, 'Text de ' + key]),
]

test('returns the complete inventory while preserving the seven original fields', () => {
  const rows = validRows()
  rows.splice(1, 7, ...rows.slice(1).reverse())
  rows.push(['internal_note', 'Must never be public'], [], ['', ''])
  const content = normalizeContentRows(rows)
  assert.deepEqual(Object.keys(content).sort(), [...contentKeys].sort())
  for (const key of keys)
    assert.equal(content[key as keyof typeof content], 'Text de ' + key)
  assert.equal(JSON.stringify(content).includes('Must never be public'), false)
  for (const key of contentKeys.filter(key => !legacyContentKeys.some(legacy => legacy === key))) {
    assert.equal(content[key], defaultSiteContent[key])
  }
})

test('reads blank values and rejects duplicates in newly configurable fields', () => {
  const rows = [...validRows(), ['header_close_menu', 'Cerrar']]
  assert.equal(normalizeContentRows(rows).header_close_menu, 'Cerrar')
  assert.throws(() => normalizeContentRows([...rows, ['header_close_menu', 'Duplicate']]), /Duplicate/)
  assert.equal(normalizeContentRows([...validRows(), ['header_close_menu', '']]).header_close_menu, '')
})

test('trims outer whitespace while preserving accents and paragraph breaks', () => {
  const rows = validRows()
  rows[3] = [' home_text ', '  Alimentació\r\n\r\nBenestar quotidià.  ']
  assert.equal(
    normalizeContentRows(rows).home_text,
    'Alimentació\n\nBenestar quotidià.',
  )
})

test('uses defaults for missing keys and rejects duplicates and incorrect headers', () => {
  assert.equal(normalizeContentRows(validRows().slice(0, -1)).products_intro, defaultSiteContent.products_intro)
  assert.throws(
    () => normalizeContentRows([...validRows(), ['home_title', 'Duplicate']]),
    /Duplicate/,
  )
  assert.throws(
    () => normalizeContentRows([['key', 'value'], ...validRows().slice(1)]),
    /headers/,
  )
})

test('accepts values automatically converted to numbers or booleans by Sheets', () => {
  for (const value of [42, false]) {
    const rows = validRows()
    rows[1] = ['home_title', value]
    assert.equal(normalizeContentRows(rows).home_title, String(value))
  }
})

test('keeps text as text instead of interpreting HTML', () => {
  const rows = validRows()
  rows[3] = ['home_text', '<script>alert(1)</script>']
  assert.equal(
    normalizeContentRows(rows).home_text,
    '<script>alert(1)</script>',
  )
})

test('does not mutate the source cells', () => {
  const rows = validRows()
  const original = structuredClone(rows)
  normalizeContentRows(rows)
  assert.deepEqual(rows, original)
})

test('empty cells hide text while preserving other content', () => {
  for (const value of ['', '   ', null, undefined]) {
    const rows = validRows()
    rows[1] = ['home_title', value]
    rows.push(['home_benestar_amb_proximitat'])
    const content = normalizeContentRows(rows)
    assert.equal(content.home_title, '')
    assert.equal(content.home_benestar_amb_proximitat, '')
    assert.equal(content.home_text, 'Text de home_text')
  }
})

test('every editable field can be empty at once, as returned by Sheets', () => {
  const rows = [['clau', 'valor'], ...contentKeys.map(key => [key])]
  const content = normalizeContentRows(rows)
  for (const key of contentKeys) assert.equal(content[key], '')
})

test('blank rows and cleared key cells do not break remaining texts', () => {
  const rows = [...validRows(), [], ['', 'orphaned text'], ['   '], ['unknown', 42]]
  assert.deepEqual(normalizeContentRows(rows), normalizeContentRows(validRows()))
  assert.deepEqual(normalizeContentRows([['clau', 'valor']]), defaultSiteContent)
})
