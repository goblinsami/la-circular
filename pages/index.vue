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
    <section v-else class="hero" :aria-labelledby="displayedContent.home_title ? 'home-title' : undefined">
      <div class="hero-copy">
        <p v-if="t('home_benestar_amb_proximitat')" class="eyebrow">
          <span class="small-dot" aria-hidden="true"></span>{{ t('home_benestar_amb_proximitat') }}</p>
        <h1 v-if="displayedContent.home_title" id="home-title" class="editable-title">
          {{ displayedContent.home_title }}
        </h1>
        <ContentStatus
          v-if="contentStatus === 'error'"
          :status="contentStatus"
          @retry="refreshContent()"
        />
        <p v-if="displayedContent.home_subtitle" class="lead editable-text">
          {{ displayedContent.home_subtitle }}
        </p>
        <p v-if="displayedContent.home_text" class="body-copy editable-text">
          {{ displayedContent.home_text }}
        </p>
        <div v-if="t('home_descobreix_els_productes') || t('home_el_nostre_projecte')" class="hero-actions">
          <NuxtLink v-if="t('home_descobreix_els_productes')" class="button" to="/productes"
            >{{ t('home_descobreix_els_productes') }}<span v-if="t('home_text_2')" aria-hidden="true">{{ t('home_text_2') }}</span></NuxtLink
          >
          <NuxtLink v-if="t('home_el_nostre_projecte')" class="text-link" to="/el-nostre-projecte"
            >{{ t('home_el_nostre_projecte') }}<span v-if="t('home_text_3')" aria-hidden="true">{{ t('home_text_3') }}</span></NuxtLink
          >
        </div>
      </div>
      <div v-if="t('home_la_circular') || t('home_cuidar_nos_de_manera_natural') || t('home_a_prop_teu') || t('home_les_petites_coses_de_cada_dia')" class="hero-art" aria-hidden="true">
        <div v-if="t('home_la_circular') || t('home_cuidar_nos_de_manera_natural') || t('home_a_prop_teu')" class="art-orbit"></div>
        <div v-if="t('home_la_circular') || t('home_cuidar_nos_de_manera_natural') || t('home_a_prop_teu')" class="art-circle">
          <span v-if="t('home_la_circular')" class="art-caption">{{ t('home_la_circular') }}</span>
          <p v-if="t('home_cuidar_nos_de_manera_natural')" class="editable-text">{{ t('home_cuidar_nos_de_manera_natural') }}</p>
          <span class="art-sprout"><i></i><i></i></span>
          <span v-if="t('home_a_prop_teu')" class="art-caption">{{ t('home_a_prop_teu') }}</span>
        </div>
        <span v-if="t('home_les_petites_coses_de_cada_dia')" class="art-note">{{ t('home_les_petites_coses_de_cada_dia') }}</span>
      </div>
    </section>

    <section v-if="t('home_la_nostra_manera_de_fer') || t('home_les_persones_al_centre') || t('home_a_prop_teu_2') || t('home_una_botiga_de_barri_amb_temps_per') || t('home_cuidar_el_dia_a_dia') || t('home_opcions_d_alimentacio_i_cura_personal_que') || t('home_triar_amb_calma') || t('home_un_espai_on_compartir_dubtes_i_descobrir')" class="values-section" :aria-labelledby="t('home_les_persones_al_centre') ? 'values-title' : undefined">
      <div v-if="t('home_la_nostra_manera_de_fer') || t('home_les_persones_al_centre')" class="section-heading">
        <p v-if="t('home_la_nostra_manera_de_fer')" class="eyebrow">{{ t('home_la_nostra_manera_de_fer') }}</p>
        <h2 v-if="t('home_les_persones_al_centre')" id="values-title">{{ t('home_les_persones_al_centre') }}</h2>
      </div>
      <div v-if="t('home_a_prop_teu_2') || t('home_una_botiga_de_barri_amb_temps_per') || t('home_cuidar_el_dia_a_dia') || t('home_opcions_d_alimentacio_i_cura_personal_que') || t('home_triar_amb_calma') || t('home_un_espai_on_compartir_dubtes_i_descobrir')" class="card-grid">
        <article v-if="t('home_a_prop_teu_2') || t('home_una_botiga_de_barri_amb_temps_per')" class="card">
          <span v-if="t('home_01')" class="card-number" aria-hidden="true">{{ t('home_01') }}</span>
          <h3 v-if="t('home_a_prop_teu_2')">{{ t('home_a_prop_teu_2') }}</h3>
          <p v-if="t('home_una_botiga_de_barri_amb_temps_per')">{{ t('home_una_botiga_de_barri_amb_temps_per') }}</p>
        </article>
        <article v-if="t('home_cuidar_el_dia_a_dia') || t('home_opcions_d_alimentacio_i_cura_personal_que')" class="card">
          <span v-if="t('home_02')" class="card-number" aria-hidden="true">{{ t('home_02') }}</span>
          <h3 v-if="t('home_cuidar_el_dia_a_dia')">{{ t('home_cuidar_el_dia_a_dia') }}</h3>
          <p v-if="t('home_opcions_d_alimentacio_i_cura_personal_que')">{{ t('home_opcions_d_alimentacio_i_cura_personal_que') }}</p>
        </article>
        <article v-if="t('home_triar_amb_calma') || t('home_un_espai_on_compartir_dubtes_i_descobrir')" class="card">
          <span v-if="t('home_03')" class="card-number" aria-hidden="true">{{ t('home_03') }}</span>
          <h3 v-if="t('home_triar_amb_calma')">{{ t('home_triar_amb_calma') }}</h3>
          <p v-if="t('home_un_espai_on_compartir_dubtes_i_descobrir')">{{ t('home_un_espai_on_compartir_dubtes_i_descobrir') }}</p>
        </article>
      </div>
    </section>
  </div>
</template>
