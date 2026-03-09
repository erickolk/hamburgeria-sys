<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold">Novo Produto</h1>
      <NuxtLink to="/products" class="btn btn-outline">Voltar</NuxtLink>
    </div>

    <div class="bg-white rounded-lg p-6 w-full max-w-6xl mx-auto border border-gray-200">
      <form @submit.prevent="saveProduct" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">SKU</label>
            <div class="flex gap-2">
              <input v-model="productForm.sku" type="text" class="input w-full" placeholder="Gerado automaticamente" />
              <button type="button" class="btn btn-outline"
                @click="productForm.sku = generateSKU(productForm.name)">Gerar</button>
            </div>
            <p class="text-xs text-gray-500 mt-1">Ex.: PRD-ABC-202411-1234 (alterável)</p>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Código de Barras</label>
            <input ref="barcodeInput" v-model="productForm.barcode" type="text" inputmode="numeric" class="input w-full"
              placeholder="Escaneie ou digite o código"
              @input="productForm.barcode = productForm.barcode.replace(/\D/g, '')" @keyup.enter="onBarcodeEnter" />
            <p class="text-xs text-gray-500 mt-1">Use o bipe do leitor: o campo aceita apenas números. Ao pressionar
              Enter após o bipe, validamos duplicidade.</p>
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium mb-1">Nome *</label>
            <input v-model="productForm.name" type="text" class="input w-full" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Categoria</label>
            <div class="flex gap-2">
              <select v-model="productForm.categoryId" class="input flex-1">
                <option value="">Selecione uma categoria</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
              <button type="button" class="btn btn-outline" @click="showNewCategoryModal = true">+ Nova</button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Ficha Técnica (Receita)</label>
            <select v-model="productForm.recipeId" class="input w-full">
              <option value="">Nenhuma (Produto Simples/Revenda)</option>
              <option v-for="r in recipes" :key="r.id" :value="r.id">
                {{ r.name }} (Custo: R$ {{ Number(r.totalCost).toFixed(2) }})
              </option>
            </select>
          </div>

          <div v-if="selectedRecipe" class="col-span-2 bg-orange-50 border border-orange-200 rounded-lg p-4 my-2">
            <h3 class="text-sm font-bold text-orange-800 mb-3">🧠 Precificação Inteligente</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label class="block text-xs text-orange-700 mb-1">Custo da Ficha</label>
                <div class="text-lg font-semibold text-gray-900">R$ {{ recipeCost.toFixed(2) }}</div>
              </div>
              <div>
                <label class="block text-xs text-orange-700 mb-1">Markup Desejado (%)</label>
                <input v-model.number="desiredMarkup" type="number" class="input w-full border-orange-300" />
              </div>
              <div>
                <label class="block text-xs text-orange-700 mb-1">Preço Sugerido</label>
                <div class="flex items-center justify-between bg-white px-3 py-2 border border-orange-200 rounded">
                  <span class="font-bold text-green-600">R$ {{ suggestedPrice.toFixed(2) }}</span>
                  <button type="button"
                    class="text-xs bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded shadow-sm"
                    @click="applySuggestedPrice">
                    Aplicar Valores
                  </button>
                </div>
              </div>
            </div>
            <p class="text-xs text-orange-600 mt-2">Markup é a margem sobre o custo. O botão "Aplicar" preenche
              automaticamente os campos de Preço de Custo e Venda abaixo.</p>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Fornecedor</label>
            <select v-model="productForm.supplierId" class="input w-full">
              <option value="">Selecione</option>
              <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Preço de Custo *</label>
            <input v-model.number="productForm.costPrice" type="number" step="0.01" class="input w-full" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Preço de Venda *</label>
            <input v-model.number="productForm.salePrice" type="number" step="0.01" class="input w-full" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Estoque Inicial *</label>
            <input v-model.number="productForm.stockQuantity" type="number" step="0.001" class="input w-full"
              required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Ponto de Reposição *</label>
            <input v-model.number="productForm.reorderPoint" type="number" step="0.001" class="input w-full" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Unidade de Venda *</label>
            <select v-model="productForm.saleUnit" class="input w-full" required>
              <option value="UN">Unidade (UN)</option>
              <option value="PC">Peça (PC)</option>
              <option value="CX">Caixa (CX)</option>
              <option value="DZ">Dúzia (DZ)</option>
              <option value="KG">Quilograma (KG)</option>
              <option value="LT">Litro (LT)</option>
              <option value="MT">Metro (MT)</option>
              <option value="OUTRA">Outra</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <input id="batchTracking" v-model="productForm.batchTracking" type="checkbox" class="h-4 w-4" />
            <label for="batchTracking" class="text-sm font-medium">Rastrear por lote</label>
          </div>
          <template v-if="productForm.batchTracking">
            <div>
              <label class="block text-sm font-medium mb-1">Lote Inicial</label>
              <input v-model="productForm.initialBatchNumber" type="text" class="input w-full"
                placeholder="Ex.: LOTE-20241115" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Validade (do lote)</label>
              <input v-model="productForm.expiryDate" type="date" class="input w-full" />
            </div>
          </template>

          <div class="col-span-2">
            <label class="block text-sm font-medium mb-1">Observações</label>
            <textarea v-model="productForm.observations" class="input w-full" rows="3"
              placeholder="Informações adicionais sobre o produto..."></textarea>
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium mb-1">Fotos do Produto</label>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div class="flex flex-wrap gap-3 mb-3">
                <div v-for="(photo, index) in productPhotos" :key="index"
                  class="relative w-24 h-24 border rounded overflow-hidden">
                  <img :src="photo.url" class="w-full h-full object-cover" />
                  <button type="button" @click="removePhoto(index)"
                    class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs">×</button>
                  <button type="button" @click="setMainPhoto(index)"
                    class="absolute bottom-1 left-1 bg-blue-500 text-white rounded px-1 text-xs"
                    :class="{ 'bg-green-500': photo.isMain }">
                    {{ photo.isMain ? '★ Principal' : 'Marcar' }}
                  </button>
                </div>
              </div>
              <div class="flex gap-2">
                <input v-model="newPhotoUrl" type="url" class="input flex-1" placeholder="Cole a URL da foto aqui"
                  @keyup.enter="addPhoto" />
                <button type="button" class="btn btn-outline" @click.prevent="addPhoto">Adicionar Foto</button>
              </div>
              <p class="text-xs text-gray-500 mt-2">Adicione URLs de fotos do produto. A primeira será a principal.</p>
            </div>
          </div>
        </div>

        <div class="flex gap-2 justify-end mt-2">
          <NuxtLink to="/products" class="btn btn-outline" type="button">Cancelar</NuxtLink>
          <button type="button" class="btn btn-primary" @click.prevent="saveProduct">Salvar</button>
        </div>
        <p class="text-xs text-gray-500 mt-3">Dica: pressione <kbd
            class="px-1 rounded bg-gray-100 border">Ctrl</kbd>+<kbd class="px-1 rounded bg-gray-100 border">G</kbd> para
          sugerir um novo SKU. O código de barras deve ser
          escaneado/fornecido pela fábrica.</p>
      </form>
    </div>

    <!-- Modal Nova Categoria -->
    <div v-if="showNewCategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">Nova Categoria</h2>
        <form @submit.prevent="createCategory" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Nome da Categoria *</label>
            <input v-model="newCategoryName" type="text" class="input w-full" required />
          </div>
          <div class="flex gap-2 justify-end">
            <button type="button" class="btn btn-outline" @click="showNewCategoryModal = false">Cancelar</button>
            <button type="submit" class="btn btn-primary">Criar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth'] })

