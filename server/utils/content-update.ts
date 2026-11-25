import { contentKeys } from '../../types/content.ts'
import type { SiteContent, ContentKey } from '../../types/content'
import { normalizeContentRows } from './content-normalization.ts'

export function prepareContentUpdate(rows: unknown[][], content: SiteContent, keys: readonly ContentKey[] = contentKeys) {
  // Validate the existing sheet before deriving row numbers from its keys.
  // Never assume rows are consecutive or in a fixed order.
  normalizeContentRows(rows)
  let nextRow = rows.length + 1
  return {
    valueInputOption: 'RAW',
    data: keys.map((key) => {
      const index = rows.findIndex(
        (row, rowIndex) =>
          rowIndex > 0 && typeof row[0] === 'string' && row[0].trim() === key,
      )
      if (index === -1) {
        const rowNumber = nextRow++
        return { range: "'Continguts'!A" + rowNumber + ':B' + rowNumber, values: [[key, content[key]]] }
      }
      return { range: "'Continguts'!B" + (index + 1), values: [[content[key]]] }
    }),
  }
}
