<script setup lang="ts">
import type { Product } from '~/types/product'

defineProps<{ product: Product }>()

const priceFormatter = new Intl.NumberFormat('ca-ES', {
  style: 'currency',
  currency: 'EUR',
})
</script>

<template>
  <article class="card product-card" :aria-labelledby="'product-' + product.id">
    <p class="product-category">{{ product.categoria }}</p>
    <h2 :id="'product-' + product.id">{{ product.nom }}</h2>
    <p v-if="product.descripcio" class="product-description">
      {{ product.descripcio }}
    </p>
    <p v-if="product.preu !== undefined" class="product-price">
      {{ priceFormatter.format(product.preu) }}
    </p>
  </article>
</template>
