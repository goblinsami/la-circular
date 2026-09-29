import type { AdminUser } from '~/types/admin'

export default defineEventHandler((event): AdminUser => {
  // The admin middleware validates Identity on every request.
  const user = event.context.adminUser as AdminUser | undefined
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return user
})
