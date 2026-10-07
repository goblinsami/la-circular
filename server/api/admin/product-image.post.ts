import { randomUUID } from 'node:crypto'
import {
  deleteProductImage,
  getCloudinaryEnvironmentPresence,
  getMissingImageConfiguration,
  getCloudinaryOptions,
  uploadProductImage,
} from '../../utils/cloudinary'
import { writeProductImage } from '../../utils/google-sheets'

const maxImageBytes = 5 * 1024 * 1024

function safeFailureDetails(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return { errorType: 'UnknownError' }
  }
  const source = error as Record<string, unknown>
  const details: {
    errorType: string
    providerStatus?: number
    providerCode?: string
  } = {
    errorType: error instanceof Error ? error.name : 'UnknownError',
  }
  const status = source.providerStatus
  if (typeof status === 'number' && Number.isInteger(status)) {
    details.providerStatus = status
  }
  const code = source.providerCode
  if (typeof code === 'string' && /^[A-Za-z0-9_-]{1,32}$/.test(code)) {
    details.providerCode = code
  }
  return details
}

function imageFormat(data: Buffer): 'jpg' | 'png' | 'webp' | undefined {
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff)
    return 'jpg'
  if (
    data.length >= 8 &&
    data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    return 'png'
  }
  if (
    data.length >= 12 &&
    data.toString('ascii', 0, 4) === 'RIFF' &&
    data.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'webp'
  }
}

export default defineEventHandler(async (event) => {
  const traceId = randomUUID()
  if (!event.context.adminUser) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  if (Number(getHeader(event, 'content-length')) > maxImageBytes + 65536) {
    throw createError({ statusCode: 413, statusMessage: 'Image too large' })
  }

  const config = useRuntimeConfig(event)
  const missingConfiguration = getMissingImageConfiguration(config)
  if (missingConfiguration.length) {
    console.error(
      'Product image service missing runtime configuration:',
      { traceId, missingConfiguration },
    )
    throw createError({
      statusCode: 503,
      statusMessage: 'Image service unavailable',
      data: {
        traceId,
        missingConfiguration,
        environmentPresence: getCloudinaryEnvironmentPresence(),
      },
    })
  }

  let parts: Awaited<ReturnType<typeof readMultipartFormData>> = []
  try {
    parts = await readMultipartFormData(event)
  } catch (error) {
    console.error('Product image multipart parsing failed', {
      traceId,
      ...safeFailureDetails(error),
    })
    throw createError({ statusCode: 400, statusMessage: 'Invalid upload' })
  }
  const totalBytes = parts?.reduce((total, part) => total + part.data.length, 0) ?? 0
  console.info('Product image multipart parsed', {
    traceId,
    partCount: parts?.length ?? 0,
    totalBytes,
  })
  if (totalBytes > maxImageBytes + 1024 || (parts?.length ?? 0) !== 2) {
    throw createError({ statusCode: 413, statusMessage: 'Image too large' })
  }
  const productParts = parts?.filter((part) => part.name === 'productId') ?? []
  const imageParts = parts?.filter((part) => part.name === 'image') ?? []
  const productId = productParts[0]?.data.toString('utf8').trim()
  const image = imageParts[0]
  if (
    productParts.length !== 1 ||
    imageParts.length !== 1 ||
    !productId ||
    productId.length > 100 ||
    !image
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid upload' })
  }
  if (image.data.length === 0 || image.data.length > maxImageBytes) {
    throw createError({ statusCode: 413, statusMessage: 'Image too large' })
  }
  const format = imageFormat(image.data)
  console.info('Product image file inspected', {
    traceId,
    bytes: image.data.length,
    declaredType: image.type ?? 'missing',
    detectedFormat: format ?? 'unsupported',
  })
  const expectedType = format === 'jpg' ? 'image/jpeg' : format && `image/${format}`
  if (!format || image.type !== expectedType) {
    throw createError({ statusCode: 415, statusMessage: 'Unsupported image type' })
  }

  let stage = 'cloudinary-upload'
  try {
    getCloudinaryOptions(config)
    const imageUrl = await uploadProductImage(config, productId, image.data)
    console.info('Product image uploaded to Cloudinary', {
      traceId,
      format,
      bytes: image.data.length,
    })
    let previousImage: string
    stage = 'google-sheets-write'
    try {
      previousImage = await writeProductImage(config, productId, imageUrl)
    } catch (error) {
      await deleteProductImage(config, productId, imageUrl).catch(() => false)
      throw error
    }
    console.info('Product image URL saved to Google Sheets', {
      traceId,
      replacedExistingImage: Boolean(previousImage),
    })
    stage = 'old-image-cleanup'
    if (previousImage) {
      const removed = await deleteProductImage(
        config,
        productId,
        previousImage,
      ).catch(() => false)
      console.info('Previous Cloudinary image cleanup completed', {
        traceId,
        removed,
      })
    }
    return { productId, imatge: imageUrl }
  } catch (error) {
    const details = safeFailureDetails(error)
    console.error('Product image request failed', {
      traceId,
      stage,
      ...details,
    })
    throw createError({
      statusCode: 502,
      statusMessage: 'Unable to save product image',
      data: { traceId, stage, ...details },
    })
  }
})