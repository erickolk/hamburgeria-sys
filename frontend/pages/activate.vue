<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo e Título -->
      <div class="text-center mb-8">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-3xl font-bold text-white shadow-lg shadow-blue-500/30">
          M
        </div>
        <h1 class="mt-6 text-3xl font-bold text-white">Mercadinho PDV</h1>
        <p class="mt-2 text-blue-200">Ative sua licença para começar</p>
      </div>

      <!-- Card de Ativação -->
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
        <form @submit.prevent="onSubmit" class="space-y-6">
          <div class="space-y-2">
            <label for="licenseKey" class="block text-sm font-medium text-blue-100">
              Chave de Licença
            </label>
            <div class="relative">
              <span class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-blue-300">
                <KeyIcon class="h-5 w-5" />
              </span>
              <input
                id="licenseKey"
                v-model="licenseKey"
                type="text"
                required
                maxlength="19"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                class="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-lg tracking-wider"
                @input="onKeyInput"
              />
            </div>
            <p class="text-xs text-blue-300/70">
              Digite a chave de licença fornecida no formato XXXX-XXXX-XXXX-XXXX
            </p>
          </div>

          <!-- Mensagem de Erro -->
          <Transition name="fade">
            <div v-if="errorMsg" class="rounded-xl border border-red-400/30 bg-red-500/20 px-4 py-3 text-sm text-red-200">
              <div class="flex items-start gap-2">
                <ExclamationCircleIcon class="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{{ errorMsg }}</span>
              </div>
            </div>
          </Transition>

          <!-- Mensagem de Sucesso -->
          <Transition name="fade">
            <div v-if="successMsg" class="rounded-xl border border-green-400/30 bg-green-500/20 px-4 py-3 text-sm text-green-200">
              <div class="flex items-start gap-2">
                <CheckCircleIcon class="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{{ successMsg }}</span>
              </div>
            </div>
          </Transition>

          <!-- Botão de Ativar -->
          <button
            type="submit"
            :disabled="loading || licenseKey.length < 19"
            class="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span v-if="loading" class="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-white/70 border-t-transparent"></span>
            <span>{{ loading ? 'Ativando...' : 'Ativar Licença' }}</span>
          </button>
        </form>

        <!-- Informações adicionais -->
        <div class="mt-8 pt-6 border-t border-white/10">
          <div class="text-center text-sm text-blue-200/70">
            <p>Não possui uma licença?</p>
            <a href="mailto:suporte@mercadinho.com" class="text-blue-400 hover:text-blue-300 transition-colors">
              Entre em contato com o suporte
            </a>
          </div>
        </div>
      </div>

      <!-- Rodapé -->
      <div class="mt-8 text-center text-sm text-blue-300/50">
        <p>Mercadinho PDV v1.0.0</p>
        <p class="mt-1">Sistema de Gestão para Pequenos Mercados</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHead } from '#imports'
import { KeyIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

useHead({ title: 'Ativar Licença · Mercadinho PDV' })

definePageMeta({ layout: false })

const { activateLicense, formatLicenseKey } = useLicense()

const licenseKey = ref('')
const errorMsg = ref('')
const successMsg = ref('')
const loading = ref(false)

const onKeyInput = (event) => {
  licenseKey.value = formatLicenseKey(event.target.value)
}

const onSubmit = async () => {
  if (loading.value) return
  
  errorMsg.value = ''
  successMsg.value = ''
  loading.value = true

  try {
    const result = await activateLicense(licenseKey.value)

    if (result.success) {
      successMsg.value = 'Licença ativada com sucesso! Redirecionando...'
      
      // Aguardar um pouco e redirecionar
      setTimeout(() => {
        navigateTo('/')
      }, 1500)
    } else {
      errorMsg.value = result.error || 'Não foi possível ativar a licença'
    }
  } catch (error) {
    console.error('[activate] erro:', error)
    errorMsg.value = 'Erro inesperado ao ativar licença'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

