import { JWT } from 'google-auth-library'
import type { ProductSheet } from './product-normalization'

interface SheetsConfig {
  googleSheetId: string
  googleServiceAccountEmail: string
  googlePrivateKey: string
}

interface SheetsMetadata {
  sheets?: Array<{
    properties: {
      title: string
      sheetType: string
      gridProperties?: { rowCount: number }
    }
  }>
}

interface SheetsValues {
  valueRanges?: Array<{ values?: unknown[][] }>
}

function createSheetsClient(config: SheetsConfig): JWT {
  return new JWT({
    email: config.googleServiceAccountEmail,
    key: config.googlePrivateKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    transporterOptions: { timeout: 10000, retry: false },
  })
}

function spreadsheetUrl(config: SheetsConfig): string {
  return 'https://sheets.googleapis.com/v4/spreadsheets/' + encodeURIComponent(config.googleSheetId)
}

export async function readProductSheets(
  config: SheetsConfig,
): Promise<ProductSheet[]> {
  const client = createSheetsClient(config)
  const base = spreadsheetUrl(config)
  const metadataUrl = new URL(base)
  metadataUrl.searchParams.set(
    'fields',
    'sheets(properties(title,sheetType,gridProperties(rowCount)))',
  )
  const { data: metadata } = await client.request<SheetsMetadata>({
    url: metadataUrl.href,
    timeout: 10000,
    retry: false,
  })
  const sheets = (metadata.sheets ?? [])
    .map((sheet) => sheet.properties)
    .filter(
      (sheet) => sheet.sheetType === 'GRID' && sheet.title !== 'Continguts',
    )

  if (!sheets.length) throw new Error('No product sheets found')

  const valuesUrl = new URL(base + '/values:batchGet')
  valuesUrl.searchParams.set('valueRenderOption', 'UNFORMATTED_VALUE')
  for (const sheet of sheets) {
    const quotedTitle = "'" + sheet.title.replace(/'/g, "''") + "'"
    valuesUrl.searchParams.append(
      'ranges',
      quotedTitle + '!A1:G' + sheet.gridProperties!.rowCount,
    )
  }

  const { data } = await client.request<SheetsValues>({
    url: valuesUrl.href,
    timeout: 10000,
    retry: false,
  })
  if (data.valueRanges?.length !== sheets.length)
    throw new Error('Incomplete Sheets response')

  return sheets.map((sheet, index) => ({
    title: sheet.title,
    rows: data.valueRanges![index]!.values ?? [],
  }))
}

export async function readContentRows(config: SheetsConfig): Promise<unknown[][]> {
  const client = createSheetsClient(config)
  const range = encodeURIComponent("'Continguts'!A1:B1000")
  const url = new URL(spreadsheetUrl(config) + '/values/' + range)
  url.searchParams.set('valueRenderOption', 'UNFORMATTED_VALUE')
  const { data } = await client.request<{ values?: unknown[][] }>({
    url: url.href,
    timeout: 10000,
    retry: false,
  })
  return data.values ?? []
}
