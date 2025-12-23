<template>
  <div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <div class="card mb-4">
          <div class="card-header">
            <h2 class="card-title">Buscar Produtos</h2>
          </div>
          <div class="card-content">
            <div class="flex gap-2">
              <input v-model="query" class="input flex-1" placeholder="Nome, SKU ou código de barras" @keydown.enter.prevent="search" />
              <button class="btn btn-outline" @click="search">Buscar</button>
            </div>
            <div v-if="results.length" class="mt-4 border-t border-gray-100">
              <div class="divide-y divide-gray-100">
                <div v-for="prod in results" :key="prod.id" class="py-2 flex items-center justify-between">
                  <div>
                    <div class="font-medium">{{ prod.name }}</div>
                    <div class="text-sm text-gray-500">SKU: {{ prod.sku }} • Estoque: {{ prod.stockQuantity }}</div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="text-right">
                      <div class="font-semibold">R$ {{ currency(prod.salePrice) }}</div>
                    </div>
                    <button class="btn btn-primary btn-sm" @click="add(prod)">Adicionar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Itens da Venda</h2>
          </div>
          <div class="card-content">
            <div v-if="items.length === 0" class="text-gray-500">Nenhum item adicionado.</div>
            <div v-else class="divide-y divide-gray-100">
              <div v-for="item in items" :key="item.id" class="py-2 flex items-center justify-between">
                <div class="flex-1">
                  <div class="font-medium">{{ item.name }}</div>
                  <div class="text-sm text-gray-500">SKU: {{ item.sku }}</div>
                </div>
                <div class="flex items-center gap-2">
                  <button 
                    v-if="['KG', 'LT'].includes(item.saleUnit)" 
                    class="btn btn-ghost btn-xs px-1" 
                    title="Ler Balança"
                    @click="readWeight(item)"
                  >
                    ⚖️
                  </button>
                  <input type="number" :min="item.saleUnit !== 'UNIT' ? 0.001 : 1" :step="item.saleUnit !== 'UNIT' ? 0.001 : 1" class="input w-20" :value="item.quantity" @input="update(item.id, $event.target.value)" />
                  <input type="number" min="0" step="0.01" class="input w-24" :value="item.discount || 0" @input="updateDiscount(item.id, $event.target.value)" placeholder="Desc." />
                  <div class="w-28 text-right">R$ {{ currency((item.price * item.quantity) - (item.discount || 0)) }}</div>
                  <button class="btn btn-outline btn-sm" @click="remove(item.id)">Remover</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="card sticky top-24">
          <div class="card-header">
            <h2 class="card-title">Pagamento</h2>
          </div>
          <div class="card-content space-y-3">
            <div class="flex justify-between"><span>Itens</span><span>{{ itemCount }}</span></div>
            <div class="flex justify-between"><span>Subtotal</span><span>R$ {{ currency(subtotal) }}</span></div>
            <div class="flex justify-between">
              <span>Desconto Total</span>
              <input type="number" min="0" step="0.01" class="input w-24 text-right" :value="discount" @input="setDiscount($event.target.value)" />
            </div>
            <div class="flex justify-between font-semibold text-lg"><span>Total</span><span>R$ {{ currency(total) }}</span></div>
            <hr />
            
            <div>
              <label class="block text-sm font-medium mb-1">Formas de Pagamento</label>
              <div v-for="(payment, idx) in payments" :key="idx" class="flex gap-2 mb-2">
                <select v-model="payment.method" class="input flex-1">
                  <option value="CASH">Dinheiro</option>
                  <option value="CARD">Cartão</option>
                  <option value="PIX">PIX</option>
                  <option value="CREDIT">Fiado</option>
                </select>
                <input type="number" min="0" step="0.01" class="input w-24" v-model.number="payment.amount" />
                <button class="btn btn-outline btn-sm" @click="removePayment(idx)">×</button>
              </div>
              <button class="btn btn-outline btn-sm w-full" @click="addPayment">+ Adicionar Pagamento</button>
            </div>

            <div v-if="totalPayments > 0" class="text-sm">
              <div class="flex justify-between"><span>Total Pago</span><span>R$ {{ currency(totalPayments) }}</span></div>
              <div v-if="change > 0" class="flex justify-between text-green-600 font-semibold"><span>Troco</span><span>R$ {{ currency(change) }}</span></div>
            </div>

            <!-- Alerta quando falta dinheiro -->
            <div v-if="paymentDifference > 0.01" class="bg-red-50 border-2 border-red-500 rounded-lg p-3 space-y-2">
              <div class="flex items-start gap-2">
                <span class="text-2xl">⚠️</span>
                <div class="flex-1">
                  <div class="font-bold text-red-700 text-sm">FALTA DINHEIRO!</div>
                  <div class="text-red-600 text-sm mt-1">
                    Faltam <span class="font-bold">R$ {{ currency(paymentDifference) }}</span> para completar o pagamento
                  </div>
                </div>
              </div>
              <div class="text-xs text-red-600 mt-2 border-t border-red-200 pt-2">
                <div class="font-semibold mb-1">O que fazer?</div>
                <ul class="list-disc list-inside space-y-1 ml-2">
                  <li>Ajuste o valor do pagamento acima</li>
                  <li>Adicione outra forma de pagamento</li>
                  <li>Ou clique em um dos botões abaixo</li>
                </ul>
              </div>
              <div class="flex gap-2">
                <button class="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white flex-1" @click="completePayment">
                  💰 Completar Pagamento
                </button>
                <button class="btn btn-sm bg-orange-600 hover:bg-orange-700 text-white flex-1" @click="adjustDiscount">
                  🏷️ Dar Desconto
                </button>
              </div>
            </div>

            <!-- Alerta quando excede (troco alto) -->
            <div v-if="paymentDifference < -0.01" class="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-3">
              <div class="flex items-start gap-2">
                <span class="text-2xl">💵</span>
                <div class="flex-1">
                  <div class="font-bold text-yellow-700 text-sm">ATENÇÃO: TROCO ALTO</div>
                  <div class="text-yellow-600 text-sm mt-1">
                    O cliente pagou <span class="font-bold">R$ {{ currency(Math.abs(paymentDifference)) }}</span> a mais
                  </div>
                  <div class="text-yellow-600 text-xs mt-2">
                    ✓ Confirme se o valor está correto antes de finalizar
                  </div>
                </div>
              </div>
            </div>

            <button class="btn btn-primary w-full" :disabled="!canCheckout" @click="checkout">Finalizar Venda</button>
            
            <!-- Área de Ticket Gerado -->
            <div v-if="lastSaleTicket" class="mt-4 p-4 bg-green-50 border-2 border-green-500 rounded-lg space-y-3">
              <div class="flex items-start gap-2">
                <span class="text-2xl">🎫</span>
                <div class="flex-1">
                  <div class="font-bold text-green-700 text-sm">TICKET GERADO COM SUCESSO!</div>
                  <div class="text-green-600 text-xs mt-1">
                    Venda #{{ lastSaleTicket.saleNumber }}
                  </div>
                </div>
                <button 
                  class="text-green-700 hover:text-green-900 text-xl font-bold"
                  @click="lastSaleTicket = null"
                  title="Fechar">
                  ×
                </button>
              </div>
              <div class="flex gap-2">
                <a 
                  :href="`http://localhost:3001/sales/${lastSaleTicket.saleId}/ticket/download`"
                  target="_blank"
                  download
                  class="btn btn-success flex-1 text-center text-sm">
                  📥 Baixar Ticket
                </a>
                <button 
                  @click="reprintTicket(lastSaleTicket.saleId)"
                  class="btn bg-blue-600 hover:bg-blue-700 text-white flex-1 text-sm">
                  🖨️ Reimprimir
                </button>
              </div>
              <div class="text-xs text-green-600">
                💡 O arquivo está salvo em: <code class="bg-green-100 px-1 rounded">backend/tickets/</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
