<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold">Produtos</h1>
      <NuxtLink to="/products/new" class="btn btn-primary">Novo Produto</NuxtLink>
    </div>

    <!-- Filtros / Ações -->
    <div class="mb-4 bg-white border border-gray-200 rounded-lg p-4">
      <div class="flex flex-col gap-3 md:flex-row md:items-center">
        <div class="flex-1 flex gap-2">
          <input
            v-model="search"
            type="text"
            class="input flex-1"
            placeholder="Digite nome, SKU ou escaneie o código"
            @keydown.enter.prevent="loadProducts"
          />
          <select v-model="filters.category" class="input w-56">
            <option value="">Todas as categorias</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-outline" @click="clearFilters">Limpar</button>
          <button class="btn btn-primary" @click="loadProducts">Buscar</button>
        </div>
      </div>
      <div class="mt-3 text-xs text-gray-500">Dica: pressione <kbd class="px-1 rounded bg-gray-100 border">Ctrl</kbd>+<kbd class="px-1 rounded bg-gray-100 border">N</kbd> para cadastrar rapidamente um novo produto.</div>
    </div>

    <!-- Skeleton de carregamento -->
    <div v-if="loading" class="overflow-x-auto bg-white border border-gray-200 rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Nome</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">SKU</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Categoria</th>
            <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">Preço Venda</th>
            <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">Estoque</th>
            <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="i in 6" :key="i">
            <td class="px-4 py-3"><div class="h-4 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3 text-right"><div class="h-4 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3 text-right"><div class="h-4 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3 text-right"><div class="h-8 bg-gray-200 rounded animate-pulse"></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Estado vazio amigável -->
    <div v-if="!loading && products.length === 0" class="bg-white border border-gray-200 rounded-lg p-10 text-center">
      <div class="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h6l1 2h10a1 1 0 011 1v10a2 2 0 01-2 2H6a2 2 0 01-2-2V4a1 1 0 011-1z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
      <p class="text-gray-600 mb-4">Use a busca acima ou comece cadastrando seu primeiro produto.</p>
      <NuxtLink to="/products/new" class="btn btn-primary">Cadastrar Produto</NuxtLink>
    </div>

    <div v-if="!loading && products.length" class="overflow-x-auto bg-white border border-gray-200 rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Nome</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">SKU</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Categoria</th>
            <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">Preço Venda</th>
            <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">Estoque</th>
            <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="p in products" :key="p.id" class="hover:bg-gray-50">
            <td class="px-4 py-2">{{ p.name }}</td>
            <td class="px-4 py-2">{{ p.sku }}</td>
            <td class="px-4 py-2">{{ p.category || '-' }}</td>
            <td class="px-4 py-2 text-right">R$ {{ currency(p.salePrice) }}</td>
            <td class="px-4 py-2 text-right" :class="p.stockQuantity <= p.reorderPoint ? 'text-red-600 font-semibold' : ''">
              {{ p.stockQuantity }}
              <span class="text-xs text-gray-500 ml-1">{{ saleUnitLabel(p.saleUnit) }}</span>
              <span v-if="p.stockQuantity <= p.reorderPoint" class="text-xs ml-1">(baixo)</span>
            </td>
            <td class="px-4 py-2 text-right">
              <NuxtLink :to="`/products/${p.id}`" class="btn btn-outline btn-sm mr-2">Editar</NuxtLink>
              <button class="btn btn-outline btn-sm mr-2" @click="openStockModal(p)">Ajustar Estoque</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Produto -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-semibold mb-4">{{ editingProduct ? 'Editar' : 'Novo' }} Produto</h2>
        <form @submit.prevent="saveProduct" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">SKU *</label>
              <input v-model="form.sku" type="text" class="input w-full" required />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Código de Barras</label>
              <input v-model="form.barcode" type="text" class="input w-full" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Nome *</label>
            <input v-model="form.name" type="text" class="input w-full" required />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Preço de Custo *</label>
              <input v-model.number="form.costPrice" type="number" step="0.01" min="0" class="input w-full" required />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Preço de Venda *</label>
              <input v-model.number="form.salePrice" type="number" step="0.01" min="0" class="input w-full" required />
            </div>
          </div>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Estoque Atual</label>
          <input v-model.number="form.stockQuantity" type="number" min="0" step="0.001" class="input w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Estoque Mínimo</label>
          <input v-model.number="form.reorderPoint" type="number" min="0" step="0.001" class="input w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Categoria</label>
          <input v-model="form.category" type="text" class="input w-full" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Unidade de Venda</label>
          <select v-model="form.saleUnit" class="input w-full">
            <option value="UNIT">Unidade</option>
            <option value="KG">Quilograma</option>
            <option value="L">Litro</option>
          </select>
        </div>
        <div class="flex items-center mt-6">
          <input id="batchTracking" v-model="form.batchTracking" type="checkbox" class="mr-2" />
          <label for="batchTracking" class="text-sm">Rastrear por lote (lote/validade)</label>
        </div>
      </div>
          <div>
            <label class="block text-sm font-medium mb-1">Fornecedor</label>
            <select v-model="form.supplierId" class="input w-full">
              <option value="">Nenhum</option>
              <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div class="flex gap-2 justify-end">
            <button type="button" class="btn btn-outline" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn btn-primary">Salvar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Ajuste de Estoque -->
    <div v-if="showStockModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">Ajustar Estoque</h2>
        <div class="mb-4">
          <strong>Produto:</strong> {{ selectedProduct?.name }}<br>
          <strong>Estoque Atual:</strong> {{ selectedProduct?.stockQuantity }}
        </div>
        <form @submit.prevent="saveStockAdjustment" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Quantidade (positiva para aumentar, negativa para diminuir) *</label>
            <input v-model.number="stockForm.quantity" type="number" :step="selectedProduct?.saleUnit !== 'UNIT' ? 0.001 : 1" class="input w-full" required />
            <div class="text-sm text-gray-500 mt-1">
              Novo estoque: {{ (selectedProduct?.stockQuantity || 0) + (stockForm.quantity || 0) }}
            </div>
          </div>
          <div v-if="selectedProduct?.batchTracking">
            <label class="block text-sm font-medium mb-1">Número do Lote (opcional)</label>
            <input v-model="stockForm.batchNumber" type="text" class="input w-full" placeholder="Ex.: LOTE-ABC123" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Motivo *</label>
            <textarea v-model="stockForm.reason" class="input w-full" rows="3" required></textarea>
          </div>
          <div class="flex gap-2 justify-end">
            <button type="button" class="btn btn-outline" @click="closeStockModal">Cancelar</button>
            <button type="submit" class="btn btn-primary">Ajustar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth'] })

