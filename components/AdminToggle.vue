<script setup lang="ts">
const props = withDefaults(defineProps<{ title: string; panelId: string; defaultOpen?: boolean }>(), { defaultOpen: false })
const expanded = ref(props.defaultOpen)
const opened = ref(props.defaultOpen)
function toggle() {
  opened.value = true
  expanded.value = !expanded.value
}
</script>

<template>
  <div class="admin-texts-section">
    <button class="admin-texts-toggle" type="button" :aria-expanded="expanded" :aria-controls="panelId" @click="toggle">
      {{ title }}
    </button>
    <div v-if="opened" v-show="expanded" :id="panelId">
      <slot />
    </div>
  </div>
</template>
