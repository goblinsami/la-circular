<script setup lang="ts">
defineProps<{ status: 'idle' | 'pending' | 'success' | 'error' }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <div v-if="status === 'idle' || status === 'pending'" class="content-status" role="status">
    <p>Carregant els textos…</p>
  </div>
  <div v-else-if="status === 'error'" class="content-status" role="alert">
    <p>No hem pogut carregar els textos. Torna-ho a provar d’aquí a uns instants.</p>
    <button class="button" type="button" @click="$emit('retry')">Torna a carregar els textos</button>
  </div>
</template>