<script setup lang="ts">
const t = useSiteText()
import type { AdminProduct } from '~/server/utils/product-normalization'

const products = ref<AdminProduct[]>([])
const selectedId = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const loading = ref(true)
const busy = ref(false)
const error = ref('')
const status = ref('')

const selectedProduct = computed(() =>
  products.value.find((product) => product.id === selectedId.value),
)

async function loadProducts() {
  loading.value = true
  error.value = ''
  try {
    products.value = await $fetch<AdminProduct[]>('/api/admin/products')
    if (!products.value.some((product) => product.id === selectedId.value)) {
      selectedId.value = products.value[0]?.id ?? ''
    }
  } catch {
    error.value = t('admin_no_hem_pogut_carregar_els_productes_torna')
  } finally {
    loading.value = false
  }
}

async function upload() {
  const file = fileInput.value?.files?.[0]
  if (!file || !selectedProduct.value || busy.value) return
  error.value = ''
  status.value = ''
  busy.value = true
  const body = new FormData()
  body.append('productId', selectedProduct.value.id)
  body.append('image', file)
  try {
    const result = await $fetch<{ imatge: string }>('/api/admin/product-image', {
      method: 'POST',
      body,
      retry: 0,
    })
    selectedProduct.value.imatge = result.imatge
    status.value = t('admin_imatge_desada_i_associada_al_producte')
    if (fileInput.value) fileInput.value.value = ''
  } catch (cause) {
    const code = (cause as { statusCode?: number }).statusCode
    error.value =
      code === 413
        ? t('admin_la_imatge_supera_el_limit_de_5')
        : code === 415
          ? t('admin_fes_servir_una_imatge_jpg_png_o')
          : t('admin_no_hem_pogut_desar_la_imatge_comprova')
  } finally {
    busy.value = false
  }
}

async function removeImage() {
  if (!selectedProduct.value?.imatge || busy.value) return
  if (!window.confirm(t('admin_vols_eliminar_la_imatge_d_aquest_producte'))) return
  error.value = ''
  status.value = ''
  busy.value = true
  try {
    await $fetch('/api/admin/product-image', {
      method: 'DELETE',
      body: { productId: selectedProduct.value.id },
      retry: 0,
    })
    selectedProduct.value.imatge = null
    status.value = t('admin_imatge_eliminada_del_producte')
  } catch {
    error.value = t('admin_no_hem_pogut_eliminar_la_imatge_torna')
  } finally {
    busy.value = false
  }
}

watch(selectedId, () => {
  status.value = ''
  error.value = ''
  if (fileInput.value) fileInput.value.value = ''
})

onMounted(loadProducts)
</script>

<template>
  <section class="admin-image-editor" aria-labelledby="image-editor-title">
    <h2 id="image-editor-title">{{ t('admin_imatges_dels_productes') }}</h2>
    <p v-if="loading" role="status">{{ t('products_carregant_els_productes') }}</p>
    <p v-if="error" role="alert" class="admin-error">{{ error }}</p>
    <button
      v-if="!loading && !products.length"
      class="button"
      type="button"
      @click="loadProducts"
    >{{ t('products_torna_ho_a_provar') }}</button>
    <div v-if="!loading && products.length" class="image-editor-controls">
      <div class="filter-field">
        <label for="image-product">{{ t('admin_producte') }}</label>
        <select id="image-product" v-model="selectedId" :disabled="busy">
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ t(product.actiu ? 'admin_product_option' : 'admin_product_option_inactive', { name: product.nom, category: product.categoria }) }}
          </option>
        </select>
      </div>
      <div v-if="selectedProduct?.imatge" class="admin-image-preview">
        <img
          :src="selectedProduct.imatge"
          :alt="t('admin_image_alt', { name: selectedProduct.nom })"
          loading="lazy"
        />
      </div>
      <p v-else class="admin-help">{{ t('admin_aquest_producte_encara_no_te_imatge') }}</p>
      <form class="image-upload-form" :aria-busy="busy" @submit.prevent="upload">
        <div class="filter-field">
          <label for="product-image-file">{{ t('admin_selecciona_una_imatge') }}</label>
          <input
            id="product-image-file"
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            :disabled="busy"
            required
          />
          <p class="admin-help">{{ t('admin_jpg_png_o_webp_maxim_5_mb') }}</p>
        </div>
        <div class="image-editor-actions">
          <button class="button" type="submit" :disabled="busy || !selectedProduct">
            {{ busy ? t('admin_desant') : selectedProduct?.imatge ? t('admin_canvia_la_imatge') : t('admin_afegeix_la_imatge') }}
          </button>
          <button
            v-if="selectedProduct?.imatge"
            class="button button-secondary"
            type="button"
            :disabled="busy"
            @click="removeImage"
          >{{ t('admin_elimina_la_imatge') }}</button>
        </div>
      </form>
      <p v-if="status" role="status">{{ status }}</p>
    </div>
  </section>
</template>
