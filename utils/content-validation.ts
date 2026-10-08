import { contentKeys, contentFields } from '../types/content.ts'
import type { SiteContent } from '../types/content'

export const contentLimits = Object.fromEntries(contentFields.map(field => [field.key, field.limit])) as Record<keyof SiteContent, number>

export function validateContentInput(input: unknown): SiteContent {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Expected a content object')
  }
  const values = input as Record<string, unknown>
  if (
    Object.keys(values).length !== contentKeys.length ||
    contentKeys.some((key) => !Object.hasOwn(values, key))
  ) {
    throw new Error('Expected exactly the editable content keys')
  }

  const content = {} as SiteContent
  for (const key of contentKeys) {
    const value = values[key]
    if (typeof value !== 'string') throw new Error('Expected text')
    const normalized = value.replace(/\r\n?/g, '\n').trim()
    if (!normalized || normalized.length > contentLimits[key]) {
      throw new Error('Empty or oversized content')
    }
    content[key] = normalized
  }
  return content
}