const { get, post } = useApi()
const suppliers = ref([])
const categories = ref([])
const productPhotos = ref([])
const newPhotoUrl = ref('')
const showNewCategoryModal = ref(false)
const newCategoryName = ref('')
import { useToast } from 'vue-toastification'
const toast = useToast()
const barcodeInput = ref(null)

const productForm = reactive({
  sku: '',
  name: '',
  barcode: '',
  costPrice: 0,
  salePrice: 0,
  stockQuantity: 0,
  reorderPoint: 0,
  category: '',
  categoryId: '',
  observations: '',
  supplierId: '',
  saleUnit: 'UN',
  batchTracking: false,
  initialBatchNumber: '',
  expiryDate: '',
  recipeId: ''
})
const recipes = ref([])
const desiredMarkup = ref(150) // Começa sugerindo 150% de markup

// Lógica de Precificação
const selectedRecipe = computed(() => recipes.value.find(r => r.id === productForm.recipeId))
const recipeCost = computed(() => selectedRecipe.value ? Number(selectedRecipe.value.totalCost) : 0)
const suggestedPrice = computed(() => recipeCost.value * (1 + (desiredMarkup.value / 100)))

const applySuggestedPrice = () => {
  productForm.salePrice = Number(suggestedPrice.value.toFixed(2))
  productForm.costPrice = Number(recipeCost.value.toFixed(2))
  toast.success('Preços atualizados com base na ficha técnica!')
}

// Carregar Receitas
const loadRecipes = async () => {
  const res = await get('/api/recipes?isActive=true')
  if (res.success) recipes.value = res.data.recipes || []
}

const loadSuppliers = async () => {
  const res = await get('/api/suppliers')
  if (res.success) suppliers.value = res.data.suppliers || []
}

const loadCategories = async () => {
  const res = await get('/api/categories')
  if (res.success) categories.value = res.data.categories || []
}

const createCategory = async () => {
  if (!newCategoryName.value.trim()) return

  const res = await post('/api/categories', { name: newCategoryName.value.trim() })
  if (res.success) {
    toast.success('Categoria criada!')
    await loadCategories()
    productForm.categoryId = res.data.id
    showNewCategoryModal.value = false
    newCategoryName.value = ''
  } else {
    toast.error(res.error || 'Erro ao criar categoria')
  }
}

