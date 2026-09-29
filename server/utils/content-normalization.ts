import { contentKeys } from '../../types/content.ts'
import type { ContentKey, SiteContent } from '../../types/content'

function isContentKey(value: unknown): value is ContentKey {
  return typeof value === 'string' && contentKeys.some(key => key === value)
}

export function normalizeContentRows(rows: unknown[][]): SiteContent {
  const header = rows[0] ?? []
  if (header.length !== 2 || header[0] !== 'clau' || header[1] !== 'valor') {
    throw new Error('Invalid content headers')
  }

  const content: Partial<SiteContent> = {}
  for (const row of rows.slice(1)) {
    const key = typeof row[0] === 'string' ? row[0].trim() : row[0]
    // Only the seven public fields are exposed, even if other rows exist.
    if (!isContentKey(key)) continue
    if (key in content) throw new Error('Duplicate content key')
    if (typeof row[1] !== 'string' || !row[1].trim()) {
      throw new Error('Content values must be non-empty text')
    }
    content[key] = row[1].replace(/\r\n?/g, '\n').trim()
  }

  if (contentKeys.some(key => !(key in content))) {
    throw new Error('Missing content key')
  }
  return content as SiteContent
}