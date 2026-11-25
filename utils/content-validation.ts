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
    if (normalized.length > contentLimits[key]) {
      throw new Error('Oversized content')
    }
    if ((key === 'home_image' || key === 'project_image') && normalized) {
      const url = new URL(normalized)
      if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com' || !/^\/[^/]+\/image\/upload\//.test(url.pathname) || url.username || url.password) {
        throw new Error('Expected a Cloudinary image URL')
      }
    }
    content[key] = normalized
  }
  return content
}
