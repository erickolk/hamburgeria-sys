<template>
  <div>
    <!-- Resumo do Dia -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Visão Geral de Hoje</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-green-600 text-sm font-semibold bg-green-50 px-3 py-1 rounded-full">+{{ dashboard.today.sales }}</span>
          </div>
          <p class="text-gray-500 text-sm mb-1">Vendas Recentes</p>
          <p class="text-3xl font-bold text-gray-900">R$ {{ currency(dashboard.today.revenue) }}</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span v-if="dashboard.inventory.lowStockProducts > 0" class="text-red-600 text-sm font-semibold bg-red-50 px-3 py-1 rounded-full">{{ dashboard.inventory.lowStockProducts }} baixo</span>
          </div>
          <p class="text-gray-500 text-sm mb-1">Produtos em Estoque</p>
          <p class="text-3xl font-bold text-gray-900">{{ dashboard.inventory.totalProducts }}</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p class="text-gray-500 text-sm mb-1">Total de Clientes</p>
          <p class="text-3xl font-bold text-gray-900">{{ dashboard.customers.total }}</p>
        </div>
      </div>
    </div>

    <!-- Navegação Principal -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Acesso Rápido</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <!-- PDV - Destaque -->
        <NuxtLink to="/pos" class="col-span-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all transform hover:scale-105">
          <div class="flex items-center justify-between mb-4">
            <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span class="text-xs font-semibold bg-white/30 px-3 py-1 rounded-full">PRINCIPAL</span>
          </div>
          <h3 class="text-xl font-bold mb-1">Ponto de Venda</h3>
          <p class="text-blue-100 text-sm">Iniciar nova venda</p>
        </NuxtLink>

        <!-- Produtos -->
        <NuxtLink to="/products" class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all border border-gray-100 group">
          <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">Produtos</h3>
          <p class="text-sm text-gray-500">Gerenciar estoque</p>
        </NuxtLink>

        <!-- Fornecedores -->
        <NuxtLink to="/suppliers" class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all border border-gray-100 group">
          <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">Fornecedores</h3>
          <p class="text-sm text-gray-500">Parceiros</p>
        </NuxtLink>

        <!-- Clientes -->
        <NuxtLink to="/customers" class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all border border-gray-100 group">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">Clientes</h3>
          <p class="text-sm text-gray-500">Cadastro</p>
        </NuxtLink>

        <!-- Compras -->
        <NuxtLink to="/purchases" class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all border border-gray-100 group">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">Compras</h3>
          <p class="text-sm text-gray-500">Entrada</p>
        </NuxtLink>
      </div>
    </div>

    <!-- Operações -->
    <div>
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Gestão e Relatórios</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Caixa -->
        <NuxtLink to="/cash" class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all border border-gray-100 group">
          <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
            <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">Caixa</h3>
          <p class="text-sm text-gray-500">Gestão do caixa</p>
        </NuxtLink>

        <!-- Vendas -->
        <NuxtLink to="/sales" class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all border border-gray-100 group">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">Vendas</h3>
          <p class="text-sm text-gray-500">Histórico de vendas</p>
        </NuxtLink>

        <!-- Movimentações -->
        <NuxtLink to="/stock-movements" class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all border border-gray-100 group">
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-200 transition-colors">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">Movimentações</h3>
          <p class="text-sm text-gray-500">Estoque</p>
        </NuxtLink>

        <!-- Relatórios -->
        <NuxtLink to="/reports" class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all border border-gray-100 group">
          <div class="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-200 transition-colors">
            <svg class="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">Relatórios</h3>
          <p class="text-sm text-gray-500">Análises</p>
        </NuxtLink>

        <!-- Configurações -->
        <NuxtLink to="/settings" class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all border border-gray-100 group">
          <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">Configurações</h3>
          <p class="text-sm text-gray-500">Sistema</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth'] })

const { get } = useApi()
const dashboard = reactive({
  today: { sales: 0, revenue: 0 },
  inventory: { totalProducts: 0, lowStockProducts: 0 },
  customers: { total: 0 }
})

const currency = (n) => {
  const v = Number(n ?? 0)
  if (Number.isNaN(v)) return '0.00'
  return v.toFixed(2)
}

onMounted(async () => {
  try {
    const res = await get('/api/reports/dashboard')
    if (res.success) {
      console.log('[Dashboard] Dados recebidos:', JSON.stringify(res.data, null, 2))
      console.log('[Dashboard] today object:', res.data.today)
      console.log('[Dashboard] revenue raw:', res.data.today?.revenue, 'type:', typeof res.data.today?.revenue)
      // Atribuir valores de forma reativa para objetos aninhados
      if (res.data.today) {
        dashboard.today.sales = res.data.today.sales || 0
        // Converter revenue para número (pode vir como Decimal do Prisma)
        const revenue = res.data.today.revenue
        console.log('[Dashboard] Revenue antes da conversão:', revenue, 'tipo:', typeof revenue)
        dashboard.today.revenue = typeof revenue === 'number' 
          ? revenue 
          : (typeof revenue === 'string' ? parseFloat(revenue) : Number(revenue) || 0)
        console.log('[Dashboard] Revenue convertido:', dashboard.today.revenue)
        console.log('[Dashboard] Sales count:', dashboard.today.sales)
      }
      if (res.data.inventory) {
        dashboard.inventory.totalProducts = res.data.inventory.totalProducts || 0
        dashboard.inventory.lowStockProducts = res.data.inventory.lowStockProducts || 0
      }
      if (res.data.customers) {
        dashboard.customers.total = res.data.customers.total || 0
      }
    } else {
      console.error('[Dashboard] Erro na resposta:', res.error)
    }
  } catch (error) {
    console.error('[Dashboard] Erro ao carregar:', error)
  }
})
</script>
