import type { SiteContent } from '~/types/content'

export const fallbackSiteContent: SiteContent = {
  home_title: 'Epa',
  home_subtitle: 'La teva botiga de dietètica de barri.',
  home_text:
    'Un espai proper per cuidar-te cada dia. A La Circular volem acompanyar-te amb una atenció personal i una selecció de productes per al teu benestar.',
  project_title: 'El nostre projecte.',
  project_content:
    'La Circular neix amb la idea de ser una botiga de dietètica propera, arrelada al barri i a les persones que en formen part. Creiem en un tracte de tu a tu, en escoltar i en ajudar-te a trobar opcions que encaixin amb el teu dia a dia.',
  products_title: 'Productes.',
  products_intro:
    'Alimentació, infusions, suplements i cura personal. Descobreix la selecció de La Circular per al teu dia a dia.',
}

export function useSiteContent() {
  return useFetch<SiteContent>('/api/content', {
    key: 'site-content',
    lazy: true,
  })
}
