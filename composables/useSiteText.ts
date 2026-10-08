import { defaultSiteContent } from '~/types/content'
import type { ContentKey, SiteContent } from '~/types/content'
import { formatSiteText } from '~/utils/site-text'

export function useSiteText() {
  const { data } = useNuxtData<SiteContent>('site-content')
  return (key: ContentKey, params: Record<string, string | number> = {}) =>
    formatSiteText(data.value?.[key] ?? defaultSiteContent[key], params)
}
