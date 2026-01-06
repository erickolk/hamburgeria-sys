<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <NuxtLink to="/licenses" class="text-purple-400 hover:text-white text-sm mb-2 inline-block">
        ← Voltar para Licenças
      </NuxtLink>
      <h1 class="text-3xl font-bold text-white mb-2">{{ license?.companyName || 'Carregando...' }}</h1>
      <p class="text-purple-300">Detalhes e gerenciamento da licença</p>
    </div>
    
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
    </div>
    
    <!-- Conteúdo -->
    <div v-else-if="license" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Principal -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Status -->
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-white">Status</h2>
            <span :class="['px-3 py-1 text-sm font-medium rounded-full', statusInfo.badge]">
              {{ statusInfo.label }}
            </span>
          </div>
          
          <div v-if="statusInfo.days !== undefined" class="mb-4">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-purple-300">Validade</span>
              <span :class="statusInfo.days <= 5 ? 'text-orange-400' : 'text-purple-300'">
                {{ statusInfo.days > 0 ? `${statusInfo.days} dias restantes` : 'Expirada' }}
              </span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-2">
              <div
                class="h-2 rounded-full"
                :class="statusInfo.days <= 5 ? 'bg-orange-500' : 'bg-green-500'"
                :style="{ width: `${Math.min(100, Math.max(0, statusInfo.days / 30 * 100))}%` }"
              ></div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-purple-400">Válida até</span>
              <p class="text-white font-medium">{{ formatDate(license.validUntil) }}</p>
            </div>
            <div>
              <span class="text-purple-400">Último Check-in</span>
              <p class="text-white font-medium">{{ license.lastCheckIn ? formatDateTime(license.lastCheckIn) : 'Nunca' }}</p>
            </div>
          </div>
        </div>
        
        <!-- Chave -->
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h2 class="text-lg font-semibold text-white mb-4">Chave de Licença</h2>
          
          <div class="bg-white/5 rounded-lg p-4 flex items-center justify-between">
            <code class="font-mono text-lg text-white font-bold">{{ license.licenseKey }}</code>
            <button @click="copyKey" class="p-2 text-purple-400 hover:text-white" title="Copiar">
              <svg v-if="!copied" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <svg v-else class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Dados -->
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h2 class="text-lg font-semibold text-white mb-4">Dados da Empresa</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="text-sm text-purple-400">CNPJ</span>
              <p class="text-white font-medium">{{ formatCnpj(license.cnpj) }}</p>
            </div>
            <div>
              <span class="text-sm text-purple-400">E-mail</span>
              <p class="text-white font-medium">{{ license.email || '-' }}</p>
            </div>
            <div>
              <span class="text-sm text-purple-400">Telefone</span>
              <p class="text-white font-medium">{{ license.phone || '-' }}</p>
            </div>
            <div>
              <span class="text-sm text-purple-400">Plano</span>
              <p class="text-white font-medium capitalize">{{ license.plan }}</p>
            </div>
            <div>
              <span class="text-sm text-purple-400">Máx. Usuários</span>
              <p class="text-white font-medium">{{ license.maxUsers }}</p>
            </div>
            <div>
              <span class="text-sm text-purple-400">Criada em</span>
              <p class="text-white font-medium">{{ formatDate(license.createdAt) }}</p>
            </div>
          </div>
          
          <div v-if="license.notes" class="mt-4 pt-4 border-t border-white/10">
            <span class="text-sm text-purple-400">Observações</span>
            <p class="text-white whitespace-pre-wrap">{{ license.notes }}</p>
          </div>
        </div>
      </div>
      
      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Ações -->
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h2 class="text-lg font-semibold text-white mb-4">Ações</h2>
          
          <div class="space-y-3">
            <button
              v-if="license.status !== 'CANCELLED'"
              @click="showRenewModal = true"
              class="w-full px-4 py-3 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 flex items-center gap-3"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Renovar
            </button>
            
            <button
              v-if="license.status === 'ACTIVE' || license.status === 'TRIAL'"
              @click="showSuspendModal = true"
              class="w-full px-4 py-3 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 flex items-center gap-3"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Suspender
            </button>
            
            <button
              v-if="license.status === 'SUSPENDED'"
              @click="handleReactivate"
              :disabled="actionLoading"
              class="w-full px-4 py-3 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 flex items-center gap-3 disabled:opacity-50"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ actionLoading ? 'Reativando...' : 'Reativar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Renovar -->
    <div v-if="showRenewModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-white/10">
        <h3 class="text-lg font-bold text-white mb-4">Renovar Licença</h3>
        
        <div class="mb-4">
          <label class="block text-sm text-purple-300 mb-2">Período (meses)</label>
          <select v-model="renewMonths" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
            <option :value="1">1 mês</option>
            <option :value="3">3 meses</option>
            <option :value="6">6 meses</option>
            <option :value="12">12 meses</option>
          </select>
        </div>
        
        <div class="flex gap-3 justify-end">
          <button @click="showRenewModal = false" class="px-4 py-2 text-purple-300">Cancelar</button>
          <button @click="handleRenew" :disabled="actionLoading" class="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50">
            {{ actionLoading ? 'Renovando...' : 'Renovar' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal Suspender -->
    <div v-if="showSuspendModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-white/10">
        <h3 class="text-lg font-bold text-white mb-4">Suspender Licença</h3>
        
        <div class="mb-4">
          <label class="block text-sm text-purple-300 mb-2">Motivo</label>
          <input v-model="suspendReason" type="text" placeholder="Ex: Inadimplência" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
        </div>
        
        <div class="flex gap-3 justify-end">
          <button @click="showSuspendModal = false" class="px-4 py-2 text-purple-300">Cancelar</button>
          <button @click="handleSuspend" :disabled="actionLoading" class="px-4 py-2 bg-yellow-600 text-white rounded-lg disabled:opacity-50">
            {{ actionLoading ? 'Suspendendo...' : 'Suspender' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Toast -->
    <div v-if="toast.show" class="fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50" :class="toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'">
      <span class="text-white">{{ toast.message }}</span>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth'] })

const route = useRoute()
const { loading, getLicense, renewLicense, suspendLicense, reactivateLicense, getStatusInfo, formatCnpj, formatDate, formatDateTime } = useLicenses()

const license = ref(null)
const showRenewModal = ref(false)
const showSuspendModal = ref(false)
const renewMonths = ref(1)
const suspendReason = ref('Inadimplência')
const actionLoading = ref(false)
const copied = ref(false)
const toast = ref({ show: false, message: '', type: 'success' })

const statusInfo = computed(() => license.value ? getStatusInfo(license.value) : { label: '-', badge: '' })

const loadData = async () => {
  const res = await getLicense(route.params.id)
  if (res.success) license.value = res.data
}

const copyKey = async () => {
  await navigator.clipboard.writeText(license.value.licenseKey)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

const handleRenew = async () => {
  actionLoading.value = true
  const res = await renewLicense(license.value.licenseKey, renewMonths.value)
  actionLoading.value = false
  showRenewModal.value = false
  if (res.success) await loadData()
  showToast(res.success ? 'Renovada!' : res.error, res.success ? 'success' : 'error')
}

const handleSuspend = async () => {
  actionLoading.value = true
  const res = await suspendLicense(license.value.licenseKey, suspendReason.value)
  actionLoading.value = false
  showSuspendModal.value = false
  if (res.success) await loadData()
  showToast(res.success ? 'Suspensa!' : res.error, res.success ? 'success' : 'error')
}

const handleReactivate = async () => {
  actionLoading.value = true
  const res = await reactivateLicense(license.value.licenseKey)
  actionLoading.value = false
  if (res.success) await loadData()
  showToast(res.success ? 'Reativada!' : res.error, res.success ? 'success' : 'error')
}

const showToast = (message, type) => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

onMounted(loadData)
</script>

