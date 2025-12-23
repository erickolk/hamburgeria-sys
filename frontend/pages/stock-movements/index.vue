<template>
  <div>
    <h1 class="text-xl font-semibold mb-4">Movimentações de Estoque</h1>

    <div class="mb-4 flex gap-2 flex-wrap">
      <select v-model="filters.productId" class="input">
        <option value="">Todos os produtos</option>
        <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
      <select v-model="filters.type" class="input">
        <option value="">Todos os tipos</option>
        <option value="IN">Entrada</option>
        <option value="OUT">Saída</option>
        <option value="ADJUST">Ajuste</option>
        <option value="SALE">Venda</option>
        <option value="PURCHASE">Compra</option>
        <option value="RETURN">Devolução</option>
      </select>
      <input v-model="filters.startDate" type="date" class="input" />
      <input v-model="filters.endDate" type="date" class="input" />
      <button class="btn btn-outline" @click="loadMovements">Filtrar</button>
    </div>

    <div class="overflow-x-auto bg-white border border-gray-200 rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Data</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Produto</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Tipo</th>
            <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">Quantidade</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Motivo</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Usuário</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="movement in movements" :key="movement.id" class="hover:bg-gray-50">
            <td class="px-4 py-2">{{ formatDate(movement.date) }}</td>
            <td class="px-4 py-2">{{ movement.product?.name }}</td>
            <td class="px-4 py-2">
              <span :class="getTypeColor(movement.type)">{{ getTypeLabel(movement.type) }}</span>
            </td>
            <td class="px-4 py-2 text-right" :class="movement.quantity > 0 ? 'text-green-600' : 'text-red-600'">
              {{ movement.quantity > 0 ? '+' : '' }}{{ movement.quantity }}
            </td>
            <td class="px-4 py-2">{{ movement.reason || '-' }}</td>
            <td class="px-4 py-2">{{ movement.user?.name }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth'] })

const { get } = useApi()
const movements = ref([])
const products = ref([])

const filters = reactive({
  productId: '',
  type: '',
  startDate: '',
  endDate: ''
})

const loadMovements = async () => {
  const params = new URLSearchParams()
  if (filters.productId) params.append('productId', filters.productId)
  if (filters.type) params.append('type', filters.type)
  if (filters.startDate) params.append('startDate', filters.startDate)
  if (filters.endDate) params.append('endDate', filters.endDate)
  
  const res = await get(`/api/stock-movements?${params.toString()}`)
  if (res.success) {
    movements.value = res.data.movements || []
  }
}

const loadProducts = async () => {
  const res = await get('/api/products?limit=1000')
  if (res.success) {
    products.value = res.data.products || []
  }
}

const formatDate = (d) => new Date(d).toLocaleString('pt-BR')
const getTypeLabel = (type) => {
  const labels = {
    IN: 'Entrada',
    OUT: 'Saída',
    ADJUST: 'Ajuste',
    SALE: 'Venda',
    PURCHASE: 'Compra',
    RETURN: 'Devolução'
  }
  return labels[type] || type
}
const getTypeColor = (type) => {
  const colors = {
    IN: 'text-green-600',
    OUT: 'text-red-600',
    ADJUST: 'text-blue-600',
    SALE: 'text-purple-600',
    PURCHASE: 'text-green-600',
    RETURN: 'text-orange-600'
  }
  return colors[type] || 'text-gray-600'
}

onMounted(() => {
  loadMovements()
  loadProducts()
})
</script>



