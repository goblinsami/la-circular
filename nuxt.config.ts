import { readFileSync } from 'node:fs'

const favicon = readFileSync(new URL('./public/favicon.svg', import.meta.url), 'utf8')

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
      link: [
        {
          key: 'site-favicon',
          rel: 'icon',
          type: 'image/svg+xml',
          href: 'data:image/svg+xml,' + encodeURIComponent(favicon),
        },
      ],
    },
  },
})
