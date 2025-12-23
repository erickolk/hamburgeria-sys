<template>
  <div class="bg-white rounded-lg shadow-sm">
    <!-- Filtros e Busca -->
    <div class="p-4 border-b">
      <div class="flex flex-wrap gap-3">
        <input
          v-model="searchQuery"
          type="text"
          class="input flex-1 min-w-[200px]"
          placeholder="Buscar por nome ou email..."
          @keydown.enter="$emit('search', searchQuery)"
        />
        
        <select v-model="roleFilter" class="input w-40" @change="$emit('filter-change', { role: roleFilter, isActive: activeFilter })">
          <option value="">Todos os perfis</option>
          <option value="ADMIN">Administrador</option>
          <option value="MANAGER">Gerente</option>
          <option value="CASHIER">Caixa</option>
        </select>
        
        <select v-model="activeFilter" class="input w-32" @change="$emit('filter-change', { role: roleFilter, isActive: activeFilter })">
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>

        <button class="btn btn-primary" @click="$emit('new-user')">
          + Novo Usuário
        </button>
      </div>
    </div>

    <!-- Tabela -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nome
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Perfil
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cadastrado em
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="loading" class="hover:bg-gray-50">
            <td colspan="6" class="px-4 py-8 text-center text-gray-500">
              Carregando...
            </td>
          </tr>
          <tr v-else-if="users.length === 0" class="hover:bg-gray-50">
            <td colspan="6" class="px-4 py-8 text-center text-gray-500">
              Nenhum usuário encontrado
            </td>
          </tr>
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="text-sm text-gray-500">{{ user.email }}</div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span :class="getRoleBadgeClass(user.role)" class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                {{ getRoleLabel(user.role) }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <button
                @click="$emit('toggle-active', user)"
                :disabled="isCurrentUser(user.id)"
                class="flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span
                  :class="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ user.isActive ? 'Ativo' : 'Inativo' }}
                </span>
              </button>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(user.createdAt) }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex justify-end gap-2">
                <button
                  class="text-blue-600 hover:text-blue-900"
                  @click="$emit('edit-user', user)"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  class="text-purple-600 hover:text-purple-900"
                  @click="$emit('change-password', user)"
                  title="Alterar senha"
                >
                  🔑
                </button>
                <button
                  class="text-red-600 hover:text-red-900"
                  :disabled="isCurrentUser(user.id)"
                  @click="$emit('delete-user', user)"
                  title="Excluir"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginação -->
    <div v-if="pagination && pagination.pages > 1" class="px-4 py-3 border-t flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Mostrando {{ ((pagination.page - 1) * pagination.limit) + 1 }} a 
        {{ Math.min(pagination.page * pagination.limit, pagination.total) }} de 
        {{ pagination.total }} usuários
      </div>
      <div class="flex gap-2">
        <button
          class="btn btn-outline btn-sm"
          :disabled="pagination.page === 1"
          @click="$emit('page-change', pagination.page - 1)"
        >
          Anterior
        </button>
        <button
          class="btn btn-outline btn-sm"
          :disabled="pagination.page === pagination.pages"
          @click="$emit('page-change', pagination.page + 1)"
        >
          Próxima
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  users: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Object,
    default: null
  },
  currentUserId: {
    type: String,
    default: null
  }
})

defineEmits([
  'search',
  'filter-change',
  'new-user',
  'edit-user',
  'change-password',
  'toggle-active',
  'delete-user',
  'page-change'
])

const searchQuery = ref('')
const roleFilter = ref('')
const activeFilter = ref('')

const getRoleLabel = (role) => {
  const labels = {
    ADMIN: 'Administrador',
    MANAGER: 'Gerente',
    CASHIER: 'Caixa'
  }
  return labels[role] || role
}

const getRoleBadgeClass = (role) => {
  const classes = {
    ADMIN: 'bg-red-100 text-red-800',
    MANAGER: 'bg-blue-100 text-blue-800',
    CASHIER: 'bg-green-100 text-green-800'
  }
  return classes[role] || 'bg-gray-100 text-gray-800'
}

const isCurrentUser = (userId) => {
  return userId === props.currentUserId
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('pt-BR')
}
</script>



