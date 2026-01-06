<template>
  <div class="bg-white rounded-lg p-6 border border-gray-200">
    <div class="space-y-8">
      <!-- Impressora Térmica -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium border-b pb-2">🖨️ Impressora Térmica</h3>
        <p class="text-sm text-gray-500">
          Configure a impressora térmica compartilhada no Windows.
        </p>
        
        <div class="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
          <strong>Como configurar:</strong>
          <ol class="list-decimal ml-4 mt-1 space-y-1">
            <li>Abra o <strong>Painel de Controle</strong> → <strong>Dispositivos e Impressoras</strong></li>
            <li>Clique direito na impressora → <strong>Propriedades da impressora</strong></li>
            <li>Aba <strong>Compartilhamento</strong> → Marque "Compartilhar esta impressora"</li>
            <li>Nome do compartilhamento: <code class="bg-blue-100 px-1 rounded">Termica</code> (sem acentos)</li>
            <li>Digite o mesmo nome abaixo e clique em Salvar</li>
          </ol>
        </div>

        <div class="flex items-center gap-4 mb-4">
          <label class="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              v-model="form.printerEnabled" 
              class="checkbox checkbox-success"
            >
            <span class="ml-2 text-sm font-medium">
              {{ form.printerEnabled ? '✓ Impressão Direta Ativada' : 'Impressão Direta Desativada' }}
            </span>
          </label>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label class="block text-sm font-medium mb-1">Nome do Compartilhamento *</label>
            <input 
              v-model="form.printerName" 
              type="text" 
              class="input w-full" 
              placeholder="Ex: Termica"
              :disabled="!form.printerEnabled"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Host (opcional)</label>
            <input 
              v-model="form.printerHost" 
              type="text" 
              class="input w-full" 
              placeholder="localhost"
              :disabled="!form.printerEnabled"
            />
          </div>
          <div>
            <button 
              class="btn btn-outline w-full" 
              @click="testPrinter"
              :disabled="!form.printerEnabled || !form.printerName || testingPrinter"
            >
              {{ testingPrinter ? 'Enviando...' : '🖨️ Testar Impressão' }}
            </button>
          </div>
        </div>

        <!-- Status da impressora -->
        <div v-if="printerStatus" class="p-3 rounded border" :class="printerStatus.success ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'">
          <span class="font-medium">Status:</span> 
          <span :class="printerStatus.success ? 'text-green-600' : 'text-yellow-700'">
            {{ printerStatus.message }}
          </span>
        </div>
      </div>

      <!-- Balança (só no Electron) -->
      <div v-if="isElectron" class="space-y-4">
        <h3 class="text-lg font-medium border-b pb-2">⚖️ Balança (Toledo)</h3>
        <p class="text-sm text-gray-500">
          Configure a balança conectada via porta Serial (COM).
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label class="block text-sm font-medium mb-1">Porta Serial (COM)</label>
            <div class="flex gap-2">
              <select v-model="form.scalePort" class="input w-full">
                <option value="">Selecione uma porta...</option>
                <option v-for="port in serialPorts" :key="port.path" :value="port.path">
                  {{ port.path }} {{ port.manufacturer ? `(${port.manufacturer})` : '' }}
                </option>
              </select>
              <button 
                class="btn btn-square btn-outline" 
                @click="loadPorts" 
                title="Atualizar Portas"
              >
                ↻
              </button>
            </div>
          </div>
          <div>
            <button 
              class="btn btn-outline" 
              @click="testScale"
              :disabled="!form.scalePort || testingScale"
            >
              {{ testingScale ? 'Lendo...' : '⚖️ Testar Balança' }}
            </button>
          </div>
        </div>
        
        <div v-if="scaleResult !== null" class="p-3 bg-gray-50 rounded border">
          <span class="font-medium">Resultado do teste:</span> 
          <span :class="scaleError ? 'text-red-600' : 'text-green-600 font-bold'">
            {{ scaleError || scaleResult + ' kg' }}
          </span>
        </div>
      </div>

      <!-- Aviso para versão Web -->
      <div v-if="!isElectron" class="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p class="text-gray-600 text-sm">
          ℹ️ <strong>Nota:</strong> A balança e leitor de código de barras só funcionam no aplicativo Desktop.
          A impressora funciona se estiver compartilhada na rede local.
        </p>
      </div>

      <div class="pt-4 border-t flex justify-end gap-3">
        <button 
          class="btn btn-outline" 
          @click="loadConfig"
        >
          ↻ Recarregar
        </button>
        <button 
          class="btn btn-primary" 
          @click="saveConfig" 
          :disabled="saving"
        >
          {{ saving ? 'Salvando...' : '💾 Salvar Configurações' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from 'vue-toastification'

const toast = useToast()
const { get, put, post } = useApi()

// Verificar se está no Electron
const isElectron = ref(false)
const electronFunctions = ref(null)

// Tentar carregar funções do Electron
onMounted(() => {
  if (typeof window !== 'undefined' && window.electronAPI) {
    isElectron.value = true
    electronFunctions.value = window.electronAPI
  }
  loadConfig()
})

const form = reactive({
  printerEnabled: false,
  printerName: '',
  printerHost: 'localhost',
  scalePort: ''
})

const serialPorts = ref([])
const saving = ref(false)
const testingPrinter = ref(false)
const testingScale = ref(false)
const scaleResult = ref(null)
const scaleError = ref(null)
const printerStatus = ref(null)

const loadPorts = async () => {
  if (!isElectron.value || !electronFunctions.value?.getSerialPorts) return
  try {
    const res = await electronFunctions.value.getSerialPorts()
    if (res.success) {
      serialPorts.value = res.ports || []
    }
  } catch (err) {
    console.error('Erro ao listar portas:', err)
  }
}

const loadConfig = async () => {
  try {
    // Carregar config do backend
    const res = await get('/hardware/printer')
    if (res.success && res.data) {
      form.printerEnabled = res.data.enabled || false
      form.printerName = res.data.shareName || ''
      form.printerHost = res.data.host || 'localhost'
    }
    
    // Se no Electron, carregar config local também
    if (isElectron.value && electronFunctions.value?.getHardwareConfig) {
      const config = await electronFunctions.value.getHardwareConfig()
      if (config) {
        form.scalePort = config.scalePort || ''
      }
      loadPorts()
    }
  } catch (err) {
    console.error('Erro ao carregar config:', err)
  }
}

const saveConfig = async () => {
  saving.value = true
  try {
    // Salvar no backend (impressora)
    const res = await put('/hardware/printer', {
      enabled: form.printerEnabled,
      shareName: form.printerName,
      host: form.printerHost || 'localhost'
    })
    
    // Se no Electron, salvar config local também
    if (isElectron.value && electronFunctions.value?.saveHardwareConfig) {
      await electronFunctions.value.saveHardwareConfig({
        printerName: form.printerName,
        scalePort: form.scalePort
      })
    }
    
    if (res.success) {
      toast.success('Configurações salvas!')
    } else {
      toast.error(res.error || 'Erro ao salvar')
    }
  } catch (err) {
    console.error('Erro ao salvar:', err)
    toast.error('Erro ao salvar configurações')
  } finally {
    saving.value = false
  }
}

const testPrinter = async () => {
  if (!form.printerName) {
    toast.warning('Digite o nome do compartilhamento da impressora')
    return
  }
  
  testingPrinter.value = true
  printerStatus.value = null
  
  try {
    // Primeiro salvar as configurações
    await saveConfig()
    
    // Testar impressão via API do backend
    const res = await post('/hardware/printer/test', {})
    
    if (res.success && res.data) {
      printerStatus.value = {
        success: res.data.success,
        message: res.data.message
      }
      
      if (res.data.success) {
        toast.success('🖨️ Ticket enviado para impressora!')
      } else {
        toast.warning(res.data.message || 'Verifique a configuração da impressora')
      }
    } else {
      printerStatus.value = {
        success: false,
        message: res.error || 'Erro ao testar'
      }
      toast.warning(res.error || 'Erro no teste')
    }
  } catch (err) {
    console.error('Erro no teste:', err)
    printerStatus.value = {
      success: false,
      message: err.message || 'Erro ao testar impressora'
    }
    toast.error('Erro no teste de impressão')
  } finally {
    testingPrinter.value = false
  }
}

const testScale = async () => {
  if (!form.scalePort || !isElectron.value) return
  
  testingScale.value = true
  scaleResult.value = null
  scaleError.value = null
  
  try {
    if (electronFunctions.value?.saveHardwareConfig) {
      await electronFunctions.value.saveHardwareConfig({
        printerName: form.printerName,
        scalePort: form.scalePort
      })
    }
    
    if (electronFunctions.value?.readScaleWeight) {
      const res = await electronFunctions.value.readScaleWeight()
      if (res.success) {
        scaleResult.value = res.weight
        toast.success(`Peso lido: ${res.weight} kg`)
      } else {
        scaleError.value = res.error
        toast.error(res.error || 'Erro ao ler balança')
      }
    }
  } catch (err) {
    scaleError.value = err.message
  } finally {
    testingScale.value = false
  }
}
</script>