const addPhoto = () => {
  const url = newPhotoUrl.value.trim()
  if (!url) {
    toast.warning('Por favor, insira uma URL válida')
    return
  }

  // Validar se é uma URL válida
  try {
    new URL(url)
  } catch (e) {
    toast.warning('Por favor, insira uma URL válida (ex: https://exemplo.com/foto.jpg)')
    return
  }

  // Verificar se a URL já foi adicionada
  if (productPhotos.value.some(p => p.url === url)) {
    toast.warning('Esta foto já foi adicionada')
    return
  }

  const isMain = productPhotos.value.length === 0
  productPhotos.value.push({
    url,
    isMain
  })
  newPhotoUrl.value = ''
  toast.success('Foto adicionada!')
}

const removePhoto = (index) => {
  productPhotos.value.splice(index, 1)
  // Se remover a principal e ainda houver fotos, marcar a primeira como principal
  if (productPhotos.value.length > 0 && !productPhotos.value.some(p => p.isMain)) {
    productPhotos.value[0].isMain = true
  }
}

const setMainPhoto = (index) => {
  productPhotos.value.forEach((p, i) => {
    p.isMain = i === index
  })
}

const saveProduct = async () => {
  // Geração automática se vazio
  if (!productForm.sku) productForm.sku = generateSKU(productForm.name)

  // Sanitização mínima
  productForm.barcode = String(productForm.barcode).replace(/\D/g, '')

  // Montar payload permitido pela API (sem validade/lote)
  const productPayload = {
    sku: productForm.sku,
    name: productForm.name,
    barcode: productForm.barcode,
    costPrice: productForm.costPrice,
    salePrice: productForm.salePrice,
    stockQuantity: productForm.batchTracking ? 0 : productForm.stockQuantity,
    reorderPoint: productForm.reorderPoint,
    category: productForm.category,
    categoryId: productForm.categoryId || null,
    recipeId: productForm.recipeId || null,
    observations: productForm.observations || null,
    supplierId: productForm.supplierId || null,
    saleUnit: productForm.saleUnit,
    batchTracking: productForm.batchTracking
  }

  const res = await post('/api/products', productPayload)
  if (res.success) {
    const created = res.data

    // Adicionar fotos
    if (productPhotos.value.length > 0) {
      for (const photo of productPhotos.value) {
        await post(`/api/products/${created.id}/photos`, {
          url: photo.url,
          isMain: photo.isMain
        })
      }
    }

    // Se rastreio por lote estiver habilitado e houve quantidade inicial, criar lote com validade via ajuste de estoque
    if (productForm.batchTracking && productForm.stockQuantity > 0 && productForm.initialBatchNumber) {
      const adjustBody = {
        quantity: productForm.stockQuantity,
        reason: 'Estoque inicial',
        batchNumber: productForm.initialBatchNumber,
        expiryDate: productForm.expiryDate || null
      }
      const adj = await post(`/api/products/${created.id}/adjust-stock`, adjustBody)
      if (!adj.success) {
        toast.error(adj.error || 'Falha ao criar lote inicial')
        return
      }
    }
    toast.success('Produto criado!')
    await navigateTo('/products')
  } else {
    toast.error(res.error || 'Erro ao salvar produto')
  }
}

onMounted(() => {
  loadSuppliers()
  loadCategories()
  loadRecipes()
  // Pré-sugerir SKU
  productForm.sku = generateSKU('PRODUTO')
  // Focar no campo de código de barras para facilitar o bipe
  if (barcodeInput?.value) barcodeInput.value.focus()
  // Atalho de geração
  const onKey = (e) => {
    const key = (e.key || '').toLowerCase()
    if ((e.ctrlKey || e.metaKey) && key === 'g') {
      productForm.sku = generateSKU(productForm.name)
      toast.info('Novo SKU sugerido')
    }
  }
  window.addEventListener('keydown', onKey)
  onUnmounted(() => window.removeEventListener('keydown', onKey))
})

watch(() => productForm.name, (val) => {
  // Preencher SKU quando usuário informar nome e o SKU estiver vazio
  if (val && !productForm.sku) productForm.sku = generateSKU(val)
})

// SKU: prefixo PRD, slug do nome e sufixo de data + aleatório
const generateSKU = (name = '') => {
  const slug = String(name)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .split('-')
    .slice(0, 2)
    .join('-') || 'PRD'
  const now = new Date()
  const yyyymm = String(now.getFullYear()) + String(now.getMonth() + 1).padStart(2, '0')
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `PRD-${slug}-${yyyymm}-${rand}`
}

const onBarcodeEnter = async () => {
  const code = String(productForm.barcode || '').replace(/\D/g, '')
  if (!code) return
  // Checar duplicidade rápida
  const res = await get(`/api/products?search=${encodeURIComponent(code)}`)
  if (res.success) {
    const items = Array.isArray(res.data?.products) ? res.data.products : []
    const exists = items.some(p => String(p.barcode || '') === code)
    if (exists) {
      toast.warning('Código de barras já cadastrado')
    } else {
      toast.info('Código de barras lido')
    }
  }
}
</script>