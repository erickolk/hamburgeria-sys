<template>
  <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
    <!-- Cabeçalho -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-3">
        <div class="p-2 rounded-lg" :class="statusBgClass">
          <svg class="w-6 h-6" :class="statusIconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="status.syncing" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            <path v-else-if="status.online" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Sincronização</h3>
          <p class="text-sm text-gray-500">{{ statusSubtitle }}</p>
        </div>
      </div>
      
      <span :class="statusBadgeClass" class="px-4 py-2 rounded-full text-sm font-medium">
        {{ statusText }}
      </span>
    </div>

    <!-- Métricas -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <!-- Conexão -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Conexão</span>
          <div :class="[status.online ? 'bg-green-400' : 'bg-red-400']" class="w-3 h-3 rounded-full"></div>
        </div>
        <p class="mt-2 text-lg font-semibold" :class="[status.online ? 'text-green-600' : 'text-red-600']">
          {{ status.online ? 'Online' : 'Offline' }}
        </p>
      </div>

      <!-- Vendas pendentes -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Pendentes</span>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p class="mt-2 text-lg font-semibold" :class="pendingClass">
          {{ status.pending?.sales || 0 }}
        </p>
      </div>

      <!-- Fila -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Fila</span>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </div>
        <p class="mt-2 text-lg font-semibold text-gray-900">
          {{ status.pending?.queue || 0 }}
        </p>
      </div>

      <!-- Última sync -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Última sync</span>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="mt-2 text-sm font-semibold text-gray-900">
          {{ lastSyncFormatted }}
        </p>
      </div>
    </div>

    <!-- Barra de progresso (quando sincronizando) -->
    <div v-if="status.syncing" class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-gray-600">Sincronizando...</span>
        <span class="text-sm font-medium text-blue-600">Em progresso</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div class="bg-blue-600 h-full rounded-full animate-pulse" style="width: 100%"></div>
      </div>
    </div>

    <!-- Avisos -->
    <div v-if="status.pending?.failed > 0" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-start">
        <svg class="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div class="flex-1">
          <h4 class="text-sm font-medium text-red-800">Itens com falha</h4>
          <p class="mt-1 text-sm text-red-700">
            {{ status.pending.failed }} item(ns) falharam após várias tentativas. 
            <button @click="viewFailedItems" class="underline hover:no-underline">Ver detalhes</button>
          </p>
        </div>
      </div>
    </div>

    <!-- Ações -->
    <div class="flex flex-wrap gap-3">
      <button
        @click="triggerSync"
        :disabled="status.syncing || !status.online || !status.enabled"
        class="flex-1 min-w-[200px] px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
      >
        <svg v-if="!status.syncing" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <svg v-else class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>{{ status.syncing ? 'Sincronizando...' : 'Sincronizar Agora' }}</span>
      </button>

      <button
        @click="viewLogs"
        class="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center space-x-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Ver Logs</span>
      </button>

      <button
        @click="openSettings"
        class="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center space-x-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Configurar</span>
      </button>
    </div>

    <!-- Dica para modo offline -->
    <div v-if="!status.enabled" class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div class="flex items-start">
        <svg class="w-5 h-5 text-yellow-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex-1">
          <h4 class="text-sm font-medium text-yellow-800">Sincronização desabilitada</h4>
          <p class="mt-1 text-sm text-yellow-700">
            Configure a URL da VPS e o token para habilitar a sincronização automática.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '~/composables/useApi'

const router = useRouter()
const { get, post } = useApi()

const status = ref({
  online: false,
  syncing: false,
  enabled: false,
  pending: { 
    sales: 0, 
    queue: 0,
    failed: 0
  },
  lastSync: null
})

let interval = null

// Status badge classes
const statusBadgeClass = computed(() => {
  if (status.value.syncing) return 'bg-blue-100 text-blue-700'
  if (!status.value.online) return 'bg-red-100 text-red-700'
  if (!status.value.enabled) return 'bg-gray-100 text-gray-700'
  if (status.value.pending?.sales > 0) return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-100 text-green-700'
})

const statusBgClass = computed(() => {
  if (status.value.syncing) return 'bg-blue-100'
  if (!status.value.online) return 'bg-red-100'
  if (!status.value.enabled) return 'bg-gray-100'
  if (status.value.pending?.sales > 0) return 'bg-yellow-100'
  return 'bg-green-100'
})

const statusIconClass = computed(() => {
  if (status.value.syncing) return 'text-blue-600 animate-spin'
  if (!status.value.online) return 'text-red-600'
  if (!status.value.enabled) return 'text-gray-600'
  if (status.value.pending?.sales > 0) return 'text-yellow-600'
  return 'text-green-600'
})

const statusText = computed(() => {
  if (!status.value.enabled) return 'Desabilitado'
  if (status.value.syncing) return 'Sincronizando...'
  if (!status.value.online) return 'Offline'
  if (status.value.pending?.sales > 0) return 'Pendente'
  return 'Sincronizado'
})

const statusSubtitle = computed(() => {
  if (!status.value.enabled) return 'Configure para usar'
  if (status.value.syncing) return 'Aguarde a conclusão'
  if (!status.value.online) return 'Sistema funcionando localmente'
  if (status.value.pending?.sales > 0) return `${status.value.pending.sales} item(ns) aguardando`
  return 'Todos os dados sincronizados'
})

const pendingClass = computed(() => {
  const count = status.value.pending?.sales || 0
  if (count === 0) return 'text-green-600'
  if (count < 10) return 'text-yellow-600'
  return 'text-red-600'
})

const lastSyncFormatted = computed(() => {
  if (!status.value.lastSync) return 'Nunca'
  
  const date = new Date(status.value.lastSync)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'Agora'
  if (minutes < 60) return `${minutes}min atrás`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h atrás`
  
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Ontem'
  if (days < 7) return `${days}d atrás`
  
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const fetchStatus = async () => {
  try {
    const response = await get('/sync/status')
    status.value = response
  } catch (error) {
    console.error('Erro ao buscar status:', error)
    // Em caso de erro, marcar como offline mas permitir operação local
    status.value.online = false
  }
}

const triggerSync = async () => {
  if (status.value.syncing || !status.value.online || !status.value.enabled) return

  try {
    await post('/sync/trigger')
    // Atualizar status após um delay
    setTimeout(() => {
      fetchStatus()
    }, 2000)
  } catch (error) {
    console.error('Erro ao sincronizar:', error)
    alert('Erro ao iniciar sincronização. Verifique a conexão.')
  }
}

const viewLogs = () => {
  router.push('/settings/sync-logs')
}

const viewFailedItems = () => {
  router.push('/settings/sync-queue?status=failed')
}

const openSettings = () => {
  router.push('/settings/sync')
}

onMounted(() => {
  fetchStatus()
  // Atualizar a cada 15 segundos
  interval = setInterval(fetchStatus, 15000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

