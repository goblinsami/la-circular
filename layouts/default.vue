<template>
  <div class="site-shell">
    <a class="skip-link" href="#contingut">Salta al contingut</a>
    <SiteHeader />
    <main id="contingut" tabindex="-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
