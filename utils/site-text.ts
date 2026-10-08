export function formatSiteText(text: string, params: Record<string, string | number> = {}): string {
  return text.replace(/\{(\w+)\}/g, (placeholder, name: string) => Object.hasOwn(params, name) ? String(params[name]) : placeholder)
}
