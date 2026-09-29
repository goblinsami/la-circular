export interface Product {
  id: string
  nom: string
  categoria: string
  descripcio?: string
  preu?: number
  imatge?: string | null
  actiu: boolean
  ordre?: number
}
