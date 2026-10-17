<script setup lang="ts">
const t = useSiteText()
</script>

<template>
  <footer class="site-footer">
    <div class="container footer-inner">
      <NuxtLink v-if="t('header_la_circular')" class="footer-brand" to="/"
        >{{ t('header_la_circular') }}<span v-if="t('footer_text')" aria-hidden="true">{{ t('footer_text') }}</span></NuxtLink
      >
      <p v-if="t('home_subtitle')">{{ t('home_subtitle') }}</p>
      <p v-if="t('footer_a_prop_teu_cada_dia')" class="footer-note">{{ t('footer_a_prop_teu_cada_dia') }}</p>
    </div>
  </footer>
</template>
