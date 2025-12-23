import { defineNuxtConfig } from 'nuxt/config'

const API_BASE =
  (globalThis &&
    typeof globalThis === 'object' &&
    (globalThis).process &&
    (globalThis).process.env &&
    (globalThis).process.env.NUXT_PUBLIC_API_BASE) ||
  'http://localhost:3001'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  // Modo SPA para Electron (desabilita SSR)
  ssr: false,
  // Usar caminhos relativos para funcionar com file:// no Electron
  app: {
    baseURL: './',
    buildAssetsDir: '_nuxt/'
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/google-fonts'
  ],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      // Aponta por padrão para o backend ativo em 3001
      apiBase: API_BASE
    }
  },
  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700]
    }
  },
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js'
  },
  nitro: {
    devProxy: {
      '/api': {
        target: API_BASE,
        changeOrigin: true
      }
    },
    routeRules: {
      '/api/**': {
        // Em produção, encaminhar /api/* para o backend removendo o prefixo /api
        // Ex.: /api/reports/dashboard -> ${API_BASE}/reports/dashboard
        proxy: `${API_BASE}/**`
      }
    }
  },
  experimental: {
    appManifest: false
  },
  devServer: {
    host: '0.0.0.0'
  },
  build: {
    transpile: ['vue-toastification']
  },
  vite: {
    ssr: {
      noExternal: ['vue-toastification']
    }
  }
} as any)
