<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gerenciamento de Caixa</h1>
      <div class="flex gap-2">
        <button v-if="!cashStatus.isOpen" class="btn btn-primary" @click="showOpenModal = true">
          Abrir Caixa
        </button>
        <button v-if="cashStatus.isOpen" class="btn btn-success" @click="showWithdrawalModal = true">
          Sangria
        </button>
        <button v-if="cashStatus.isOpen" class="btn btn-success" @click="showSupplyModal = true">
          Suprimento
        </button>
        <button v-if="cashStatus.isOpen" class="btn btn-danger" @click="showCloseModal = true">
          Fechar Caixa
        </button>
      </div>
    </div>

    <!-- Status do Caixa -->
    <div v-if="cashStatus.isOpen" class="card mb-6">
      <div class="card-header">
        <h2 class="card-title">Status do Caixa</h2>
      </div>
      <div class="card-content">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div class="text-sm text-gray-500">Operador</div>
            <div class="font-semibold">{{ cashStatus.cashRegister?.openedBy?.name }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">Abertura</div>
            <div class="font-semibold">{{ formatDateTime(cashStatus.cashRegister?.openedAt) }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">Valor Inicial</div>
            <div class="font-semibold">R$ {{ currency(cashStatus.cashRegister?.openingAmount) }}</div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div>
            <div class="text-sm text-gray-500">Vendas Realizadas</div>
            <div class="font-semibold">{{ cashStatus.todaySales?.count || 0 }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">Total em Vendas</div>
            <div class="font-semibold text-green-600">R$ {{ currency(cashStatus.todaySales?.total) }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">Valor Atual em Caixa (estimado)</div>
            <div class="font-semibold text-blue-600">R$ {{ currency(cashStatus.currentAmount) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="card mb-6">
      <div class="card-content text-center text-gray-500 py-8">
        <p class="text-lg mb-2">Caixa Fechado</p>
        <p>Clique em "Abrir Caixa" para iniciar o dia</p>
      </div>
    </div>

    <!-- Histórico de Caixas -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Histórico de Caixas</h2>
      </div>
      <div class="card-content">
        <div v-if="history.length === 0" class="text-gray-500 text-center py-4">
          Nenhum registro encontrado
        </div>
        <div v-else class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Operador</th>
                <th>Abertura</th>
                <th>Fechamento</th>
                <th>Inicial</th>
                <th>Final</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cash in history" :key="cash.id">
                <td>{{ cash.user?.name }}</td>
                <td>{{ formatDateTime(cash.openedAt) }}</td>
                <td>{{ cash.closedAt ? formatDateTime(cash.closedAt) : '-' }}</td>
                <td>R$ {{ currency(cash.initialBalance) }}</td>
                <td>{{ cash.finalBalance ? `R$ ${currency(cash.finalBalance)}` : '-' }}</td>
                <td>
                  <span :class="getStatusColor(cash.status)">
                    {{ getStatusLabel(cash.status) }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-outline btn-sm" @click="viewDetails(cash.id)">
                    Detalhes
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Abrir Caixa -->
    <div v-if="showOpenModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">Abrir Caixa</h3>
        <form @submit.prevent="openCash">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Valor Inicial (Fundo de Troco)</label>
            <input v-model.number="openForm.amount" type="number" step="0.01" min="0" class="input" required />
          </div>
          <div class="flex gap-2 justify-end">
            <button type="button" class="btn btn-outline" @click="showOpenModal = false">Cancelar</button>
            <button type="submit" class="btn btn-primary">Abrir</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Sangria -->
    <div v-if="showWithdrawalModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">Sangria (Retirada)</h3>
        <form @submit.prevent="makeWithdrawal">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Valor</label>
            <input v-model.number="withdrawalForm.amount" type="number" step="0.01" min="0.01" class="input" required />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Motivo</label>
            <textarea v-model="withdrawalForm.reason" class="input" rows="3" required></textarea>
          </div>
          <div class="flex gap-2 justify-end">
            <button type="button" class="btn btn-outline" @click="showWithdrawalModal = false">Cancelar</button>
            <button type="submit" class="btn btn-primary">Confirmar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Suprimento -->
    <div v-if="showSupplyModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">Suprimento (Reforço de Troco)</h3>
        <form @submit.prevent="makeSupply">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Valor</label>
            <input v-model.number="supplyForm.amount" type="number" step="0.01" min="0.01" class="input" required />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Motivo</label>
            <textarea v-model="supplyForm.reason" class="input" rows="3" required></textarea>
          </div>
          <div class="flex gap-2 justify-end">
            <button type="button" class="btn btn-outline" @click="showSupplyModal = false">Cancelar</button>
            <button type="submit" class="btn btn-primary">Confirmar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Fechar Caixa -->
    <div v-if="showCloseModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h3 class="text-xl font-bold mb-4">Fechar Caixa</h3>
        <form @submit.prevent="closeCash">
          <div class="bg-gray-50 p-4 rounded mb-4">
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>Valor Inicial:</div>
              <div class="text-right font-semibold">R$ {{ currency(cashStatus.cashRegister?.openingAmount) }}</div>
              <div>Total em Vendas:</div>
              <div class="text-right font-semibold text-green-600">R$ {{ currency(cashStatus.todaySales?.total) }}</div>
              <div>Valor Esperado:</div>
              <div class="text-right font-semibold text-blue-600">R$ {{ currency(cashStatus.currentAmount) }}</div>
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Valor Contado em Dinheiro</label>
            <input v-model.number="closeForm.amount" type="number" step="0.01" min="0" class="input" required />
          </div>
          <div v-if="closeForm.amount" class="mb-4 p-3 rounded" :class="closeDifference === 0 ? 'bg-green-50 text-green-700' : closeDifference > 0 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'">
            <div class="font-semibold">
              {{ closeDifference === 0 ? '✓ Caixa Bateu!' : closeDifference > 0 ? `⚠ Sobra: R$ ${currency(Math.abs(closeDifference))}` : `⚠ Falta: R$ ${currency(Math.abs(closeDifference))}` }}
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Observações</label>
            <textarea v-model="closeForm.notes" class="input" rows="3" placeholder="Opcional"></textarea>
          </div>
          <div class="flex gap-2 justify-end">
            <button type="button" class="btn btn-outline" @click="showCloseModal = false">Cancelar</button>
            <button type="submit" class="btn btn-danger">Fechar Caixa</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from 'vue-toastification'
definePageMeta({ middleware: ['auth'] })

const { get, post } = useApi()
const toast = useToast()

const cashStatus = ref({ isOpen: false })
const history = ref([])
const showOpenModal = ref(false)
const showWithdrawalModal = ref(false)
const showSupplyModal = ref(false)
const showCloseModal = ref(false)

const openForm = ref({ amount: 0 })
const withdrawalForm = ref({ amount: 0, reason: '' })
const supplyForm = ref({ amount: 0, reason: '' })
const closeForm = ref({ amount: 0, notes: '' })

const closeDifference = computed(() => {
  return closeForm.value.amount - (cashStatus.value.currentAmount || 0)
})

const loadCashStatus = async () => {
  const res = await get('/api/cash/status')
  if (res.success) {
    cashStatus.value = res.data
  }
}

const loadHistory = async () => {
  const res = await get('/api/cash/history')
  if (res.success) {
    history.value = res.data.cashRegisters || []
  }
}

const openCash = async () => {
  const res = await post('/api/cash/open', { openingAmount: openForm.value.amount })
  if (res.success) {
    toast.success('Caixa aberto com sucesso!')
    showOpenModal.value = false
    openForm.value = { amount: 0 }
    await loadCashStatus()
    await loadHistory()
  } else {
    toast.error(res.error || 'Erro ao abrir caixa')
  }
}

const makeWithdrawal = async () => {
  const res = await post('/api/cash/withdrawal', withdrawalForm.value)
  if (res.success) {
    toast.success('Sangria registrada com sucesso!')
    showWithdrawalModal.value = false
    withdrawalForm.value = { amount: 0, reason: '' }
    await loadCashStatus()
  } else {
    toast.error(res.error || 'Erro ao registrar sangria')
  }
}

const makeSupply = async () => {
  const res = await post('/api/cash/supply', supplyForm.value)
  if (res.success) {
    toast.success('Suprimento registrado com sucesso!')
    showSupplyModal.value = false
    supplyForm.value = { amount: 0, reason: '' }
    await loadCashStatus()
  } else {
    toast.error(res.error || 'Erro ao registrar suprimento')
  }
}

const closeCash = async () => {
  const res = await post('/api/cash/close', { 
    closingAmount: closeForm.value.amount,
    notes: closeForm.value.notes
  })
  if (res.success) {
    toast.success('Caixa fechado com sucesso!')
    showCloseModal.value = false
    closeForm.value = { amount: 0, notes: '' }
    await loadCashStatus()
    await loadHistory()
  } else {
    toast.error(res.error || 'Erro ao fechar caixa')
  }
}

const viewDetails = async (id) => {
  // TODO: Implementar modal de detalhes
  toast.info('Funcionalidade em desenvolvimento')
}

const currency = (n) => {
  const v = Number(n ?? 0)
  if (Number.isNaN(v)) return '0.00'
  return v.toFixed(2)
}

const formatDateTime = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleString('pt-BR')
}

const getStatusColor = (status) => {
  return status === 'OPEN' ? 'text-green-600' : 'text-gray-600'
}

const getStatusLabel = (status) => {
  return status === 'OPEN' ? 'Aberto' : 'Fechado'
}

onMounted(() => {
  loadCashStatus()
  loadHistory()
})
</script>

