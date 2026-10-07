import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  normalizeAdminProductSheets,
  normalizeProductSheets,
} from '../server/utils/product-normalization.ts'

const header = ['id', 'nom', 'descripcio', 'preu', 'imatge', 'actiu', 'ordre']
const sheet = (rows: unknown[][], title = 'Infusions') => ({
  title,
  rows: [header, ...rows],
})

test('combines categories, excludes contents and inactive products, and sorts numerically', () => {
  const result = normalizeProductSheets([
    sheet([
      ['INF-1', 'Camamilla', '', 3.9, '', true, 20],
      ['INF-2', 'Menta', '', 2, '', false, 0],
    ]),
    sheet([['ALI-1', 'Civada', '', 0, '', 'TRUE', 2]], 'Alimentació'),
    {
      title: 'Continguts',
      rows: [
        ['clau', 'valor'],
        ['home_title', 'La Circular'],
      ],
    },
  ])
  assert.deepEqual(
    result.map((product) => [product.id, product.categoria]),
    [
      ['ALI-1', 'Alimentació'],
      ['INF-1', 'Infusions'],
    ],
  )
  assert.equal(result[0]!.preu, 0)
  assert.ok(result.every((product) => product.actiu === true))
})

test('admin product list includes inactive rows and their current images', () => {
  assert.deepEqual(
    normalizeAdminProductSheets([
      sheet([
        ['INF-1', 'Camamilla', '', 3.9, 'https://example.com/tea.jpg', true],
        ['INF-2', 'Menta', '', 2, '', false],
      ]),
    ]),
    [
      {
        id: 'INF-1',
        nom: 'Camamilla',
        categoria: 'Infusions',
        actiu: true,
        imatge: 'https://example.com/tea.jpg',
      },
      {
        id: 'INF-2',
        nom: 'Menta',
        categoria: 'Infusions',
        actiu: false,
        imatge: null,
      },
    ],
  )
})

test('normalizes whitespace, decimal strings and optional fields without extra columns', () => {
  const [product] = normalizeProductSheets([
    sheet([[' INF-1 ', ' Camamilla ', ' Flors ', '3,90', '', ' true ', '10']]),
  ])
  assert.deepEqual(product, {
    id: 'INF-1',
    nom: 'Camamilla',
    categoria: 'Infusions',
    actiu: true,
    descripcio: 'Flors',
    preu: 3.9,
    imatge: null,
    ordre: 10,
  })
})

test('missing optional cells stay absent and missing images become null', () => {
  assert.deepEqual(
    normalizeProductSheets([sheet([['INF-1', 'Camamilla', '', '', '', true]])]),
    [
      {
        id: 'INF-1',
        nom: 'Camamilla',
        categoria: 'Infusions',
        actiu: true,
        imatge: null,
      },
    ],
  )
})

test('ignores blank and checkbox-only rows and accepts an empty catalogue', () => {
  assert.deepEqual(
    normalizeProductSheets([sheet([[], ['', '', '', '', '', false]])]),
    [],
  )
})

test('only explicit true values are active; malformed booleans are rejected', () => {
  assert.deepEqual(
    normalizeProductSheets([
      sheet([
        ['1', 'A', '', '', '', 'FALSE'],
        ['2', 'B'],
      ]),
    ]),
    [],
  )
  for (const value of ['sí', 1, 'enabled']) {
    assert.throws(
      () => normalizeProductSheets([sheet([['1', 'A', '', '', '', value]])]),
      /actiu/,
    )
  }
})

test('rejects missing or altered headers', () => {
  assert.throws(
    () => normalizeProductSheets([{ title: 'Altres', rows: [] }]),
    /headers/,
  )
  assert.throws(
    () => normalizeProductSheets([{ title: 'Altres', rows: [['nom', 'id']] }]),
    /headers/,
  )
})

test('rejects duplicate ids across sheets, including inactive rows', () => {
  assert.throws(
    () =>
      normalizeProductSheets([
        sheet([['SAME', 'A', '', '', '', true]]),
        sheet([['SAME', 'B', '', '', '', false]], 'Altres'),
      ]),
    /Duplicate/,
  )
})

test('rejects rows with a missing id or name', () => {
  for (const row of [
    ['', 'A', '', '', '', true],
    ['1', '', '', '', '', true],
  ]) {
    assert.throws(() => normalizeProductSheets([sheet([row])]), /required/)
  }
})

test('rejects invalid prices and non-integer or negative order values', () => {
  for (const price of ['3,90 €', 'no', -1, Infinity, true]) {
    assert.throws(
      () => normalizeProductSheets([sheet([['1', 'A', '', price, '', true]])]),
      /numeric/,
    )
  }
  for (const order of [1.5, -1, 'no']) {
    assert.throws(
      () =>
        normalizeProductSheets([sheet([['1', 'A', '', '', '', true, order]])]),
      /numeric/,
    )
  }
})

test('keeps ties stable, places unspecified order last and does not mutate source rows', () => {
  const rows = [
    ['1', 'A', '', '', '', true],
    ['2', 'B', '', '', '', true, 0],
    ['3', 'C', '', '', '', true, 0],
  ]
  const before = structuredClone(rows)
  assert.deepEqual(
    normalizeProductSheets([sheet(rows)]).map((product) => product.id),
    ['2', '3', '1'],
  )
  assert.deepEqual(rows, before)
})
