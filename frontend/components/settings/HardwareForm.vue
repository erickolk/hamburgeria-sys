<template>
  <div class="bg-white rounded-lg p-6 border border-gray-200">
    <div v-if="!isElectron" class="text-center p-8 bg-gray-50 rounded-lg">
      <p class="text-gray-500">
        As configurações de hardware só estão disponíveis no aplicativo Desktop.
      </p>
    </div>

    <div v-else class="space-y-8">
      <!-- Impressora Térmica -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium border-b pb-2">Impressora Térmica</h3>
        <p class="text-sm text-gray-500">
          Configure a impressora térmica compartilhada no Windows.
          <br>
          <span class="text-xs">Ex: Compartilhe a impressora com o nome "Termica" e insira abaixo.</span>
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label class="block text-sm font-medium mb-1">Nome do Compartilhamento</label>
            <input 
              v-model="form.printerName" 
              type="text" 
              class="input w-full" 
              placeholder="Ex: Termica" 
            />
          </div>
          <div>
            <button 
              class="btn btn-outline" 
              @click="testPrinter"
              :disabled="!form.printerName || testingPrinter"
            >
              {{ testingPrinter ? 'Testando...' : '🖨️ Testar Impressão' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Balança -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium border-b pb-2">Balança (Toledo)</h3>
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

      <div class="pt-4 border-t flex justify-end">
        <button 
          class="btn btn-primary" 
          @click="saveConfig" 
          :disabled="saving"
        >
          {{ saving ? 'Salvando...' : 'Salvar Configurações' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from 'vue-toastification'

const toast = useToast()
const { 
  isElectron, 
  getSerialPorts, 
  getHardwareConfig, 
  saveHardwareConfig,
  readScaleWeight,
  printThermal 
} = useElectron()

const form = reactive({
  printerName: '',
  scalePort: ''
})

const serialPorts = ref([])
const saving = ref(false)
const testingPrinter = ref(false)
const testingScale = ref(false)
const scaleResult = ref(null)
const scaleError = ref(null)

const loadPorts = async () => {
  if (!isElectron.value) return
  const res = await getSerialPorts()
  if (res.success) {
    serialPorts.value = res.ports || []
  } else {
    toast.error('Erro ao listar portas seriais')
  }
}

const loadConfig = async () => {
  if (!isElectron.value) return
  const config = await getHardwareConfig()
  if (config) {
    form.printerName = config.printerName || ''
    form.scalePort = config.scalePort || ''
  }
}

const saveConfig = async () => {
  if (!isElectron.value) return
  
  saving.value = true
  try {
    const res = await saveHardwareConfig({ ...form })
    if (res.success) {
      toast.success('Configurações salvas!')
    } else {
      toast.error(res.error || 'Erro ao salvar')
    }
  } catch (err) {
    toast.error('Erro ao salvar configurações')
  } finally {
    saving.value = false
  }
}

const testPrinter = async () => {
  // Para testar, precisamos salvar primeiro ou passar o nome temporariamente?
  // A API usa o config salvo. Então vamos salvar temporariamente ou assumir que o usuário salvou.
  // Vamos salvar antes de testar para garantir.
  
  if (!form.printerName) return
  
  testingPrinter.value = true
  try {
    // Salvar config atual
    await saveHardwareConfig({ ...form })
    
    // Criar arquivo de teste fictício não é simples pois o backend espera POST.
    // Mas podemos tentar imprimir algo simples se o backend permitir,
    // ou apenas testar se o comando funciona.
    
    // Como a função printThermal espera um path de arquivo,
    // e não temos um "test print" endpoint no backend que retorne um arquivo de teste sem venda,
    // vamos tentar imprimir um arquivo de texto simples criado temporariamente?
    // Não temos acesso ao FS aqui.
    
    // O ideal seria um endpoint no backend: POST /api/printer/test -> retorna path de um ticket de teste.
    // Mas sem alterar backend, podemos tentar imprimir um ticket de uma venda antiga?
    // Ou informar ao usuário para realizar uma venda.
    
    // Alternativa: Enviar string direta? O backend electron main suporta string path.
    // Se passarmos um texto, o copy vai falhar.
    
    toast.info('Para testar, realize uma venda ou reimprima um ticket existente.')
    
  } catch (err) {
    toast.error('Erro no teste de impressão')
  } finally {
    testingPrinter.value = false
  }
}

const testScale = async () => {
  if (!form.scalePort) return
  
  testingScale.value = true
  scaleResult.value = null
  scaleError.value = null
  
  try {
    // Salvar config atual para o main process saber qual porta usar
    await saveHardwareConfig({ ...form })
    
    const res = await readScaleWeight()
    if (res.success) {
      scaleResult.value = res.weight
      toast.success(`Peso lido: ${res.weight} kg`)
    } else {
      scaleError.value = res.error
      toast.error(res.error || 'Erro ao ler balança')
    }
  } catch (err) {
    scaleError.value = err.message
  } finally {
    testingScale.value = false
  }
}

onMounted(() => {
  if (isElectron.value) {
    loadPorts()
    loadConfig()
  }
})
</script>

