<script setup lang="ts">
const t = useSiteText()
defineProps<{ status: 'idle' | 'pending' | 'success' | 'error' }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <div
    v-if="(status === 'idle' || status === 'pending') && t('common_carregant_els_textos')"
    class="content-status"
    role="status"
  >
    <p v-if="t('common_carregant_els_textos')">{{ t('common_carregant_els_textos') }}</p>
  </div>
  <div v-else-if="status === 'error' && (t('common_no_hem_pogut_carregar_els_textos_torna') || t('common_torna_a_carregar_els_textos'))" class="content-status" role="alert">
    <p v-if="t('common_no_hem_pogut_carregar_els_textos_torna')">{{ t('common_no_hem_pogut_carregar_els_textos_torna') }}</p>
    <button v-if="t('common_torna_a_carregar_els_textos')" class="button" type="button" @click="$emit('retry')">{{ t('common_torna_a_carregar_els_textos') }}</button>
  </div>
</template>
