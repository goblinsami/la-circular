import { createHash, randomUUID } from 'node:crypto'
import { v2 as cloudinary } from 'cloudinary'

interface CloudinaryConfig {
  cloudinaryCloudName: string
  cloudinaryApiKey: string
  cloudinaryApiSecret: string
}

// Server-only configuration. Pass these options to the official SDK;
// never put them in runtimeConfig.public or return them from an API.
export function getCloudinaryOptions(config: CloudinaryConfig) {
  const cloudName = config.cloudinaryCloudName.trim()
  const apiKey = config.cloudinaryApiKey.trim()
  const apiSecret = config.cloudinaryApiSecret.trim()
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Missing Cloudinary configuration')
  }
  return {
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
    timeout: 10000,
  }
}

function productFolder(productId: string): string {
  const key = createHash('sha256').update(productId).digest('hex').slice(0, 20)
  return `la-circular/products/${key}`
}

export async function uploadProductImage(
  config: CloudinaryConfig,
  productId: string,
  data: Buffer,
): Promise<string> {
  cloudinary.config(getCloudinaryOptions(config))
  return await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: productFolder(productId),
        public_id: randomUUID(),
        resource_type: 'image',
        allowed_formats: ['jpg', 'png', 'webp'],
        overwrite: false,
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(new Error('Image upload failed'))
          return
        }
        resolve(result.secure_url)
      },
    )
    stream.end(data)
  })
}

export function getProductImagePublicId(
  config: CloudinaryConfig,
  productId: string,
  imageUrl: string,
): string | null {
  try {
    const url = new URL(imageUrl)
    const prefix = `/${config.cloudinaryCloudName.trim()}/image/upload/`
    if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com')
      return null
    if (!url.pathname.startsWith(prefix)) return null
    const assetPath = url.pathname.slice(prefix.length).replace(/^v\d+\//, '')
    const folder = productFolder(productId)
    const match = assetPath.match(
      new RegExp(
        `^${folder}/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\\.(?:jpg|png|webp)$`,
      ),
    )
    if (!match) return null
    return `${folder}/${match[1]}`
  } catch {
    return null
  }
}

export async function deleteProductImage(
  config: CloudinaryConfig,
  productId: string,
  imageUrl: string,
): Promise<boolean> {
  const options = getCloudinaryOptions(config)
  const publicId = getProductImagePublicId(config, productId, imageUrl)
  if (!publicId) return false

  cloudinary.config(options)
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
    invalidate: true,
  })
  return result.result === 'ok' || result.result === 'not found'
}
