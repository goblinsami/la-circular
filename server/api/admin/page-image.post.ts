import { uploadProductImage, getMissingImageConfiguration } from '../../utils/cloudinary'

const maxBytes = 5 * 1024 * 1024

export default defineEventHandler(async (event) => {
  if (!event.context.adminUser) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  if (Number(getHeader(event, 'content-length')) > maxBytes + 65536) {
    throw createError({ statusCode: 413, statusMessage: 'Image too large' })
  }
  const parts = await readMultipartFormData(event)
  const pageParts = parts?.filter(part => part.name === 'page') ?? []
  const images = parts?.filter(part => part.name === 'image') ?? []
  const page = pageParts[0]?.data.toString('utf8')
  if (parts?.length !== 2 || pageParts.length !== 1 || images.length !== 1 || (page !== 'home' && page !== 'project')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid upload' })
  }
  const image = images[0]!
  const data = image.data
  if (!data.length || data.length > maxBytes) throw createError({ statusCode: 413, statusMessage: 'Image too large' })
  const jpg = data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff
  const png = data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  const webp = data.length >= 12 && data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP'
  if (!(jpg && image.type === 'image/jpeg') && !(png && image.type === 'image/png') && !(webp && image.type === 'image/webp')) {
    throw createError({ statusCode: 415, statusMessage: 'Unsupported image type' })
  }
  const config = useRuntimeConfig(event)
  if (getMissingImageConfiguration(config).length) throw createError({ statusCode: 503, statusMessage: 'Image service unavailable' })
  try {
    return { url: await uploadProductImage(config, page, data, 'pages') }
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Unable to upload image' })
  }
})
