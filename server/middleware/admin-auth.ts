import { getSettings, getUser, verifyRequestOrigin } from '@netlify/identity'
import { isLocalAdminRequest, hasLocalWriteOrigin } from '../utils/local-admin'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (path !== '/api/admin' && !path.startsWith('/api/admin/')) return

  setHeader(event, 'Cache-Control', 'private, no-store')
  setHeader(event, 'Netlify-CDN-Cache-Control', 'no-store')
  const requestUrl = getRequestURL(event, { xForwardedHost: false, xForwardedProto: false })
  if (isLocalAdminRequest(import.meta.dev === true, requestUrl, event.node.req.socket.remoteAddress)) {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(event.method) && !hasLocalWriteOrigin(requestUrl, getHeader(event, 'origin'))) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }
    event.context.adminUser = { id: 'local-development', email: 'desenvolupament@localhost' }
    return
  }
  const user = await getUser()
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  let inviteOnly = false
  try {
    inviteOnly = (await getSettings()).disableSignup
  } catch {
    // Fail closed if the required registration policy cannot be verified.
  }
  if (!inviteOnly) {
    throw createError({ statusCode: 503, statusMessage: 'Admin unavailable' })
  }

  // Cookie-authenticated writes must also come from this site's origin.
  if (!['GET', 'HEAD', 'OPTIONS'].includes(event.method)) {
    try {
      // Check headers only: toWebRequest(event) consumes the streamed body in Netlify.
      const origin = getHeader(event, 'origin')
      verifyRequestOrigin(
        new Request(getRequestURL(event), {
          headers: origin ? { origin } : undefined,
        }),
      )
    } catch {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }
  }
  event.context.adminUser = { id: user.id, email: user.email }
})
