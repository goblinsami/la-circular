export default defineNuxtConfig({
  compatibilityDate: '2026-09-28',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    googleSheetId: '',
    googleServiceAccountEmail: '',
    googlePrivateKey: '',
    cloudinaryCloudName: '',
    cloudinaryApiKey: '',
    cloudinaryApiSecret: '',
  },
  routeRules: {
    '/admin': {
      ssr: false,
      headers: {
        'cache-control': 'private, no-store',
        'x-robots-tag': 'noindex, nofollow',
        'referrer-policy': 'no-referrer',
      },
    },
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
