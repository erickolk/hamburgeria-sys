<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold">Editar Produto</h1>
      <NuxtLink to="/products" class="btn btn-outline">Voltar</NuxtLink>
    </div>

    <div v-if="loading" class="bg-white rounded-lg p-6 text-center">
      <p>Carregando...</p>
    </div>

    <div v-else-if="!product" class="bg-white rounded-lg p-6 text-center">
      <p>Produto não encontrado</p>
    </div>

    <div v-else class="bg-white rounded-lg p-6 w-full max-w-6xl mx-auto border border-gray-200">
      <form @submit.prevent="saveProduct" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">SKU *</label>
            <input v-model="productForm.sku" type="text" class="input w-full" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Código de Barras</label>
            <input v-model="productForm.barcode" type="text" inputmode="numeric" class="input w-full" placeholder="Código de barras" />
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium mb-1">Nome *</label>
            <input v-model="productForm.name" type="text" class="input w-full" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Categoria</label>
            <div class="flex gap-2">
              <select v-model="productForm.categoryId" class="input flex-1">
                <option value="">Selecione uma categoria</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
              <button type="button" class="btn btn-outline" @click="showNewCategoryModal = true">+ Nova</button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Fornecedor</label>
            <select v-model="productForm.supplierId" class="input w-full">
              <option value="">Selecione</option>
              <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Preço de Custo *</label>
            <input v-model.number="productForm.costPrice" type="number" step="0.01" class="input w-full" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Preço de Venda *</label>
            <input v-model.number="productForm.salePrice" type="number" step="0.01" class="input w-full" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Estoque Atual</label>
            <input v-model.number="productForm.stockQuantity" type="number" step="0.001" class="input w-full" disabled />
            <p class="text-xs text-gray-500 mt-1">Use "Ajustar Estoque" para modificar</p>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Ponto de Reposição *</label>
            <input v-model.number="productForm.reorderPoint" type="number" step="0.001" class="input w-full" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Unidade de Venda *</label>
            <select v-model="productForm.saleUnit" class="input w-full" required>
              <option value="UN">Unidade (UN)</option>
              <option value="PC">Peça (PC)</option>
              <option value="CX">Caixa (CX)</option>
              <option value="DZ">Dúzia (DZ)</option>
              <option value="KG">Quilograma (KG)</option>
              <option value="LT">Litro (LT)</option>
              <option value="MT">Metro (MT)</option>
              <option value="OUTRA">Outra</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <input id="batchTracking" v-model="productForm.batchTracking" type="checkbox" class="h-4 w-4" disabled />
            <label for="batchTracking" class="text-sm font-medium text-gray-500">Rastrear por lote (não pode ser alterado)</label>
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium mb-1">Observações</label>
            <textarea v-model="productForm.observations" class="input w-full" rows="3" placeholder="Informações adicionais sobre o produto..."></textarea>
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium mb-1">Fotos do Produto</label>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div class="flex flex-wrap gap-3 mb-3">
                <div v-for="(photo, index) in productPhotos" :key="photo.id || index" class="relative w-24 h-24 border rounded overflow-hidden">
                  <img :src="photo.url" class="w-full h-full object-cover" />
                  <button type="button" @click="removePhoto(photo, index)" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs">×</button>
                  <button type="button" @click="setMainPhoto(photo, index)" class="absolute bottom-1 left-1 bg-blue-500 text-white rounded px-1 text-xs" :class="{ 'bg-green-500': photo.isMain }">
                    {{ photo.isMain ? '★ Principal' : 'Marcar' }}
                  </button>
                </div>
              </div>
              <div class="flex gap-2">
                <input 
                  v-model="newPhotoUrl" 
                  type="url" 
                  class="input flex-1" 
                  placeholder="Cole a URL da foto aqui"
                  @keyup.enter="addPhoto"
                />
                <button type="button" class="btn btn-outline" @click.prevent="addPhoto">Adicionar Foto</button>
              </div>
              <p class="text-xs text-gray-500 mt-2">Adicione URLs de fotos do produto.</p>
            </div>
          </div>
        </div>

        <div class="flex gap-2 justify-end mt-2">
          <NuxtLink to="/products" class="btn btn-outline" type="button">Cancelar</NuxtLink>
          <button type="submit" class="btn btn-primary">Salvar Alterações</button>
        </div>
      </form>
    </div>

    <!-- Modal Nova Categoria -->
    <div v-if="showNewCategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">Nova Categoria</h2>
        <form @submit.prevent="createCategory" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Nome da Categoria *</label>
            <input v-model="newCategoryName" type="text" class="input w-full" required />
          </div>
          <div class="flex gap-2 justify-end">
            <button type="button" class="btn btn-outline" @click="showNewCategoryModal = false">Cancelar</button>
            <button type="submit" class="btn btn-primary">Criar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth'] })

const route = useRoute()
const { get, put, post, del } = useApi()
const productId = route.params.id

