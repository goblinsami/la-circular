<script setup lang="ts">
const t = useSiteText()
const props = defineProps<{ modelValue: string; page: 'home' | 'project' }>()
const emit = defineEmits<{ 'update:modelValue': [value: string]; busy: [value: boolean] }>()
const uploading = ref(false)
const error = ref('')
const input = ref<HTMLInputElement | null>(null)

async function upload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  error.value = ''
  if (file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    error.value = t('admin_fes_servir_una_imatge_jpg_png_o')
    return
  }
  uploading.value = true
  emit('busy', true)
  try {
    const body = new FormData()
    body.append('page', props.page)
    body.append('image', file)
    const result = await $fetch<{ url: string }>('/api/admin/page-image', { method: 'POST', body, retry: 0 })
    emit('update:modelValue', result.url)
  } catch {
    error.value = t('admin_no_hem_pogut_desar_la_imatge_comprova')
  } finally {
    uploading.value = false
    emit('busy', false)
    if (input.value) input.value.value = ''
  }
}
</script>

<template>
  <div class="admin-page-image" :aria-busy="uploading">
    <img v-if="modelValue" :src="modelValue" :alt="t('admin_page_image_preview')" />
    <p v-else>{{ t('admin_page_image_default') }}</p>
    <label :for="'page-image-' + page">{{ t(modelValue ? 'admin_canvia_la_imatge' : 'admin_selecciona_una_imatge') }}</label>
    <input :id="'page-image-' + page" ref="input" type="file" accept="image/jpeg,image/png,image/webp" :disabled="uploading" @change="upload" />
    <button v-if="modelValue" type="button" class="filter-reset" :disabled="uploading" @click="emit('update:modelValue', '')">{{ t('admin_page_image_reset') }}</button>
    <p class="admin-help">{{ t('admin_page_image_help') }}</p>
    <p v-if="uploading" role="status">{{ t('admin_page_image_uploading') }}</p>
    <p v-if="error" role="alert" class="admin-error">{{ error }}</p>
  </div>
</template>
