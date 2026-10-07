<script setup lang="ts">
import type { Product } from '~/types/product'
import { fallbackSiteContent } from '~/composables/useSiteContent'
import { getVisibleProducts } from '~/utils/products'

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

const search = ref('')
const category = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const {
  data: activeProducts,
  status,
  error,
  refresh,
} = await useFetch<Product[]>('/api/products', {
  lazy: true,
  default: () => [],
})
const loading = computed(
  () => status.value === 'pending' || status.value === 'idle',
)
const categories = computed(() =>
  [...new Set(activeProducts.value.map((product) => product.categoria))].sort(
    (a, b) => a.localeCompare(b, 'ca'),
  ),
)
const products = computed(() =>
  getVisibleProducts(activeProducts.value, search.value, category.value),
)
const hasFilters = computed(() => search.value !== '' || category.value !== '')

function resetFilters() {
  search.value = ''
  category.value = ''
  searchInput.value?.focus()
}
</script>

<template>
  <div class="container page-section">
    <section aria-labelledby="products-title" :aria-busy="loading">
      <ContentSectionLoader v-if="contentLoading" variant="products" />
      <div v-else class="page-heading">
        <p class="eyebrow">La nostra selecció</p>
        <h1 id="products-title" class="editable-title">
          <em>{{ displayedContent.products_title }}</em>
        </h1>
        <ContentStatus
          v-if="contentStatus === 'error'"
          :status="contentStatus"
          @retry="refreshContent()"
        />
        <p class="lead editable-text">
          {{ displayedContent.products_intro }}
        </p>
      </div>

      <div v-if="loading" class="card catalogue-status" role="status">
        <p>Carregant els productes…</p>
      </div>
      <div v-else-if="error" class="card catalogue-status" role="alert">
        <h2>No hem pogut carregar el catàleg</h2>
        <p>Torna-ho a provar d’aquí a uns instants.</p>
        <button class="button" type="button" @click="refresh()">
          Torna-ho a provar
        </button>
      </div>
      <template v-else>
        <form
          class="catalogue-filters"
          role="search"
          aria-label="Cerca al catàleg"
          @submit.prevent
          @reset.prevent="resetFilters"
        >
          <div class="filter-field">
            <label for="product-search">Cerca per nom</label>
            <input
              id="product-search"
              ref="searchInput"
              v-model="search"
              type="search"
              placeholder="Per exemple, camamilla"
              autocomplete="off"
              aria-controls="product-results"
            />
          </div>
          <div class="filter-field">
            <label for="product-category">Categoria</label>
            <select
              id="product-category"
              v-model="category"
              aria-controls="product-results"
            >
              <option value="">Totes les categories</option>
              <option v-for="name in categories" :key="name" :value="name">
                {{ name }}
              </option>
            </select>
          </div>
          <button class="filter-reset" type="reset" :disabled="!hasFilters">
            Neteja els filtres
          </button>
        </form>

        <p
          class="results-count"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {{ products.length }}
          {{ products.length === 1 ? 'producte' : 'productes' }}
          <span v-if="hasFilters">de {{ activeProducts.length }}</span>
        </p>

        <div id="product-results">
          <ul
            v-if="products.length"
            class="product-grid"
            aria-label="Productes"
          >
            <li v-for="product in products" :key="product.id">
              <ProductCard :product="product" />
            </li>
          </ul>
          <div v-else class="card empty-state">
            <h2>
              {{
                hasFilters
                  ? 'No hem trobat cap producte'
                  : 'Encara no hi ha productes disponibles'
              }}
            </h2>
            <p>
              {{
                hasFilters
                  ? 'Prova amb un altre nom o categoria, o neteja els filtres.'
                  : 'Torna a visitar el catàleg més endavant.'
              }}
            </p>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>
