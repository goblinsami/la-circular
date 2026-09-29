import type { SiteContent } from '~/types/content'

export function useSiteContent() {
  return useFetch<SiteContent>('/api/content', {
    key: 'site-content',
    lazy: true,
  })
}
