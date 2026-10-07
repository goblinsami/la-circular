import { getSettings, getUser, verifyRequestOrigin } from '@netlify/identity'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (path !== '/api/admin' && !path.startsWith('/api/admin/')) return

  setHeader(event, 'Cache-Control', 'private, no-store')
  setHeader(event, 'Netlify-CDN-Cache-Control', 'no-store')
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
