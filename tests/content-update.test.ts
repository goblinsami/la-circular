import assert from 'node:assert/strict'
import { test } from 'node:test'
import { contentKeys } from '../types/content.ts'
import {
  contentLimits,
  validateContentInput,
} from '../utils/content-validation.ts'
import { prepareContentUpdate } from '../server/utils/content-update.ts'

const validContent = () =>
  Object.fromEntries(contentKeys.map((key) => [key, 'Text de ' + key]))
const validRows = () => [
  ['clau', 'valor'],
  ...contentKeys.map((key) => [key, 'Text existent']),
]

test('validates exactly the editable fields without mutating input', () => {
  const input = validContent()
  input.home_text = '  Alimentació\r\n\r\nBenestar.  '
  const before = structuredClone(input)
  assert.equal(
    validateContentInput(input).home_text,
    'Alimentació\n\nBenestar.',
  )
  assert.deepEqual(input, before)
  for (const input of [
    null,
    [],
    'text',
    { ...validContent(), sheetId: 'other' },
  ]) {
    assert.throws(() => validateContentInput(input))
  }
  const missing = validContent()
  delete missing.home_title
  assert.throws(() => validateContentInput(missing))
})

test('rejects missing text and enforces each field length', () => {
  for (const value of ['', '   ', 1, false, null, {}, []]) {
    assert.throws(() =>
      validateContentInput({ ...validContent(), home_title: value }),
    )
  }
  for (const key of contentKeys) {
    assert.equal(
      validateContentInput({
        ...validContent(),
        [key]: 'a'.repeat(contentLimits[key]),
      })[key].length,
      contentLimits[key],
    )
    assert.throws(() =>
      validateContentInput({
        ...validContent(),
        [key]: 'a'.repeat(contentLimits[key] + 1),
      }),
    )
  }
})

test('finds each key in reordered rows and changes only its value cell', () => {
  const rows = [
    ['clau', 'valor'],
    ['internal_note', 'Preserve'],
    [],
    ...validRows().slice(1).reverse(),
  ]
  const before = structuredClone(rows)
  const content = validateContentInput(validContent())
  const update = prepareContentUpdate(rows, content)
  assert.equal(update.valueInputOption, 'RAW')
  assert.equal(update.data.length, 7)
  for (const [index, key] of contentKeys.entries()) {
    const rowNumber = rows.findIndex((row) => row[0] === key) + 1
    assert.deepEqual(update.data[index], {
      range: "'Continguts'!B" + rowNumber,
      values: [[content[key]]],
    })
  }
  assert.deepEqual(rows, before)
})

test('keeps formula-like values, HTML and paragraph breaks as literal strings', () => {
  const content = validateContentInput({
    ...validContent(),
    home_title: '=1+2',
    project_content: '<img src=x onerror=alert(1)>\n\nSegon paràgraf.',
  })
  const update = prepareContentUpdate(validRows(), content)
  assert.equal(update.valueInputOption, 'RAW')
  assert.deepEqual(update.data[0]?.values, [['=1+2']])
  assert.deepEqual(update.data[4]?.values, [[content.project_content]])
})

test('refuses writes when the existing sheet has ambiguous or missing keys', () => {
  const content = validateContentInput(validContent())
  assert.throws(() =>
    prepareContentUpdate(
      [...validRows(), ['home_title', 'duplicate']],
      content,
    ),
  )
  assert.throws(() => prepareContentUpdate(validRows().slice(0, -1), content))
  assert.throws(() =>
    prepareContentUpdate(
      [['wrong', 'headers'], ...validRows().slice(1)],
      content,
    ),
  )
})
