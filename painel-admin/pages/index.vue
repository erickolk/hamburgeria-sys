<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white mb-2">Dashboard</h1>
      <p class="text-purple-300">Visão geral das licenças do sistema</p>
    </div>
    
    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div class="text-3xl font-bold text-white mb-1">{{ stats.total }}</div>
        <div class="text-purple-300 text-sm">Total de Licenças</div>
      </div>
      <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div class="text-3xl font-bold text-green-400 mb-1">{{ stats.active }}</div>
        <div class="text-purple-300 text-sm">Ativas</div>
      </div>
      <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div class="text-3xl font-bold text-orange-400 mb-1">{{ stats.expiring }}</div>
        <div class="text-purple-300 text-sm">Expirando em 5 dias</div>
      </div>
      <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div class="text-3xl font-bold text-yellow-400 mb-1">{{ stats.suspended }}</div>
        <div class="text-purple-300 text-sm">Suspensas</div>
      </div>
    </div>
    
    <!-- Ações Rápidas -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <NuxtLink
        to="/licenses"
        class="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 hover:opacity-90 transition-opacity group"
      >
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-white mb-1">Gerenciar Licenças</h3>
            <p class="text-purple-200 text-sm">Ver, criar e editar licenças</p>
          </div>
        </div>
      </NuxtLink>
      
      <NuxtLink
        to="/licenses/new"
        class="bg-gradient-to-br from-pink-600 to-pink-700 rounded-xl p-6 hover:opacity-90 transition-opacity group"
      >
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-white mb-1">Nova Licença</h3>
            <p class="text-pink-200 text-sm">Cadastrar nova empresa</p>
          </div>
        </div>
      </NuxtLink>
    </div>
    
    <!-- Licenças Recentes -->
    <div class="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
      <div class="p-6 border-b border-white/10">
        <h2 class="text-xl font-bold text-white">Licenças Recentes</h2>
      </div>
      
      <div v-if="loading" class="p-12 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
      </div>
      
      <div v-else-if="licenses.length === 0" class="p-12 text-center text-purple-300">
        Nenhuma licença cadastrada
      </div>
      
      <table v-else class="w-full">
        <thead class="bg-white/5">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase">Empresa</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase">Validade</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-purple-300 uppercase">Ação</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/10">
          <tr v-for="license in licenses.slice(0, 5)" :key="license.id" class="hover:bg-white/5">
            <td class="px-6 py-4">
              <div class="font-medium text-white">{{ license.companyName }}</div>
              <div class="text-sm text-purple-400 font-mono">{{ license.licenseKey }}</div>
            </td>
            <td class="px-6 py-4">
              <span :class="['px-2 py-1 text-xs font-medium rounded-full', getStatusInfo(license).badge]">
                {{ getStatusInfo(license).label }}
              </span>
            </td>
            <td class="px-6 py-4 text-purple-300">
              {{ formatDate(license.validUntil) }}
            </td>
            <td class="px-6 py-4 text-right">
              <NuxtLink
                :to="`/licenses/${license.id}`"
                class="text-purple-400 hover:text-white transition-colors"
              >
                Ver
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="licenses.length > 5" class="p-4 border-t border-white/10 text-center">
        <NuxtLink to="/licenses" class="text-purple-400 hover:text-white text-sm">
          Ver todas as {{ licenses.length }} licenças
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth'] })

const { licenses, loading, listLicenses, getStatusInfo, formatDate } = useLicenses()

const stats = computed(() => {
  const now = new Date()
  return {
    total: licenses.value.length,
    active: licenses.value.filter(l => l.status === 'ACTIVE').length,
    expiring: licenses.value.filter(l => {
      const d = Math.ceil((new Date(l.validUntil) - now) / (1000*60*60*24))
      return l.status === 'ACTIVE' && d <= 5 && d > 0
    }).length,
    suspended: licenses.value.filter(l => l.status === 'SUSPENDED').length
  }
})

onMounted(() => {
  listLicenses()
})
</script>

