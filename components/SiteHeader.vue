<script setup lang="ts">
const t = useSiteText()
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
        v-if="t('header_la_circular') || t('header_dietetica_de_barri')"
        class="brand"
        to="/"
        :aria-label="t('header_la_circular_inici')"
        @click="closeMenu()"
      >
        <span v-if="t('header_la_circular') || t('header_dietetica_de_barri')" class="brand-mark" aria-hidden="true"></span>
        <span
          >{{ t('header_la_circular') }}<span v-if="t('header_dietetica_de_barri')" class="brand-caption"
            >{{ t('header_dietetica_de_barri') }}</span
          ></span
        >
      </NuxtLink>
      <button
        v-if="menuReady && t(menuOpen ? 'header_close_menu' : 'header_menu')"
        ref="menuButton"
        class="menu-toggle"
        type="button"
        aria-controls="main-navigation"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        {{ menuOpen ? t('header_close_menu') : t('header_menu') }}
        <span
          class="menu-icon"
          :class="{ 'is-open': menuOpen }"
          aria-hidden="true"
        ></span>
      </button>
      <nav
        v-if="t('header_inici') || t('home_el_nostre_projecte') || t('products_productes')"
        id="main-navigation"
        class="site-nav"
        :class="{ 'is-open': menuOpen, 'is-ready': menuReady }"
        :aria-label="t('header_navegacio_principal')"
      >
        <ul>
          <li v-if="t('header_inici')"><NuxtLink to="/">{{ t('header_inici') }}</NuxtLink></li>
          <li v-if="t('home_el_nostre_projecte')">
            <NuxtLink to="/el-nostre-projecte">{{ t('home_el_nostre_projecte') }}</NuxtLink>
          </li>
          <li v-if="t('products_productes')"><NuxtLink to="/productes">{{ t('products_productes') }}</NuxtLink></li>
        </ul>
      </nav>
    </div>
  </header>
</template>
