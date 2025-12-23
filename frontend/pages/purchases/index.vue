<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold">Compras / Entradas</h1>
      <button class="btn btn-primary" @click="openModal()">Nova Compra</button>
    </div>

    <div class="mb-4 flex gap-2">
      <select v-model="filters.supplierId" class="input">
        <option value="">Todos os fornecedores</option>
        <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
      <select v-model="filters.status" class="input">
        <option value="">Todos os status</option>
        <option value="PENDING">Pendente</option>
        <option value="COMPLETED">Concluída</option>
        <option value="CANCELLED">Cancelada</option>
      </select>
      <button class="btn btn-outline" @click="loadPurchases">Filtrar</button>
    </div>

    <div class="overflow-x-auto bg-white border border-gray-200 rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Data</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Fornecedor</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Itens</th>
            <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">Total</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
            <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="purchase in purchases" :key="purchase.id" class="hover:bg-gray-50">
            <td class="px-4 py-2">{{ formatDate(purchase.date) }}</td>
            <td class="px-4 py-2">{{ purchase.supplier?.name }}</td>
            <td class="px-4 py-2">{{ purchase.purchaseItems?.length || 0 }}</td>
            <td class="px-4 py-2 text-right">R$ {{ currency(purchase.total) }}</td>
            <td class="px-4 py-2">
              <span :class="getStatusColor(purchase.status)">{{ getStatusLabel(purchase.status) }}</span>
            </td>
            <td class="px-4 py-2 text-right">
              <button class="btn btn-outline btn-sm" @click="viewDetails(purchase)">Detalhes</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Nova Compra -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-semibold mb-4">Nova Compra</h2>
        <form @submit.prevent="savePurchase" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Fornecedor *</label>
            <select v-model="form.supplierId" class="input w-full" required>
              <option value="">Selecione um fornecedor</option>
              <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Buscar Produto</label>
            <div class="flex gap-2">
              <input v-model="productSearch" type="text" class="input flex-1" placeholder="Nome ou SKU" @keydown.enter.prevent="searchProduct" />
              <button type="button" class="btn btn-outline" @click="searchProduct">Buscar</button>
            </div>
            <div v-if="productResults.length" class="mt-2 border rounded p-2 max-h-40 overflow-y-auto">
              <div v-for="p in productResults" :key="p.id" class="flex justify-between items-center py-1 hover:bg-gray-50 px-2 rounded">
                <span>{{ p.name }} ({{ p.sku }})</span>
                <button type="button" class="btn btn-outline btn-sm" @click="addProduct(p)">Adicionar</button>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Itens da Compra</label>
            <div v-if="form.items.length === 0" class="text-gray-500 text-sm">Nenhum item adicionado</div>
            <div v-else class="space-y-2">
              <div v-for="(item, idx) in form.items" :key="idx" class="flex gap-2 items-center border p-2 rounded">
                <div class="flex-1">
                  <div class="font-medium">{{ item.name }}</div>
                  <div class="text-sm text-gray-600">SKU: {{ item.sku }}</div>
                </div>
                <input v-model.number="item.quantity" type="number" min="1" class="input w-20" placeholder="Qtd" />
                <input v-model.number="item.unitCost" type="number" step="0.01" min="0" class="input w-32" placeholder="Custo unit." />
                <div class="w-24 text-right">R$ {{ currency(item.quantity * item.unitCost) }}</div>
                <button type="button" class="btn btn-outline btn-sm" @click="removeItem(idx)">Remover</button>
              </div>
              <div class="text-right font-semibold mt-2">Total: R$ {{ currency(totalPurchase) }}</div>
            </div>
          </div>

          <div class="flex gap-2 justify-end">
            <button type="button" class="btn btn-outline" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="form.items.length === 0">Salvar Compra</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Detalhes -->
    <div v-if="selectedPurchase" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-semibold mb-4">Detalhes da Compra</h2>
        <div class="space-y-4">
          <div>
            <strong>Fornecedor:</strong> {{ selectedPurchase.supplier?.name }}
          </div>
          <div>
            <strong>Data:</strong> {{ formatDate(selectedPurchase.date) }}
          </div>
          <div>
            <strong>Status:</strong> <span :class="getStatusColor(selectedPurchase.status)">{{ getStatusLabel(selectedPurchase.status) }}</span>
          </div>
          <div>
            <strong>Itens:</strong>
            <table class="w-full mt-2">
              <thead>
                <tr class="border-b">
                  <th class="text-left py-2">Produto</th>
                  <th class="text-right py-2">Qtd</th>
                  <th class="text-right py-2">Custo Unit.</th>
                  <th class="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedPurchase.purchaseItems" :key="item.id" class="border-b">
                  <td class="py-2">{{ item.product?.name }}</td>
                  <td class="text-right py-2">{{ item.quantity }}</td>
                  <td class="text-right py-2">R$ {{ currency(item.unitCost) }}</td>
                  <td class="text-right py-2">R$ {{ currency(item.quantity * item.unitCost) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="text-right font-semibold py-2">Total:</td>
                  <td class="text-right font-semibold py-2">R$ {{ currency(selectedPurchase.total) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div class="flex justify-end">
            <button class="btn btn-outline" @click="selectedPurchase = null">Fechar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from 'vue-toastification'

definePageMeta({ middleware: ['auth'] })

const { get, post } = useApi()
const toast = useToast()
const purchases = ref([])
const suppliers = ref([])
const showModal = ref(false)
const selectedPurchase = ref(null)
const productSearch = ref('')
const productResults = ref([])

const filters = reactive({
  supplierId: '',
  status: ''
})

const form = reactive({
  supplierId: '',
  items: []
})

const totalPurchase = computed(() => {
  return form.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)
})

const loadPurchases = async () => {
  const params = new URLSearchParams()
  if (filters.supplierId) params.append('supplierId', filters.supplierId)
  if (filters.status) params.append('status', filters.status)
  
  const res = await get(`/api/purchases?${params.toString()}`)
  if (res.success) {
    purchases.value = res.data.purchases || []
  }
}

const loadSuppliers = async () => {
  const res = await get('/api/suppliers')
  if (res.success) {
    suppliers.value = res.data.suppliers || res.data
  }
}

const searchProduct = async () => {
  if (!productSearch.value) return
  const res = await get(`/api/products?search=${encodeURIComponent(productSearch.value)}`)
  if (res.success) {
    productResults.value = res.data.products || res.data
  }
}

const addProduct = (product) => {
  if (form.items.find(i => i.id === product.id)) {
    toast.warning('Produto já adicionado')
    return
  }
  form.items.push({
    id: product.id,
    productId: product.id,
    name: product.name,
    sku: product.sku,
    quantity: 1,
    unitCost: parseFloat(product.costPrice) || 0
  })
  productSearch.value = ''
  productResults.value = []
}

const removeItem = (idx) => {
  form.items.splice(idx, 1)
}

const openModal = () => {
  form.supplierId = ''
  form.items = []
  productSearch.value = ''
  productResults.value = []
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const savePurchase = async () => {
  if (!form.supplierId || form.items.length === 0) {
    toast.error('Preencha todos os campos obrigatórios')
    return
  }

  const purchaseData = {
    supplierId: form.supplierId,
    items: form.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitCost: item.unitCost
    })),
    status: 'COMPLETED'
  }

  const res = await post('/api/purchases', purchaseData)
  if (res.success) {
    toast.success('Compra registrada com sucesso!')
    closeModal()
    loadPurchases()
  } else {
    toast.error(res.error || 'Erro ao registrar compra')
  }
}

const viewDetails = async (purchase) => {
  const res = await get(`/api/purchases/${purchase.id}`)
  if (res.success) {
    selectedPurchase.value = res.data
  }
}

const currency = (n) => (n || 0).toFixed(2)
const formatDate = (d) => new Date(d).toLocaleDateString('pt-BR')
const getStatusColor = (status) => {
  const colors = {
    COMPLETED: 'text-green-600',
    PENDING: 'text-yellow-600',
    CANCELLED: 'text-red-600'
  }
  return colors[status] || 'text-gray-600'
}
const getStatusLabel = (status) => {
  const labels = {
    COMPLETED: 'Concluída',
    PENDING: 'Pendente',
    CANCELLED: 'Cancelada'
  }
  return labels[status] || status
}

onMounted(() => {
  loadPurchases()
  loadSuppliers()
})
</script>



