import { readContentRows } from '../utils/google-sheets'
import { normalizeContentRows } from '../utils/content-normalization'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  const config = useRuntimeConfig(event)
  if (!config.googleSheetId || !config.googleServiceAccountEmail || !config.googlePrivateKey) {
    throw createError({ statusCode: 503, statusMessage: 'Content unavailable' })
  }

  try {
    const rows = await readContentRows(config)
    return normalizeContentRows(rows)
  } catch {
    // Do not forward Google errors, credentials or request headers.
    throw createError({ statusCode: 502, statusMessage: 'Unable to load content' })
  }
})