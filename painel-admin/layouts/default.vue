<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <!-- Header -->
    <header class="bg-black/30 backdrop-blur-sm border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </div>
          <div>
            <h1 class="font-bold text-white">Painel Admin</h1>
            <p class="text-xs text-purple-300">Mercadinho SaaS</p>
          </div>
        </NuxtLink>
        
        <ClientOnly>
          <div v-if="user" class="flex items-center gap-4">
            <span class="text-sm text-purple-200">{{ user.name }}</span>
            <button
              @click="logout"
              class="px-3 py-1.5 text-sm text-white/70 hover:text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
            >
              Sair
            </button>
          </div>
        </ClientOnly>
      </div>
    </header>
    
    <!-- Main -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
const { user, logout } = useAdminAuth()
</script>

