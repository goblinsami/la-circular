import type { Product } from '../types/product'

function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
}

export function getVisibleProducts(
  products: readonly Product[],
  search = '',
  category = '',
): Product[] {
  const query = normalizeSearch(search)

  return (
    products
      .filter(
        (product) =>
          product.actiu &&
          (!category || product.categoria === category) &&
          normalizeSearch(product.nom).includes(query),
      )
      // Els productes sense ordre van al final; els empats mantenen l'ordre original.
      .sort((a, b) => (a.ordre ?? Infinity) - (b.ordre ?? Infinity))
  )
}
