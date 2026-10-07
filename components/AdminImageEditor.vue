<script setup lang="ts">
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
    error.value = 'No hem pogut carregar els productes. Torna-ho a provar.'
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
    status.value = 'Imatge desada i associada al producte.'
    if (fileInput.value) fileInput.value.value = ''
  } catch (cause) {
    const code = (cause as { statusCode?: number }).statusCode
    error.value =
      code === 413
        ? 'La imatge supera el límit de 5 MB.'
        : code === 415
          ? 'Fes servir una imatge JPG, PNG o WebP.'
          : 'No hem pogut desar la imatge. Comprova la sessió i torna-ho a provar.'
  } finally {
    busy.value = false
  }
}

async function removeImage() {
  if (!selectedProduct.value?.imatge || busy.value) return
  if (!window.confirm('Vols eliminar la imatge d’aquest producte?')) return
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
    status.value = 'Imatge eliminada del producte.'
  } catch {
    error.value = 'No hem pogut eliminar la imatge. Torna-ho a provar.'
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
    <h2 id="image-editor-title">Imatges dels productes</h2>
    <p v-if="loading" role="status">Carregant els productes…</p>
    <p v-if="error" role="alert" class="admin-error">{{ error }}</p>
    <button
      v-if="!loading && !products.length"
      class="button"
      type="button"
      @click="loadProducts"
    >
      Torna-ho a provar
    </button>
    <div v-if="!loading && products.length" class="image-editor-controls">
      <div class="filter-field">
        <label for="image-product">Producte</label>
        <select id="image-product" v-model="selectedId" :disabled="busy">
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ product.nom }} · {{ product.categoria }}{{ product.actiu ? '' : ' · Inactiu' }}
          </option>
        </select>
      </div>
      <div v-if="selectedProduct?.imatge" class="admin-image-preview">
        <img
          :src="selectedProduct.imatge"
          :alt="'Imatge actual de ' + selectedProduct.nom"
          loading="lazy"
        />
      </div>
      <p v-else class="admin-help">Aquest producte encara no té imatge.</p>
      <form class="image-upload-form" :aria-busy="busy" @submit.prevent="upload">
        <div class="filter-field">
          <label for="product-image-file">Selecciona una imatge</label>
          <input
            id="product-image-file"
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            :disabled="busy"
            required
          />
          <p class="admin-help">JPG, PNG o WebP · màxim 5 MB</p>
        </div>
        <div class="image-editor-actions">
          <button class="button" type="submit" :disabled="busy || !selectedProduct">
            {{ busy ? 'Desant…' : selectedProduct?.imatge ? 'Canvia la imatge' : 'Afegeix la imatge' }}
          </button>
          <button
            v-if="selectedProduct?.imatge"
            class="button button-secondary"
            type="button"
            :disabled="busy"
            @click="removeImage"
          >
            Elimina la imatge
          </button>
        </div>
      </form>
      <p v-if="status" role="status">{{ status }}</p>
    </div>
  </section>
</template>