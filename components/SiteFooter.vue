<script setup lang="ts">
const t = useSiteText()
</script>

<template>
  <footer class="site-footer">
    <div class="container footer-inner">
      <NuxtLink class="footer-brand" to="/"
        >{{ t('header_la_circular') }}<span aria-hidden="true">{{ t('footer_text') }}</span></NuxtLink
      >
      <p>{{ t('home_subtitle') }}</p>
      <p class="footer-note">{{ t('footer_a_prop_teu_cada_dia') }}</p>
    </div>
  </footer>
</template>
