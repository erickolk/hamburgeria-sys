<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-white mb-2">Licenças</h1>
        <p class="text-purple-300">Gerencie todas as licenças das empresas parceiras</p>
      </div>
      <NuxtLink
        to="/licenses/new"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nova Licença
      </NuxtLink>
    </div>
    
    <!-- Filtros -->
    <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/10">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="search"
            type="text"
            placeholder="Buscar por nome, CNPJ ou chave..."
            class="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500"
            @input="debouncedSearch"
          />
        </div>
        <select
          v-model="statusFilter"
          class="px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
          @change="loadData"
        >
          <option value="">Todos os status</option>
          <option value="ACTIVE">Ativas</option>
          <option value="TRIAL">Em Teste</option>
          <option value="SUSPENDED">Suspensas</option>
          <option value="CANCELLED">Canceladas</option>
        </select>
      </div>
    </div>
    
    <!-- Lista -->
    <div class="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
      <div v-if="loading" class="p-12 text-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto"></div>
      </div>
      
      <div v-else-if="licenses.length === 0" class="p-12 text-center">
        <svg class="w-16 h-16 text-purple-400/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
        <h3 class="text-lg font-medium text-white mb-2">Nenhuma licença encontrada</h3>
        <p class="text-purple-300 mb-4">Crie sua primeira licença para uma empresa parceira.</p>
        <NuxtLink to="/licenses/new" class="text-purple-400 hover:text-white">
          + Criar Licença
        </NuxtLink>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-white/5">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase">Empresa</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase">CNPJ</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase">Status</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase">Validade</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase">Último Check-in</th>
              <th class="px-6 py-4 text-right text-xs font-medium text-purple-300 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr v-for="license in licenses" :key="license.id" class="hover:bg-white/5">
              <td class="px-6 py-4">
                <div class="font-medium text-white">{{ license.companyName }}</div>
                <div class="text-sm text-purple-400 font-mono">{{ license.licenseKey }}</div>
              </td>
              <td class="px-6 py-4 text-purple-300">
                {{ formatCnpj(license.cnpj) }}
              </td>
              <td class="px-6 py-4">
                <span :class="['px-2 py-1 text-xs font-medium rounded-full', getStatusInfo(license).badge]">
                  {{ getStatusInfo(license).label }}
                </span>
              </td>
              <td class="px-6 py-4 text-purple-300">
                {{ formatDate(license.validUntil) }}
              </td>
              <td class="px-6 py-4 text-purple-300 text-sm">
                {{ license.lastCheckIn ? formatDateTime(license.lastCheckIn) : 'Nunca' }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink
                    :to="`/licenses/${license.id}`"
                    class="p-2 text-purple-400 hover:text-white transition-colors"
                    title="Ver"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </NuxtLink>
                  <button
                    v-if="license.status !== 'CANCELLED'"
                    @click="openRenewModal(license)"
                    class="p-2 text-green-400 hover:text-green-300 transition-colors"
                    title="Renovar"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    v-if="license.status === 'ACTIVE' || license.status === 'TRIAL'"
                    @click="openSuspendModal(license)"
                    class="p-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                    title="Suspender"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </button>
                  <button
                    v-if="license.status === 'SUSPENDED'"
                    @click="handleReactivate(license)"
                    class="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                    title="Reativar"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Modal Renovar -->
    <div v-if="showRenewModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-white/10">
        <h3 class="text-lg font-bold text-white mb-4">Renovar Licença</h3>
        <p class="text-purple-300 mb-4">{{ selectedLicense?.companyName }}</p>
        
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
          <button @click="showRenewModal = false" class="px-4 py-2 text-purple-300 hover:text-white">
            Cancelar
          </button>
          <button
            @click="handleRenew"
            :disabled="actionLoading"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {{ actionLoading ? 'Renovando...' : 'Renovar' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal Suspender -->
    <div v-if="showSuspendModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-white/10">
        <h3 class="text-lg font-bold text-white mb-4">Suspender Licença</h3>
        <p class="text-purple-300 mb-4">{{ selectedLicense?.companyName }}</p>
        
        <div class="mb-4">
          <label class="block text-sm text-purple-300 mb-2">Motivo</label>
          <input
            v-model="suspendReason"
            type="text"
            placeholder="Ex: Inadimplência"
            class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          />
        </div>
        
        <div class="flex gap-3 justify-end">
          <button @click="showSuspendModal = false" class="px-4 py-2 text-purple-300 hover:text-white">
            Cancelar
          </button>
          <button
            @click="handleSuspend"
            :disabled="actionLoading"
            class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
          >
            {{ actionLoading ? 'Suspendendo...' : 'Suspender' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Toast -->
    <div
      v-if="toast.show"
      class="fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50"
      :class="toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'"
    >
      <span class="text-white">{{ toast.message }}</span>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth'] })

const {
  licenses, loading, listLicenses, renewLicense, suspendLicense, reactivateLicense,
  getStatusInfo, formatCnpj, formatDate, formatDateTime
} = useLicenses()

const search = ref('')
const statusFilter = ref('')
const showRenewModal = ref(false)
const showSuspendModal = ref(false)
const selectedLicense = ref(null)
const renewMonths = ref(1)
const suspendReason = ref('Inadimplência')
const actionLoading = ref(false)
const toast = ref({ show: false, message: '', type: 'success' })

let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(loadData, 300)
}

const loadData = () => {
  listLicenses({ status: statusFilter.value || undefined, search: search.value || undefined })
}

const openRenewModal = (license) => {
  selectedLicense.value = license
  renewMonths.value = 1
  showRenewModal.value = true
}

const openSuspendModal = (license) => {
  selectedLicense.value = license
  suspendReason.value = 'Inadimplência'
  showSuspendModal.value = true
}

const handleRenew = async () => {
  actionLoading.value = true
  const res = await renewLicense(selectedLicense.value.licenseKey, renewMonths.value)
  actionLoading.value = false
  showRenewModal.value = false
  showToast(res.success ? `Renovada por ${renewMonths.value} mês(es)!` : res.error, res.success ? 'success' : 'error')
}

const handleSuspend = async () => {
  actionLoading.value = true
  const res = await suspendLicense(selectedLicense.value.licenseKey, suspendReason.value)
  actionLoading.value = false
  showSuspendModal.value = false
  showToast(res.success ? 'Licença suspensa!' : res.error, res.success ? 'success' : 'error')
}

const handleReactivate = async (license) => {
  if (!confirm(`Reativar licença de ${license.companyName}?`)) return
  actionLoading.value = true
  const res = await reactivateLicense(license.licenseKey)
  actionLoading.value = false
  showToast(res.success ? 'Licença reativada!' : res.error, res.success ? 'success' : 'error')
}

const showToast = (message, type) => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

onMounted(loadData)
</script>

