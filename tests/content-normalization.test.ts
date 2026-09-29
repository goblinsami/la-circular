import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizeContentRows } from '../server/utils/content-normalization.ts'

const keys = ['home_title', 'home_subtitle', 'home_text', 'project_title', 'project_content', 'products_title', 'products_intro']
const validRows = (): unknown[][] => [
  ['clau', 'valor'], ...keys.map(key => [key, 'Text de ' + key]),
]

test('returns exactly the seven public keys regardless of row order', () => {
  const rows = validRows()
  rows.splice(1, 7, ...rows.slice(1).reverse())
  rows.push(['internal_note', 'Must never be public'], [], ['', ''])
  const content = normalizeContentRows(rows)
  assert.deepEqual(Object.keys(content).sort(), [...keys].sort())
  for (const key of keys) assert.equal(content[key as keyof typeof content], 'Text de ' + key)
  assert.equal(JSON.stringify(content).includes('Must never be public'), false)
})

test('trims outer whitespace while preserving accents and paragraph breaks', () => {
  const rows = validRows()
  rows[3] = [' home_text ', '  Alimentació\r\n\r\nBenestar quotidià.  ']
  assert.equal(normalizeContentRows(rows).home_text, 'Alimentació\n\nBenestar quotidià.')
})

test('rejects missing keys, duplicate keys and incorrect headers', () => {
  assert.throws(() => normalizeContentRows(validRows().slice(0, -1)), /Missing/)
  assert.throws(() => normalizeContentRows([...validRows(), ['home_title', 'Duplicate']]), /Duplicate/)
  assert.throws(() => normalizeContentRows([['key', 'value'], ...validRows().slice(1)]), /headers/)
})

test('rejects empty, numeric and boolean values', () => {
  for (const value of ['', '   ', 42, false, null]) {
    const rows = validRows()
    rows[1] = ['home_title', value]
    assert.throws(() => normalizeContentRows(rows), /non-empty text/)
  }
})

test('keeps text as text instead of interpreting HTML', () => {
  const rows = validRows()
  rows[3] = ['home_text', '<script>alert(1)</script>']
  assert.equal(normalizeContentRows(rows).home_text, '<script>alert(1)</script>')
})

test('does not mutate the source cells', () => {
  const rows = validRows()
  const original = structuredClone(rows)
  normalizeContentRows(rows)
  assert.deepEqual(rows, original)
})