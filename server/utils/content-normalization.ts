import { contentKeys, defaultSiteContent } from '../../types/content.ts'
import type { ContentKey, SiteContent } from '../../types/content'

function isContentKey(value: unknown): value is ContentKey {
  return typeof value === 'string' && contentKeys.some((key) => key === value)
}

export function normalizeContentRows(rows: unknown[][]): SiteContent {
  const header = rows[0] ?? []
  if (header.length !== 2 || header[0] !== 'clau' || header[1] !== 'valor') {
    throw new Error('Invalid content headers')
  }

  const content: Partial<SiteContent> = {}
  for (const row of rows.slice(1)) {
    const key = typeof row[0] === 'string' ? row[0].trim() : row[0]
    // Expose only keys from the shared editable text inventory.
    if (!isContentKey(key)) continue
    if (key in content) throw new Error('Duplicate content key')
    if (row[1] != null && !['string', 'number', 'boolean'].includes(typeof row[1])) {
      throw new Error('Content values must be text')
    }
    content[key] = String(row[1] ?? '').replace(/\r\n?/g, '\n').trim()
  }

  // Missing rows use defaults; explicitly empty cells remain empty.
  return { ...defaultSiteContent, ...content }
}
