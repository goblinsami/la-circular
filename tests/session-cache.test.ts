import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getSessionCachedData, updateSessionCachedData } from '../utils/session-cache.ts'

const app = () => ({ payload: { data: {} as Record<string, unknown>, _errors: {} as Record<string, unknown> } })

test('navigation reuses content, including blank strings, and panel updates', () => {
  const session = app()
  const initial = { home_title: 'La Circular', home_text: '' }
  assert.equal(getSessionCachedData('site-content', session, { cause: 'initial' }), undefined)
  session.payload.data['site-content'] = initial
  assert.equal(getSessionCachedData('site-content', session, { cause: 'initial' }), initial)
  const edited = { ...initial, home_title: 'Updated' }
  session.payload.data['site-content'] = edited
  assert.equal(getSessionCachedData('site-content', session, { cause: 'initial' }), edited)
})

test('products load independently and an empty catalogue is a valid cache hit', () => {
  const session = app()
  session.payload.data['site-content'] = { home_title: 'La Circular' }
  assert.equal(getSessionCachedData('site-products', session, { cause: 'initial' }), undefined)
  const products: unknown[] = []
  session.payload.data['site-products'] = products
  assert.equal(getSessionCachedData('site-products', session, { cause: 'initial' }), products)
})

test('manual refresh and failed responses never use cached data', () => {
  const session = app()
  session.payload.data['site-products'] = []
  for (const cause of ['refresh:manual', 'refresh:hook', 'watch']) {
    assert.equal(getSessionCachedData('site-products', session, { cause }), undefined)
  }
  session.payload._errors['site-products'] = { statusCode: 502 }
  assert.equal(getSessionCachedData('site-products', session, { cause: 'initial' }), undefined)
})

test('reloads and separate SSR requests have independent payloads', () => {
  const previous = app()
  previous.payload.data['site-content'] = { home_title: 'Previous' }
  assert.equal(getSessionCachedData('site-content', app(), { cause: 'initial' }), undefined)
})

test('panel save replaces stale navigation data and recovers from a previous read error', () => {
  const session = app()
  session.payload.data['site-content'] = { home_title: 'Old' }
  session.payload._errors['site-content'] = { statusCode: 502 }
  const shared = { value: { home_title: 'Old' } }
  const saved = { home_title: '' }
  updateSessionCachedData('site-content', session, shared, saved)
  assert.equal(shared.value, saved)
  assert.equal(getSessionCachedData('site-content', session, { cause: 'initial' }), saved)
  assert.equal(session.payload._errors['site-content'], null)
})

test('image edits and removals survive remounting the products page', () => {
  const session = app()
  const shared = { value: [{ id: 'P1', imatge: 'old.jpg' as string | null }] }
  session.payload.data['site-products'] = shared.value
  for (const imatge of ['new.jpg', null]) {
    const updated = shared.value.map(product => ({ ...product, imatge }))
    updateSessionCachedData('site-products', session, shared, updated)
    assert.equal(getSessionCachedData('site-products', session, { cause: 'initial' }), updated)
    assert.equal(shared.value[0].imatge, imatge)
  }
})
