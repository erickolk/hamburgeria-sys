<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
    <!-- Componente de Aviso de Licença -->
    <ClientOnly>
      <LicenseWarning />
    </ClientOnly>
    
    <!-- Componente de Notificação de Atualização -->
    <ClientOnly>
      <UpdateNotification />
    </ClientOnly>
    
    <!-- Barra Superior Minimalista -->
    <header class="bg-white shadow-sm sticky top-0 z-30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-xl">M</span>
          </div>
          <div>
            <h1 class="font-bold text-xl text-gray-900">Mercadinho</h1>
            <p class="text-xs text-gray-500">Sistema de Gestão</p>
          </div>
        </NuxtLink>
        <ClientOnly>
          <UserMenu />
        </ClientOnly>
      </div>
    </header>
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
import UserMenu from '~/components/UserMenu.vue'
import LicenseWarning from '~/components/LicenseWarning.vue'
import UpdateNotification from '~/components/UpdateNotification.vue'
</script>