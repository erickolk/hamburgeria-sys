<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold">Ingredientes</h1>
      <button class="btn btn-primary" @click="openModal(null)">Novo Ingrediente</button>
    </div>

    <!-- Filtros -->
    <div class="mb-4 bg-white border border-gray-200 rounded-lg p-4">
      <div class="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          v-model="search"
          type="text"
          class="input flex-1"
          placeholder="Buscar ingrediente..."
          @keydown.enter.prevent="loadIngredients"
        />
        <label class="flex items-center gap-2 text-sm cursor-pointer">
          <input v-model="filters.lowStock" type="checkbox" @change="loadIngredients" />
          Apenas estoque baixo
        </label>
        <div class="flex gap-2">
          <button class="btn btn-outline" @click="clearFilters">Limpar</button>
          <button class="btn btn-primary" @click="loadIngredients">Buscar</button>
        </div>
      </div>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="overflow-x-auto bg-white border border-gray-200 rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Nome</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Unidade</th>
            <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">Estoque</th>
            <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">Custo Médio</th>
            <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="i in 5" :key="i">
            <td class="px-4 py-3"><div class="h-4 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-8 bg-gray-200 rounded animate-pulse"></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Vazio -->
    <div v-if="!loading && ingredients.length === 0" class="bg-white border border-gray-200 rounded-lg p-10 text-center">
      <div class="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 text-3xl">🥩</div>
      <h3 class="text-lg font-semibold mb-2">Nenhum ingrediente cadastrado</h3>
      <p class="text-gray-600 mb-4">Cadastre os ingredientes para montar suas fichas técnicas.</p>
      <button class="btn btn-primary" @click="openModal(null)">Cadastrar Ingrediente</button>
    </div>

    <!-- Tabela -->
    <div v-if="!loading && ingredients.length" class="overflow-x-auto bg-white border border-gray-200 rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Nome</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Unidade</th>
            <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">Estoque Atual</th>
            <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">Mínimo</th>
            <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">Custo Médio</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Fornecedor</th>
            <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="ing in ingredients" :key="ing.id" class="hover:bg-gray-50">
            <td class="px-4 py-2 font-medium">{{ ing.name }}</td>
            <td class="px-4 py-2">
              <span class="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">{{ ing.unit }}</span>
            </td>
            <td class="px-4 py-2 text-right" :class="isLowStock(ing) ? 'text-red-600 font-semibold' : ''">
              {{ Number(ing.currentStock).toFixed(3) }}
              <span v-if="isLowStock(ing)" class="text-xs ml-1">(baixo)</span>
            </td>
            <td class="px-4 py-2 text-right text-gray-500 text-sm">{{ Number(ing.reorderPoint).toFixed(3) }}</td>
            <td class="px-4 py-2 text-right">R$ {{ Number(ing.averageCost).toFixed(2) }}</td>
            <td class="px-4 py-2 text-gray-500 text-sm">{{ ing.supplier?.name || '-' }}</td>
            <td class="px-4 py-2 text-right flex gap-2 justify-end">
              <button class="btn btn-outline btn-sm" @click="openModal(ing)">Editar</button>
              <button class="btn btn-outline btn-sm" @click="openStockModal(ing)">Ajustar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Ingrediente -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 class="text-xl font-semibold mb-4">{{ editing ? 'Editar' : 'Novo' }} Ingrediente</h2>
        <form @submit.prevent="saveIngredient" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Nome *</label>
            <input v-model="form.name" type="text" class="input w-full" required />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Unidade *</label>
              <select v-model="form.unit" class="input w-full" required>
                <option value="G">Gramas (g)</option>
                <option value="KG">Quilogramas (kg)</option>
                <option value="ML">Mililitros (ml)</option>
                <option value="L">Litros (L)</option>
                <option value="UN">Unidade (un)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Custo Médio (R$)</label>
              <input v-model.number="form.averageCost" type="number" step="0.01" min="0" class="input w-full" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Estoque Atual</label>
              <input v-model.number="form.currentStock" type="number" step="0.001" min="0" class="input w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Estoque Mínimo</label>
              <input v-model.number="form.reorderPoint" type="number" step="0.001" min="0" class="input w-full" />
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
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Ajuste de Estoque -->
    <div v-if="showStockModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">Ajustar Estoque</h2>
        <div class="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
          <strong>{{ selectedIng?.name }}</strong><br>
          Estoque atual: <span class="font-mono">{{ Number(selectedIng?.currentStock).toFixed(3) }} {{ selectedIng?.unit }}</span>
        </div>
        <form @submit.prevent="saveStockAdjust" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Quantidade (+ entrada / - saída) *</label>
            <input v-model.number="stockForm.quantity" type="number" step="0.001" class="input w-full" required />
            <div class="text-sm text-gray-500 mt-1">
              Novo estoque: <span class="font-mono font-semibold">{{ newStockPreview }}</span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Motivo *</label>
            <textarea v-model="stockForm.reason" class="input w-full" rows="2" required></textarea>
          </div>
          <div class="flex gap-2 justify-end">
            <button type="button" class="btn btn-outline" @click="closeStockModal">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Salvando...' : 'Ajustar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth'] })

