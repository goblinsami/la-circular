import { readProductSheets } from '../utils/google-sheets'
import { normalizeProductSheets } from '../utils/product-normalization'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  const config = useRuntimeConfig(event)
  if (
    !config.googleSheetId ||
    !config.googleServiceAccountEmail ||
    !config.googlePrivateKey
  ) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Catalogue unavailable',
    })
  }

  try {
    const sheets = await readProductSheets(config)
    return normalizeProductSheets(sheets)
  } catch {
    // Google errors can contain credentials or request headers. Never forward them.
    throw createError({
      statusCode: 502,
      statusMessage: 'Unable to load catalogue',
    })
  }
})
