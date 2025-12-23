<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold">Gerenciar Categorias</h1>
      <button class="btn btn-primary" @click="openNewModal">+ Nova Categoria</button>
    </div>

    <!-- Descrição amigável -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <p class="text-sm text-blue-800">
        <strong>💡 Dica:</strong> As categorias ajudam a organizar seus produtos. 
        Crie categorias como "Bebidas", "Alimentos", "Higiene", etc. 
        Você poderá selecionar essas categorias ao cadastrar ou editar produtos.
      </p>
    </div>

    <!-- Skeleton de carregamento -->
    <div v-if="loading" class="overflow-x-auto bg-white border border-gray-200 rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Nome</th>
            <th class="px-4 py-2 text-center text-sm font-medium text-gray-600">Produtos</th>
            <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="i in 3" :key="i">
            <td class="px-4 py-3"><div class="h-4 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3 text-center"><div class="h-4 bg-gray-200 rounded animate-pulse mx-auto w-10"></div></td>
            <td class="px-4 py-3 text-right"><div class="h-8 bg-gray-200 rounded animate-pulse"></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Estado vazio amigável -->
    <div v-if="!loading && categories.length === 0" class="bg-white border border-gray-200 rounded-lg p-10 text-center">
      <div class="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold mb-2">Nenhuma categoria cadastrada</h3>
      <p class="text-gray-600 mb-4">Comece criando sua primeira categoria de produtos.</p>
      <button class="btn btn-primary" @click="openNewModal">Criar Categoria</button>
    </div>

    <!-- Tabela de categorias -->
    <div v-if="!loading && categories.length > 0" class="overflow-x-auto bg-white border border-gray-200 rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Nome</th>
            <th class="px-4 py-2 text-center text-sm font-medium text-gray-600">Produtos</th>
            <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="category in categories" :key="category.id" class="hover:bg-gray-50">
            <td class="px-4 py-3">
              <span class="font-medium">{{ category.name }}</span>
            </td>
            <td class="px-4 py-3 text-center">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ category._count?.products || 0 }} produtos
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <button class="btn btn-outline btn-sm mr-2" @click="openEditModal(category)">Editar</button>
              <button class="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50" @click="confirmDelete(category)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Criar/Editar -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">{{ editingCategory ? 'Editar' : 'Nova' }} Categoria</h2>
        <form @submit.prevent="saveCategory" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Nome da Categoria *</label>
            <input v-model="form.name" type="text" class="input w-full" required autofocus />
          </div>
          <div class="flex gap-2 justify-end">
            <button type="button" class="btn btn-outline" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn btn-primary">{{ editingCategory ? 'Salvar' : 'Criar' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Confirmar Exclusão -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4 text-red-600">Confirmar Exclusão</h2>
        <p class="mb-4">
          Tem certeza que deseja excluir a categoria <strong>{{ categoryToDelete?.name }}</strong>?
        </p>
        <p v-if="categoryToDelete?._count?.products > 0" class="text-sm text-red-600 mb-4">
          ⚠️ Esta categoria possui {{ categoryToDelete._count.products }} produto(s) associado(s) e não poderá ser excluída.
        </p>
        <div class="flex gap-2 justify-end">
          <button type="button" class="btn btn-outline" @click="showDeleteModal = false">Cancelar</button>
          <button 
            type="button" 
            class="btn btn-primary bg-red-600 hover:bg-red-700" 
            @click="deleteCategory"
            :disabled="categoryToDelete?._count?.products > 0"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth', 'admin'] })

const { get, post, put, del } = useApi()
const categories = ref([])
const loading = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingCategory = ref(null)
const categoryToDelete = ref(null)

import { useToast } from 'vue-toastification'
const toast = useToast()

const form = reactive({
  name: ''
})

const loadCategories = async () => {
  loading.value = true
  const res = await get('/api/categories')
  if (res.success) {
    categories.value = res.data.categories || []
  } else {
    toast.error('Erro ao carregar categorias')
  }
  loading.value = false
}

const openNewModal = () => {
  editingCategory.value = null
  form.name = ''
  showModal.value = true
}

const openEditModal = (category) => {
  editingCategory.value = category
  form.name = category.name
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingCategory.value = null
  form.name = ''
}

const saveCategory = async () => {
  if (!form.name.trim()) {
    toast.error('Nome da categoria é obrigatório')
    return
  }

  const res = editingCategory.value
    ? await put(`/api/categories/${editingCategory.value.id}`, form)
    : await post('/api/categories', form)

  if (res.success) {
    toast.success(editingCategory.value ? 'Categoria atualizada!' : 'Categoria criada!')
    closeModal()
    loadCategories()
  } else {
    toast.error(res.error || 'Erro ao salvar categoria')
  }
}

const confirmDelete = (category) => {
  categoryToDelete.value = category
  showDeleteModal.value = true
}

const deleteCategory = async () => {
  if (!categoryToDelete.value) return

  const res = await del(`/api/categories/${categoryToDelete.value.id}`)
  if (res.success) {
    toast.success('Categoria excluída!')
    showDeleteModal.value = false
    categoryToDelete.value = null
    loadCategories()
  } else {
    toast.error(res.error || 'Erro ao excluir categoria')
  }
}

onMounted(() => {
  loadCategories()
})
</script>

