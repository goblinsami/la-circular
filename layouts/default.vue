<script setup lang="ts">
const t = useSiteText()
</script>

<template>
  <div class="site-shell">
    <a class="skip-link" href="#contingut">{{ t('common_salta_al_contingut') }}</a>
    <SiteHeader />
    <main id="contingut" tabindex="-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
