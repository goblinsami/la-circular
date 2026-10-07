import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  getCloudinaryEnvironmentPresence,
  getMissingImageConfiguration,
  getProductImagePublicId,
} from '../server/utils/cloudinary.ts'

const config = {
  cloudinaryCloudName: 'test-cloud',
  cloudinaryApiKey: 'test-key',
  cloudinaryApiSecret: 'test-secret',
}
const productId = 'INF-0001'
const uuid = '550e8400-e29b-41d4-a716-446655440000'
const folder =
  'la-circular/products/' +
  createHash('sha256').update(productId).digest('hex').slice(0, 20)

test('reports missing image service keys without exposing configured values', () => {
  const configuredValues = {
    googleSheetId: 'sheet-id',
    googleServiceAccountEmail: 'service@example.test',
    googlePrivateKey: 'private-key',
    cloudinaryCloudName: undefined,
    cloudinaryApiKey: 'api-key',
    cloudinaryApiSecret: '',
  }
  const missing = getMissingImageConfiguration(configuredValues)
  assert.deepEqual(
    missing,
    ['NUXT_CLOUDINARY_CLOUD_NAME', 'NUXT_CLOUDINARY_API_SECRET'],
  )
  assert.ok(missing.every((key) => !Object.values(configuredValues).includes(key)))
})

test('reports only boolean Cloudinary environment presence', () => {
  assert.deepEqual(
    getCloudinaryEnvironmentPresence({
      NUXT_CLOUDINARY_CLOUD_NAME: 'cloud-name',
      NUXT_CLOUDINARY_API_KEY: '',
      NUXT_CLOUDINARY_API_SECRET: 'secret-value',
    }),
    {
      NUXT_CLOUDINARY_CLOUD_NAME: true,
      NUXT_CLOUDINARY_API_KEY: false,
      NUXT_CLOUDINARY_API_SECRET: true,
    },
  )
})

test('accepts a versioned Cloudinary URL owned by the requested product', () => {
  assert.equal(
    getProductImagePublicId(
      config,
      productId,
      `https://res.cloudinary.com/test-cloud/image/upload/v1234567890/${folder}/${uuid}.webp`,
    ),
    `${folder}/${uuid}`,
  )
})

test('rejects URLs outside the product image namespace', () => {
  const candidates = [
    `https://example.com/${folder}/${uuid}.jpg`,
    `https://res.cloudinary.com/other-cloud/image/upload/${folder}/${uuid}.jpg`,
    `http://res.cloudinary.com/test-cloud/image/upload/${folder}/${uuid}.jpg`,
    `https://res.cloudinary.com/test-cloud/image/upload/${folder}/other.jpg`,
    `https://res.cloudinary.com/test-cloud/image/upload/${folder}/${uuid}.svg`,
  ]
  for (const url of candidates) {
    assert.equal(getProductImagePublicId(config, productId, url), null)
  }
  assert.equal(
    getProductImagePublicId(
      config,
      'DIFFERENT-PRODUCT',
      `https://res.cloudinary.com/test-cloud/image/upload/${folder}/${uuid}.jpg`,
    ),
    null,
  )
})