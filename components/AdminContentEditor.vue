<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router'
import { contentKeys } from '~/types/content'
import type { ContentKey, SiteContent } from '~/types/content'
import { contentLimits, validateContentInput } from '~/utils/content-validation'

const emit = defineEmits<{
  state: [value: { dirty: boolean; saving: boolean }]
}>()
const draft = ref<SiteContent | null>(null)
const original = ref<SiteContent | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const saved = ref(false)

const groups: Array<{
  title: string
  path: string
  fields: Array<{ key: ContentKey; label: string; rows?: number }>
}> = [
  {
    title: 'Inici',
    path: '/',
    fields: [
      { key: 'home_title', label: 'Títol de la pàgina d’inici' },
      { key: 'home_subtitle', label: 'Subtítol', rows: 2 },
      { key: 'home_text', label: 'Text principal', rows: 5 },
    ],
  },
  {
    title: 'El nostre projecte',
    path: '/el-nostre-projecte',
    fields: [
      { key: 'project_title', label: 'Títol del projecte' },
      { key: 'project_content', label: 'Contingut del projecte', rows: 8 },
    ],
  },
  {
    title: 'Productes',
    path: '/productes',
    fields: [
      { key: 'products_title', label: 'Títol del catàleg' },
      { key: 'products_intro', label: 'Introducció del catàleg', rows: 4 },
    ],
  },
]

const dirty = computed(() =>
  Boolean(
    draft.value &&
    original.value &&
    contentKeys.some((key) => draft.value![key] !== original.value![key]),
  ),
)
watch(
  [dirty, saving],
  ([isDirty, isSaving]) => {
    emit('state', { dirty: isDirty, saving: isSaving })
  },
  { immediate: true },
)
watch(
  draft,
  () => {
    saved.value = false
  },
  { deep: true, flush: 'sync' },
)

function showRequestError(cause: unknown, action: 'load' | 'save') {
  const status = (cause as { statusCode?: number }).statusCode
  if (status === 401) {
    error.value =
      'La sessió ha caducat. Copia els canvis abans de tornar a iniciar la sessió.'
  } else if (status === 403) {
    error.value =
      'No s’ha autoritzat la petició. Torna a obrir el panell des de la web.'
  } else if (status === 413) {
    error.value =
      'La petició és massa gran. Redueix la mida dels textos i torna-ho a provar.'
  } else if (
    status === 415 ||
    (status === 400 &&
      (cause as { data?: { data?: { code?: string } } }).data?.data?.code ===
        'INVALID_JSON')
  ) {
    error.value =
      'No hem pogut llegir la petició de guardat. Copia els canvis, recarrega el panell i torna-ho a provar.'
  } else if (status === 400) {
    error.value =
      'Revisa que tots els camps continguin text i respectin el límit de caràcters.'
  } else {
    error.value =
      action === 'save'
        ? 'No hem pogut confirmar que els canvis s’hagin desat. Els textos es conserven aquí perquè puguis tornar-ho a provar.'
        : 'No hem pogut carregar els textos. Torna-ho a provar.'
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const content = await $fetch<SiteContent>('/api/admin/content')
    draft.value = { ...content }
    original.value = { ...content }
  } catch (cause) {
    showRequestError(cause, 'load')
  } finally {
    loading.value = false
  }
}

async function save() {
  if (!draft.value || saving.value || !dirty.value) return
  error.value = ''
  saved.value = false
  let content: SiteContent
  try {
    content = validateContentInput(draft.value)
  } catch {
    error.value =
      'Omple tots els camps amb text i respecta el límit de caràcters.'
    return
  }
  saving.value = true
  try {
    const result = await $fetch<SiteContent>('/api/admin/content', {
      method: 'POST',
      body: content,
      retry: 0,
    })
    draft.value = { ...result }
    original.value = { ...result }
    clearNuxtData('site-content')
    saved.value = true
  } catch (cause) {
    showRequestError(cause, 'save')
  } finally {
    saving.value = false
  }
}

function beforeUnload(event: BeforeUnloadEvent) {
  if (!dirty.value && !saving.value) return
  event.preventDefault()
  event.returnValue = ''
}
onBeforeRouteLeave(() => {
  if (saving.value) return false
  return (
    !dirty.value ||
    window.confirm('Tens canvis sense desar. Vols sortir igualment?')
  )
})
onMounted(() => {
  window.addEventListener('beforeunload', beforeUnload)
  void load()
})
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
</script>

<template>
  <section class="content-editor" aria-labelledby="content-editor-title">
    <h2 id="content-editor-title">Textos de la web</h2>
    <p>
      Edita els textos i desa els canvis per publicar-los. Pots separar els
      paràgrafs amb salts de línia.
    </p>
    <p v-if="loading" role="status">Carregant els textos…</p>
    <p v-if="error" role="alert" class="admin-error">{{ error }}</p>
    <button
      v-if="!loading && !draft"
      class="button"
      type="button"
      @click="load"
    >
      Torna a carregar els textos
    </button>
    <form v-if="draft" :aria-busy="saving" @submit.prevent="save">
      <fieldset
        v-for="group in groups"
        :key="group.path"
        class="card content-group"
        :disabled="saving"
      >
        <legend>{{ group.title }}</legend>
        <div
          v-for="field in group.fields"
          :key="field.key"
          class="filter-field"
        >
          <label :for="'content-' + field.key">{{ field.label }}</label>
          <textarea
            v-if="field.rows"
            :id="'content-' + field.key"
            v-model="draft[field.key]"
            :name="field.key"
            :rows="field.rows"
            :maxlength="contentLimits[field.key]"
            :aria-describedby="'limit-' + field.key"
            required
          />
          <input
            v-else
            :id="'content-' + field.key"
            v-model="draft[field.key]"
            :name="field.key"
            type="text"
            :maxlength="contentLimits[field.key]"
            :aria-describedby="'limit-' + field.key"
            required
          />
          <p :id="'limit-' + field.key" class="admin-help">
            Màxim {{ contentLimits[field.key] }} caràcters.
          </p>
        </div>
        <a :href="group.path" target="_blank" rel="noopener"
          >Veure la pàgina
          <span class="sr-only">(s’obre en una pestanya nova)</span> ↗</a
        >
      </fieldset>
      <div class="content-save">
        <button class="button" type="submit" :disabled="saving || !dirty">
          {{ saving ? 'Desant…' : 'Desa els canvis' }}
        </button>
        <p role="status">
          {{
            saved
              ? 'Canvis desats. Ja es poden veure a la web.'
              : dirty
                ? 'Tens canvis sense desar.'
                : ''
          }}
        </p>
      </div>
    </form>
  </section>
</template>
