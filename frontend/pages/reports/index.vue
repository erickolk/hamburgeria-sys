<template>
  <div>
    <h1 class="text-xl font-semibold mb-4">Relatórios</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Relatório de Vendas -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Vendas por Período</h2>
        </div>
        <div class="card-content space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Data Inicial</label>
            <input v-model="salesFilters.startDate" type="date" class="input w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Data Final</label>
            <input v-model="salesFilters.endDate" type="date" class="input w-full" />
          </div>
          <button class="btn btn-primary w-full" @click="loadSalesReport">Gerar Relatório</button>
          <button v-if="salesReport.length" class="btn btn-outline w-full" @click="exportSalesCSV">Exportar CSV</button>
          <a v-if="generatedFiles.sales" 
             :href="`http://localhost:3001/reports/files/${generatedFiles.sales.filename}`" 
             target="_blank"
             download
             class="btn btn-success w-full text-center">
            📄 Baixar Arquivo Gerado
          </a>
        </div>
      </div>

      <!-- Produtos Mais Vendidos -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Produtos Mais Vendidos</h2>
        </div>
        <div class="card-content space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Período (opcional)</label>
            <div class="flex gap-2">
              <input v-model="topProductsFilters.startDate" type="date" class="input flex-1" />
              <input v-model="topProductsFilters.endDate" type="date" class="input flex-1" />
            </div>
          </div>
          <button class="btn btn-primary w-full" @click="loadTopProducts">Gerar Relatório</button>
          <a v-if="generatedFiles.topProducts" 
             :href="`http://localhost:3001/reports/files/${generatedFiles.topProducts.filename}`" 
             target="_blank"
             download
             class="btn btn-success w-full text-center">
            📄 Baixar Arquivo Gerado
          </a>
        </div>
      </div>

      <!-- Estoque Baixo -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Estoque Baixo</h2>
        </div>
        <div class="card-content space-y-4">
          <button class="btn btn-primary w-full" @click="loadLowStock">Gerar Relatório</button>
          <a v-if="generatedFiles.lowStock" 
             :href="`http://localhost:3001/reports/files/${generatedFiles.lowStock.filename}`" 
             target="_blank"
             download
             class="btn btn-success w-full text-center">
            📄 Baixar Arquivo Gerado
          </a>
        </div>
      </div>

      <!-- Fluxo de Caixa -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Fluxo de Caixa</h2>
        </div>
        <div class="card-content space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Data Inicial</label>
            <input v-model="cashFlowFilters.startDate" type="date" class="input w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Data Final</label>
            <input v-model="cashFlowFilters.endDate" type="date" class="input w-full" />
          </div>
          <button class="btn btn-primary w-full" @click="loadCashFlow">Gerar Relatório</button>
          <a v-if="generatedFiles.cashFlow" 
             :href="`http://localhost:3001/reports/files/${generatedFiles.cashFlow.filename}`" 
             target="_blank"
             download
             class="btn btn-success w-full text-center">
            📄 Baixar Arquivo Gerado
          </a>
        </div>
      </div>
    </div>

    <!-- Resultados -->
    <div v-if="salesReport.length" class="mt-6 card">
      <div class="card-header">
        <h2 class="card-title">Vendas por Período</h2>
      </div>
      <div class="card-content">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-4 py-2 text-left">Data</th>
                <th class="px-4 py-2 text-right">Vendas</th>
                <th class="px-4 py-2 text-right">Itens Vendidos</th>
                <th class="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in salesReport" :key="item.date">
                <td class="px-4 py-2">{{ item.date }}</td>
                <td class="px-4 py-2 text-right">{{ item.totalSales }}</td>
                <td class="px-4 py-2 text-right">{{ item.itemsSold }}</td>
                <td class="px-4 py-2 text-right">R$ {{ currency(item.totalAmount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="topProducts.length" class="mt-6 card">
      <div class="card-header">
        <h2 class="card-title">Produtos Mais Vendidos</h2>
      </div>
      <div class="card-content">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-4 py-2 text-left">Produto</th>
                <th class="px-4 py-2 text-left">SKU</th>
                <th class="px-4 py-2 text-right">Quantidade</th>
                <th class="px-4 py-2 text-right">Vendas</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in topProducts" :key="item.product?.id">
                <td class="px-4 py-2">{{ item.product?.name }}</td>
                <td class="px-4 py-2">{{ item.product?.sku }}</td>
                <td class="px-4 py-2 text-right">{{ item.totalQuantity }}</td>
                <td class="px-4 py-2 text-right">{{ item.totalSales }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="lowStock.length" class="mt-6 card">
      <div class="card-header">
        <h2 class="card-title">Produtos com Estoque Baixo</h2>
      </div>
      <div class="card-content">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-4 py-2 text-left">Produto</th>
                <th class="px-4 py-2 text-left">SKU</th>
                <th class="px-4 py-2 text-right">Estoque</th>
                <th class="px-4 py-2 text-right">Mínimo</th>
                <th class="px-4 py-2 text-left">Fornecedor</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in lowStock" :key="product.id">
                <td class="px-4 py-2">{{ product.name }}</td>
                <td class="px-4 py-2">{{ product.sku }}</td>
                <td class="px-4 py-2 text-right text-red-600">{{ product.stockQuantity }}</td>
                <td class="px-4 py-2 text-right">{{ product.reorderPoint }}</td>
                <td class="px-4 py-2">{{ product.supplier?.name || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="cashFlowData" class="mt-6 card">
      <div class="card-header">
        <h2 class="card-title">Fluxo de Caixa</h2>
      </div>
      <div class="card-content">
        <div class="space-y-4">
          <div>
            <strong>Período:</strong> {{ cashFlowData.period.startDate }} até {{ cashFlowData.period.endDate }}
          </div>
          <div>
            <strong>Total de Vendas:</strong> {{ cashFlowData.income.totalSales }}
          </div>
          <div>
            <strong>Total Recebido:</strong> R$ {{ currency(cashFlowData.income.totalAmount) }}
          </div>
          <div>
            <strong>Por Forma de Pagamento:</strong>
            <ul class="list-disc list-inside mt-2">
              <li v-for="(amount, method) in cashFlowData.income.byPaymentMethod" :key="method">
                {{ getPaymentMethodLabel(method) }}: R$ {{ currency(amount) }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from 'vue-toastification'

definePageMeta({ middleware: ['auth'] })

const { get } = useApi()
const toast = useToast()
const salesReport = ref([])
const topProducts = ref([])
const lowStock = ref([])
const cashFlowData = ref(null)

// Arquivos gerados
const generatedFiles = ref({
  sales: null,
  topProducts: null,
  lowStock: null,
  cashFlow: null
})

const salesFilters = reactive({
  startDate: '',
  endDate: ''
})

const topProductsFilters = reactive({
  startDate: '',
  endDate: ''
})

const cashFlowFilters = reactive({
  startDate: '',
  endDate: ''
})

const loadSalesReport = async () => {
  if (!salesFilters.startDate || !salesFilters.endDate) {
    toast.error('Selecione as datas inicial e final')
    return
  }
  const res = await get(`/api/reports/sales?startDate=${salesFilters.startDate}&endDate=${salesFilters.endDate}&generateFile=true`)
  if (res.success) {
    // Nova estrutura de resposta: { data: [...], file: {...} }
    salesReport.value = res.data.data || res.data
    generatedFiles.value.sales = res.data.file
    
    if (res.data.file && res.data.file.generated) {
      toast.success(`✅ Relatório gerado! Arquivo: ${res.data.file.filename}`)
    }
  }
}

const loadTopProducts = async () => {
  let url = '/api/reports/top-products'
  const params = ['generateFile=true']
  if (topProductsFilters.startDate) params.push(`startDate=${topProductsFilters.startDate}`)
  if (topProductsFilters.endDate) params.push(`endDate=${topProductsFilters.endDate}`)
  if (params.length) url += '?' + params.join('&')
  
  const res = await get(url)
  if (res.success) {
    topProducts.value = res.data.data || res.data
    generatedFiles.value.topProducts = res.data.file
    
    if (res.data.file && res.data.file.generated) {
      toast.success(`✅ Relatório gerado! Arquivo: ${res.data.file.filename}`)
    }
  }
}

const loadLowStock = async () => {
  const res = await get('/api/reports/low-stock?generateFile=true')
  if (res.success) {
    lowStock.value = res.data.data || res.data
    generatedFiles.value.lowStock = res.data.file
    
    if (res.data.file && res.data.file.generated) {
      toast.success(`✅ Relatório gerado! Arquivo: ${res.data.file.filename}`)
    }
  }
}

const loadCashFlow = async () => {
  if (!cashFlowFilters.startDate || !cashFlowFilters.endDate) {
    toast.error('Selecione as datas inicial e final')
    return
  }
  const res = await get(`/api/reports/cash-flow?startDate=${cashFlowFilters.startDate}&endDate=${cashFlowFilters.endDate}&generateFile=true`)
  if (res.success) {
    // Remover a propriedade file antes de atribuir ao cashFlowData
    const { file, ...reportData } = res.data
    cashFlowData.value = reportData
    generatedFiles.value.cashFlow = file
    
    if (file && file.generated) {
      toast.success(`✅ Relatório gerado! Arquivo: ${file.filename}`)
    }
  }
}

const exportSalesCSV = () => {
  if (salesReport.value.length === 0) return
  
  const headers = ['Data', 'Vendas', 'Itens Vendidos', 'Total']
  const rows = salesReport.value.map(item => [
    item.date,
    item.totalSales,
    item.itemsSold,
    item.totalAmount
  ])
  
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vendas-${salesFilters.startDate}-${salesFilters.endDate}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

const currency = (n) => {
  // Converter para número se for string ou objeto
  const num = typeof n === 'number' ? n : parseFloat(n) || 0
  return num.toFixed(2)
}
const getPaymentMethodLabel = (method) => {
  const labels = {
    CASH: 'Dinheiro',
    CARD: 'Cartão',
    PIX: 'PIX',
    CREDIT: 'Fiado'
  }
  return labels[method] || method
}
</script>



