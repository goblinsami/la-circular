import {
  acceptInvite,
  getSettings,
  getUser as getIdentityUser,
  handleAuthCallback,
  login as identityLogin,
  logout as identityLogout,
  onAuthChange,
} from '@netlify/identity'
import type { AdminUser } from '~/types/admin'

export function useAdminAuth() {
  const user = useState<AdminUser | null>('admin-user', () => null)
  const ready = ref(false)
  const available = ref(false)
  const busy = ref(false)
  const error = ref('')
  const inviteToken = ref('')
  let unsubscribe: (() => void) | undefined
  let requestVersion = 0

  async function getUser() {
    const version = ++requestVersion
    try {
      const verified = await $fetch<AdminUser>('/api/admin/session')
      if (version === requestVersion) user.value = verified
    } catch (cause) {
      if (version === requestVersion) user.value = null
      const status = (cause as { statusCode?: number }).statusCode
      if (status !== 401) throw cause
    }
    return user.value
  }

  async function initialize() {
    ready.value = false
    available.value = false
    user.value = null
    unsubscribe?.()
    error.value = ''
    try {
      const settings = await getSettings()
      if (!settings.disableSignup) {
        error.value = "L'accés d'administració encara no està configurat."
        return
      }
      available.value = true
      if (
        new URLSearchParams(window.location.hash.slice(1)).has('invite_token')
      ) {
        const callback = await handleAuthCallback()
        if (callback?.type === 'invite')
          inviteToken.value = callback.token ?? ''
      }
      await getIdentityUser()
      await getUser()
      unsubscribe = onAuthChange((_event, identityUser) => {
        if (!identityUser) {
          requestVersion++
          user.value = null
        } else {
          void getUser().catch(() => {
            error.value = 'No hem pogut comprovar la sessió. Torna-ho a provar.'
          })
        }
      })
    } catch {
      error.value =
        "No podem connectar amb el servei d'accés. Torna-ho a provar més tard."
    } finally {
      ready.value = true
    }
  }

  async function login(email: string, password: string) {
    busy.value = true
    error.value = ''
    try {
      await identityLogin(email.trim(), password)
      await getUser()
      if (!user.value) throw new Error('Session rejected')
      return true
    } catch {
      error.value =
        'No hem pogut iniciar la sessió. Comprova el correu i la contrasenya i torna-ho a provar.'
      return false
    } finally {
      busy.value = false
    }
  }

  async function completeInvite(password: string) {
    busy.value = true
    error.value = ''
    try {
      const invitedUser = await acceptInvite(inviteToken.value, password)
      // Establish the server cookie through the official login flow as well.
      // acceptInvite in Identity 2.0 does not set it in the browser.
      if (!invitedUser.email) throw new Error('Missing invited email')
      await identityLogin(invitedUser.email, password)
      inviteToken.value = ''
      await getUser()
      if (!user.value) throw new Error('Session rejected')
      return true
    } catch {
      error.value =
        "No hem pogut activar l'accés. Comprova la contrasenya o demana una nova invitació."
      return false
    } finally {
      busy.value = false
    }
  }

  async function logout() {
    busy.value = true
    error.value = ''
    try {
      await identityLogout()
      requestVersion++
      user.value = null
    } catch {
      error.value = 'No hem pogut tancar la sessió. Torna-ho a provar.'
    } finally {
      busy.value = false
    }
  }

  onScopeDispose(() => {
    requestVersion++
    unsubscribe?.()
  })

  return {
    user: readonly(user),
    isAuthenticated: computed(() => user.value !== null),
    ready: readonly(ready),
    available: readonly(available),
    busy: readonly(busy),
    error,
    hasInvite: computed(() => inviteToken.value !== ''),
    initialize,
    getUser,
    login,
    logout,
    completeInvite,
  }
}