const { get, post, put } = useApi()
const products = ref([])
const suppliers = ref([])
const search = ref('')
const loading = ref(false)
const showModal = ref(false)
const showStockModal = ref(false)
const editingProduct = ref(null)
const selectedProduct = ref(null)
import { useToast } from 'vue-toastification'

const filters = reactive({
  category: ''
})

const form = reactive({
  sku: '',
  name: '',
  barcode: '',
  costPrice: 0,
  salePrice: 0,
  stockQuantity: 0,
  reorderPoint: 0,
  category: '',
  supplierId: '',
  saleUnit: 'UNIT',
  batchTracking: false
})

const stockForm = reactive({
  quantity: 0,
  reason: '',
  batchNumber: ''
})

const categories = computed(() => {
  const cats = new Set()
  products.value.forEach(p => {
    if (p.category) cats.add(p.category)
  })
  return Array.from(cats).sort()
})

const loadProducts = async () => {
  loading.value = true
  let url = '/api/products'
  const params = []
  if (search.value) params.push(`search=${encodeURIComponent(search.value)}`)
  if (filters.category) params.push(`category=${encodeURIComponent(filters.category)}`)
  if (params.length) url += '?' + params.join('&')
  
  const res = await get(url)
  if (res.success) {
    const items = res.data.products || []
    // Coagir campos numéricos vindos como string/Decimal para número
    products.value = items.map(p => ({
      ...p,
      costPrice: Number(p?.costPrice ?? 0),
      salePrice: Number(p?.salePrice ?? 0),
      stockQuantity: Number(p?.stockQuantity ?? 0),
      reorderPoint: Number(p?.reorderPoint ?? 0)
    }))
  }
  loading.value = false
}

const loadSuppliers = async () => {
  const res = await get('/api/suppliers')
  if (res.success) {
    suppliers.value = res.data.suppliers || []
  }
}

const openModal = (product) => {
  editingProduct.value = product
  if (product) {
    form.sku = product.sku
    form.name = product.name
    form.barcode = product.barcode || ''
    form.costPrice = parseFloat(product.costPrice)
    form.salePrice = parseFloat(product.salePrice)
    form.stockQuantity = product.stockQuantity
    form.reorderPoint = product.reorderPoint
    form.category = product.category || ''
    form.supplierId = product.supplierId || ''
    form.saleUnit = product.saleUnit || 'UNIT'
    form.batchTracking = !!product.batchTracking
  } else {
    Object.assign(form, {
      sku: '',
      name: '',
      barcode: '',
      costPrice: 0,
      salePrice: 0,
      stockQuantity: 0,
      reorderPoint: 0,
      category: '',
      supplierId: '',
      saleUnit: 'UNIT',
      batchTracking: false
    })
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingProduct.value = null
}

const saveProduct = async () => {
  const res = editingProduct.value
    ? await put(`/api/products/${editingProduct.value.id}`, form)
    : await post('/api/products', form)
  
  if (res.success) {
    useToast().success(editingProduct.value ? 'Produto atualizado!' : 'Produto criado!')
    closeModal()
    loadProducts()
  } else {
    useToast().error(res.error || 'Erro ao salvar produto')
  }
}

const openStockModal = (product) => {
  selectedProduct.value = product
  stockForm.quantity = 0
  stockForm.reason = ''
  showStockModal.value = true
}

const closeStockModal = () => {
  showStockModal.value = false
  selectedProduct.value = null
}

const saveStockAdjustment = async () => {
  const res = await post(`/api/products/${selectedProduct.value.id}/adjust-stock`, stockForm)
  if (res.success) {
    useToast().success('Estoque ajustado!')
    closeStockModal()
    loadProducts()
  } else {
    useToast().error(res.error || 'Erro ao ajustar estoque')
  }
}

const currency = (n) => {
  const v = Number(n ?? 0)
  if (Number.isNaN(v)) return '0.00'
  return v.toFixed(2)
}

const saleUnitLabel = (u) => {
  const units = {
    'UN': 'un',
    'PC': 'pc',
    'CX': 'cx',
    'DZ': 'dz',
    'KG': 'kg',
    'LT': 'lt',
    'MT': 'mt',
    'OUTRA': 'outra',
    'UNIT': 'un', // Compatibilidade
    'L': 'lt' // Compatibilidade
  }
  return units[u] || 'un'
}

const clearFilters = () => {
  search.value = ''
  filters.category = ''
  loadProducts()
}

onMounted(() => {
  loadProducts()
  loadSuppliers()
  const onKey = (e) => {
    const key = (e.key || '').toLowerCase()
    if ((e.ctrlKey || e.metaKey) && key === 'n') {
      navigateTo('/products/new')
    }
  }
  window.addEventListener('keydown', onKey)
  onUnmounted(() => window.removeEventListener('keydown', onKey))
})
</script>
