export const contentKeys = [
  'home_title',
  'home_subtitle',
  'home_text',
  'project_title',
  'project_content',
  'products_title',
  'products_intro',
] as const

export type ContentKey = (typeof contentKeys)[number]
export type SiteContent = Record<ContentKey, string>
