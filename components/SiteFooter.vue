<script setup lang="ts">
const t = useSiteText()

const fundingLogos = [
  {
    src: '/images/financament/generalitat-catalunya-empresa-treball.jpeg',
    alt: 'Generalitat de Catalunya. Departament d’Empresa i Treball',
    width: 490,
    height: 100,
  },
  {
    src: '/images/financament/cofinancat-unio-europea.jpeg',
    alt: 'Cofinançat per la Unió Europea',
    width: 1600,
    height: 360,
  },
  {
    src: '/images/financament/ministerio-trabajo-economia-social-sepe.jpeg',
    alt: 'Ministerio de Trabajo y Economía Social. Servicio Público de Empleo Estatal (SEPE)',
    width: 1600,
    height: 441,
  },
  {
    src: '/images/financament/sistema-nacional-garantia-juvenil.jpeg',
    alt: 'Sistema Nacional de Garantía Juvenil',
    width: 1471,
    height: 500,
  },
]
</script>

<template>
  <footer class="site-footer">
    <div class="container footer-inner">
      <NuxtLink v-if="t('header_la_circular')" class="footer-brand" to="/"
        >{{ t('header_la_circular') }}<span v-if="t('footer_text')" aria-hidden="true">{{ t('footer_text') }}</span></NuxtLink
      >
      <p v-if="t('home_subtitle')">{{ t('home_subtitle') }}</p>
    </div>
    <section class="container footer-funding" :aria-label="t('footer_funding_label')" lang="ca">
      <h2 class="footer-funding-heading">{{ t('footer_funding_heading') }}</h2>
      <div class="footer-funding-logos">
        <img
          v-for="logo in fundingLogos"
          :key="logo.src"
          :src="logo.src"
          :alt="logo.alt"
          :width="logo.width"
          :height="logo.height"
          loading="lazy"
        />
      </div>
      <p class="footer-funding-statement">{{ t('footer_funding_statement') }}</p>
    </section>
    <p v-if="t('footer_a_prop_teu_cada_dia')" class="container footer-note">{{ t('footer_a_prop_teu_cada_dia') }}</p>
  </footer>
</template>
