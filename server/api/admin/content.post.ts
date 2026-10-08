import { validateContentInput } from '../../../utils/content-validation'
import { writeSiteContent } from '../../utils/google-sheets'

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

  const maxBytes = 2 * 1024 * 1024
  if (Number(getHeader(event, 'content-length')) > maxBytes) {
    throw createError({ statusCode: 413, statusMessage: 'Content too large' })
  }
  const raw = await readRawBody(event)
  if (raw && Buffer.byteLength(raw, 'utf8') > maxBytes) {
    throw createError({ statusCode: 413, statusMessage: 'Content too large' })
  }

  let input: unknown
  try {
    input = JSON.parse(raw ?? '')
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid JSON',
      data: { code: 'INVALID_JSON' },
    })
  }

  let content
  try {
    content = validateContentInput(input)
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid content',
      data: { code: 'INVALID_CONTENT' },
    })
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
    await writeSiteContent(config, content)
    return content
  } catch {
    // Never expose Google's response, request body or credentials.
    throw createError({
      statusCode: 502,
      statusMessage: 'Unable to save content',
    })
  }
})
