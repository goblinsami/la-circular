const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]'])
const loopbackAddresses = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1'])

export function isLocalAdminRequest(development: boolean, url: URL, remoteAddress: string | undefined): boolean {
  // Nuxt's dev proxy uses a local named pipe, which has no remoteAddress.
  return development && loopbackHosts.has(url.hostname) && (remoteAddress === undefined || loopbackAddresses.has(remoteAddress))
}

export function hasLocalWriteOrigin(url: URL, origin: string | undefined): boolean {
  return Boolean(origin && origin === url.origin)
}
