<script setup lang="ts">
const t = useSiteText()
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
        <p class="eyebrow">{{ t('products_la_nostra_seleccio') }}</p>
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
        <p>{{ t('products_carregant_els_productes') }}</p>
      </div>
      <div v-else-if="error" class="card catalogue-status" role="alert">
        <h2>{{ t('products_no_hem_pogut_carregar_el_cataleg') }}</h2>
        <p>{{ t('products_torna_ho_a_provar_d_aqui_a') }}</p>
        <button class="button" type="button" @click="refresh()">{{ t('products_torna_ho_a_provar') }}</button>
      </div>
      <template v-else>
        <form
          class="catalogue-filters"
          role="search"
          :aria-label="t('products_cerca_al_cataleg')"
          @submit.prevent
          @reset.prevent="resetFilters"
        >
          <div class="filter-field">
            <label for="product-search">{{ t('products_cerca_per_nom') }}</label>
            <input
              id="product-search"
              ref="searchInput"
              v-model="search"
              type="search"
              :placeholder="t('products_per_exemple_camamilla')"
              autocomplete="off"
              aria-controls="product-results"
            />
          </div>
          <div class="filter-field">
            <label for="product-category">{{ t('products_categoria') }}</label>
            <select
              id="product-category"
              v-model="category"
              aria-controls="product-results"
            >
              <option value="">{{ t('products_totes_les_categories') }}</option>
              <option v-for="name in categories" :key="name" :value="name">
                {{ name }}
              </option>
            </select>
          </div>
          <button class="filter-reset" type="reset" :disabled="!hasFilters">{{ t('products_neteja_els_filtres') }}</button>
        </form>

        <p
          class="results-count"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {{ t(hasFilters ? (products.length === 1 ? 'products_count_filtered_one' : 'products_count_filtered_many') : (products.length === 1 ? 'products_count_one' : 'products_count_many'), { count: products.length, total: activeProducts.length }) }}
        </p>

        <div id="product-results">
          <ul
            v-if="products.length"
            class="product-grid"
            :aria-label="t('products_productes')"
          >
            <li v-for="product in products" :key="product.id">
              <ProductCard :product="product" />
            </li>
          </ul>
          <div v-else class="card empty-state">
            <h2>
              {{
                hasFilters
                  ? t('products_no_hem_trobat_cap_producte')
                  : t('products_encara_no_hi_ha_productes_disponibles')
              }}
            </h2>
            <p>
              {{
                hasFilters
                  ? t('products_prova_amb_un_altre_nom_o_categoria')
                  : t('products_torna_a_visitar_el_cataleg_mes_endavant')
              }}
            </p>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>
