<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold">Vendas</h1>
      <div class="flex gap-2 items-center">
        <input v-model="startDate" type="date" class="input w-40" />
        <span class="text-gray-600">até</span>
        <input v-model="endDate" type="date" class="input w-40" />
        <button class="btn btn-outline" @click="loadSales">Filtrar</button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="card">
        <div class="card-header"><h2 class="card-title">Resumo</h2></div>
        <div class="card-content">
          <div class="text-sm text-gray-600">Vendas</div>
          <div class="text-2xl font-bold">{{ summary.totalSales }}</div>
          <div class="mt-2 text-sm text-gray-600">Valor</div>
          <div class="text-2xl font-bold">R$ {{ currency(summary.totalAmount) }}</div>
        </div>
      </div>
    </div>

    <div class="overflow-x-auto bg-white border border-gray-200 rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Data</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Cliente</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Operador</th>
            <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">Total</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="s in sales" :key="s.id" class="hover:bg-gray-50">
            <td class="px-4 py-2">{{ formatDateTime(s.date) }}</td>
            <td class="px-4 py-2">{{ s.customer?.name || '-' }}</td>
            <td class="px-4 py-2">{{ s.user?.name || '-' }}</td>
            <td class="px-4 py-2 text-right">R$ {{ currency(s.total) }}</td>
          </tr>
          <tr v-if="sales.length === 0">
            <td colspan="4" class="px-4 py-6 text-center text-gray-500">Nenhuma venda encontrada.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useToast } from 'vue-toastification'

definePageMeta({ middleware: ['auth'] })

const { get } = useApi()
const toast = useToast()
const sales = ref([])
const summary = reactive({ totalSales: 0, totalAmount: 0 })
const startDate = ref('')
const endDate = ref('')

// Função auxiliar para converter Decimal do Prisma
const convertDecimal = (value) => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value) || 0
  if (value && typeof value === 'object' && typeof value.toNumber === 'function') {
    return value.toNumber()
  }
  return Number(value) || 0
}

const currency = (n) => {
  const value = convertDecimal(n)
  return value.toFixed(2)
}

const formatDateTime = (d) => {
  if (!d) return '-'
  const date = new Date(d)
  return date.toLocaleString()
}

const loadSales = async () => {
  try {
    let res
    if (startDate.value && endDate.value) {
      const q = `?startDate=${startDate.value}&endDate=${endDate.value}`
      res = await get(`/api/sales${q}`)
    } else {
      // Quando não há filtros, buscar todas as vendas com limite maior
      res = await get('/api/sales?limit=1000')
    }

    if (res.success) {
      // A API /api/sales retorna { sales: [...], pagination: {...} }
      // A API /api/sales/today retorna { sales: [...], summary: {...} }
      if (res.data.sales && Array.isArray(res.data.sales)) {
        // Converter valores Decimal para número
        sales.value = res.data.sales.map(sale => ({
          ...sale,
          total: convertDecimal(sale.total),
          discount: convertDecimal(sale.discount)
        }))
        // Atualizar summary se existir
        if (res.data.summary) {
          summary.totalSales = res.data.summary.totalSales || sales.value.length
          summary.totalAmount = convertDecimal(res.data.summary.totalAmount) || sales.value.reduce((sum, sale) => {
            return sum + (Number(sale.total) || 0)
          }, 0)
        } else {
          // Calcular summary manualmente se não vier da API
          summary.totalSales = sales.value.length
          summary.totalAmount = sales.value.reduce((sum, sale) => {
            return sum + (Number(sale.total) || 0)
          }, 0)
        }
      } else if (Array.isArray(res.data)) {
        // Fallback caso a API retorne array diretamente
        sales.value = res.data.map(sale => ({
          ...sale,
          total: convertDecimal(sale.total),
          discount: convertDecimal(sale.discount)
        }))
        summary.totalSales = sales.value.length
        summary.totalAmount = sales.value.reduce((sum, sale) => {
          return sum + (Number(sale.total) || 0)
        }, 0)
      }
    } else {
      toast.error(res.error || 'Erro ao carregar vendas')
    }
  } catch (error) {
    console.error('Erro ao carregar vendas:', error)
    toast.error('Erro ao carregar vendas')
  }
}

onMounted(loadSales)
</script>