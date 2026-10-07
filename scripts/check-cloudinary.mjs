import { loadEnvFile } from 'node:process'
import { v2 as cloudinary } from 'cloudinary'
import { getCloudinaryOptions } from '../server/utils/cloudinary.ts'

try {
  loadEnvFile('.env')
} catch {
  console.error(
    'No se pudo leer .env. Ejecuta este comando desde la carpeta del proyecto.',
  )
  process.exit(1)
}

const config = {
  cloudinaryCloudName: process.env.NUXT_CLOUDINARY_CLOUD_NAME ?? '',
  cloudinaryApiKey: process.env.NUXT_CLOUDINARY_API_KEY ?? '',
  cloudinaryApiSecret: process.env.NUXT_CLOUDINARY_API_SECRET ?? '',
}
if (Object.values(config).some((value) => !value.trim())) {
  console.error(
    'Completa NUXT_CLOUDINARY_CLOUD_NAME, NUXT_CLOUDINARY_API_KEY y NUXT_CLOUDINARY_API_SECRET en .env.',
  )
  process.exit(1)
}

try {
  const result = await cloudinary.api.ping(getCloudinaryOptions(config))
  if (result.status !== 'ok') throw new Error('Unexpected ping response')
  console.log(
    'Cloudinary: conexión y credenciales verificadas. No se han modificado imágenes.',
  )
} catch {
  // SDK errors can contain request configuration. Never log the raw error.
  console.error(
    'No se pudo verificar Cloudinary. Comprueba las tres credenciales y la conexión de red.',
  )
  process.exitCode = 1
}
