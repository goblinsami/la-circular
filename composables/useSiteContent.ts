import type { SiteContent } from '~/types/content'
import { getSessionCachedData } from '~/utils/session-cache'
export { defaultSiteContent as fallbackSiteContent } from '~/types/content'

export function useSiteContent() {
  return useFetch<SiteContent>('/api/content', {
    key: 'site-content',
    lazy: true,
    dedupe: 'defer',
    getCachedData: getSessionCachedData<SiteContent>,
  })
}
