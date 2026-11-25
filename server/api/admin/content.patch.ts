import { contentKeys, type ContentKey } from '../../../types/content'
import { validateContentInput } from '../../../utils/content-validation'
import { readContentRows, writeSiteContent } from '../../utils/google-sheets'
import { normalizeContentRows } from '../../utils/content-normalization'

export default defineEventHandler(async (event) => {
  if (!event.context.adminUser) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  if (getHeader(event, 'content-type')?.split(';')[0]?.trim() !== 'application/json') {
    throw createError({ statusCode: 415, statusMessage: 'Expected JSON' })
  }
  const raw = await readRawBody(event)
  if (Buffer.byteLength(raw ?? '') > 2 * 1024 * 1024) throw createError({ statusCode: 413, statusMessage: 'Content too large' })
  let input: Record<string, unknown>
  try {
    input = JSON.parse(raw ?? '')
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid object')
    const keys = Object.keys(input)
    if (!keys.length || keys.some(key => !contentKeys.includes(key as ContentKey) || typeof input[key] !== 'string')) throw new Error('Invalid keys')
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid content' })
  }
  const config = useRuntimeConfig(event)
  let current
  try {
    current = normalizeContentRows(await readContentRows(config))
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Unable to load content' })
  }
  let result
  try {
    result = validateContentInput({ ...current, ...input })
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid content' })
  }
  try {
    await writeSiteContent(config, result, Object.keys(input) as ContentKey[])
    return result
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Unable to save content' })
  }
})
