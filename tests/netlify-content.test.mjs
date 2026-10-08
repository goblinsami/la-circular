import assert from 'node:assert/strict'
import { AsyncLocalStorage } from 'node:async_hooks'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { test } from 'node:test'
import { contentKeys, legacyContentKeys, defaultSiteContent } from '../types/content.ts'

// Run after building with NITRO_PRESET=netlify. Test doubles never reach Google
// or Identity: only the actual compiled Netlify adapter and routes execute.
test('Netlify adapter preserves the POST body through authentication and CSRF', async (t) => {
  const entry = resolve('.netlify/functions-internal/server/main.mjs')
  const require = createRequire(entry)
  const { JWT } = require('google-auth-library')
  const requestContext = new AsyncLocalStorage()
  const origin = 'https://la-circular.netlify.app'
  const keys = contentKeys
  const content = Object.fromEntries(keys.map((key) => [key, 'Text de ' + key]))
  content.home_text = 'Alimentació i benestar.\n\nSegon paràgraf.'
  let rows = [['clau', 'valor'], ['other', 'Keep'], ...Object.entries(content)]
  let writes = 0
  const originalFetch = globalThis.fetch
  const originalNetlify = globalThis.Netlify
  const originalRequest = JWT.prototype.request
  const env = {
    NUXT_GOOGLE_SHEET_ID: 'fixture-sheet',
    NUXT_GOOGLE_SERVICE_ACCOUNT_EMAIL: 'fixture@example.test',
    NUXT_GOOGLE_PRIVATE_KEY: 'fixture-key',
  }
  const previousEnv = Object.fromEntries(
    Object.keys(env).map((key) => [key, process.env[key]]),
  )
  Object.assign(process.env, env)
  globalThis.Netlify = {
    get context() {
      return {
        url: origin,
        cookies: {
          get: (name) =>
            name === 'nf_jwt'
              ? requestContext
                  .getStore()
                  ?.headers.get('cookie')
                  ?.split('nf_jwt=')[1]
              : undefined,
        },
      }
    },
  }
  globalThis.fetch = async (url, options = {}) => {
    assert.ok(
      String(url).startsWith(origin + '/.netlify/identity/'),
      'Unexpected outbound request',
    )
    if (String(url).endsWith('/settings'))
      return Response.json({ disable_signup: true, external: { email: true } })
    if (
      String(url).endsWith('/user') &&
      options.headers?.Authorization === 'Bearer test-session'
    ) {
      return Response.json({ id: 'test-admin', email: 'admin@example.test' })
    }
    return Response.json({}, { status: 401 })
  }
  JWT.prototype.request = async function (options) {
    assert.ok(
      options.url.startsWith(
        'https://sheets.googleapis.com/v4/spreadsheets/fixture-sheet/',
      ),
    )
    if (options.method === 'POST') {
      assert.equal(options.data.valueInputOption, 'RAW')
      assert.equal(options.data.data.length, keys.length)
      let updatedCells = 0
      for (const cell of options.data.data) {
        const match = /^'Continguts'!([AB])(\d+)(?::B\d+)?$/.exec(cell.range)
        assert.ok(match)
        const index = Number(match[2]) - 1
        if (match[1] === 'A') {
          assert.equal(rows[index], undefined)
          assert.ok(keys.includes(cell.values[0][0]))
          rows[index] = [...cell.values[0]]
        } else {
          assert.ok(keys.includes(rows[index][0]))
          rows[index][1] = cell.values[0][0]
        }
        updatedCells += cell.values[0].length
      }
      writes++
      return { data: { totalUpdatedCells: updatedCells } }
    }
    return { data: { values: structuredClone(rows) } }
  }

  try {
    const { default: handler } = await import(pathToFileURL(entry).href)
    async function call({
      method = 'POST',
      path = '/api/admin/content',
      body = JSON.stringify(content),
      cookie = 'nf_jwt=test-session',
      requestOrigin = origin,
      type = 'application/json',
      length = false,
    } = {}) {
      const headers = {
        host: 'la-circular.netlify.app',
        'x-forwarded-proto': 'https',
        cookie,
        'content-type': type,
      }
      if (requestOrigin) headers.origin = requestOrigin
      if (length) headers['content-length'] = String(Buffer.byteLength(body))
      const request = new Request(origin + path, {
        method,
        headers,
        ...(!['GET', 'HEAD'].includes(method) ? { body } : {}),
      })
      return requestContext.run(request, () => handler(request))
    }

    await t.test(
      'valid JSON with and without Content-Length reaches Sheets intact',
      async () => {
        for (const length of [true, false]) {
          const response = await call({ length })
          assert.equal(response.status, 200)
          assert.deepEqual(await response.json(), content)
        }
        assert.equal(writes, 2)
        assert.deepEqual(rows[1], ['other', 'Keep'])
      },
    )
    await t.test('authenticated GET returns the saved content', async () => {
      const response = await call({ method: 'GET' })
      assert.equal(response.status, 200)
      assert.deepEqual(await response.json(), content)
    })
    await t.test('anonymous and forged sessions cannot write', async () => {
      for (const cookie of ['', 'nf_jwt=forged']) {
        assert.equal((await call({ cookie })).status, 401)
      }
    })
    await t.test('image and product APIs reject anonymous and forged sessions', async () => {
      const protectedRequests = [
        { path: '/api/admin/products', method: 'GET' },
        {
          path: '/api/admin/product-image',
          method: 'POST',
          body: JSON.stringify({ productId: 'INF-0001' }),
        },
        {
          path: '/api/admin/product-image',
          method: 'DELETE',
          body: JSON.stringify({ productId: 'INF-0001' }),
        },
      ]
      for (const request of protectedRequests) {
        for (const cookie of ['', 'nf_jwt=forged']) {
          assert.equal((await call({ ...request, cookie })).status, 401)
        }
      }
      assert.equal(writes, 2)
    })
    await t.test('missing or foreign origins remain forbidden', async () => {
      for (const requestOrigin of ['', 'https://foreign.example']) {
        assert.equal((await call({ requestOrigin })).status, 403)
      }
    })
    await t.test(
      'distinguishes malformed requests from invalid fields',
      async () => {
        const malformed = await call({ body: '{bad json' })
        assert.equal(malformed.status, 400)
        assert.equal((await malformed.json()).data.code, 'INVALID_JSON')
        const fields = await call({
          body: JSON.stringify({ ...content, home_title: '' }),
        })
        assert.equal(fields.status, 400)
        assert.equal((await fields.json()).data.code, 'INVALID_CONTENT')
        assert.equal((await call({ type: 'text/plain' })).status, 415)
        assert.equal((await call({ body: 'x'.repeat(2 * 1024 * 1024 + 1) })).status, 413)
        assert.equal(writes, 2)
      },
    )
    await t.test('public page renders configurable header, artwork, cards and footer', async () => {
      const response = await call({ method: 'GET', path: '/', cookie: '' })
      assert.equal(response.status, 200)
      const html = await response.text()
      for (const key of ['header_la_circular', 'header_dietetica_de_barri', 'header_inici', 'home_benestar_amb_proximitat', 'home_cuidar_nos_de_manera_natural', 'home_descobreix_els_productes', 'home_les_persones_al_centre', 'home_triar_amb_calma', 'footer_a_prop_teu_cada_dia']) {
        assert.ok(html.includes(content[key]), 'Missing rendered text: ' + key)
      }
    })
    await t.test('first admin save extends the legacy sheet and remains readable after reload', async () => {
      rows = [['clau', 'valor'], ['other', 'Keep'], ...legacyContentKeys.map(key => [key, content[key]])]
      const legacyResponse = await call({ method: 'GET' })
      assert.equal(legacyResponse.status, 200)
      const loaded = await legacyResponse.json()
      assert.equal(loaded.header_close_menu, defaultSiteContent.header_close_menu)
      assert.equal(loaded.home_title, content.home_title)
      const response = await call()
      assert.equal(response.status, 200)
      assert.deepEqual(await response.json(), content)
      assert.deepEqual(rows[1], ['other', 'Keep'])
      assert.equal(rows.length, keys.length + 2)
      assert.deepEqual(await (await call({ method: 'GET' })).json(), content)
      assert.deepEqual(await (await call({ method: 'GET', path: '/api/content', cookie: '' })).json(), content)
    })
  } finally {
    globalThis.fetch = originalFetch
    globalThis.Netlify = originalNetlify
    JWT.prototype.request = originalRequest
    for (const [key, value] of Object.entries(previousEnv)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
})
