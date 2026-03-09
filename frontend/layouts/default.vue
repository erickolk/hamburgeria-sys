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
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-xl">🍔</span>
          </div>
          <div>
            <h1 class="font-bold text-xl text-gray-900">Hamburgeria</h1>
            <p class="text-xs text-gray-500">Sistema de Gestão</p>
          </div>
        </NuxtLink>

        <!-- Nav principal -->
        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink to="/pos" class="nav-link">PDV</NuxtLink>
          <NuxtLink to="/products" class="nav-link">Cardápio</NuxtLink>
          <NuxtLink to="/ingredients" class="nav-link">Ingredientes</NuxtLink>
          <NuxtLink to="/recipes" class="nav-link">Fichas Técnicas</NuxtLink>
          <NuxtLink to="/purchases" class="nav-link">Compras</NuxtLink>
          <NuxtLink to="/reports" class="nav-link">Relatórios</NuxtLink>
          <NuxtLink to="/settings" class="nav-link">Config.</NuxtLink>
        </nav>

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

<style scoped>
.nav-link {
  @apply px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors;
}
.nav-link.router-link-active {
  @apply text-orange-600 bg-orange-50;
}
</style>