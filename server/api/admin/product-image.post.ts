import {
  deleteProductImage,
  getCloudinaryOptions,
  uploadProductImage,
} from '../../utils/cloudinary'
import { writeProductImage } from '../../utils/google-sheets'

const maxImageBytes = 5 * 1024 * 1024

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
  if (!event.context.adminUser) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  if (Number(getHeader(event, 'content-length')) > maxImageBytes + 65536) {
    throw createError({ statusCode: 413, statusMessage: 'Image too large' })
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

  let parts: Awaited<ReturnType<typeof readMultipartFormData>> = []
  try {
    parts = await readMultipartFormData(event)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid upload' })
  }
  const totalBytes = parts?.reduce((total, part) => total + part.data.length, 0) ?? 0
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
  const expectedType = format === 'jpg' ? 'image/jpeg' : format && `image/${format}`
  if (!format || image.type !== expectedType) {
    throw createError({ statusCode: 415, statusMessage: 'Unsupported image type' })
  }

  try {
    getCloudinaryOptions(config)
    const imageUrl = await uploadProductImage(config, productId, image.data)
    let previousImage: string
    try {
      previousImage = await writeProductImage(config, productId, imageUrl)
    } catch (error) {
      await deleteProductImage(config, productId, imageUrl).catch(() => false)
      throw error
    }
    if (previousImage) {
      await deleteProductImage(config, productId, previousImage).catch(() => false)
    }
    return { productId, imatge: imageUrl }
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: 'Unable to save product image',
    })
  }
})