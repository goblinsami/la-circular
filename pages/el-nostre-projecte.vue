<script setup lang="ts">
const {
  data: content,
  status: contentStatus,
  refresh: refreshContent,
} = await useSiteContent()
</script>

<template>
  <div class="container page-section">
    <section aria-labelledby="project-title">
      <div class="page-heading">
        <p class="eyebrow">Arrelats al barri</p>
        <h1 id="project-title" class="editable-title">
          <em>{{ content?.project_title ?? 'El nostre projecte' }}</em>
        </h1>
        <ContentStatus :status="contentStatus" @retry="refreshContent()" />
        <p class="lead">Un espai proper. Una manera de cuidar-nos.</p>
      </div>
      <div class="project-grid">
        <div class="prose">
          <p
            v-if="content && contentStatus === 'success'"
            class="editable-text"
          >
            {{ content.project_content }}
          </p>
          <NuxtLink class="button" to="/productes"
            >Descobreix els nostres productes
            <span aria-hidden="true">↗</span></NuxtLink
          >
        </div>
        <aside class="card project-note" aria-label="La nostra filosofia">
          <span class="small-dot" aria-hidden="true"></span>
          <h2>Petits gestos.<br />Benestar quotidià.</h2>
          <p>Ens agrada fer les coses amb calma, amb cura i amb proximitat.</p>
        </aside>
      </div>
    </section>
  </div>
</template>
