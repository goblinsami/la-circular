<script setup lang="ts">
const t = useSiteText()
import type { Product } from '~/types/product'

const props = defineProps<{ product: Product }>()
const infusionTime = computed(() =>
  props.product.descripcio?.match(/(?:De\s+)?(\d+)(?:\s+a\s+(\d+))?\s*['’]?\s*(?:min\s*)?d['’]infusió\.?$/i),
)
const preparation = computed(() =>
  infusionTime.value
    ? `Infusió · ${infusionTime.value[1]}${infusionTime.value[2] ? `–${infusionTime.value[2]}` : ''} min`
    : '',
)
const description = computed(() => {
  const value = props.product.descripcio ?? ''
  return infusionTime.value
    ? value.slice(0, infusionTime.value.index).trim().replace(/\s+\.$/, '.')
    : value
})
</script>

<template>
  <article class="card product-card" :aria-labelledby="'product-' + product.id">
    <figure v-if="product.imatge" class="product-image-frame">
      <img
        :src="product.imatge"
        :alt="t('products_image_alt', { name: product.nom })"
        class="product-image"
        loading="lazy"
        decoding="async"
      />
    </figure>
    <div class="product-card-content">
      <p class="product-category">{{ product.categoria }}</p>
      <h2 :id="'product-' + product.id">{{ product.nom }}</h2>
      <p v-if="description" class="product-description">
        {{ description }}
      </p>
      <p v-if="preparation" class="product-preparation">{{ preparation }}</p>
    </div>
  </article>
</template>
