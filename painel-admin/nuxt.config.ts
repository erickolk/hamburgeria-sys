// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  
  ssr: false,
  
  app: {
    head: {
      title: 'Painel Admin - Mercadinho SaaS',
      meta: [
        { name: 'description', content: 'Painel de administração de licenças' }
      ]
    }
  },
  
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:3001'
    }
  },

  compatibilityDate: '2024-04-03'
})

