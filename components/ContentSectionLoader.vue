<script setup lang="ts">
const t = useSiteText()
defineProps<{
  variant: 'home' | 'project' | 'products'
}>()
</script>

<template>
  <div
    class="content-section-loader"
    :class="'content-section-loader-' + variant"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <span class="sr-only">{{ t('common_carregant_els_continguts') }}</span>
    <template v-if="variant === 'home'">
      <div class="content-loader-home-copy" aria-hidden="true">
        <span class="content-loader-block content-loader-eyebrow"></span>
        <span class="content-loader-block content-loader-title"></span>
        <span class="content-loader-block content-loader-title-short"></span>
        <span class="content-loader-block content-loader-copy-line"></span>
        <span class="content-loader-block content-loader-copy-line-short"></span>
        <span class="content-loader-block content-loader-copy-line"></span>
        <div class="content-loader-actions">
          <span class="content-loader-block"></span>
          <span class="content-loader-block"></span>
        </div>
      </div>
      <div class="content-loader-home-art" aria-hidden="true">
        <span class="content-loader-block"></span>
      </div>
    </template>
    <template v-else-if="variant === 'project'">
      <div class="content-loader-project-copy" aria-hidden="true">
        <div class="content-loader-page-heading">
          <span class="content-loader-block content-loader-eyebrow"></span>
          <span class="content-loader-block content-loader-title"></span>
          <span class="content-loader-block content-loader-copy-line"></span>
        </div>
        <div class="content-loader-project-text">
          <span class="content-loader-block content-loader-copy-line"></span>
          <span class="content-loader-block content-loader-copy-line"></span>
          <span class="content-loader-block content-loader-copy-line-short"></span>
          <span class="content-loader-block content-loader-copy-line"></span>
          <span class="content-loader-block content-loader-copy-line-short"></span>
          <span class="content-loader-block content-loader-button"></span>
        </div>
      </div>
      <div class="content-loader-project-aside" aria-hidden="true">
        <span class="content-loader-block content-loader-note"></span>
      </div>
    </template>
    <template v-else>
      <div class="content-loader-page-heading" aria-hidden="true">
        <span class="content-loader-block content-loader-eyebrow"></span>
        <span class="content-loader-block content-loader-title"></span>
        <span class="content-loader-block content-loader-copy-line"></span>
        <span class="content-loader-block content-loader-copy-line-short"></span>
      </div>
    </template>
  </div>
</template>