const product = ref(null)
const loading = ref(true)
const suppliers = ref([])
const categories = ref([])
const productPhotos = ref([])
const newPhotoUrl = ref('')
const showNewCategoryModal = ref(false)
const newCategoryName = ref('')

import { useToast } from 'vue-toastification'
const toast = useToast()

const productForm = reactive({
  sku: '',
  name: '',
  barcode: '',
  costPrice: 0,
  salePrice: 0,
  stockQuantity: 0,
  reorderPoint: 0,
  categoryId: '',
  observations: '',
  supplierId: '',
  saleUnit: 'UN',
  batchTracking: false
})

const loadProduct = async () => {
  loading.value = true
  const res = await get(`/api/products/${productId}`)
  if (res.success) {
    product.value = res.data
    
    // Preencher formulário
    productForm.sku = product.value.sku
    productForm.name = product.value.name
    productForm.barcode = product.value.barcode || ''
    productForm.costPrice = parseFloat(product.value.costPrice)
    productForm.salePrice = parseFloat(product.value.salePrice)
    productForm.stockQuantity = parseFloat(product.value.stockQuantity)
    productForm.reorderPoint = parseFloat(product.value.reorderPoint)
    productForm.categoryId = product.value.categoryId || ''
    productForm.observations = product.value.observations || ''
    productForm.supplierId = product.value.supplierId || ''
    productForm.saleUnit = product.value.saleUnit || 'UN'
    productForm.batchTracking = !!product.value.batchTracking
    
    // Carregar fotos existentes
    productPhotos.value = (product.value.photos || []).map(p => ({ ...p }))
  } else {
    toast.error('Erro ao carregar produto')
  }
  loading.value = false
}

const loadSuppliers = async () => {
  const res = await get('/api/suppliers')
  if (res.success) suppliers.value = res.data.suppliers || []
}

const loadCategories = async () => {
  const res = await get('/api/categories')
  if (res.success) categories.value = res.data.categories || []
}

const createCategory = async () => {
  if (!newCategoryName.value.trim()) return
  
  const res = await post('/api/categories', { name: newCategoryName.value.trim() })
  if (res.success) {
    toast.success('Categoria criada!')
    await loadCategories()
    productForm.categoryId = res.data.id
    showNewCategoryModal.value = false
    newCategoryName.value = ''
  } else {
    toast.error(res.error || 'Erro ao criar categoria')
  }
}

const addPhoto = async () => {
  const url = newPhotoUrl.value.trim()
  if (!url) {
    toast.warning('Por favor, insira uma URL válida')
    return
  }
  
  // Validar se é uma URL válida
  try {
    new URL(url)
  } catch (e) {
    toast.warning('Por favor, insira uma URL válida (ex: https://exemplo.com/foto.jpg)')
    return
  }
  
  // Verificar se a URL já foi adicionada
  if (productPhotos.value.some(p => p.url === url)) {
    toast.warning('Esta foto já foi adicionada')
    return
  }
  
  const res = await post(`/api/products/${productId}/photos`, {
    url,
    isMain: productPhotos.value.length === 0
  })
  
  if (res.success) {
    productPhotos.value.push(res.data)
    newPhotoUrl.value = ''
    toast.success('Foto adicionada!')
  } else {
    toast.error(res.error || 'Erro ao adicionar foto')
  }
}

const removePhoto = async (photo, index) => {
  if (photo.id) {
    const res = await del(`/api/products/${productId}/photos/${photo.id}`)
    if (res.success) {
      productPhotos.value.splice(index, 1)
      toast.success('Foto removida!')
    } else {
      toast.error('Erro ao remover foto')
    }
  } else {
    productPhotos.value.splice(index, 1)
  }
}

const setMainPhoto = async (photo, index) => {
  if (photo.id) {
    const res = await put(`/api/products/${productId}/photos/${photo.id}`, { isMain: true })
    if (res.success) {
      productPhotos.value.forEach((p, i) => {
        p.isMain = i === index
      })
      toast.success('Foto principal atualizada!')
    } else {
      toast.error('Erro ao atualizar foto')
    }
  }
}

const saveProduct = async () => {
  const payload = {
    sku: productForm.sku,
    name: productForm.name,
    barcode: productForm.barcode || null,
    costPrice: productForm.costPrice,
    salePrice: productForm.salePrice,
    reorderPoint: productForm.reorderPoint,
    categoryId: productForm.categoryId || null,
    observations: productForm.observations || null,
    supplierId: productForm.supplierId || null,
    saleUnit: productForm.saleUnit
  }

  const res = await put(`/api/products/${productId}`, payload)
  if (res.success) {
    toast.success('Produto atualizado!')
    await navigateTo('/products')
  } else {
    toast.error(res.error || 'Erro ao atualizar produto')
  }
}

onMounted(() => {
  loadProduct()
  loadSuppliers()
  loadCategories()
})
</script>

