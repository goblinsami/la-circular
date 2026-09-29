import { readContentRows } from '../../utils/google-sheets'
import { normalizeContentRows } from '../../utils/content-normalization'

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
    throw createError({ statusCode: 503, statusMessage: 'Content unavailable' })
  }
  try {
    return normalizeContentRows(await readContentRows(config))
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: 'Unable to load content',
    })
  }
})
