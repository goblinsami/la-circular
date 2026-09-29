import { contentKeys } from '../../types/content.ts'
import type { SiteContent } from '../../types/content'
import { normalizeContentRows } from './content-normalization.ts'

export function prepareContentUpdate(rows: unknown[][], content: SiteContent) {
  // Validate the existing sheet before deriving row numbers from its keys.
  // Never assume that the seven rows are consecutive or in a fixed order.
  normalizeContentRows(rows)
  return {
    valueInputOption: 'RAW',
    data: contentKeys.map((key) => {
      const index = rows.findIndex(
        (row, rowIndex) =>
          rowIndex > 0 && typeof row[0] === 'string' && row[0].trim() === key,
      )
      return {
        range: "'Continguts'!B" + (index + 1),
        values: [[content[key]]],
      }
    }),
  }
}
