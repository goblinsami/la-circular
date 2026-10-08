<script setup lang="ts">
const t = useSiteText()
import { onBeforeRouteLeave } from 'vue-router'
import { contentKeys, contentFields } from '~/types/content'
import type { SiteContent } from '~/types/content'
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
const sharedContent = useNuxtData<SiteContent>('site-content')

const groups = computed(() => [...new Set(contentFields.map(field => field.group))].map(group => ({
  id: group,
  title: t(group === 'home' ? 'editor_group_home' : group === 'project' ? 'editor_group_project' : group === 'products' ? 'editor_group_products' : group === 'header' ? 'editor_group_header' : group === 'footer' ? 'editor_group_footer' : group === 'common' ? 'editor_group_common' : 'editor_group_admin'),
  path: group === 'project' ? '/el-nostre-projecte' : group === 'products' ? '/productes' : group === 'admin' ? '/admin' : '/',
  fields: contentFields.filter(field => field.group === group).map(field => ({ key: field.key, rows: field.limit > 500 ? 4 : undefined })),
})))

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
      t('admin_la_sessio_ha_caducat_copia_els_canvis')
  } else if (status === 403) {
    error.value =
      t('admin_no_s_ha_autoritzat_la_peticio_torna')
  } else if (status === 413) {
    error.value =
      t('admin_la_peticio_es_massa_gran_redueix_la')
  } else if (
    status === 415 ||
    (status === 400 &&
      (cause as { data?: { data?: { code?: string } } }).data?.data?.code ===
        'INVALID_JSON')
  ) {
    error.value =
      t('admin_no_hem_pogut_llegir_la_peticio_de')
  } else if (status === 400) {
    error.value =
      t('admin_revisa_que_tots_els_camps_continguin_text')
  } else {
    error.value =
      action === 'save'
        ? t('admin_no_hem_pogut_confirmar_que_els_canvis')
        : t('admin_no_hem_pogut_carregar_els_textos_torna')
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
      t('admin_omple_tots_els_camps_amb_text_i')
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
    sharedContent.data.value = result
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
    window.confirm(t('admin_tens_canvis_sense_desar_vols_sortir_igualment'))
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
    <h2 id="content-editor-title">{{ t('admin_textos_de_la_web') }}</h2>
    <p>{{ t('admin_edita_els_textos_i_desa_els_canvis') }}</p>
    <p v-if="loading" role="status">{{ t('common_carregant_els_textos') }}</p>
    <p v-if="error" role="alert" class="admin-error">{{ error }}</p>
    <button
      v-if="!loading && !draft"
      class="button"
      type="button"
      @click="load"
    >{{ t('common_torna_a_carregar_els_textos') }}</button>
    <form v-if="draft" :aria-busy="saving" @submit.prevent="save">
      <fieldset
        v-for="group in groups"
        :key="group.id"
        class="card content-group"
        :disabled="saving"
      >
        <legend>{{ group.title }}</legend>
        <div
          v-for="field in group.fields"
          :key="field.key"
          class="filter-field"
        >
          <label :for="'content-' + field.key">{{ t(field.key).slice(0, 90) }} <code>{{ field.key }}</code></label>
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
            {{ t('editor_limit', { limit: contentLimits[field.key] }) }}
          </p>
        </div>
        <a :href="group.path" target="_blank" rel="noopener"
          >{{ t('admin_veure_la_pagina') }}<span class="sr-only">{{ t('admin_s_obre_en_una_pestanya_nova') }}</span>{{ t('home_text_2') }}</a
        >
      </fieldset>
      <div class="content-save">
        <button class="button" type="submit" :disabled="saving || !dirty">
          {{ saving ? t('admin_desant') : t('admin_desa_els_canvis') }}
        </button>
        <p role="status">
          {{
            saved
              ? t('admin_canvis_desats_ja_es_poden_veure_a')
              : dirty
                ? t('admin_tens_canvis_sense_desar')
                : ''
          }}
        </p>
      </div>
    </form>
  </section>
</template>
