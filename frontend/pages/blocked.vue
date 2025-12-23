<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-4">
    <div class="w-full max-w-lg">
      <!-- Ícone de Bloqueio -->
      <div class="text-center mb-8">
        <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 border-4 border-red-500/50">
          <LockClosedIcon class="h-10 w-10 text-red-400" />
        </div>
        <h1 class="mt-6 text-3xl font-bold text-white">Sistema Bloqueado</h1>
        <p class="mt-2 text-red-200">Licença expirada ou suspensa</p>
      </div>

      <!-- Card Principal -->
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
        <!-- Informações da Licença -->
        <div class="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <div class="flex items-center gap-3 mb-3">
            <BuildingStorefrontIcon class="h-6 w-6 text-red-300" />
            <span class="text-white font-medium">{{ companyName || 'Empresa' }}</span>
          </div>
          <div class="text-sm text-red-200/70">
            <p>Status: <span class="text-red-400 font-medium">Bloqueado</span></p>
            <p v-if="graceDays">Dias em atraso: <span class="text-red-400 font-medium">{{ graceDays }}</span></p>
          </div>
        </div>

        <!-- Mensagem -->
        <div class="mb-6">
          <p class="text-white/90 mb-4">
            Seu sistema está em <strong>modo leitura</strong> devido a pendências com a licença.
          </p>
          <p class="text-red-200/70 text-sm">
            Entre em contato com o suporte para regularizar sua situação e voltar a usar todas as funcionalidades.
          </p>
        </div>

        <!-- O que você pode fazer -->
        <div class="mb-6">
          <h3 class="text-white font-medium mb-3 flex items-center gap-2">
            <CheckCircleIcon class="h-5 w-5 text-green-400" />
            O que você ainda pode fazer:
          </h3>
          <ul class="space-y-2 text-sm text-white/80">
            <li class="flex items-center gap-2">
              <ChartBarIcon class="h-4 w-4 text-blue-400" />
              Visualizar relatórios
            </li>
            <li class="flex items-center gap-2">
              <DocumentArrowDownIcon class="h-4 w-4 text-blue-400" />
              Exportar dados
            </li>
            <li class="flex items-center gap-2">
              <CogIcon class="h-4 w-4 text-blue-400" />
              Acessar configurações
            </li>
          </ul>
        </div>

        <!-- O que está bloqueado -->
        <div class="mb-8">
          <h3 class="text-white font-medium mb-3 flex items-center gap-2">
            <XCircleIcon class="h-5 w-5 text-red-400" />
            O que está bloqueado:
          </h3>
          <ul class="space-y-2 text-sm text-white/60">
            <li class="flex items-center gap-2">
              <ShoppingCartIcon class="h-4 w-4" />
              Realizar vendas (PDV)
            </li>
            <li class="flex items-center gap-2">
              <PlusCircleIcon class="h-4 w-4" />
              Cadastrar produtos/clientes
            </li>
            <li class="flex items-center gap-2">
              <ArrowsRightLeftIcon class="h-4 w-4" />
              Movimentações de estoque
            </li>
          </ul>
        </div>

        <!-- Botões de Ação -->
        <div class="space-y-3">
          <button
            @click="onRetry"
            :disabled="retrying"
            class="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span v-if="retrying" class="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-white/70 border-t-transparent"></span>
            <ArrowPathIcon v-else class="h-5 w-5" />
            <span>{{ retrying ? 'Verificando...' : 'Já regularizei - Verificar novamente' }}</span>
          </button>

          <div class="grid grid-cols-2 gap-3">
            <NuxtLink
              to="/reports"
              class="py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors text-center flex items-center justify-center gap-2"
            >
              <ChartBarIcon class="h-5 w-5" />
              Relatórios
            </NuxtLink>
            <NuxtLink
              to="/settings"
              class="py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors text-center flex items-center justify-center gap-2"
            >
              <CogIcon class="h-5 w-5" />
              Configurações
            </NuxtLink>
          </div>
        </div>

        <!-- Mensagem de Sucesso -->
        <Transition name="fade">
          <div v-if="successMsg" class="mt-4 rounded-xl border border-green-400/30 bg-green-500/20 px-4 py-3 text-sm text-green-200">
            {{ successMsg }}
          </div>
        </Transition>

        <!-- Mensagem de Erro -->
        <Transition name="fade">
          <div v-if="errorMsg" class="mt-4 rounded-xl border border-red-400/30 bg-red-500/20 px-4 py-3 text-sm text-red-200">
            {{ errorMsg }}
          </div>
        </Transition>
      </div>

      <!-- Contato -->
      <div class="mt-8 text-center">
        <p class="text-red-200/70 text-sm mb-2">Precisa de ajuda?</p>
        <a 
          href="mailto:suporte@mercadinho.com" 
          class="text-white hover:text-red-300 transition-colors flex items-center justify-center gap-2"
        >
          <EnvelopeIcon class="h-5 w-5" />
          suporte@mercadinho.com
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHead } from '#imports'
import { 
  LockClosedIcon, 
  BuildingStorefrontIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  CogIcon,
  ShoppingCartIcon,
  PlusCircleIcon,
  ArrowsRightLeftIcon,
  ArrowPathIcon,
  EnvelopeIcon
} from '@heroicons/vue/24/outline'

useHead({ title: 'Sistema Bloqueado · Mercadinho PDV' })

definePageMeta({ layout: false })

const { retryLicense, companyName, graceDays, isBlocked } = useLicense()

const retrying = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const onRetry = async () => {
  retrying.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const result = await retryLicense()

    if (result.success) {
      successMsg.value = 'Licença verificada! Redirecionando...'
      setTimeout(() => {
        navigateTo('/')
      }, 1500)
    } else {
      errorMsg.value = result.error || 'Licença ainda não regularizada'
    }
  } catch (error) {
    errorMsg.value = 'Erro ao verificar licença'
  } finally {
    retrying.value = false
  }
}

// Se não está bloqueado, redirecionar para home
onMounted(async () => {
  const { checkLicense, isBlocked: blocked } = useLicense()
  await checkLicense()
  
  if (!blocked.value) {
    navigateTo('/')
  }
})
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

