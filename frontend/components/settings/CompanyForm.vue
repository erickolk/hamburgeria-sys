<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <form @submit.prevent="handleSubmit">
      <!-- Dados Básicos -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Dados Básicos</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nome do Estabelecimento *
            </label>
            <input
              v-model="form.name"
              type="text"
              class="input w-full"
              :class="{ 'border-red-500': errors.name }"
              placeholder="Ex: Mercadinho da Esquina"
              required
            />
            <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              CNPJ *
            </label>
            <input
              v-model="form.cnpj"
              type="text"
              class="input w-full"
              :class="{ 'border-red-500': errors.cnpj }"
              placeholder="00.000.000/0000-00"
              maxlength="18"
              @input="handleCNPJInput"
              @blur="validateCNPJField"
              required
            />
            <p v-if="errors.cnpj" class="text-red-500 text-xs mt-1">{{ errors.cnpj }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Telefone *
            </label>
            <input
              v-model="form.phone"
              type="text"
              class="input w-full"
              :class="{ 'border-red-500': errors.phone }"
              placeholder="(00) 00000-0000"
              maxlength="15"
              @input="handlePhoneInput"
              required
            />
            <p v-if="errors.phone" class="text-red-500 text-xs mt-1">{{ errors.phone }}</p>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              v-model="form.website"
              type="url"
              class="input w-full"
              placeholder="https://www.seusite.com.br"
            />
          </div>
        </div>
      </div>

      <!-- Endereço -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Endereço</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              CEP *
            </label>
            <div class="flex gap-2">
              <input
                v-model="form.zipCode"
                type="text"
                class="input flex-1"
                :class="{ 'border-red-500': errors.zipCode }"
                placeholder="00000-000"
                maxlength="9"
                @input="handleCEPInput"
                @blur="searchAddress"
                required
              />
              <button
                type="button"
                class="btn btn-outline"
                :disabled="cepLoading"
                @click="searchAddress"
              >
                {{ cepLoading ? '...' : '🔍' }}
              </button>
            </div>
            <p v-if="errors.zipCode" class="text-red-500 text-xs mt-1">{{ errors.zipCode }}</p>
            <p v-if="cepError" class="text-red-500 text-xs mt-1">{{ cepError }}</p>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Rua *
            </label>
            <input
              v-model="form.street"
              type="text"
              class="input w-full"
              :class="{ 'border-red-500': errors.street }"
              placeholder="Nome da rua"
              required
            />
            <p v-if="errors.street" class="text-red-500 text-xs mt-1">{{ errors.street }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Número *
            </label>
            <input
              v-model="form.number"
              type="text"
              class="input w-full"
              :class="{ 'border-red-500': errors.number }"
              placeholder="123"
              required
            />
            <p v-if="errors.number" class="text-red-500 text-xs mt-1">{{ errors.number }}</p>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Complemento
            </label>
            <input
              v-model="form.complement"
              type="text"
              class="input w-full"
              placeholder="Loja 1, Sala 2, etc."
            />
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Bairro *
            </label>
            <input
              v-model="form.neighborhood"
              type="text"
              class="input w-full"
              :class="{ 'border-red-500': errors.neighborhood }"
              placeholder="Nome do bairro"
              required
            />
            <p v-if="errors.neighborhood" class="text-red-500 text-xs mt-1">{{ errors.neighborhood }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Cidade *
            </label>
            <input
              v-model="form.city"
              type="text"
              class="input w-full"
              :class="{ 'border-red-500': errors.city }"
              placeholder="Nome da cidade"
              required
            />
            <p v-if="errors.city" class="text-red-500 text-xs mt-1">{{ errors.city }}</p>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Estado *
            </label>
            <select
              v-model="form.state"
              class="input w-full"
              :class="{ 'border-red-500': errors.state }"
              required
            >
              <option value="">Selecione...</option>
              <option v-for="state in states" :key="state.value" :value="state.value">
                {{ state.label }}
              </option>
            </select>
            <p v-if="errors.state" class="text-red-500 text-xs mt-1">{{ errors.state }}</p>
          </div>
        </div>
      </div>

      <!-- Ações -->
      <div class="flex justify-end gap-3">
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="saving"
        >
          {{ saving ? 'Salvando...' : 'Salvar Configurações' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { validateCNPJ, maskCNPJ, maskCEP, maskPhone, BRAZILIAN_STATES } from '~/utils/validators'
import { useToast } from 'vue-toastification'

const { get, put } = useApi()
const toast = useToast()
const { searchCep, loading: cepLoading, error: cepError } = useCep()

const states = BRAZILIAN_STATES

const form = reactive({
  name: '',
  cnpj: '',
  phone: '',
  website: '',
  zipCode: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: ''
})

const errors = reactive({})
const saving = ref(false)

// Carregar dados existentes
const loadSettings = async () => {
  const res = await get('/api/settings/company')
  if (res.success && res.data) {
    Object.assign(form, {
      name: res.data.name || '',
      cnpj: res.data.cnpj || '',
      phone: res.data.phone || '',
      website: res.data.website || '',
      zipCode: res.data.zipCode || '',
      street: res.data.street || '',
      number: res.data.number || '',
      complement: res.data.complement || '',
      neighborhood: res.data.neighborhood || '',
      city: res.data.city || '',
      state: res.data.state || ''
    })
  }
}

// Máscaras de input
const handleCNPJInput = (e) => {
  form.cnpj = maskCNPJ(e.target.value)
  if (errors.cnpj) delete errors.cnpj
}

const handleCEPInput = (e) => {
  form.zipCode = maskCEP(e.target.value)
  if (errors.zipCode) delete errors.zipCode
}

const handlePhoneInput = (e) => {
  form.phone = maskPhone(e.target.value)
  if (errors.phone) delete errors.phone
}

// Validações
const validateCNPJField = () => {
  if (form.cnpj && !validateCNPJ(form.cnpj)) {
    errors.cnpj = 'CNPJ inválido'
  } else {
    delete errors.cnpj
  }
}

// Buscar endereço por CEP
const searchAddress = async () => {
  if (!form.zipCode) return

  const address = await searchCep(form.zipCode)
  if (address) {
    form.street = address.street || form.street
    form.neighborhood = address.neighborhood || form.neighborhood
    form.city = address.city || form.city
    form.state = address.state || form.state
    if (address.complement) {
      form.complement = address.complement
    }
  }
}

// Submeter formulário
const handleSubmit = async () => {
  // Limpar erros anteriores
  Object.keys(errors).forEach(key => delete errors[key])

  // Validar CNPJ
  if (!validateCNPJ(form.cnpj)) {
    errors.cnpj = 'CNPJ inválido'
    toast.error('Por favor, corrija os erros no formulário')
    return
  }

  saving.value = true

  try {
    const res = await put('/api/settings/company', form)
    
    if (res.success) {
      toast.success('Configurações salvas com sucesso!')
      await loadSettings() // Recarregar dados
    } else {
      toast.error(res.error || 'Erro ao salvar configurações')
      
      // Exibir erros de validação
      if (res.details && Array.isArray(res.details)) {
        res.details.forEach(err => {
          toast.error(err)
        })
      }
    }
  } catch (error) {
    console.error('Erro ao salvar:', error)
    toast.error('Erro ao salvar configurações')
  } finally {
    saving.value = false
  }
}

// Carregar ao montar
onMounted(() => {
  loadSettings()
})
</script>



