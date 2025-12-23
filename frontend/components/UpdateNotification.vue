<template>
  <!-- Modal de Atualização Disponível -->
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="showUpdateModal"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <div class="flex items-center gap-3 text-white">
              <ArrowDownTrayIcon class="h-8 w-8" />
              <div>
                <h2 class="text-xl font-bold">Atualização Disponível</h2>
                <p class="text-blue-100 text-sm">Nova versão do Mercadinho PDV</p>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6">
            <!-- Versões -->
            <div class="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
              <div class="text-center">
                <p class="text-xs text-gray-500">Versão Atual</p>
                <p class="text-lg font-bold text-gray-600">{{ updateInfo.currentVersion }}</p>
              </div>
              <ArrowRightIcon class="h-5 w-5 text-gray-400" />
              <div class="text-center">
                <p class="text-xs text-gray-500">Nova Versão</p>
                <p class="text-lg font-bold text-blue-600">{{ updateInfo.latestVersion }}</p>
              </div>
            </div>

            <!-- Changelog -->
            <div v-if="updateInfo.changelog" class="mb-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Novidades:</h4>
              <div class="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 max-h-32 overflow-y-auto">
                {{ updateInfo.changelog }}
              </div>
            </div>

            <!-- Info -->
            <div class="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <span class="flex items-center gap-1">
                <CloudArrowDownIcon class="h-4 w-4" />
                {{ updateInfo.size || '~150 MB' }}
              </span>
              <span v-if="updateInfo.releaseDate" class="flex items-center gap-1">
                <CalendarIcon class="h-4 w-4" />
                {{ formatDate(updateInfo.releaseDate) }}
              </span>
            </div>

            <!-- Progresso de Download -->
            <div v-if="downloading" class="mb-6">
              <div class="flex items-center justify-between text-sm mb-2">
                <span class="text-gray-600">Baixando atualização...</span>
                <span class="text-blue-600 font-medium">{{ downloadProgress }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  class="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  :style="{ width: `${downloadProgress}%` }"
                ></div>
              </div>
            </div>

            <!-- Botões -->
            <div v-if="!downloading" class="flex gap-3">
              <button
                @click="downloadAndInstall"
                class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <ArrowDownTrayIcon class="h-5 w-5" />
                Atualizar Agora
              </button>
              <button
                @click="remindLater"
                class="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
              >
                Depois
              </button>
            </div>

            <!-- Link para pular versão -->
            <div v-if="!downloading" class="mt-4 text-center">
              <button 
                @click="skipThisVersion"
                class="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Pular esta versão
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Toast de Notificação (pequeno, no canto) -->
  <Transition name="slide">
    <div 
      v-if="showToast && !showUpdateModal"
      class="fixed bottom-4 right-4 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-sm"
    >
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <ArrowDownTrayIcon class="h-5 w-5 text-blue-600" />
        </div>
        <div class="flex-1">
          <h4 class="font-medium text-gray-900">Atualização Disponível</h4>
          <p class="text-sm text-gray-500">Versão {{ updateInfo.latestVersion }} está disponível</p>
          <div class="mt-2 flex gap-2">
            <button
              @click="showUpdateModal = true; showToast = false"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver detalhes
            </button>
            <button
              @click="showToast = false"
              class="text-sm text-gray-400 hover:text-gray-600"
            >
              Ignorar
            </button>
          </div>
        </div>
        <button @click="showToast = false" class="text-gray-400 hover:text-gray-600">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import {
  ArrowDownTrayIcon,
  ArrowRightIcon,
  CloudArrowDownIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const showUpdateModal = ref(false)
const showToast = ref(false)
const downloading = ref(false)
const downloadProgress = ref(0)

const updateInfo = ref({
  currentVersion: '1.0.0',
  latestVersion: '1.1.0',
  changelog: '',
  size: '~150 MB',
  releaseDate: null,
  downloadUrl: ''
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR')
}

const checkForUpdates = async () => {
  // Verificar se está no Electron
  if (typeof window !== 'undefined' && window.electronAPI?.checkForUpdates) {
    try {
      const result = await window.electronAPI.checkForUpdates()
      
      if (result.available) {
        updateInfo.value = result
        showToast.value = true
      }
    } catch (e) {
      console.error('[UpdateNotification] Erro ao verificar atualizações:', e)
    }
  }
}

const downloadAndInstall = async () => {
  if (!window.electronAPI?.downloadUpdate) {
    // Fallback: abrir URL no navegador
    if (updateInfo.value.downloadUrl) {
      window.open(updateInfo.value.downloadUrl, '_blank')
    }
    return
  }

  downloading.value = true
  downloadProgress.value = 0

  try {
    // Configurar listener de progresso
    window.electronAPI.onDownloadProgress((percent) => {
      downloadProgress.value = percent
    })

    const result = await window.electronAPI.downloadUpdate(updateInfo.value.downloadUrl)
    
    if (result.success) {
      // Perguntar se quer instalar agora
      const install = confirm('Download concluído! Deseja instalar agora?\n\nO aplicativo será fechado para instalação.')
      
      if (install) {
        await window.electronAPI.installUpdate(result.filePath)
      }
    }
  } catch (e) {
    console.error('[UpdateNotification] Erro no download:', e)
    alert('Erro ao baixar atualização. Tente novamente.')
  } finally {
    downloading.value = false
    downloadProgress.value = 0
  }
}

const remindLater = () => {
  showUpdateModal.value = false
  showToast.value = false
}

const skipThisVersion = async () => {
  if (window.electronAPI?.skipVersion) {
    await window.electronAPI.skipVersion(updateInfo.value.latestVersion)
  }
  showUpdateModal.value = false
  showToast.value = false
}

// Verificar atualizações ao montar
onMounted(() => {
  // Delay para não atrapalhar carregamento inicial
  setTimeout(checkForUpdates, 5000)
})

// Expor método para verificar manualmente
defineExpose({ checkForUpdates })
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

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>

