<script setup lang="ts">
const t = useSiteText()
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
            <p class="eyebrow">{{ t('project_arrelats_al_barri') }}</p>
            <h1 id="project-title" class="editable-title">
              <em>{{ displayedContent.project_title }}</em>
            </h1>
            <ContentStatus
              v-if="contentStatus === 'error'"
              :status="contentStatus"
              @retry="refreshContent()"
            />
            <p class="lead">{{ t('project_un_espai_proper_una_manera_de_cuidar') }}</p>
          </div>
          <div class="prose">
            <p class="editable-text">
              {{ displayedContent.project_content }}
            </p>
            <NuxtLink class="button" to="/productes"
              >{{ t('project_descobreix_els_nostres_productes') }}<span aria-hidden="true">{{ t('home_text_2') }}</span></NuxtLink
            >
          </div>
        </div>
        <div class="project-aside-column">
          <aside class="card project-note" :aria-label="t('project_la_nostra_filosofia')">
            <span class="small-dot" aria-hidden="true"></span>
            <h2 class="editable-text">{{ t('project_petits_gestos_benestar_quotidia') }}</h2>
            <p>{{ t('project_ens_agrada_fer_les_coses_amb_calma') }}</p>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>
