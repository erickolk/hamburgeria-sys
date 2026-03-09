<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold">Fichas Técnicas</h1>
      <button class="btn btn-primary" @click="openModal(null)">Nova Ficha Técnica</button>
    </div>

    <!-- Filtros -->
    <div class="mb-4 bg-white border border-gray-200 rounded-lg p-4">
      <div class="flex gap-3 items-center">
        <input v-model="search" type="text" class="input flex-1" placeholder="Buscar ficha técnica..."
          @keydown.enter.prevent="loadRecipes" />
        <button class="btn btn-outline" @click="clearFilters">Limpar</button>
        <button class="btn btn-primary" @click="loadRecipes">Buscar</button>
      </div>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div class="h-5 bg-gray-200 rounded animate-pulse w-2/3"></div>
        <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        <div class="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
      </div>
    </div>

    <!-- Vazio -->
    <div v-if="!loading && recipes.length === 0" class="bg-white border border-gray-200 rounded-lg p-10 text-center">
      <div class="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-50 flex items-center justify-center text-3xl">📋</div>
      <h3 class="text-lg font-semibold mb-2">Nenhuma ficha técnica cadastrada</h3>
      <p class="text-gray-600 mb-4">Crie fichas técnicas para calcular o custo e CMV dos seus lanches.</p>
      <button class="btn btn-primary" @click="openModal(null)">Criar Ficha Técnica</button>
    </div>

    <!-- Cards de receitas -->
    <div v-if="!loading && recipes.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="recipe in recipes" :key="recipe.id"
        class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-semibold text-gray-900">{{ recipe.name }}</h3>
            <p class="text-xs text-gray-500 mt-0.5">
              Rendimento: {{ Number(recipe.yieldQuantity).toFixed(3) }} {{ recipe.yieldUnit }}
            </p>
          </div>
          <span :class="recipe.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
            class="text-xs px-2 py-0.5 rounded-full font-medium">
            {{ recipe.isActive ? 'Ativa' : 'Inativa' }}
          </span>
        </div>

        <!-- Ingredientes resumidos -->
        <div class="space-y-1 mb-3">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Ingredientes</p>
          <div v-for="ri in recipe.recipeIngredients.slice(0, 3)" :key="ri.id"
            class="flex justify-between text-sm">
            <span class="text-gray-700">{{ ri.ingredient.name }}</span>
            <span class="font-mono text-gray-500 text-xs">
              {{ Number(ri.quantity).toFixed(3) }} {{ ri.unit }}
            </span>
          </div>
          <p v-if="recipe.recipeIngredients.length > 3" class="text-xs text-gray-400">
            +{{ recipe.recipeIngredients.length - 3 }} ingredientes
          </p>
        </div>

        <!-- Custo -->
        <div class="border-t border-gray-100 pt-3 flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-500">Custo total</p>
            <p class="font-semibold text-orange-600">R$ {{ Number(recipe.totalCost).toFixed(2) }}</p>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-outline btn-sm" @click="openModal(recipe)">Editar</button>
            <button class="btn btn-outline btn-sm" @click="viewRecipe(recipe)">Ver</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Criar/Editar Ficha Técnica -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h2 class="text-xl font-semibold mb-4">{{ editing ? 'Editar' : 'Nova' }} Ficha Técnica</h2>
          <form @submit.prevent="saveRecipe" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Nome da Ficha *</label>
              <input v-model="form.name" type="text" class="input w-full" placeholder="Ex: X-Bacon, X-Salada..." required />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Rendimento *</label>
                <input v-model.number="form.yieldQuantity" type="number" step="0.001" min="0.001" class="input w-full" required />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Unidade do Rendimento *</label>
                <select v-model="form.yieldUnit" class="input w-full">
                  <option value="UN">Unidade (un)</option>
                  <option value="G">Gramas (g)</option>
                  <option value="KG">Quilogramas (kg)</option>
                  <option value="ML">Mililitros (ml)</option>
                  <option value="L">Litros (L)</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Observações</label>
              <textarea v-model="form.observations" class="input w-full" rows="2"
                placeholder="Modo de preparo, observações..."></textarea>
            </div>

            <!-- Ingredientes da ficha -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium">Ingredientes *</label>
                <button type="button" class="btn btn-outline btn-sm" @click="addIngredientLine">
                  + Adicionar Ingrediente
                </button>
              </div>

              <div v-if="form.ingredients.length === 0" class="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-300 rounded-lg">
                Nenhum ingrediente adicionado. Clique em "+ Adicionar Ingrediente".
              </div>

              <div v-for="(line, idx) in form.ingredients" :key="idx"
                class="grid grid-cols-12 gap-2 mb-2 items-center">
                <div class="col-span-4">
                  <select v-model="line.ingredientId" class="input w-full text-sm" required>
                    <option value="">Selecione...</option>
                    <option v-for="ing in allIngredients" :key="ing.id" :value="ing.id">
                      {{ ing.name }} ({{ ing.unit }})
                    </option>
                  </select>
                </div>
                <div class="col-span-3">
                  <input v-model.number="line.quantity" type="number" step="0.001" min="0.001"
                    class="input w-full text-sm" placeholder="Qtd" required />
                </div>
                <div class="col-span-3">
                  <select v-model="line.unit" class="input w-full text-sm">
                    <option value="G">g</option>
                    <option value="KG">kg</option>
                    <option value="ML">ml</option>
                    <option value="L">L</option>
                    <option value="UN">un</option>
                  </select>
                </div>
                <div class="col-span-1">
                  <input v-model.number="line.lossPercentage" type="number" step="0.1" min="0" max="100"
                    class="input w-full text-sm" placeholder="%" title="% de perda" />
                </div>
                <div class="col-span-1 flex justify-center">
                  <button type="button" class="text-red-400 hover:text-red-600 text-lg" @click="removeIngredientLine(idx)">✕</button>
                </div>
              </div>

              <div v-if="form.ingredients.length" class="text-xs text-gray-400 grid grid-cols-12 gap-2 px-0.5">
                <span class="col-span-4">Ingrediente</span>
                <span class="col-span-3">Quantidade</span>
                <span class="col-span-3">Unidade</span>
                <span class="col-span-1">%Perda</span>
              </div>
            </div>

            <!-- Preview de custo -->
            <div v-if="estimatedCost > 0" class="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p class="text-sm text-orange-700">
                💰 Custo estimado com base nos custos médios atuais:
                <span class="font-bold">R$ {{ estimatedCost.toFixed(2) }}</span>
              </p>
            </div>

            <div class="flex gap-2 justify-end pt-2">
              <button type="button" class="btn btn-outline" @click="closeModal">Cancelar</button>
              <button type="submit" class="btn btn-primary" :disabled="saving || form.ingredients.length === 0">
                {{ saving ? 'Salvando...' : 'Salvar Ficha' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Visualizar Receita -->
    <div v-if="showViewModal && viewingRecipe" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold">{{ viewingRecipe.name }}</h2>
            <button class="text-gray-400 hover:text-gray-600 text-2xl" @click="showViewModal = false">✕</button>
          </div>
          <p class="text-sm text-gray-500 mb-4">
            Rendimento: {{ Number(viewingRecipe.yieldQuantity).toFixed(3) }} {{ viewingRecipe.yieldUnit }}
          </p>
          <table class="w-full text-sm mb-4">
            <thead>
              <tr class="border-b">
                <th class="text-left py-1 font-medium text-gray-600">Ingrediente</th>
                <th class="text-right py-1 font-medium text-gray-600">Qtd</th>
                <th class="text-right py-1 font-medium text-gray-600">% Perda</th>
                <th class="text-right py-1 font-medium text-gray-600">Custo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ri in viewingRecipe.recipeIngredients" :key="ri.id" class="border-b border-gray-50">
                <td class="py-1.5">{{ ri.ingredient.name }}</td>
                <td class="text-right font-mono">{{ Number(ri.quantity).toFixed(3) }} {{ ri.unit }}</td>
                <td class="text-right text-gray-500">{{ Number(ri.lossPercentage).toFixed(1) }}%</td>
                <td class="text-right text-orange-600 font-medium">R$ {{ Number(ri.lineCost || 0).toFixed(2) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="pt-3 font-semibold">Custo Total</td>
                <td class="pt-3 text-right font-bold text-orange-600">R$ {{ Number(viewingRecipe.totalCost).toFixed(2) }}</td>
              </tr>
            </tfoot>
          </table>
          <div v-if="viewingRecipe.observations" class="text-sm text-gray-600 bg-gray-50 rounded p-3">
            {{ viewingRecipe.observations }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth'] })

import { useToast } from 'vue-toastification'

const { get, post, put } = useApi()
const toast = useToast()

const recipes = ref([])
const allIngredients = ref([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const showModal = ref(false)
const showViewModal = ref(false)
const editing = ref(null)
const viewingRecipe = ref(null)

const form = reactive({
  name: '',
  yieldQuantity: 1,
  yieldUnit: 'UN',
  observations: '',
  ingredients: []
})

const estimatedCost = computed(() => {
  return form.ingredients.reduce((total, line) => {
    const ing = allIngredients.value.find(i => i.id === line.ingredientId)
    if (!ing || !line.quantity) return total
    const qty = Number(line.quantity)
    const loss = Number(line.lossPercentage || 0) / 100
    const cost = Number(ing.averageCost)
    return total + (qty * (1 + loss) * cost)
  }, 0)
})

const loadRecipes = async () => {
  loading.value = true
  const url = '/api/recipes' + (search.value ? `?search=${encodeURIComponent(search.value)}` : '')
  const res = await get(url)
  if (res.success) recipes.value = res.data.recipes || []
  loading.value = false
}

const loadIngredients = async () => {
  const res = await get('/api/ingredients?limit=200')
  if (res.success) allIngredients.value = res.data.ingredients || []
}

const addIngredientLine = () => {
  form.ingredients.push({ ingredientId: '', quantity: 0, unit: 'G', lossPercentage: 0 })
}

const removeIngredientLine = (idx) => {
  form.ingredients.splice(idx, 1)
}

const openModal = (recipe) => {
  editing.value = recipe
  if (recipe) {
    Object.assign(form, {
      name: recipe.name,
      yieldQuantity: Number(recipe.yieldQuantity),
      yieldUnit: recipe.yieldUnit,
      observations: recipe.observations || '',
      ingredients: recipe.recipeIngredients.map(ri => ({
        ingredientId: ri.ingredientId,
        quantity: Number(ri.quantity),
        unit: ri.unit,
        lossPercentage: Number(ri.lossPercentage)
      }))
    })
  } else {
    Object.assign(form, { name: '', yieldQuantity: 1, yieldUnit: 'UN', observations: '', ingredients: [] })
  }
  showModal.value = true
}

const closeModal = () => { showModal.value = false; editing.value = null }

const saveRecipe = async () => {
  if (form.ingredients.length === 0) {
    toast.error('Adicione ao menos um ingrediente')
    return
  }
  saving.value = true
  const res = editing.value
    ? await put(`/api/recipes/${editing.value.id}`, form)
    : await post('/api/recipes', form)
  if (res.success) {
    toast.success(editing.value ? 'Ficha atualizada!' : 'Ficha criada!')
    closeModal()
    loadRecipes()
  } else {
    toast.error(res.error || 'Erro ao salvar ficha técnica')
  }
  saving.value = false
}

const viewRecipe = async (recipe) => {
  const res = await get(`/api/recipes/${recipe.id}`)
  if (res.success) {
    viewingRecipe.value = res.data
    showViewModal.value = true
  }
}

const clearFilters = () => { search.value = ''; loadRecipes() }

onMounted(() => {
  loadRecipes()
  loadIngredients()
})
</script>