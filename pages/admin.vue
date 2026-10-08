<script setup lang="ts">
const t = useSiteText()
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
    !window.confirm(t('admin_tens_canvis_sense_desar_vols_tancar_la'))
  )
    return
  await logout()
}

useHead(() => ({
  title: t('admin_administracio_la_circular'),
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'referrer', content: 'no-referrer' },
  ],
}))

onMounted(initialize)

async function submit() {
  if (hasInvite.value && password.value !== confirmation.value) {
    error.value = t('admin_les_contrasenyes_no_coincideixen')
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
      <p class="eyebrow">{{ t('header_la_circular') }}</p>
      <h1 id="admin-title">{{ t('admin_administracio') }}</h1>
      <p v-if="!ready" role="status">{{ t('admin_comprovant_l_acces') }}</p>
      <template v-else>
        <p v-if="error" role="alert" class="admin-error">{{ error }}</p>
        <template v-if="isAuthenticated && !hasInvite"
          ><div class="card admin-panel">
            <h2>{{ t('admin_sessio_iniciada') }}</h2>
            <p class="admin-email">{{ user?.email }}</p>
            <p>{{ t('admin_benvingut_a_l_espai_d_administracio_de') }}</p>
            <button
              class="button"
              type="button"
              :disabled="busy || editorState.saving"
              @click="signOut"
            >
              {{ busy ? t('admin_tancant_la_sessio') : t('admin_tanca_la_sessio') }}
            </button>
          </div>
          <AdminContentEditor @state="editorState = $event" />
          <AdminImageEditor />
        </template>
        <template v-else-if="available">
          <p class="lead">
            {{
              hasInvite
                ? t('admin_activa_el_teu_acces_amb_una_contrasenya')
                : t('admin_acces_reservat_a_les_persones_convidades')
            }}
          </p>
          <form
            class="card admin-form"
            :aria-busy="busy"
            @submit.prevent="submit"
          >
            <div v-if="!hasInvite" class="filter-field">
              <label for="admin-email">{{ t('admin_correu_electronic') }}</label>
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
                hasInvite ? t('admin_crea_una_contrasenya') : t('admin_password')
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
              <p v-if="hasInvite" id="password-help" class="admin-help">{{ t('admin_fes_servir_almenys_8_caracters') }}</p>
            </div>
            <div v-if="hasInvite" class="filter-field">
              <label for="admin-confirmation">{{ t('admin_repeteix_la_contrasenya') }}</label>
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
                  ? t('admin_un_moment')
                  : hasInvite
                    ? t('admin_activa_l_acces')
                    : t('admin_inicia_la_sessio')
              }}
            </button>
          </form>
        </template>
        <button
          v-else
          class="button"
          type="button"
          @click="ready && initialize()"
        >{{ t('products_torna_ho_a_provar') }}</button>
      </template>
      <NuxtLink class="admin-back" to="/">{{ t('admin_torna_a_la_web') }}</NuxtLink>
    </section>
  </div>
</template>
