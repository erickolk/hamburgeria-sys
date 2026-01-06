<template>
  <div class="container mx-auto px-4 py-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Configurações do Sistema</h1>
      <p class="text-gray-600">Gerencie as configurações da empresa e usuários</p>
    </div>

    <!-- Abas -->
    <div class="mb-6 border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="activeTab = 'company'"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'company'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
            </svg>
            Dados da Empresa
          </div>
        </button>

        <button
          @click="activeTab = 'users'"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'users'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            Gestão de Usuários
          </div>
        </button>

        <NuxtLink
          to="/settings/categories"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            Categorias
          </div>
        </NuxtLink>

        <button
          @click="activeTab = 'hardware'"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'hardware'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
            </svg>
            Hardware
          </div>
        </button>
      </nav>
    </div>

    <!-- Conteúdo das Abas -->
    <div>
      <!-- Aba Empresa -->
      <div v-show="activeTab === 'company'">
        <CompanyForm />
      </div>

      <!-- Aba Hardware -->
      <div v-show="activeTab === 'hardware'">
        <HardwareForm />
      </div>

      <!-- Aba Usuários -->
      <div v-show="activeTab === 'users'">
        <UserList
          :users="users"
          :loading="loadingUsers"
          :pagination="pagination"
          :current-user-id="currentUser?.id"
          @search="handleSearch"
          @filter-change="handleFilterChange"
          @new-user="openUserModal(null)"
          @edit-user="openUserModal"
          @change-password="openPasswordModal"
          @toggle-active="handleToggleActive"
          @delete-user="handleDeleteUser"
          @page-change="handlePageChange"
        />
      </div>
    </div>

    <!-- Modal de Usuário -->
    <UserModal
      :show="showUserModal"
      :user="editingUser"
      :saving="savingUser"
      @close="closeUserModal"
      @save="handleSaveUser"
    />

    <!-- Modal de Senha -->
    <PasswordModal
      :show="showPasswordModal"
      :user="changingPasswordUser"
      :current-user-id="currentUser?.id"
      :saving="savingPassword"
      @close="closePasswordModal"
      @save="handleChangePassword"
    />
  </div>
</template>

<script setup>
import { useToast } from 'vue-toastification'
import CompanyForm from '~/components/settings/CompanyForm.vue'
import HardwareForm from '~/components/settings/HardwareForm.vue'
import UserList from '~/components/settings/UserList.vue'
import UserModal from '~/components/settings/UserModal.vue'
import PasswordModal from '~/components/settings/PasswordModal.vue'

definePageMeta({ middleware: ['auth'] })

const { get, post, put, delete: del } = useApi()
const toast = useToast()
const { user: currentUser } = useAuth()

// Estado
const activeTab = ref('company')
const users = ref([])
const loadingUsers = ref(false)
const pagination = ref(null)

// Filtros
const searchQuery = ref('')
const roleFilter = ref('')
const activeFilter = ref('')
const currentPage = ref(1)

// Modal Usuário
const showUserModal = ref(false)
const editingUser = ref(null)
const savingUser = ref(false)

// Modal Senha
const showPasswordModal = ref(false)
const changingPasswordUser = ref(null)
const savingPassword = ref(false)

// Carregar usuários
const loadUsers = async () => {
  loadingUsers.value = true
  try {
    const params = new URLSearchParams()
    params.append('page', currentPage.value)
    params.append('limit', '20')
    
    if (searchQuery.value) params.append('search', searchQuery.value)
    if (roleFilter.value) params.append('role', roleFilter.value)
    if (activeFilter.value) params.append('isActive', activeFilter.value)

    const res = await get(`/api/users?${params.toString()}`)
    if (res.success) {
      users.value = res.data.users || []
      pagination.value = res.data.pagination
    }
  } catch (error) {
    console.error('Erro ao carregar usuários:', error)
    toast.error('Erro ao carregar usuários')
  } finally {
    loadingUsers.value = false
  }
}

