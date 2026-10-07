import { deleteProductImage } from '../../utils/cloudinary'
import { writeProductImage } from '../../utils/google-sheets'

export default defineEventHandler(async (event) => {
  if (!event.context.adminUser) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const mediaType = getHeader(event, 'content-type')
    ?.split(';')[0]
    ?.trim()
    .toLowerCase()
  if (mediaType !== 'application/json') {
    throw createError({ statusCode: 415, statusMessage: 'Expected JSON' })
  }
  if (Number(getHeader(event, 'content-length')) > 1024) {
    throw createError({ statusCode: 413, statusMessage: 'Request too large' })
  }
  const config = useRuntimeConfig(event)
  if (
    !config.googleSheetId ||
    !config.googleServiceAccountEmail ||
    !config.googlePrivateKey ||
    !config.cloudinaryCloudName ||
    !config.cloudinaryApiKey ||
    !config.cloudinaryApiSecret
  ) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Image service unavailable',
    })
  }

  const raw = await readRawBody(event)
  if (raw && Buffer.byteLength(raw, 'utf8') > 1024) {
    throw createError({ statusCode: 413, statusMessage: 'Request too large' })
  }
  let input: unknown
  try {
    input = JSON.parse(raw ?? '')
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request' })
  }
  const productId =
    typeof input === 'object' && input !== null && 'productId' in input
      ? (input as { productId?: unknown }).productId
      : undefined
  if (
    typeof productId !== 'string' ||
    !productId.trim() ||
    productId.length > 100
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid product' })
  }

  try {
    const id = productId.trim()
    const previousImage = await writeProductImage(config, id, '')
    if (previousImage) {
      await deleteProductImage(config, id, previousImage).catch(() => false)
    }
    return { productId: id, imatge: null }
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: 'Unable to remove product image',
    })
  }
})