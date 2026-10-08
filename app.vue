<script setup lang="ts">
await useSiteContent()
const t = useSiteText()
useHead(() => ({ title: t('site_title') }))
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
