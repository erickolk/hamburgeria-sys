<template>
  <Modal :show="show" @close="handleClose">
    <template #title>
      {{ isEditing ? 'Editar Usuário' : 'Novo Usuário' }}
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Nome -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Nome *
        </label>
        <input
          v-model="form.name"
          type="text"
          class="input w-full"
          :class="{ 'border-red-500': errors.name }"
          placeholder="Nome completo"
          required
          autofocus
        />
        <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
      </div>

      <!-- Email -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          v-model="form.email"
          type="email"
          class="input w-full"
          :class="{ 'border-red-500': errors.email }"
          placeholder="usuario@email.com"
          required
        />
        <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
      </div>

      <!-- Perfil -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Perfil *
        </label>
        <select
          v-model="form.role"
          class="input w-full"
          :class="{ 'border-red-500': errors.role }"
          required
        >
          <option value="CASHIER">Caixa - Apenas PDV e vendas</option>
          <option value="MANAGER">Gerente - Acesso a relatórios e cadastros</option>
          <option value="ADMIN">Administrador - Acesso total</option>
        </select>
        <p v-if="errors.role" class="text-red-500 text-xs mt-1">{{ errors.role }}</p>
      </div>

      <!-- Senha -->
      <div v-if="!isEditing || showPasswordField">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ isEditing ? 'Nova Senha' : 'Senha' }} *
        </label>
        <input
          v-model="form.password"
          type="password"
          class="input w-full"
          :class="{ 'border-red-500': errors.password }"
          placeholder="Mínimo 6 caracteres"
          :required="!isEditing"
        />
        <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
        
        <p v-if="isEditing && !showPasswordField" class="text-sm text-gray-500 mt-1">
          <button
            type="button"
            class="text-blue-600 hover:underline"
            @click="showPasswordField = true"
          >
            Alterar senha
          </button>
        </p>
        <p v-else-if="isEditing" class="text-sm text-gray-500 mt-1">
          Deixe em branco para manter a senha atual
        </p>
      </div>

      <!-- Status (apenas para edição) -->
      <div v-if="isEditing" class="flex items-center">
        <input
          v-model="form.isActive"
          type="checkbox"
          id="isActive"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label for="isActive" class="ml-2 block text-sm text-gray-900">
          Usuário ativo
        </label>
      </div>

      <!-- Ações -->
      <div class="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          class="btn btn-outline"
          @click="$emit('close')"
          :disabled="saving"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="saving"
        >
          {{ saving ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { validateEmail } from '~/utils/validators'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  user: {
    type: Object,
    default: null
  },
  saving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save'])

const isEditing = computed(() => !!props.user)
const showPasswordField = ref(false)

const form = reactive({
  name: '',
  email: '',
  role: 'CASHIER',
  password: '',
  isActive: true
})

const errors = reactive({})

// Watch para atualizar form quando user mudar
watch(() => props.user, (newUser) => {
  if (newUser) {
    form.name = newUser.name || ''
    form.email = newUser.email || ''
    form.role = newUser.role || 'CASHIER'
    form.password = ''
    form.isActive = newUser.isActive !== false
    showPasswordField.value = false
  } else {
    // Resetar form para novo usuário
    form.name = ''
    form.email = ''
    form.role = 'CASHIER'
    form.password = ''
    form.isActive = true
    showPasswordField.value = false
  }
  // Limpar erros
  Object.keys(errors).forEach(key => delete errors[key])
}, { immediate: true })

// Watch show para resetar quando fechar
watch(() => props.show, (isShown) => {
  if (!isShown) {
    Object.keys(errors).forEach(key => delete errors[key])
  }
})

const handleClose = () => {
  emit('close')
}

const validateForm = () => {
  // Limpar erros
  Object.keys(errors).forEach(key => delete errors[key])

  let isValid = true

  // Validar nome
  if (!form.name || form.name.trim().length === 0) {
    errors.name = 'Nome é obrigatório'
    isValid = false
  }

  // Validar email
  if (!form.email) {
    errors.email = 'Email é obrigatório'
    isValid = false
  } else if (!validateEmail(form.email)) {
    errors.email = 'Email inválido'
    isValid = false
  }

  // Validar senha (apenas se for novo usuário ou se estiver alterando)
  if (!isEditing.value || (isEditing.value && form.password)) {
    if (!form.password) {
      errors.password = 'Senha é obrigatória'
      isValid = false
    } else if (form.password.length < 6) {
      errors.password = 'Senha deve ter no mínimo 6 caracteres'
      isValid = false
    }
  }

  // Validar role
  if (!form.role) {
    errors.role = 'Perfil é obrigatório'
    isValid = false
  }

  return isValid
}

const handleSubmit = () => {
  if (!validateForm()) {
    return
  }

  const data = {
    name: form.name,
    email: form.email,
    role: form.role
  }

  // Incluir senha apenas se foi preenchida
  if (form.password) {
    data.password = form.password
  }

  // Incluir isActive apenas se for edição
  if (isEditing.value) {
    data.isActive = form.isActive
  }

  emit('save', data)
}
</script>

