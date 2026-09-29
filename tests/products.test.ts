import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Product } from '../types/product'
import { getVisibleProducts } from '../utils/products.ts'

const products: readonly Product[] = Object.freeze([
  {
    id: 'A',
    nom: 'Arròs integral',
    categoria: 'Alimentació',
    actiu: true,
    ordre: 20,
  },
  {
    id: 'B',
    nom: 'Arròs blanc',
    categoria: 'Alimentació',
    actiu: false,
    ordre: 1,
  },
  { id: 'C', nom: 'Te verd', categoria: 'Infusions', actiu: true, ordre: 10 },
  { id: 'D', nom: 'Bossa de cotó', categoria: 'Altres', actiu: true },
  { id: 'E', nom: 'Te negre', categoria: 'Infusions', actiu: true, ordre: 10 },
  { id: 'F', nom: 'Civada', categoria: 'Alimentació', actiu: true, ordre: 0 },
])

test('excludes inactive products even when their name matches the search', () => {
  assert.equal(
    getVisibleProducts(products).some((product) => product.id === 'B'),
    false,
  )
  assert.deepEqual(getVisibleProducts(products, 'Arròs blanc'), [])
})

test('searches names ignoring accents, case and surrounding whitespace', () => {
  assert.deepEqual(
    getVisibleProducts(products, '  ARROS  ').map((product) => product.id),
    ['A'],
  )
  assert.deepEqual(
    getVisibleProducts(products, 'coto').map((product) => product.id),
    ['D'],
  )
  assert.deepEqual(getVisibleProducts(products, 'Alimentació'), [])
})

test('combines category and search instead of applying them separately', () => {
  assert.deepEqual(
    getVisibleProducts(products, 'te', 'Infusions').map(
      (product) => product.id,
    ),
    ['C', 'E'],
  )
  assert.deepEqual(getVisibleProducts(products, 'verd', 'Alimentació'), [])
  assert.deepEqual(getVisibleProducts(products, 'civada', 'Infusions'), [])
})

test('sorts numerically, preserves ties and puts missing order last without changing the source', () => {
  const originalIds = products.map((product) => product.id)
  assert.deepEqual(
    getVisibleProducts(products).map((product) => product.id),
    ['F', 'C', 'E', 'A', 'D'],
  )
  assert.deepEqual(
    products.map((product) => product.id),
    originalIds,
  )
})

test('empty or whitespace-only filters restore all active products', () => {
  assert.deepEqual(
    getVisibleProducts(products, '   ', ''),
    getVisibleProducts(products),
  )
})

test('handles empty data, unknown categories and names without matches', () => {
  assert.deepEqual(getVisibleProducts([]), [])
  assert.deepEqual(getVisibleProducts(products, '', 'Desconeguda'), [])
  assert.deepEqual(getVisibleProducts(products, 'xyz'), [])
})
