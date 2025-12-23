<template>
  <div>
    <!-- Cabeçalho com filtros -->
    <div class="bg-white p-4 rounded-lg border border-gray-200 mb-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Busca</label>
          <input 
            v-model="filters.search" 
            type="text" 
            class="input w-full"
            placeholder="Nome, CPF, email..."
            @keydown.enter="loadItems"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select v-model="filters.documentType" class="input w-full">
            <option value="">Todos</option>
            <option value="CPF">Pessoa Física</option>
            <option value="CNPJ">Pessoa Jurídica</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select v-model="filters.isActive" class="input w-full">
            <option value="">Todos</option>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
          <input 
            v-model="filters.city" 
            type="text" 
            class="input w-full"
            placeholder="Cidade"
          >
        </div>
      </div>
      
      <div class="flex justify-between items-center">
        <div class="flex gap-2">
          <button class="btn btn-outline" @click="loadItems">
            Buscar
          </button>
          <button class="btn btn-outline" @click="clearFilters">
            Limpar Filtros
          </button>
        </div>
        
        <div class="flex gap-2">
          <button class="btn btn-outline" @click="exportCSV">
            Exportar CSV
          </button>
          <button class="btn btn-primary" @click="openModal">
            Novo Cliente
          </button>
        </div>
      </div>
    </div>
    
    <!-- Tabela de dados -->
    <div class="overflow-x-auto bg-white border border-gray-200 rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <button @click="toggleSort('name')" class="flex items-center gap-1">
                Nome
                <Icon v-if="sortField === 'name'" :name="sortDirection === 'asc' ? 'chevron-up' : 'chevron-down'" />
              </button>
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Documento
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contato
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cidade/UF
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50">
            <td class="px-4 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
              <div class="text-sm text-gray-500">{{ item.email || '-' }}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.document || '-' }}
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.phone || '-' }}
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.addressCity || '-' }}
              <span v-if="item.addressState">/{{ item.addressState }}</span>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
              <span 
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ item.isActive ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex gap-2 justify-end">
                <button 
                  @click="viewDetails(item)" 
                  class="text-blue-600 hover:text-blue-900"
                >
                  Ver
                </button>
                <button 
                  @click="editItem(item)" 
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  Editar
                </button>
                <button 
                  @click="toggleStatus(item)" 
                  class="text-yellow-600 hover:text-yellow-900"
                >
                  {{ item.isActive ? 'Inativar' : 'Ativar' }}
                </button>
                <button 
                  @click="deleteItem(item)" 
                  class="text-red-600 hover:text-red-900"
                >
                  Excluir
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-gray-500">
              Nenhum cliente encontrado.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Paginação -->
    <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div class="flex-1 flex justify-between sm:hidden">
        <button 
          @click="goToPage(pagination.page - 1)" 
          :disabled="pagination.page <= 1"
          class="btn btn-outline"
        >
          Anterior
        </button>
        <button 
          @click="goToPage(pagination.page + 1)" 
          :disabled="pagination.page >= pagination.pages"
          class="btn btn-outline"
        >
          Próximo
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Mostrando
            <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span>
            até
            <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span>
            de
            <span class="font-medium">{{ pagination.total }}</span>
            resultados
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button 
              @click="goToPage(pagination.page - 1)" 
              :disabled="pagination.page <= 1"
              class="btn btn-outline"
            >
              Anterior
            </button>
            <span class="relative inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700">
              Página {{ pagination.page }} de {{ pagination.pages }}
            </span>
            <button 
              @click="goToPage(pagination.page + 1)" 
              :disabled="pagination.page >= pagination.pages"
              class="btn btn-outline"
            >
              Próximo
            </button>
          </nav>
        </div>
      </div>
    </div>
    
    <!-- Modal de formulário -->
    <Modal v-if="showModal" @close="closeModal">
      <CustomerForm 
        :customer="editingItem"
        @save="handleSave"
        @cancel="closeModal"
      />
    </Modal>
  </div>
</template>

<script setup>
// Estado
const items = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingItem = ref(null)

// Filtros
const filters = reactive({
  search: '',
  documentType: '',
  isActive: '',
  city: ''
})

// Paginação e ordenação
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
})

const sortField = ref('name')
const sortDirection = ref('asc')

// Composables
const { get, put, del } = useApi()
const { $toast } = useNuxtApp()

// Métodos
const loadItems = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filters,
      sort: sortField.value,
      direction: sortDirection.value
    }
    
    // Remover campos vazios
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    const response = await get('/api/customers', params)
    if (response.success) {
      items.value = response.data.customers
      Object.assign(pagination, response.data.pagination)
    }
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
    $toast.error('Erro ao carregar clientes')
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  Object.keys(filters).forEach(key => {
    filters[key] = ''
  })
  pagination.page = 1
  loadItems()
}

const toggleSort = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
  loadItems()
}

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.pages) {
    pagination.page = page
    loadItems()
  }
}

const openModal = (item = null) => {
  editingItem.value = item
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingItem.value = null
}

const handleSave = (savedItem) => {
  closeModal()
  loadItems()
  $toast.success('Cliente salvo com sucesso!')
}

const editItem = (item) => {
  openModal(item)
}

const viewDetails = (item) => {
  // Implementar visualização detalhada
  navigateTo(`/customers/${item.id}`)
}

const toggleStatus = async (item) => {
  try {
    await put(`/api/customers/${item.id}/toggle-status`)
    item.isActive = !item.isActive
    $toast.success(`Cliente ${item.isActive ? 'ativado' : 'inativado'} com sucesso!`)
  } catch (error) {
    console.error('Erro ao alterar status:', error)
    $toast.error('Erro ao alterar status do cliente')
  }
}

const deleteItem = async (item) => {
  if (confirm(`Confirma a exclusão do cliente "${item.name}"?`)) {
    try {
      await del(`/api/customers/${item.id}`)
      loadItems()
      $toast.success('Cliente excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      $toast.error('Erro ao excluir cliente')
    }
  }
}

const exportCSV = () => {
  // Implementar exportação CSV
  const csv = convertToCSV(items.value)
  downloadFile(csv, 'clientes.csv', 'text/csv')
}

// Funções auxiliares
const convertToCSV = (data) => {
  const headers = ['Nome', 'Documento', 'Email', 'Telefone', 'Cidade', 'Estado', 'Status']
  const rows = data.map(item => [
    item.name,
    item.document || '',
    item.email || '',
    item.phone || '',
    item.addressCity || '',
    item.addressState || '',
    item.isActive ? 'Ativo' : 'Inativo'
  ])
  
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

// Inicialização
onMounted(() => {
  loadItems()
})
</script>