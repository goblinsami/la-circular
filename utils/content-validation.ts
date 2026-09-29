import { contentKeys } from '../types/content.ts'
import type { SiteContent } from '../types/content'

export const contentLimits: Record<keyof SiteContent, number> = {
  home_title: 200,
  home_subtitle: 500,
  home_text: 10000,
  project_title: 200,
  project_content: 20000,
  products_title: 200,
  products_intro: 2000,
}

export function validateContentInput(input: unknown): SiteContent {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Expected a content object')
  }
  const values = input as Record<string, unknown>
  if (
    Object.keys(values).length !== contentKeys.length ||
    contentKeys.some((key) => !Object.hasOwn(values, key))
  ) {
    throw new Error('Expected exactly the seven content keys')
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
