<template>
  <div class="text-gray-900">
    <div class="text-center mb-8">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-2xl font-bold text-white shadow-sm">
        M
      </div>
      <h1 class="mt-4 text-2xl font-semibold">Bem-vindo de volta 👋</h1>
      <p class="mt-2 text-sm text-gray-500">Acesse o painel utilizando suas credenciais cadastradas.</p>
    </div>

    <form @submit.prevent="onSubmit" class="space-y-6">
      <div class="space-y-2">
        <label for="email" class="block text-sm font-medium text-gray-700">E-mail</label>
        <div class="relative">
          <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
            <EnvelopeIcon class="h-5 w-5" />
          </span>
          <input
            id="email"
            v-model.trim="email"
            type="email"
            required
            autocomplete="email"
            placeholder="admin@mercadinho.com"
            class="input w-full pl-11"
          />
        </div>
      </div>

      <div class="space-y-2">
        <label for="password" class="block text-sm font-medium text-gray-700">Senha</label>
        <div class="relative">
          <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
            <LockClosedIcon class="h-5 w-5" />
          </span>
          <input
            :type="showPassword ? 'text' : 'password'"
            id="password"
            v-model="password"
            required
            autocomplete="current-password"
            placeholder="Sua senha"
            class="input w-full pl-11 pr-12"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-3 flex items-center text-gray-400 transition hover:text-gray-600"
            @click="togglePasswordVisibility"
          >
            <EyeSlashIcon v-if="showPassword" class="h-5 w-5" />
            <EyeIcon v-else class="h-5 w-5" />
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between text-sm">
        <label class="inline-flex items-center gap-2 text-gray-600">
          <input v-model="rememberMe" type="checkbox" class="checkbox checkbox-primary checkbox-sm" />
          Manter-me conectado
        </label>
        <NuxtLink to="/recuperar-senha" class="font-medium text-blue-600 transition hover:text-blue-700">
          Esqueci minha senha
        </NuxtLink>
      </div>

      <Transition name="fade">
        <div v-if="errorMsg" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {{ errorMsg }}
        </div>
      </Transition>

      <button
        type="submit"
        class="btn btn-primary w-full"
        :disabled="loading"
      >
        <span class="flex items-center justify-center gap-2">
          <span v-if="loading" class="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent"></span>
          <span>{{ loading ? 'Entrando...' : 'Entrar no sistema' }}</span>
        </span>
      </button>
    </form>

    <div class="mt-8 text-center text-sm text-gray-500">
      Dúvidas? Entre em contato com o suporte interno.
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useHead } from '#imports'
import { useToast } from 'vue-toastification'
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

useHead({ title: 'Entrar · Mercadinho' })

definePageMeta({ layout: 'auth' })

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const errorMsg = ref('')
const loading = ref(false)

const toast = useToast()
const { login } = useAuth()

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const onSubmit = async () => {
  if (loading.value) return

  if (!email.value || !password.value) {
    errorMsg.value = 'Informe e-mail e senha para continuar.'
    toast.error(errorMsg.value)
    return
  }

  errorMsg.value = ''
  loading.value = true

  try {
    toast.info('Verificando credenciais...')
    const res = await login({ email: email.value, password: password.value })

    if (res.success) {
      toast.success('Login realizado! Redirecionando...')
      if (process.client) {
        if (rememberMe.value) {
          localStorage.setItem('rememberedEmail', email.value)
        } else {
          localStorage.removeItem('rememberedEmail')
        }
      }
      await navigateTo('/')
    } else {
      errorMsg.value = res.error || 'Não foi possível autenticar. Verifique seus dados.'
      toast.error(errorMsg.value)
    }
  } catch (error) {
    console.error('[login] erro inesperado', error)
    errorMsg.value = 'Erro inesperado ao fazer login. Tente novamente em instantes.'
    toast.error('Erro inesperado ao fazer login')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (process.client) {
    const storedEmail = localStorage.getItem('rememberedEmail')
    if (storedEmail) {
      email.value = storedEmail
      rememberMe.value = true
    }
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>