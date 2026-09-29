<script setup lang="ts">
const route = useRoute()
const menuOpen = ref(false)
const menuReady = ref(false)
const menuButton = ref<HTMLButtonElement | null>(null)

function closeMenu(restoreFocus = false) {
  menuOpen.value = false
  if (restoreFocus) menuButton.value?.focus()
}

watch(
  () => route.path,
  () => closeMenu(),
)

onMounted(() => {
  menuReady.value = true
  const desktop = window.matchMedia('(min-width: 48rem)')
  const onResize = (event: MediaQueryListEvent) => {
    if (event.matches) closeMenu()
  }
  desktop.addEventListener('change', onResize)
  onBeforeUnmount(() => desktop.removeEventListener('change', onResize))
})
</script>

<template>
  <header class="site-header" @keydown.esc="closeMenu(true)">
    <div class="container header-inner">
      <NuxtLink
        class="brand"
        to="/"
        aria-label="La Circular — Inici"
        @click="closeMenu()"
      >
        <span class="brand-mark" aria-hidden="true"></span>
        <span
          >La Circular<span class="brand-caption"
            >DIETÈTICA DE BARRI</span
          ></span
        >
      </NuxtLink>
      <button
        v-if="menuReady"
        ref="menuButton"
        class="menu-toggle"
        type="button"
        aria-controls="main-navigation"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        {{ menuOpen ? 'Tanca' : 'Menú' }}
        <span
          class="menu-icon"
          :class="{ 'is-open': menuOpen }"
          aria-hidden="true"
        ></span>
      </button>
      <nav
        id="main-navigation"
        class="site-nav"
        :class="{ 'is-open': menuOpen, 'is-ready': menuReady }"
        aria-label="Navegació principal"
      >
        <ul>
          <li><NuxtLink to="/">Inici</NuxtLink></li>
          <li>
            <NuxtLink to="/el-nostre-projecte">El nostre projecte</NuxtLink>
          </li>
          <li><NuxtLink to="/productes">Productes</NuxtLink></li>
        </ul>
      </nav>
    </div>
  </header>
</template>
