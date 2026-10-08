import { JWT } from 'google-auth-library'
import type { SiteContent } from '../../types/content'
import { prepareContentUpdate } from './content-update'
import {
  normalizeAdminProductSheets,
  type ProductSheet,
} from './product-normalization'

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

function createSheetsClient(config: SheetsConfig, writable = false): JWT {
  return new JWT({
    email: config.googleServiceAccountEmail,
    key: config.googlePrivateKey.replace(/\\n/g, '\n'),
    scopes: [
      writable
        ? 'https://www.googleapis.com/auth/spreadsheets'
        : 'https://www.googleapis.com/auth/spreadsheets.readonly',
    ],
    transporterOptions: { timeout: 10000, retry: false },
  })
}

function spreadsheetUrl(config: SheetsConfig): string {
  return (
    'https://sheets.googleapis.com/v4/spreadsheets/' +
    encodeURIComponent(config.googleSheetId)
  )
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

export async function readAdminProducts(config: SheetsConfig) {
  return normalizeAdminProductSheets(await readProductSheets(config))
}

export async function writeProductImage(
  config: SheetsConfig,
  productId: string,
  imageUrl: string,
): Promise<string> {
  const sheets = await readProductSheets(config)
  let location: { title: string; rowNumber: number } | undefined
  let previousImage = ''

  for (const sheet of sheets) {
    const header = sheet.rows[0] ?? []
    if (
      header.length !== 7 ||
      ['id', 'nom', 'descripcio', 'preu', 'imatge', 'actiu', 'ordre'].some(
        (name, index) => header[index] !== name,
      )
    ) {
      throw new Error('Invalid product headers')
    }
    for (let index = 1; index < sheet.rows.length; index++) {
      const row = sheet.rows[index]!
      if (typeof row[0] !== 'string' || row[0].trim() !== productId) continue
      if (location) throw new Error('Duplicate product id')
      location = { title: sheet.title, rowNumber: index + 1 }
      const cell = row[4]
      if (cell != null && typeof cell !== 'string')
        throw new Error('Invalid product image')
      previousImage = typeof cell === 'string' ? cell.trim() : ''
    }
  }
  if (!location) throw new Error('Product not found')

  const quotedTitle = "'" + location.title.replace(/'/g, "''") + "'"
  const client = createSheetsClient(config, true)
  const { data } = await client.request<{ totalUpdatedCells?: number }>({
    url: spreadsheetUrl(config) + '/values:batchUpdate',
    method: 'POST',
    data: {
      valueInputOption: 'RAW',
      data: [
        {
          range: `${quotedTitle}!E${location.rowNumber}`,
          values: [[imageUrl]],
        },
      ],
    },
    timeout: 10000,
    retry: false,
  })
  if (data.totalUpdatedCells !== 1) throw new Error('Incomplete image update')
  return previousImage
}

export async function readContentRows(
  config: SheetsConfig,
): Promise<unknown[][]> {
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

export async function writeSiteContent(
  config: SheetsConfig,
  content: SiteContent,
): Promise<void> {
  const rows = await readContentRows(config)
  const body = prepareContentUpdate(rows, content)
  const client = createSheetsClient(config, true)
  const { data } = await client.request<{ totalUpdatedCells?: number }>({
    url: spreadsheetUrl(config) + '/values:batchUpdate',
    method: 'POST',
    data: body,
    timeout: 10000,
    retry: false,
  })
  const expectedCells = body.data.reduce((total, update) => total + update.values[0]!.length, 0)
  if (data.totalUpdatedCells !== expectedCells) throw new Error('Incomplete content update')
}
