<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <NuxtLink to="/licenses" class="text-purple-400 hover:text-white text-sm mb-2 inline-block">
        ← Voltar para Licenças
      </NuxtLink>
      <h1 class="text-3xl font-bold text-white mb-2">Nova Licença</h1>
      <p class="text-purple-300">Cadastre uma nova empresa parceira</p>
    </div>
    
    <!-- Formulário -->
    <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 max-w-2xl">
      <form @submit.prevent="handleSubmit">
        <!-- Dados da Empresa -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold text-white mb-4 pb-2 border-b border-white/10">Dados da Empresa</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-purple-300 mb-2">CNPJ *</label>
              <input
                v-model="form.cnpj"
                type="text"
                placeholder="00.000.000/0000-00"
                maxlength="18"
                class="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500"
                :class="{ 'border-red-500': errors.cnpj }"
                @input="formatCnpjInput"
              />
              <p v-if="errors.cnpj" class="mt-1 text-sm text-red-400">{{ errors.cnpj }}</p>
            </div>
            
            <div>
              <label class="block text-sm text-purple-300 mb-2">Nome da Empresa *</label>
              <input
                v-model="form.companyName"
                type="text"
                placeholder="Ex: Mercado do João"
                class="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500"
                :class="{ 'border-red-500': errors.companyName }"
              />
              <p v-if="errors.companyName" class="mt-1 text-sm text-red-400">{{ errors.companyName }}</p>
            </div>
            
            <div>
              <label class="block text-sm text-purple-300 mb-2">E-mail</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="contato@empresa.com"
                class="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label class="block text-sm text-purple-300 mb-2">Telefone</label>
              <input
                v-model="form.phone"
                type="text"
                placeholder="(00) 00000-0000"
                maxlength="15"
                class="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500"
                @input="formatPhoneInput"
              />
            </div>
          </div>
        </div>
        
        <!-- Configurações -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold text-white mb-4 pb-2 border-b border-white/10">Configurações</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm text-purple-300 mb-2">Plano</label>
              <select v-model="form.plan" class="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white">
                <option value="basic">Básico</option>
                <option value="pro">Profissional</option>
                <option value="enterprise">Empresarial</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm text-purple-300 mb-2">Período (meses)</label>
              <select v-model="form.validMonths" class="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white">
                <option :value="1">1 mês</option>
                <option :value="3">3 meses</option>
                <option :value="6">6 meses</option>
                <option :value="12">12 meses</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm text-purple-300 mb-2">Máx. Usuários</label>
              <input
                v-model.number="form.maxUsers"
                type="number"
                min="1"
                max="100"
                class="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
          </div>
        </div>
        
        <!-- Observações -->
        <div class="mb-6">
          <label class="block text-sm text-purple-300 mb-2">Observações</label>
          <textarea
            v-model="form.notes"
            rows="3"
            placeholder="Anotações internas..."
            class="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 resize-none"
          ></textarea>
        </div>
        
        <!-- Erro -->
        <div v-if="submitError" class="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
          <p class="text-red-300">{{ submitError }}</p>
        </div>
        
        <!-- Botões -->
        <div class="flex gap-3 justify-end">
          <NuxtLink to="/licenses" class="px-6 py-2 text-purple-300 hover:text-white">
            Cancelar
          </NuxtLink>
          <button
            type="submit"
            :disabled="loading"
            class="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {{ loading ? 'Criando...' : 'Criar Licença' }}
          </button>
        </div>
      </form>
    </div>
    
    <!-- Modal Sucesso -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-white/10 text-center">
        <div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h3 class="text-xl font-bold text-white mb-2">Licença Criada!</h3>
        
        <div class="bg-white/10 rounded-lg p-4 my-4">
          <p class="text-xs text-purple-300 mb-1">Chave de Licença</p>
          <p class="font-mono text-lg font-bold text-white">{{ createdLicense?.licenseKey }}</p>
        </div>
        
        <button
          @click="copyKey"
          class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mb-3"
        >
          {{ copied ? '✓ Copiado!' : 'Copiar Chave' }}
        </button>
        
        <NuxtLink to="/licenses" class="block text-purple-400 hover:text-white">
          Voltar para Lista
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth'] })

const { createLicense, loading } = useLicenses()

const form = ref({
  cnpj: '',
  companyName: '',
  email: '',
  phone: '',
  plan: 'basic',
  validMonths: 1,
  maxUsers: 5,
  notes: ''
})

const errors = ref({})
const submitError = ref('')
const showSuccessModal = ref(false)
const createdLicense = ref(null)
const copied = ref(false)

const formatCnpjInput = (e) => {
  let v = e.target.value.replace(/\D/g, '').slice(0, 14)
  if (v.length > 12) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
  else if (v.length > 8) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d*)$/, '$1.$2.$3/$4')
  else if (v.length > 5) v = v.replace(/^(\d{2})(\d{3})(\d*)$/, '$1.$2.$3')
  else if (v.length > 2) v = v.replace(/^(\d{2})(\d*)$/, '$1.$2')
  form.value.cnpj = v
}

const formatPhoneInput = (e) => {
  let v = e.target.value.replace(/\D/g, '').slice(0, 11)
  if (v.length > 6) v = v.replace(/^(\d{2})(\d{5})(\d*)$/, '($1) $2-$3')
  else if (v.length > 2) v = v.replace(/^(\d{2})(\d*)$/, '($1) $2')
  form.value.phone = v
}

const validate = () => {
  errors.value = {}
  const cnpj = form.value.cnpj.replace(/\D/g, '')
  if (!cnpj) errors.value.cnpj = 'CNPJ é obrigatório'
  else if (cnpj.length !== 14) errors.value.cnpj = 'CNPJ inválido'
  if (!form.value.companyName.trim()) errors.value.companyName = 'Nome é obrigatório'
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  submitError.value = ''
  if (!validate()) return
  
  const res = await createLicense({
    cnpj: form.value.cnpj.replace(/\D/g, ''),
    companyName: form.value.companyName.trim(),
    email: form.value.email.trim() || undefined,
    phone: form.value.phone.replace(/\D/g, '') || undefined,
    plan: form.value.plan,
    validMonths: form.value.validMonths,
    maxUsers: form.value.maxUsers,
    notes: form.value.notes.trim() || undefined
  })
  
  if (res.success) {
    createdLicense.value = res.data.license
    showSuccessModal.value = true
  } else {
    submitError.value = res.error
  }
}

const copyKey = async () => {
  if (createdLicense.value?.licenseKey) {
    await navigator.clipboard.writeText(createdLicense.value.licenseKey)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

