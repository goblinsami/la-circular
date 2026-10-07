<script setup lang="ts">
import { fallbackSiteContent } from '~/composables/useSiteContent'

const {
  data: content,
  status: contentStatus,
  refresh: refreshContent,
} = await useSiteContent()
const contentLoading = computed(
  () => contentStatus.value === 'idle' || contentStatus.value === 'pending',
)
const displayedContent = computed(() =>
  contentStatus.value === 'error'
    ? fallbackSiteContent
    : (content.value ?? fallbackSiteContent),
)
</script>

<template>
  <div class="container page-section">
    <ContentSectionLoader v-if="contentLoading" variant="project" />
    <section v-else aria-labelledby="project-title">
      <div class="project-layout">
        <div class="project-copy">
          <div class="page-heading">
            <p class="eyebrow">Arrelats al barri</p>
            <h1 id="project-title" class="editable-title">
              <em>{{ displayedContent.project_title }}</em>
            </h1>
            <ContentStatus
              v-if="contentStatus === 'error'"
              :status="contentStatus"
              @retry="refreshContent()"
            />
            <p class="lead">Un espai proper. Una manera de cuidar-nos.</p>
          </div>
          <div class="prose">
            <p class="editable-text">
              {{ displayedContent.project_content }}
            </p>
            <NuxtLink class="button" to="/productes"
              >Descobreix els nostres productes
              <span aria-hidden="true">↗</span></NuxtLink
            >
          </div>
        </div>
        <div class="project-aside-column">
          <aside class="card project-note" aria-label="La nostra filosofia">
            <span class="small-dot" aria-hidden="true"></span>
            <h2>Petits gestos.<br />Benestar quotidià.</h2>
            <p>Ens agrada fer les coses amb calma, amb cura i amb proximitat.</p>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>
