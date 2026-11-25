import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isLocalAdminRequest, hasLocalWriteOrigin } from '../server/utils/local-admin.ts'

test('local admin is restricted to development and a loopback connection and hostname', () => {
  for (const host of ['localhost', '127.0.0.1', '[::1]']) {
    const url = new URL(`http://${host}:3000/admin`)
    assert.equal(isLocalAdminRequest(true, url, '127.0.0.1'), true)
    assert.equal(isLocalAdminRequest(false, url, '127.0.0.1'), false)
    assert.equal(isLocalAdminRequest(true, url, '192.168.1.2'), false)
    assert.equal(isLocalAdminRequest(true, url, undefined), true)
  }
  assert.equal(isLocalAdminRequest(true, new URL('https://la-circular.netlify.app/admin'), '127.0.0.1'), false)
})

test('local writes require the exact same origin including port', () => {
  const url = new URL('http://localhost:3000/api/admin/content')
  assert.equal(hasLocalWriteOrigin(url, 'http://localhost:3000'), true)
  for (const origin of [undefined, 'null', 'https://example.com', 'http://localhost:3001', 'http://localhost:3000.attacker.test']) {
    assert.equal(hasLocalWriteOrigin(url, origin), false)
  }
})
