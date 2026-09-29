export default defineNuxtConfig({
  compatibilityDate: '2026-09-28',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    googleSheetId: '',
    googleServiceAccountEmail: '',
    googlePrivateKey: '',
  },
  typescript: {
    strict: true,
  },
  app: {
    head: {
      htmlAttrs: { lang: 'ca' },
      title: 'La Circular',
    },
  },
})
