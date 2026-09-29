<script setup lang="ts">
const {
  user,
  isAuthenticated,
  ready,
  available,
  busy,
  error,
  hasInvite,
  initialize,
  login,
  logout,
  completeInvite,
} = useAdminAuth()
const email = ref('')
const password = ref('')
const confirmation = ref('')
const editorState = ref({ dirty: false, saving: false })

async function signOut() {
  if (editorState.value.saving) return
  if (
    editorState.value.dirty &&
    !window.confirm('Tens canvis sense desar. Vols tancar la sessió igualment?')
  )
    return
  await logout()
}

useHead({
  title: 'Administració · La Circular',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'referrer', content: 'no-referrer' },
  ],
})

onMounted(initialize)

async function submit() {
  if (hasInvite.value && password.value !== confirmation.value) {
    error.value = 'Les contrasenyes no coincideixen.'
    return
  }
  const success = hasInvite.value
    ? await completeInvite(password.value)
    : await login(email.value, password.value)
  password.value = ''
  confirmation.value = ''
  if (success) email.value = ''
}
</script>

<template>
  <div class="container page-section">
    <section
      class="admin-section"
      :class="{ 'admin-section-wide': isAuthenticated }"
      aria-labelledby="admin-title"
    >
      <p class="eyebrow">La Circular</p>
      <h1 id="admin-title">Administració</h1>
      <p v-if="!ready" role="status">Comprovant l'accés…</p>
      <template v-else>
        <p v-if="error" role="alert" class="admin-error">{{ error }}</p>
        <template v-if="isAuthenticated && !hasInvite"
          ><div class="card admin-panel">
            <h2>Sessió iniciada</h2>
            <p class="admin-email">{{ user?.email }}</p>
            <p>Benvingut a l'espai d'administració de La Circular.</p>
            <button
              class="button"
              type="button"
              :disabled="busy || editorState.saving"
              @click="signOut"
            >
              {{ busy ? 'Tancant la sessió…' : 'Tanca la sessió' }}
            </button>
          </div>
          <AdminContentEditor @state="editorState = $event"
        /></template>
        <template v-else-if="available">
          <p class="lead">
            {{
              hasInvite
                ? 'Activa el teu accés amb una contrasenya.'
                : 'Accés reservat a les persones convidades.'
            }}
          </p>
          <form
            class="card admin-form"
            :aria-busy="busy"
            @submit.prevent="submit"
          >
            <div v-if="!hasInvite" class="filter-field">
              <label for="admin-email">Correu electrònic</label>
              <input
                id="admin-email"
                v-model="email"
                name="email"
                type="email"
                autocomplete="username"
                required
                :disabled="busy"
              />
            </div>
            <div class="filter-field">
              <label for="admin-password">{{
                hasInvite ? 'Crea una contrasenya' : 'Contrasenya'
              }}</label>
              <input
                id="admin-password"
                v-model="password"
                name="password"
                type="password"
                :autocomplete="hasInvite ? 'new-password' : 'current-password'"
                :minlength="hasInvite ? 8 : undefined"
                required
                :disabled="busy"
                :aria-describedby="hasInvite ? 'password-help' : undefined"
              />
              <p v-if="hasInvite" id="password-help" class="admin-help">
                Fes servir almenys 8 caràcters.
              </p>
            </div>
            <div v-if="hasInvite" class="filter-field">
              <label for="admin-confirmation">Repeteix la contrasenya</label>
              <input
                id="admin-confirmation"
                v-model="confirmation"
                type="password"
                autocomplete="new-password"
                minlength="8"
                required
                :disabled="busy"
              />
            </div>
            <button class="button" type="submit" :disabled="busy">
              {{
                busy
                  ? 'Un moment…'
                  : hasInvite
                    ? "Activa l'accés"
                    : 'Inicia la sessió'
              }}
            </button>
          </form>
        </template>
        <button
          v-else
          class="button"
          type="button"
          @click="ready && initialize()"
        >
          Torna-ho a provar
        </button>
      </template>
      <NuxtLink class="admin-back" to="/">Torna a la web</NuxtLink>
    </section>
  </div>
</template>