// Handlers de busca e filtros
const handleSearch = (query) => {
  searchQuery.value = query
  currentPage.value = 1
  loadUsers()
}

const handleFilterChange = ({ role, isActive }) => {
  roleFilter.value = role
  activeFilter.value = isActive
  currentPage.value = 1
  loadUsers()
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadUsers()
}

// Modal Usuário
const openUserModal = (user) => {
  editingUser.value = user
  showUserModal.value = true
}

const closeUserModal = () => {
  showUserModal.value = false
  editingUser.value = null
}

const handleSaveUser = async (data) => {
  savingUser.value = true
  try {
    const res = editingUser.value
      ? await put(`/api/users/${editingUser.value.id}`, data)
      : await post('/api/users', data)
    
    if (res.success) {
      toast.success(editingUser.value ? 'Usuário atualizado!' : 'Usuário criado!')
      closeUserModal()
      loadUsers()
    } else {
      toast.error(res.error || 'Erro ao salvar usuário')
    }
  } catch (error) {
    console.error('Erro ao salvar usuário:', error)
    toast.error('Erro ao salvar usuário')
  } finally {
    savingUser.value = false
  }
}

// Modal Senha
const openPasswordModal = (user) => {
  changingPasswordUser.value = user
  showPasswordModal.value = true
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  changingPasswordUser.value = null
}

const handleChangePassword = async (data) => {
  if (!changingPasswordUser.value) return

  savingPassword.value = true
  try {
    const res = await put(`/api/users/${changingPasswordUser.value.id}/password`, data)
    
    if (res.success) {
      toast.success('Senha alterada com sucesso!')
      closePasswordModal()
    } else {
      toast.error(res.error || 'Erro ao alterar senha')
    }
  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    toast.error('Erro ao alterar senha')
  } finally {
    savingPassword.value = false
  }
}

// Toggle ativo/inativo
const handleToggleActive = async (user) => {
  if (user.id === currentUser.value?.id) {
    toast.error('Você não pode desativar seu próprio usuário')
    return
  }

  const action = user.isActive ? 'desativar' : 'ativar'
  if (!confirm(`Tem certeza que deseja ${action} o usuário ${user.name}?`)) {
    return
  }

  try {
    const res = await put(`/api/users/${user.id}/toggle-active`)
    
    if (res.success) {
      toast.success(`Usuário ${action === 'desativar' ? 'desativado' : 'ativado'} com sucesso!`)
      loadUsers()
    } else {
      toast.error(res.error || `Erro ao ${action} usuário`)
    }
  } catch (error) {
    console.error(`Erro ao ${action} usuário:`, error)
    toast.error(`Erro ao ${action} usuário`)
  }
}

// Excluir usuário
const handleDeleteUser = async (user) => {
  if (user.id === currentUser.value?.id) {
    toast.error('Você não pode excluir seu próprio usuário')
    return
  }

  if (!confirm(`Tem certeza que deseja excluir o usuário ${user.name}? Esta ação não pode ser desfeita.`)) {
    return
  }

  try {
    const res = await del(`/api/users/${user.id}`)
    
    if (res.success) {
      toast.success('Usuário excluído com sucesso!')
      loadUsers()
    } else {
      toast.error(res.error || 'Erro ao excluir usuário')
    }
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    toast.error('Erro ao excluir usuário')
  }
}

// Carregar usuários ao montar se a aba de usuários estiver ativa
watch(activeTab, (newTab) => {
  if (newTab === 'users' && users.value.length === 0) {
    loadUsers()
  }
})

onMounted(() => {
  // Se vier com hash na URL, abrir a aba correspondente
  const hash = window.location.hash.substring(1)
  if (hash === 'users' || hash === 'company') {
    activeTab.value = hash
  }
  
  // Carregar usuários se a aba estiver ativa
  if (activeTab.value === 'users') {
    loadUsers()
  }
})
</script>
