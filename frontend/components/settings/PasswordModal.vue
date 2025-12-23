<template>
  <Modal :show="show" @close="handleClose">
    <template #title>
      Alterar Senha{{ user?.name ? ' - ' + user.name : '' }}
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Senha atual (se for o próprio usuário) -->
      <div v-if="isCurrentUser">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Senha Atual *
        </label>
        <input
          v-model="form.currentPassword"
          type="password"
          class="input w-full"
          :class="{ 'border-red-500': errors.currentPassword }"
          placeholder="Digite sua senha atual"
          required
          autofocus
        />
        <p v-if="errors.currentPassword" class="text-red-500 text-xs mt-1">{{ errors.currentPassword }}</p>
      </div>

      <!-- Nova senha -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Nova Senha *
        </label>
        <input
          v-model="form.newPassword"
          type="password"
          class="input w-full"
          :class="{ 'border-red-500': errors.newPassword }"
          placeholder="Mínimo 6 caracteres"
          required
        />
        <p v-if="errors.newPassword" class="text-red-500 text-xs mt-1">{{ errors.newPassword }}</p>
      </div>

      <!-- Confirmar senha -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Confirmar Nova Senha *
        </label>
        <input
          v-model="form.confirmPassword"
          type="password"
          class="input w-full"
          :class="{ 'border-red-500': errors.confirmPassword }"
          placeholder="Digite novamente"
          required
        />
        <p v-if="errors.confirmPassword" class="text-red-500 text-xs mt-1">{{ errors.confirmPassword }}</p>
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
          {{ saving ? 'Alterando...' : 'Alterar Senha' }}
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  user: {
    type: Object,
    default: null
  },
  currentUserId: {
    type: String,
    default: null
  },
  saving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save'])

const isCurrentUser = computed(() => props.user?.id === props.currentUserId)

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const errors = reactive({})

const handleClose = () => {
  emit('close')
}

// Watch show para resetar quando abrir/fechar
watch(() => props.show, (isShown) => {
  if (isShown) {
    // Resetar form
    form.currentPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
  }
  // Limpar erros
  Object.keys(errors).forEach(key => delete errors[key])
})

const validateForm = () => {
  // Limpar erros
  Object.keys(errors).forEach(key => delete errors[key])

  let isValid = true

  // Validar senha atual (se for o próprio usuário)
  if (isCurrentUser.value && !form.currentPassword) {
    errors.currentPassword = 'Senha atual é obrigatória'
    isValid = false
  }

  // Validar nova senha
  if (!form.newPassword) {
    errors.newPassword = 'Nova senha é obrigatória'
    isValid = false
  } else if (form.newPassword.length < 6) {
    errors.newPassword = 'Senha deve ter no mínimo 6 caracteres'
    isValid = false
  }

  // Validar confirmação
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirmação de senha é obrigatória'
    isValid = false
  } else if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = 'As senhas não coincidem'
    isValid = false
  }

  return isValid
}

const handleSubmit = () => {
  if (!validateForm()) {
    return
  }

  const data = {
    newPassword: form.newPassword
  }

  if (isCurrentUser.value) {
    data.password = form.currentPassword
  }

  emit('save', data)
}
</script>

