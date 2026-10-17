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
    <section v-else :aria-labelledby="displayedContent.project_title ? 'project-title' : undefined">
      <div class="project-layout">
        <div class="project-copy">
          <div class="page-heading">
            <p v-if="t('project_arrelats_al_barri')" class="eyebrow">{{ t('project_arrelats_al_barri') }}</p>
            <h1 v-if="displayedContent.project_title" id="project-title" class="editable-title">
              <em>{{ displayedContent.project_title }}</em>
            </h1>
            <ContentStatus
              v-if="contentStatus === 'error'"
              :status="contentStatus"
              @retry="refreshContent()"
            />
            <p v-if="t('project_un_espai_proper_una_manera_de_cuidar')" class="lead">{{ t('project_un_espai_proper_una_manera_de_cuidar') }}</p>
          </div>
          <div v-if="displayedContent.project_content || t('project_descobreix_els_nostres_productes')" class="prose">
            <p v-if="displayedContent.project_content" class="editable-text">
              {{ displayedContent.project_content }}
            </p>
            <NuxtLink v-if="t('project_descobreix_els_nostres_productes')" class="button" to="/productes"
              >{{ t('project_descobreix_els_nostres_productes') }}<span v-if="t('home_text_2')" aria-hidden="true">{{ t('home_text_2') }}</span></NuxtLink
            >
          </div>
        </div>
        <div v-if="t('project_petits_gestos_benestar_quotidia') || t('project_ens_agrada_fer_les_coses_amb_calma')" class="project-aside-column">
          <aside class="card project-note" :aria-label="t('project_la_nostra_filosofia')">
            <h2 v-if="t('project_petits_gestos_benestar_quotidia')" class="editable-text">{{ t('project_petits_gestos_benestar_quotidia') }}</h2>
            <p v-if="t('project_ens_agrada_fer_les_coses_amb_calma')">{{ t('project_ens_agrada_fer_les_coses_amb_calma') }}</p>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>
