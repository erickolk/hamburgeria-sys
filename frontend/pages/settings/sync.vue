<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Configuração de Sincronização</h1>
      <p class="text-gray-600">Configure a sincronização offline-first do sistema</p>
    </div>

    <!-- Status Card -->
    <SyncStatus class="mb-8" />

    <!-- Configurações -->
    <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900 mb-6">Configurações</h2>

      <form @submit.prevent="saveConfig" class="space-y-6">
        <!-- VPS API URL -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            URL da VPS
          </label>
          <input
            v-model="config.vpsApiUrl"
            type="url"
            placeholder="https://seu-servidor.com/api"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p class="mt-1 text-sm text-gray-500">
            URL do servidor remoto para sincronização
          </p>
        </div>

        <!-- Sync Token -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Token de Sincronização
          </label>
          <div class="flex space-x-2">
            <input
              v-model="config.syncToken"
              :type="showToken ? 'text' : 'password'"
              placeholder="JWT Token"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="button"
              @click="showToken = !showToken"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              {{ showToken ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <p class="mt-1 text-sm text-gray-500">
            Token JWT gerado no servidor remoto
          </p>
        </div>

        <!-- Intervalo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Intervalo de Sincronização (segundos)
          </label>
          <input
            v-model.number="intervalSeconds"
            type="number"
            min="10"
            max="3600"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p class="mt-1 text-sm text-gray-500">
            Frequência de sincronização automática (recomendado: 60 segundos)
          </p>
        </div>

        <!-- Habilitar/Desabilitar -->
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 class="font-medium text-gray-900">Sincronização Automática</h3>
            <p class="text-sm text-gray-500">Sincronizar dados periodicamente</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="config.isEnabled"
              type="checkbox"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <!-- Botões -->
        <div class="flex space-x-3">
          <button
            type="submit"
            :disabled="saving"
            class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {{ saving ? 'Salvando...' : 'Salvar Configurações' }}
          </button>
          <button
            type="button"
            @click="testConnection"
            :disabled="testing"
            class="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium"
          >
            {{ testing ? 'Testando...' : 'Testar Conexão' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Informações Adicionais -->
    <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Informações do Banco -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="font-medium text-blue-900 mb-2">💾 Banco de Dados</h3>
        <dl class="space-y-1 text-sm">
          <div class="flex justify-between">
            <dt class="text-blue-700">Modo:</dt>
            <dd class="font-medium text-blue-900">{{ databaseMode }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-blue-700">Tipo:</dt>
            <dd class="font-medium text-blue-900">{{ databaseType }}</dd>
          </div>
        </dl>
      </div>

      <!-- Ajuda -->
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 class="font-medium text-gray-900 mb-2">❓ Ajuda</h3>
        <ul class="space-y-1 text-sm text-gray-600">
          <li>• Sistema funciona 100% offline</li>
          <li>• Sincronização automática quando online</li>
          <li>• Dados seguros localmente</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useRouter } from 'vue-router'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const router = useRouter()
const { get, put } = useApi()

const config = ref({
  vpsApiUrl: '',
  syncToken: '',
  syncInterval: 60000,
  isEnabled: false
})

const showToken = ref(false)
const saving = ref(false)
const testing = ref(false)
const databaseMode = ref('local')
const databaseType = ref('PostgreSQL')

const intervalSeconds = computed({
  get: () => Math.floor(config.value.syncInterval / 1000),
  set: (val) => { config.value.syncInterval = val * 1000 }
})

const loadConfig = async () => {
  try {
    const response = await get('/sync/config')
    if (response.config) {
      config.value = {
        vpsApiUrl: response.config.vpsApiUrl,
        syncToken: response.config.syncToken === null ? '' : response.config.syncToken,
        syncInterval: response.config.syncInterval,
        isEnabled: response.config.isEnabled
      }
    }
  } catch (error) {
    console.error('Erro ao carregar configuração:', error)
  }
}

const saveConfig = async () => {
  saving.value = true
  try {
    await put('/sync/config', {
      vpsApiUrl: config.value.vpsApiUrl,
      syncToken: config.value.syncToken,
      syncInterval: config.value.syncInterval,
      isEnabled: config.value.isEnabled
    })

    alert('✅ Configurações salvas com sucesso!')
  } catch (error) {
    console.error('Erro ao salvar:', error)
    alert('❌ Erro ao salvar configurações. Verifique suas permissões.')
  } finally {
    saving.value = false
  }
}

const testConnection = async () => {
  testing.value = true
  try {
    const response = await fetch(`${config.value.vpsApiUrl}/health`, {
      headers: {
        'Authorization': `Bearer ${config.value.syncToken}`
      }
    })

    if (response.ok) {
      alert('✅ Conexão estabelecida com sucesso!')
    } else {
      alert(`❌ Falha na conexão (${response.status})`)
    }
  } catch (error) {
    alert('❌ Não foi possível conectar ao servidor: ' + error.message)
  } finally {
    testing.value = false
  }
}

onMounted(() => {
  loadConfig()
})
</script>