definePageMeta({ middleware: ['auth'] })

const query = ref('')
const results = ref([])
const { get, post } = useApi()
const { printThermal, readScaleWeight } = useElectron()
const lastSaleTicket = ref(null)

const cart = useCartStore()
const { items, itemCount, subtotal, total, totalPayments, change, canCheckout, payments, discount } = storeToRefs(cart)

const add = (p) => {
  cart.addItem(p, 1)
  query.value = ''
  results.value = []
  // Refocar busca para próximo item
  nextTick(() => document.querySelector('input[placeholder="Nome, SKU ou código de barras"]')?.focus())
}
const remove = (id) => cart.removeItem(id)
const update = (id, q) => cart.updateQuantity(id, Number(q))

const readWeight = async (item) => {
  useToast().info('Lendo balança...')
  const res = await readScaleWeight()
  if (res.success) {
    update(item.id, res.weight)
    useToast().success(`Peso lido: ${res.weight}kg`)
  } else {
    useToast().error(res.error || 'Erro ao ler balança')
  }
}

const updateDiscount = (id, d) => cart.updateItemDiscount(id, d)
const setDiscount = (d) => cart.setDiscount(d)
const addPayment = () => cart.addPayment('CASH', 0)
const removePayment = (idx) => cart.removePayment(idx)

const currency = (n) => {
  const v = Number(n ?? 0)
  if (Number.isNaN(v)) return '0.00'
  return v.toFixed(2)
}

// Calcular diferença de pagamento (positivo = falta, negativo = excesso)
const paymentDifference = computed(() => {
  return total.value - totalPayments.value
})

// Completar o pagamento automaticamente
const completePayment = () => {
  const falta = paymentDifference.value
  if (falta > 0.01) {
    // Se já existe algum pagamento, ajustar o último
    if (payments.value.length > 0) {
      const lastPayment = payments.value[payments.value.length - 1]
      lastPayment.amount = Number(lastPayment.amount) + falta
      useToast().success(`Pagamento ajustado! Adicionado R$ ${currency(falta)}`)
    } else {
      // Se não existe pagamento, criar um novo
      cart.addPayment('CASH', falta)
      useToast().success(`Pagamento adicionado: R$ ${currency(falta)}`)
    }
  }
}

