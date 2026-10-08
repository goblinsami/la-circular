<script setup lang="ts">
const t = useSiteText()
defineProps<{ status: 'idle' | 'pending' | 'success' | 'error' }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <div
    v-if="status === 'idle' || status === 'pending'"
    class="content-status"
    role="status"
  >
    <p>{{ t('common_carregant_els_textos') }}</p>
  </div>
  <div v-else-if="status === 'error'" class="content-status" role="alert">
    <p>{{ t('common_no_hem_pogut_carregar_els_textos_torna') }}</p>
    <button class="button" type="button" @click="$emit('retry')">{{ t('common_torna_a_carregar_els_textos') }}</button>
  </div>
</template>
