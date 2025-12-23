import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const customer = ref(null)
  const payments = ref([])
  const discount = ref(0)

  const normalizeNumber = (value, precision = 2) => {
    if (value === null || value === undefined || value === '') return 0
    let parsed = value
    if (typeof parsed === 'string') {
      parsed = parsed.replace(',', '.')
    }
    const num = Number(parsed)
    if (!Number.isFinite(num)) return 0
    return Number(num.toFixed(precision))
  }

  // Computed
  const itemCount = computed(() => items.value.reduce((sum, item) => sum + normalizeNumber(item.quantity, 3), 0))
  const subtotal = computed(() => items.value.reduce((sum, item) => {
    const qty = normalizeNumber(item.quantity, 3)
    const price = normalizeNumber(item.price)
    const itemDiscount = normalizeNumber(item.discount)
    const itemTotal = (qty * price) - itemDiscount
    return sum + itemTotal
  }, 0))
  const totalDiscount = computed(() => Math.max(0, normalizeNumber(discount.value)))
  const total = computed(() => Math.max(0, subtotal.value - totalDiscount.value))
  const totalPayments = computed(() => payments.value.reduce((sum, p) => sum + normalizeNumber(p.amount), 0))
  const change = computed(() => Math.max(0, totalPayments.value - total.value))

  // Actions
  const addItem = (product, quantity = 1) => {
    const normalizedQuantity = normalizeNumber(quantity, 3)
    const existingItem = items.value.find(item => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity = normalizeNumber(existingItem.quantity + normalizedQuantity, 3)
    } else {
      items.value.push({
        id: product.id,
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: normalizeNumber(product.salePrice),
        quantity: normalizedQuantity,
        discount: 0,
        stockQuantity: normalizeNumber(product.stockQuantity, 3),
        saleUnit: product.saleUnit || 'UNIT'
      })
    }
  }

  const updateItemDiscount = (productId, discountValue) => {
    const item = items.value.find(item => item.id === productId)
    if (item) {
      item.discount = Math.max(0, normalizeNumber(discountValue))
    }
  }

  const removeItem = (productId) => {
    const index = items.value.findIndex(item => item.id === productId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  const updateQuantity = (productId, quantity) => {
    const item = items.value.find(item => item.id === productId)
    if (item) {
      const normalized = normalizeNumber(quantity, 3)
      if (normalized <= 0) {
        removeItem(productId)
      } else {
        item.quantity = normalized
      }
    }
  }

  const setCustomer = (customerData) => {
    customer.value = customerData
  }

  const addPayment = (method, amount) => {
    payments.value.push({ method, amount: normalizeNumber(amount) })
  }

  const removePayment = (index) => {
    payments.value.splice(index, 1)
  }

  const clearPayments = () => {
    payments.value = []
  }

  const setDiscount = (value) => {
    discount.value = Math.max(0, normalizeNumber(value))
  }

  const clear = () => {
    items.value = []
    customer.value = null
    payments.value = []
    discount.value = 0
  }

  const canCheckout = computed(() => {
    return items.value.length > 0 && 
           Math.abs(totalPayments.value - total.value) < 0.01
  })

  const getSaleData = () => {
    return {
      customerId: customer.value?.id || '',
      items: items.value.map(item => ({
        productId: item.productId || item.id,
        quantity: normalizeNumber(item.quantity, 3),
        unitPrice: normalizeNumber(item.price),
        discount: Math.max(0, normalizeNumber(item.discount))
      })),
      payments: payments.value.map(payment => ({
        method: payment.method,
        amount: normalizeNumber(payment.amount)
      })),
      discount: Math.max(0, normalizeNumber(discount.value))
    }
  }

  return {
    // State
    items,
    customer,
    payments,
    discount,

    // Computed
    itemCount,
    subtotal,
    total,
    totalPayments,
    change,
    canCheckout,

    // Actions
    addItem,
    removeItem,
    updateQuantity,
    updateItemDiscount,
    setCustomer,
    addPayment,
    removePayment,
    updatePaymentMethod: (index, method) => { if (payments.value[index]) payments.value[index].method = method },
    updatePaymentAmount: (index, amount) => {
      if (payments.value[index]) {
        payments.value[index].amount = normalizeNumber(amount)
      }
    },
    clearPayments,
    setDiscount,
    clear,
    getSaleData
  }
})