import { useToast } from 'vue-toastification'

const { get, post, put } = useApi()
const toast = useToast()

const ingredients = ref([])
const suppliers = ref([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const showModal = ref(false)
const showStockModal = ref(false)
const editing = ref(null)
const selectedIng = ref(null)

const filters = reactive({ lowStock: false })

const form = reactive({
  name: '',
  unit: 'G',
  averageCost: 0,
  currentStock: 0,
  reorderPoint: 0,
  supplierId: ''
})

const stockForm = reactive({ quantity: 0, reason: '' })

const newStockPreview = computed(() => {
  const current = Number(selectedIng.value?.currentStock || 0)
  const adj = Number(stockForm.quantity || 0)
  return (current + adj).toFixed(3)
})

const isLowStock = (ing) =>
  Number(ing.currentStock) <= Number(ing.reorderPoint) && Number(ing.reorderPoint) > 0

const loadIngredients = async () => {
  loading.value = true
  const params = []
  if (search.value) params.push(`search=${encodeURIComponent(search.value)}`)
  if (filters.lowStock) params.push('lowStock=true')
  const url = '/api/ingredients' + (params.length ? '?' + params.join('&') : '')
  const res = await get(url)
  if (res.success) ingredients.value = res.data.ingredients || []
  loading.value = false
}

const loadSuppliers = async () => {
  const res = await get('/api/suppliers')
  if (res.success) suppliers.value = res.data.suppliers || []
}

const openModal = (ing) => {
  editing.value = ing
  if (ing) {
    Object.assign(form, {
      name: ing.name,
      unit: ing.unit,
      averageCost: Number(ing.averageCost),
      currentStock: Number(ing.currentStock),
      reorderPoint: Number(ing.reorderPoint),
      supplierId: ing.supplierId || ''
    })
  } else {
    Object.assign(form, { name: '', unit: 'G', averageCost: 0, currentStock: 0, reorderPoint: 0, supplierId: '' })
  }
  showModal.value = true
}

const closeModal = () => { showModal.value = false; editing.value = null }

const saveIngredient = async () => {
  saving.value = true
  const res = editing.value
    ? await put(`/api/ingredients/${editing.value.id}`, form)
    : await post('/api/ingredients', form)
  if (res.success) {
    toast.success(editing.value ? 'Ingrediente atualizado!' : 'Ingrediente criado!')
    closeModal()
    loadIngredients()
  } else {
    toast.error(res.error || 'Erro ao salvar ingrediente')
  }
  saving.value = false
}

const openStockModal = (ing) => {
  selectedIng.value = ing
  stockForm.quantity = 0
  stockForm.reason = ''
  showStockModal.value = true
}

const closeStockModal = () => { showStockModal.value = false; selectedIng.value = null }

const saveStockAdjust = async () => {
  saving.value = true
  const res = await post(`/api/ingredients/${selectedIng.value.id}/adjust-stock`, stockForm)
  if (res.success) {
    toast.success('Estoque ajustado!')
    closeStockModal()
    loadIngredients()
  } else {
    toast.error(res.error || 'Erro ao ajustar estoque')
  }
  saving.value = false
}

const clearFilters = () => {
  search.value = ''
  filters.lowStock = false
  loadIngredients()
}

onMounted(() => {
  loadIngredients()
  loadSuppliers()
})
</script>