<template>
  <!-- Warning Banner (amarelo) -->
  <div 
    v-if="isWarning && !dismissed"
    class="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 shadow-lg"
  >
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <ExclamationTriangleIcon class="h-6 w-6 flex-shrink-0" />
        <div>
          <p class="font-medium">{{ statusMessage }}</p>
          <p v-if="daysRemaining > 0" class="text-sm text-amber-100">
            Sua licença vence em {{ daysRemaining }} dia(s). Renove para evitar interrupções.
          </p>
          <p v-else-if="daysUntilBlock" class="text-sm text-amber-100">
            Regularize em {{ daysUntilBlock }} dia(s) para evitar o bloqueio do sistema.
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="onRetry"
          :disabled="retrying"
          class="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
        >
          {{ retrying ? 'Verificando...' : 'Já paguei' }}
        </button>
        <button
          @click="dismissed = true"
          class="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>

  <!-- Critical Modal (vermelho) -->
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="showCriticalModal"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
            <div class="flex items-center gap-3 text-white">
              <ExclamationCircleIcon class="h-8 w-8" />
              <div>
                <h2 class="text-xl font-bold">Atenção!</h2>
                <p class="text-red-100 text-sm">Licença com pendências</p>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6">
            <p class="text-gray-700 mb-4">
              {{ statusMessage }}
            </p>
            
            <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div class="flex items-center gap-3">
                <ClockIcon class="h-10 w-10 text-red-500" />
                <div>
                  <p class="text-2xl font-bold text-red-600">{{ daysUntilBlock }}</p>
                  <p class="text-sm text-red-700">dias até o bloqueio</p>
                </div>
              </div>
            </div>

            <p class="text-sm text-gray-500 mb-6">
              Após o bloqueio, o sistema entrará em modo leitura. 
              Você ainda poderá visualizar relatórios e exportar dados, mas não poderá realizar vendas.
            </p>

            <div class="flex gap-3">
              <button
                @click="onRetry"
                :disabled="retrying"
                class="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors"
              >
                {{ retrying ? 'Verificando...' : 'Já regularizei' }}
              </button>
              <button
                @click="dismissCritical"
                class="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Critical Banner (sempre visível quando crítico) -->
  <div 
    v-if="isCritical && !showCriticalModal"
    class="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 shadow-lg"
  >
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <ExclamationCircleIcon class="h-6 w-6 flex-shrink-0 animate-pulse" />
        <div>
          <p class="font-medium">{{ statusMessage }}</p>
          <p class="text-sm text-red-200">
            Sistema será bloqueado em {{ daysUntilBlock }} dia(s)
          </p>
        </div>
      </div>
      <button
        @click="onRetry"
        :disabled="retrying"
        class="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
      >
        {{ retrying ? 'Verificando...' : 'Já regularizei' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { 
  ExclamationTriangleIcon, 
  ExclamationCircleIcon, 
  XMarkIcon,
  ClockIcon 
} from '@heroicons/vue/24/outline'

const { 
  isWarning, 
  isCritical, 
  statusMessage, 
  daysRemaining,
  daysUntilBlock,
  retryLicense 
} = useLicense()

const dismissed = ref(false)
const retrying = ref(false)
const criticalDismissed = ref(false)

// Mostrar modal crítico apenas uma vez por sessão
const showCriticalModal = computed(() => {
  return isCritical.value && !criticalDismissed.value
})

const onRetry = async () => {
  retrying.value = true
  try {
    const result = await retryLicense()
    if (result.success) {
      dismissed.value = true
      criticalDismissed.value = true
    }
  } finally {
    retrying.value = false
  }
}

const dismissCritical = () => {
  criticalDismissed.value = true
}

// Reset dismissed quando o status muda
watch([isWarning, isCritical], () => {
  if (!isWarning.value && !isCritical.value) {
    dismissed.value = false
    criticalDismissed.value = false
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
}
</style>