// Ajustar desconto para fechar o valor
const adjustDiscount = () => {
  const falta = paymentDifference.value
  if (falta > 0.01) {
    const novoDesconto = Number(discount.value || 0) + falta
    cart.setDiscount(novoDesconto)
    useToast().success(`Desconto aplicado! Total: R$ ${currency(novoDesconto)}`)
  }
}

const reprintTicket = async (saleId) => {
  try {
    const res = await post(`/api/sales/${saleId}/ticket`)
    if (res.success) {
      useToast().success('Ticket reimprimido com sucesso!')
      // Atualizar informações do ticket
      if (res.data.ticket) {
        lastSaleTicket.value = {
          saleId: saleId,
          filename: res.data.ticket.filename,
          saleNumber: saleId.substring(0, 8).toUpperCase()
        }
      }
    } else {
      useToast().error(res.error || 'Erro ao reimprimir ticket')
    }
  } catch (err) {
    console.error('[reprintTicket] Erro:', err)
    useToast().error('Erro ao reimprimir ticket')
  }
}

const search = async () => {
  const q = query.value ? `?search=${encodeURIComponent(query.value)}` : ''
  const res = await get(`/api/products${q}`)
  if (res.success) {
    const items = res.data.products || res.data || []
    // Coagir campos numéricos vindos como string/Decimal para número
    results.value = items.map(p => ({
      ...p,
      costPrice: Number(p?.costPrice ?? 0),
      salePrice: Number(p?.salePrice ?? 0),
      stockQuantity: Number(p?.stockQuantity ?? 0),
      reorderPoint: Number(p?.reorderPoint ?? 0)
    }))
  }
  else {
    useToast().error(res.error || 'Erro ao buscar produtos')
    results.value = []
  }
}

const checkout = async () => {
  // Validações de fluxo com feedback ao usuário
  if (!items.value.length) {
    useToast().error('Adicione itens à venda antes de finalizar')
    return
  }
  if (total.value <= 0) {
    useToast().error('Total da venda é inválido')
    return
  }
  if (payments.value.length === 0) {
    useToast().error('Adicione ao menos uma forma de pagamento')
    return
  }
  // Validar que todos os pagamentos possuem valores positivos
  const hasInvalidPayment = payments.value.some(p => !p || isNaN(p.amount) || p.amount <= 0)
  if (hasInvalidPayment) {
    useToast().error('Informe valores positivos nas formas de pagamento')
    return
  }
  const diff = Math.abs(totalPayments.value - total.value)
  if (diff > 0.01) {
    const falta = total.value - totalPayments.value
    if (falta > 0) {
      useToast().error(
        `❌ FALTA DINHEIRO! Faltam R$ ${currency(falta)} para completar o pagamento.\n\n` +
        `💡 Dica: Use os botões "Completar Pagamento" ou "Dar Desconto" acima!`,
        { timeout: 6000 }
      )
    } else {
      useToast().warning(
        `⚠️ Pagamento excedente! O cliente está pagando R$ ${currency(Math.abs(falta))} a mais.\n\n` +
        `Troco a devolver: R$ ${currency(Math.abs(falta))}`,
        { timeout: 5000 }
      )
    }
    return
  }

  try {
    const saleData = cart.getSaleData()
    console.log('[checkout] Dados da venda:', JSON.stringify(saleData, null, 2))
    const res = await post('/api/sales', saleData)
    console.log('[checkout] Resposta completa:', JSON.stringify(res, null, 2))
    if (res.success) {
      const sale = res.data
      console.log('[checkout] Dados da venda:', sale)
      console.log('[checkout] Ticket info:', sale.ticket)
      
      // Verificar se ticket foi gerado
      if (sale.ticket && sale.ticket.generated) {
        // Salvar informações do ticket para exibir botão de download
        lastSaleTicket.value = {
          saleId: sale.id,
          filename: sale.ticket.filename,
          saleNumber: sale.id.substring(0, 8).toUpperCase()
        }
        
        console.log('[checkout] Ticket salvo:', lastSaleTicket.value)

        // Auto Imprimir Ticket (Electron)
        if (sale.ticket.filepath) {
           printThermal(sale.ticket.filepath).then(res => {
             if (res.success) useToast().success('🖨️ Enviado para impressora')
             else console.error('Erro impressão:', res.error)
           })
        }

        useToast().success(`🎫 Venda #${lastSaleTicket.value.saleNumber} realizada! Ticket gerado com sucesso!`, {
          timeout: 5000
        })
      } else {
        console.warn('[checkout] Ticket não foi gerado. Resposta:', sale)
        useToast().warning('Venda realizada com sucesso, mas ticket não foi gerado. Verifique os logs do servidor.')
      }
      
      cart.clear()
      query.value = ''
      results.value = []
    } else {
      console.error('[checkout] Erro:', res.error)
      useToast().error(res.error || 'Falha ao finalizar venda')
    }
  } catch (err) {
    console.error('[checkout] Exceção:', err)
    useToast().error('Erro inesperado ao finalizar venda')
  }
}
</script>
