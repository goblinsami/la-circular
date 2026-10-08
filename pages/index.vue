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
  <div class="container">
    <ContentSectionLoader v-if="contentLoading" variant="home" />
    <section v-else class="hero" aria-labelledby="home-title">
      <div class="hero-copy">
        <p class="eyebrow">
          <span class="small-dot" aria-hidden="true"></span>{{ t('home_benestar_amb_proximitat') }}</p>
        <h1 id="home-title" class="editable-title">
          {{ displayedContent.home_title }}
        </h1>
        <ContentStatus
          v-if="contentStatus === 'error'"
          :status="contentStatus"
          @retry="refreshContent()"
        />
        <p class="lead editable-text">
          {{ displayedContent.home_subtitle }}
        </p>
        <p class="body-copy editable-text">
          {{ displayedContent.home_text }}
        </p>
        <div class="hero-actions">
          <NuxtLink class="button" to="/productes"
            >{{ t('home_descobreix_els_productes') }}<span aria-hidden="true">{{ t('home_text_2') }}</span></NuxtLink
          >
          <NuxtLink class="text-link" to="/el-nostre-projecte"
            >{{ t('home_el_nostre_projecte') }}<span aria-hidden="true">{{ t('home_text_3') }}</span></NuxtLink
          >
        </div>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="art-orbit"></div>
        <div class="art-circle">
          <span class="art-caption">{{ t('home_la_circular') }}</span>
          <p class="editable-text">{{ t('home_cuidar_nos_de_manera_natural') }}</p>
          <span class="art-sprout"><i></i><i></i></span>
          <span class="art-caption">{{ t('home_a_prop_teu') }}</span>
        </div>
        <span class="art-note">{{ t('home_les_petites_coses_de_cada_dia') }}</span>
      </div>
    </section>

    <section class="values-section" aria-labelledby="values-title">
      <div class="section-heading">
        <p class="eyebrow">{{ t('home_la_nostra_manera_de_fer') }}</p>
        <h2 id="values-title">{{ t('home_les_persones_al_centre') }}</h2>
      </div>
      <div class="card-grid">
        <article class="card">
          <span class="card-number" aria-hidden="true">{{ t('home_01') }}</span>
          <h3>{{ t('home_a_prop_teu_2') }}</h3>
          <p>{{ t('home_una_botiga_de_barri_amb_temps_per') }}</p>
        </article>
        <article class="card">
          <span class="card-number" aria-hidden="true">{{ t('home_02') }}</span>
          <h3>{{ t('home_cuidar_el_dia_a_dia') }}</h3>
          <p>{{ t('home_opcions_d_alimentacio_i_cura_personal_que') }}</p>
        </article>
        <article class="card">
          <span class="card-number" aria-hidden="true">{{ t('home_03') }}</span>
          <h3>{{ t('home_triar_amb_calma') }}</h3>
          <p>{{ t('home_un_espai_on_compartir_dubtes_i_descobrir') }}</p>
        </article>
      </div>
    </section>
  </div>
</template>
