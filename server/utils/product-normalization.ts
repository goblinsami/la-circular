import type { Product } from '../../types/product'

export interface ProductSheet {
  title: string
  rows: unknown[][]
}

const headers = ['id', 'nom', 'descripcio', 'preu', 'imatge', 'actiu', 'ordre']

function isBlank(value: unknown): boolean {
  return value == null || (typeof value === 'string' && value.trim() === '')
}

function text(value: unknown): string {
  if (isBlank(value)) return ''
  if (typeof value !== 'string') throw new Error('Expected text in product row')
  return value.trim()
}

function activeValue(value: unknown): boolean {
  if (isBlank(value)) return false
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toUpperCase()
    if (normalized === 'TRUE') return true
    if (normalized === 'FALSE') return false
  }
  throw new Error('Invalid actiu value')
}

function optionalNumber(value: unknown, integer = false): number | undefined {
  if (isBlank(value)) return undefined
  let number: number
  if (typeof value === 'number') number = value
  else if (
    typeof value === 'string' &&
    /^\d+(?:[.,]\d+)?$/.test(value.trim())
  ) {
    number = Number(value.trim().replace(',', '.'))
  } else throw new Error('Invalid numeric value')
  if (
    !Number.isFinite(number) ||
    number < 0 ||
    (integer && !Number.isInteger(number))
  ) {
    throw new Error('Invalid numeric value')
  }
  return number
}

export function normalizeProductSheets(
  sheets: readonly ProductSheet[],
): Product[] {
  const products: Product[] = []
  const ids = new Set<string>()

  for (const sheet of sheets) {
    if (sheet.title === 'Continguts') continue
    const header = sheet.rows[0] ?? []
    if (
      header.length !== headers.length ||
      headers.some((name, index) => header[index] !== name)
    ) {
      throw new Error('Invalid product headers')
    }
    for (const row of sheet.rows.slice(1)) {
      // Ignore unused rows that contain only an unchecked checkbox.
      if (!row.some((value, index) => index !== 5 && !isBlank(value))) continue

      const id = text(row[0])
      const nom = text(row[1])
      if (!id || !nom) throw new Error('Product id and name are required')
      if (ids.has(id)) throw new Error('Duplicate product id')
      ids.add(id)

      const actiu = activeValue(row[5])
      if (!actiu) continue

      const descripcio = text(row[2])
      const preu = optionalNumber(row[3])
      const imatge = text(row[4]) || null
      const ordre = optionalNumber(row[6], true)

      products.push({
        id,
        nom,
        categoria: sheet.title,
        actiu,
        ...(descripcio ? { descripcio } : {}),
        ...(preu !== undefined ? { preu } : {}),
        imatge,
        ...(ordre !== undefined ? { ordre } : {}),
      })
    }
  }

  return products.sort((a, b) => (a.ordre ?? Infinity) - (b.ordre ?? Infinity))
}
