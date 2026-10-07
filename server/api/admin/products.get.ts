import { readAdminProducts } from '../../utils/google-sheets'

export default defineEventHandler(async (event) => {
  if (!event.context.adminUser) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const config = useRuntimeConfig(event)
  if (
    !config.googleSheetId ||
    !config.googleServiceAccountEmail ||
    !config.googlePrivateKey
  ) {
    throw createError({ statusCode: 503, statusMessage: 'Catalogue unavailable' })
  }
  try {
    return await readAdminProducts(config)
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: 'Unable to load catalogue',
    })
  }
})