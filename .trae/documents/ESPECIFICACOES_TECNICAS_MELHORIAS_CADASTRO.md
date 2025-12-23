# Especificações Técnicas - Melhorias no Cadastro de Clientes e Fornecedores

## 1. Visão Geral das Melhorias

Este documento detalha as melhorias necessárias no módulo de cadastro de clientes e fornecedores, mantendo total compatibilidade com os padrões existentes do sistema.

## 2. Melhorias no Backend

### 2.1 Extensão do Schema Prisma

#### Migração para Clientes (Adicionar campos)
```sql
-- Adicionar campos ao modelo Customer
ALTER TABLE customers ADD COLUMN IF NOT EXISTS document VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS document_type VARCHAR(10) DEFAULT 'CPF';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_street VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_number VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_complement VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_neighborhood VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_city VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_state VARCHAR(2);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_zip_code VARCHAR(10);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_country VARCHAR(50) DEFAULT 'Brasil';
```

#### Migração para Fornecedores (Adicionar campos)
```sql
-- Adicionar campos ao modelo Supplier
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS legal_name VARCHAR(255);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS cnpj VARCHAR(18);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS state_registration VARCHAR(50);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address_street VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_number VARCHAR(20);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address_complement VARCHAR(100);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address_neighborhood VARCHAR(100);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address_city VARCHAR(100);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address_state VARCHAR(2);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address_zip_code VARCHAR(10);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address_country VARCHAR(50) DEFAULT 'Brasil';
```

### 2.2 Schema Prisma Atualizado

```prisma
model Customer {
  id           String   @id @default(cuid())
  name         String   @db.VarChar(255)
  phone        String?  @db.VarChar(20)
  email        String?  @db.VarChar(255)
  document     String?  @db.VarChar(20)    // CPF/CNPJ
  documentType String   @default("CPF") @map("document_type") @db.VarChar(10)
  isActive     Boolean  @default(true) @map("is_active")
  note         String?  @db.Text
  
  // Endereço completo
  addressStreet     String? @map("address_street") @db.VarChar(255)
  addressNumber     String? @map("address_number") @db.VarChar(20)
  addressComplement String? @map("address_complement") @db.VarChar(100)
  addressNeighborhood String? @map("address_neighborhood") @db.VarChar(100)
  addressCity       String? @map("address_city") @db.VarChar(100)
  addressState      String? @map("address_state") @db.VarChar(2)
  addressZipCode    String? @map("address_zip_code") @db.VarChar(10)
  addressCountry    String  @default("Brasil") @map("address_country") @db.VarChar(50)
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  sales Sale[]

  @@map("customers")
}

model Supplier {
  id           String   @id @default(cuid())
  name         String   @db.VarChar(255)
  legalName    String?  @map("legal_name") @db.VarChar(255)
  contact      String?  @db.VarChar(255)
  phone        String?  @db.VarChar(20)
  email        String?  @db.VarChar(255)
  cnpj         String?  @db.VarChar(18)
  stateRegistration String? @map("state_registration") @db.VarChar(50)
  paymentTerms String?  @map("payment_terms") @db.VarChar(100)
  isActive     Boolean  @default(true) @map("is_active")
  
  // Endereço completo
  addressStreet     String? @map("address_street") @db.VarChar(255)
  addressNumber     String? @map("address_number") @db.VarChar(20)
  addressComplement String? @map("address_complement") @db.VarChar(100)
  addressNeighborhood String? @map("address_neighborhood") @db.VarChar(100)
  addressCity       String? @map("address_city") @db.VarChar(100)
  addressState      String? @map("address_state") @db.VarChar(2)
  addressZipCode    String? @map("address_zip_code") @db.VarChar(10)
  addressCountry    String  @default("Brasil") @map("address_country") @db.VarChar(50)
  
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relations
  products  Product[]
  purchases Purchase[]

  @@map("suppliers")
}
```

### 2.3 Validações Aprimoradas

#### customerValidation.js
```javascript
const customerSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 255 caracteres',
    'any.required': 'Nome é obrigatório'
  }),
  phone: Joi.string().pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/).optional().messages({
    'string.pattern.base': 'Telefone deve estar no formato (XX) XXXXX-XXXX'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Email deve ter um formato válido'
  }),
  document: Joi.string().when('documentType', {
    is: 'CPF',
    then: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).messages({
      'string.pattern.base': 'CPF deve estar no formato XXX.XXX.XXX-XX'
    }),
    otherwise: Joi.string().pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).messages({
      'string.pattern.base': 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX'
    })
  }),
  documentType: Joi.string().valid('CPF', 'CNPJ').default('CPF'),
  isActive: Joi.boolean().default(true),
  note: Joi.string().max(1000).optional(),
  
  // Endereço
  addressStreet: Joi.string().max(255).optional(),
  addressNumber: Joi.string().max(20).optional(),
  addressComplement: Joi.string().max(100).optional(),
  addressNeighborhood: Joi.string().max(100).optional(),
  addressCity: Joi.string().max(100).optional(),
  addressState: Joi.string().length(2).optional(),
  addressZipCode: Joi.string().pattern(/^\d{5}-\d{3}$/).optional().messages({
    'string.pattern.base': 'CEP deve estar no formato XXXXX-XXX'
  }),
  addressCountry: Joi.string().max(50).default('Brasil')
});
```

### 2.4 Endpoints Aprimorados

#### GET /api/customers (com filtros avançados)
```javascript
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      page = 1, 
      limit = 20, 
      isActive,
      documentType,
      city,
      state 
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let where = {};
    
    // Busca textual
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { document: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Filtros específicos
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    if (documentType) {
      where.documentType = documentType;
    }
    
    if (city) {
      where.addressCity = { contains: city, mode: 'insensitive' };
    }
    
    if (state) {
      where.addressState = state.toUpperCase();
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
        skip,
        take: parseInt(limit)
      }),
      prisma.customer.count({ where })
    ]);

    res.json({
      customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
```

## 3. Melhorias no Frontend

### 3.1 Componente de Formulário de Cliente
```vue
<template>
  <form @submit.prevent="saveCustomer" class="space-y-6">
    <!-- Dados Básicos -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Pessoa
        </label>
        <select 
          v-model="form.documentType" 
          class="input w-full"
          @change="clearDocument"
        >
          <option value="CPF">Pessoa Física</option>
          <option value="CNPJ">Pessoa Jurídica</option>
        </select>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ form.documentType === 'CPF' ? 'CPF' : 'CNPJ' }}
        </label>
        <input 
          v-model="form.document" 
          type="text" 
          class="input w-full"
          :placeholder="form.documentType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'"
          @input="formatDocument"
        >
      </div>
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Nome {{ form.documentType === 'CNPJ' ? '/ Razão Social' : '' }}
      </label>
      <input 
        v-model="form.name" 
        type="text" 
        class="input w-full"
        required
      >
    </div>
    
    <!-- Contato -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
        <input 
          v-model="form.phone" 
          type="text" 
          class="input w-full"
          placeholder="(00) 00000-0000"
          @input="formatPhone"
        >
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input 
          v-model="form.email" 
          type="email" 
          class="input w-full"
        >
      </div>
    </div>
    
    <!-- Endereço com Busca de CEP -->
    <div class="border-t pt-4">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Endereço</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">CEP</label>
          <div class="flex gap-2">
            <input 
              v-model="form.addressZipCode" 
              type="text" 
              class="input flex-1"
              placeholder="00000-000"
              @input="formatCEP"
              @blur="buscarCEP"
            >
            <button 
              type="button" 
              class="btn btn-outline"
              @click="buscarCEP"
              :disabled="loadingCEP"
            >
              {{ loadingCEP ? 'Buscando...' : 'Buscar' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Campos de endereço preenchidos automaticamente -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
          <input 
            v-model="form.addressStreet" 
            type="text" 
            class="input w-full"
            :disabled="loadingCEP"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Número</label>
          <input 
            v-model="form.addressNumber" 
            type="text" 
            class="input w-full"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
          <input 
            v-model="form.addressComplement" 
            type="text" 
            class="input w-full"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
          <input 
            v-model="form.addressNeighborhood" 
            type="text" 
            class="input w-full"
            :disabled="loadingCEP"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
          <input 
            v-model="form.addressCity" 
            type="text" 
            class="input w-full"
            :disabled="loadingCEP"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select 
            v-model="form.addressState" 
            class="input w-full"
            :disabled="loadingCEP"
          >
            <option value="">Selecione...</option>
            <option v-for="estado in estados" :key="estado.sigla" :value="estado.sigla">
              {{ estado.nome }}
            </option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Observações -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
      <textarea 
        v-model="form.note" 
        rows="3" 
        class="input w-full"
      ></textarea>
    </div>
    
    <!-- Status -->
    <div class="flex items-center">
      <input 
        v-model="form.isActive" 
        type="checkbox" 
        class="mr-2"
      >
      <label class="text-sm font-medium text-gray-700">
        Cliente Ativo
      </label>
    </div>
    
    <!-- Ações -->
    <div class="flex justify-end gap-2 pt-4">
      <button 
        type="button" 
        class="btn btn-outline"
        @click="$emit('cancel')"
      >
        Cancelar
      </button>
      <button 
        type="submit" 
        class="btn btn-primary"
        :disabled="loading"
      >
        {{ loading ? 'Salvando...' : 'Salvar' }}
      </button>
    </div>
  </form>
</template>

<script setup>
const props = defineProps({
  customer: Object
}})

const emit = defineEmits(['save', 'cancel'])

// Estado
const loading = ref(false)
const loadingCEP = ref(false)
const form = reactive({
  name: '',
  phone: '',
  email: '',
  document: '',
  documentType: 'CPF',
  isActive: true,
  note: '',
  addressStreet: '',
  addressNumber: '',
  addressComplement: '',
  addressNeighborhood: '',
  addressCity: '',
  addressState: '',
  addressZipCode: '',
  addressCountry: 'Brasil'
})

// Estados do Brasil
const estados = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' }
]

// Funções de formatação
const formatDocument = () => {
  if (form.documentType === 'CPF') {
    form.document = form.document.replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  } else {
    form.document = form.document.replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }
}

const formatPhone = () => {
  form.phone = form.phone.replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1')
}

const formatCEP = () => {
  form.addressZipCode = form.addressZipCode.replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1')
}

// Busca de CEP
const buscarCEP = async () => {
  const cep = form.addressZipCode.replace(/\D/g, '')
  if (cep.length !== 8) return
  
  loadingCEP.value = true
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const data = await response.json()
    
    if (!data.erro) {
      form.addressStreet = data.logradouro
      form.addressNeighborhood = data.bairro
      form.addressCity = data.localidade
      form.addressState = data.uf
    }
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
  } finally {
    loadingCEP.value = false
  }
}

const clearDocument = () => {
  form.document = ''
}

// Salvar cliente
const saveCustomer = async () => {
  loading.value = true
  try {
    const { post, put } = useApi()
    const endpoint = props.customer ? put : post
    const url = props.customer ? `/customers/${props.customer.id}` : '/customers'
    
    const response = await endpoint(url, form)
    
    if (response) {
      emit('save', response)
    }
  } catch (error) {
    console.error('Erro ao salvar cliente:', error)
  } finally {
    loading.value = false
  }
}

// Inicializar formulário com dados do cliente
if (props.customer) {
  Object.assign(form, props.customer)
}
</script>
```

### 3.2 Componente de Listagem Aprimorado

```vue
<template>
  <div>
    <!-- Cabeçalho com filtros -->
    <div class="bg-white p-4 rounded-lg border border-gray-200 mb-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Busca</label>
          <input 
            v-model="filters.search" 
            type="text" 
            class="input w-full"
            placeholder="Nome, CPF, email..."
            @keydown.enter="loadItems"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select v-model="filters.documentType" class="input w-full">
            <option value="">Todos</option>
            <option value="CPF">Pessoa Física</option>
            <option value="CNPJ">Pessoa Jurídica</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select v-model="filters.isActive" class="input w-full">
            <option value="">Todos</option>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
          <input 
            v-model="filters.city" 
            type="text" 
            class="input w-full"
            placeholder="Cidade"
          >
        </div>
      </div>
      
      <div class="flex justify-between items-center">
        <div class="flex gap-2">
          <button class="btn btn-outline" @click="loadItems">
            Buscar
          </button>
          <button class="btn btn-outline" @click="clearFilters">
            Limpar Filtros
          </button>
        </div>
        
        <div class="flex gap-2">
          <button class="btn btn-outline" @click="exportCSV">
            Exportar CSV
          </button>
          <button class="btn btn-primary" @click="openModal">
            Novo Cliente
          </button>
        </div>
      </div>
    </div>
    
    <!-- Tabela de dados -->
    <div class="overflow-x-auto bg-white border border-gray-200 rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <button @click="toggleSort('name')" class="flex items-center gap-1">
                Nome
                <Icon v-if="sortField === 'name'" :name="sortDirection === 'asc' ? 'chevron-up' : 'chevron-down'" />
              </button>
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Documento
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contato
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cidade/UF
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50">
            <td class="px-4 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
              <div class="text-sm text-gray-500">{{ item.email || '-' }}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.document || '-' }}
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.phone || '-' }}
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.addressCity || '-' }}
              <span v-if="item.addressState">/{{ item.addressState }}</span>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
              <span 
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ item.isActive ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex gap-2 justify-end">
                <button 
                  @click="viewDetails(item)" 
                  class="text-blue-600 hover:text-blue-900"
                >
                  Ver
                </button>
                <button 
                  @click="editItem(item)" 
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  Editar
                </button>
                <button 
                  @click="toggleStatus(item)" 
                  class="text-yellow-600 hover:text-yellow-900"
                >
                  {{ item.isActive ? 'Inativar' : 'Ativar' }}
                </button>
                <button 
                  @click="deleteItem(item)" 
                  class="text-red-600 hover:text-red-900"
                >
                  Excluir
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-gray-500">
              Nenhum cliente encontrado.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Paginação -->
    <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div class="flex-1 flex justify-between sm:hidden">
        <button 
          @click="goToPage(pagination.page - 1)" 
          :disabled="pagination.page <= 1"
          class="btn btn-outline"
        >
          Anterior
        </button>
        <button 
          @click="goToPage(pagination.page + 1)" 
          :disabled="pagination.page >= pagination.pages"
          class="btn btn-outline"
        >
          Próximo
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Mostrando
            <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span>
            até
            <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span>
            de
            <span class="font-medium">{{ pagination.total }}</span>
            resultados
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button 
              @click="goToPage(pagination.page - 1)" 
              :disabled="pagination.page <= 1"
              class="btn btn-outline"
            >
              Anterior
            </button>
            <span class="relative inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700">
              Página {{ pagination.page }} de {{ pagination.pages }}
            </span>
            <button 
              @click="goToPage(pagination.page + 1)" 
              :disabled="pagination.page >= pagination.pages"
              class="btn btn-outline"
            >
              Próximo
            </button>
          </nav>
        </div>
      </div>
    </div>
    
    <!-- Modal de formulário -->
    <Modal v-if="showModal" @close="closeModal">
      <CustomerForm 
        :customer="editingItem"
        @save="handleSave"
        @cancel="closeModal"
      />
    </Modal>
  </div>
</template>

<script setup>
// Estado
const items = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingItem = ref(null)

// Filtros
const filters = reactive({
  search: '',
  documentType: '',
  isActive: '',
  city: ''
})

// Paginação e ordenação
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
})

const sortField = ref('name')
const sortDirection = ref('asc')

// Composables
const { get, put, del } = useApi()
const { $toast } = useNuxtApp()

// Métodos
const loadItems = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filters,
      sort: sortField.value,
      direction: sortDirection.value
    }
    
    // Remover campos vazios
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    const response = await get('/customers', params)
    if (response) {
      items.value = response.customers
      Object.assign(pagination, response.pagination)
    }
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
    $toast.error('Erro ao carregar clientes')
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  Object.keys(filters).forEach(key => {
    filters[key] = ''
  })
  pagination.page = 1
  loadItems()
}

const toggleSort = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
  loadItems()
}

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.pages) {
    pagination.page = page
    loadItems()
  }
}

const openModal = (item = null) => {
  editingItem.value = item
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingItem.value = null
}

const handleSave = (savedItem) => {
  closeModal()
  loadItems()
  $toast.success('Cliente salvo com sucesso!')
}

const editItem = (item) => {
  openModal(item)
}

const viewDetails = (item) => {
  // Implementar visualização detalhada
  navigateTo(`/customers/${item.id}`)
}

const toggleStatus = async (item) => {
  try {
    await put(`/customers/${item.id}/toggle-status`)
    item.isActive = !item.isActive
    $toast.success(`Cliente ${item.isActive ? 'ativado' : 'inativado'} com sucesso!`)
  } catch (error) {
    console.error('Erro ao alterar status:', error)
    $toast.error('Erro ao alterar status do cliente')
  }
}

const deleteItem = async (item) => {
  if (confirm(`Confirma a exclusão do cliente "${item.name}"?`)) {
    try {
      await del(`/customers/${item.id}`)
      loadItems()
      $toast.success('Cliente excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      $toast.error('Erro ao excluir cliente')
    }
  }
}

const exportCSV = () => {
  // Implementar exportação CSV
  const csv = convertToCSV(items.value)
  downloadFile(csv, 'clientes.csv', 'text/csv')
}

// Inicialização
onMounted(() => {
  loadItems()
})
</script>
```

## 4. Testes Unitários e de Integração

### 4.1 Testes de Validação
```javascript
// validation.test.js
describe('Customer Validation', () => {
  test('deve validar CPF corretamente', () => {
    const validCPF = {
      name: 'João Silva',
      document: '123.456.789-09',
      documentType: 'CPF'
    }
    
    const { error } = customerSchema.validate(validCPF)
    expect(error).toBeUndefined()
  })
  
  test('deve rejeitar CPF inválido', () => {
    const invalidCPF = {
      name: 'João Silva',
      document: '123.456.789-00',
      documentType: 'CPF'
    }
    
    const { error } = customerSchema.validate(invalidCPF)
    expect(error).toBeDefined()
  })
})
```

### 4.2 Testes de API
```javascript
// customers.api.test.js
describe('Customers API', () => {
  test('deve criar cliente com endereço completo', async () => {
    const customerData = {
      name: 'Maria Souza',
      document: '987.654.321-00',
      documentType: 'CPF',
      phone: '(11) 98765-4321',
      email: 'maria@email.com',
      addressZipCode: '01234-567',
      addressStreet: 'Rua Teste',
      addressNumber: '123',
      addressNeighborhood: 'Centro',
      addressCity: 'São Paulo',
      addressState: 'SP'
    }
    
    const response = await request(app)
      .post('/api/customers')
      .send(customerData)
      .expect(201)
    
    expect(response.body).toHaveProperty('id')
    expect(response.body.name).toBe(customerData.name)
    expect(response.body.addressCity).toBe(customerData.addressCity)
  })
})
```

### 4.3 Testes de Componente
```javascript
// CustomerForm.test.js
test('deve preencher endereço ao buscar CEP', async () => {
  const mockCepResponse = {
    logradouro: 'Rua Teste',
    bairro: 'Centro',
    localidade: 'São Paulo',
    uf: 'SP'
  }
  
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => mockCepResponse
  })
  
  const wrapper = mount(CustomerForm)
  
  await wrapper.find('input[placeholder="XXXXX-XXX"]').setValue('01234-567')
  await wrapper.find('button:contains("Buscar")').trigger('click')
  
  await flushPromises()
  
  expect(wrapper.find('input[placeholder="Logradouro"]').element.value).toBe('Rua Teste')
  expect(wrapper.find('select').element.value).toBe('SP')
})
```

## 5. Documentação de Deploy

### 5.1 Migrações de Banco de Dados
```bash
# Criar migração
npx prisma migrate dev --name add-customer-supplier-fields

# Aplicar migrações em produção
npx prisma migrate deploy
```

### 5.2 Atualização do Docker
```dockerfile
# backend/Dockerfile (já existe)
FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Executar migrações antes de iniciar
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
```

### 5.3 Variáveis de Ambiente
Verificar se todas as variáveis necessárias estão em `.env.example`:
```bash
# Backend
DATABASE_URL="postgresql://user:password@localhost:5432/mercadinho"
JWT_SECRET="your-secret-key"
NODE_ENV="development"

# Frontend
NUXT_PUBLIC_API_BASE="http://localhost:3001"
```

### 5.4 Pipeline de CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci
      
      - name: Run backend tests
        run: |
          cd backend
          npm run test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          JWT_SECRET: test-secret
      
      - name: Run frontend tests
        run: |
          cd frontend
          npm run test:unit
      
      - name: Lint code
        run: |
          cd backend && npm run lint
          cd ../frontend && npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Comandos de deploy específicos da infraestrutura
          echo "Deploy realizado com sucesso"
```

## 6. Checklist de Implementação

### 6.1 Backend
- [ ] Criar migrações de banco de dados
- [ ] Atualizar schema Prisma
- [ ] Implementar validações aprimoradas
- [ ] Adicionar filtros avançados nos endpoints
- [ ] Implementar busca por CEP (integração externa)
- [ ] Adicionar endpoints de toggle de status
- [ ] Criar testes unitários e de integração
- [ ] Documentar novos endpoints

### 6.2 Frontend
- [ ] Criar componente de formulário aprimorado
- [ ] Implementar máscaras de input (CPF, CNPJ, telefone, CEP)
- [ ] Adicionar busca de CEP automática
- [ ] Implementar filtros avançados na listagem
- [ ] Adicionar ordenação de colunas
- [ ] Implementar exportação CSV
- [ ] Criar testes de componente
- [ ] Adicionar validações client-side

### 6.3 Testes
- [ ] Testar todas as validações
- [ ] Testar fluxo completo de CRUD
- [ ] Testar busca de CEP
- [ ] Testar filtros e ordenação
- [ ] Testar exportação de dados
- [ ] Testar responsividade
- [ ] Testar acessibilidade

### 6.4 Documentação
- [ ] Atualizar documentação de API
- [ ] Criar guia de usuário
- [ ] Documentar novos campos
- [ ] Atualizar README do projeto
- [ ] Criar vídeo de demonstração (opcional)

## 7. Considerações de Performance

### 7.1 Índices de Banco de Dados
```sql
-- Criar índices para melhorar performance de busca
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_document ON customers(document);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_is_active ON customers(is_active);
CREATE INDEX idx_customers_address_city ON customers(address_city);
CREATE INDEX idx_customers_address_state ON customers(address_state);
CREATE INDEX idx_customers_created_at ON customers(created_at);

CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_cnpj ON suppliers(cnpj);
CREATE INDEX idx_suppliers_email ON suppliers(email);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);
```

### 7.2 Cache de Consultas
```javascript
// Implementar cache para consultas frequentes
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutos

router.get('/', async (req, res) => {
  const cacheKey = `customers_${JSON.stringify(req.query)}`;
  
  // Verificar cache
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }
  
  // Buscar no banco
  const result = await buscarNoBanco(req.query);
  
  // Armazenar em cache
  cache.set(cacheKey, result);
  
  res.json(result);
});
```

### 7.3 Paginação Otimizada
```javascript
// Usar cursor-based pagination para grandes datasets
router.get('/cursor', async (req, res) => {
  const { cursor, limit = 20 } = req.query;
  
  const customers = await prisma.customer.findMany({
    take: parseInt(limit) + 1, // Buscar um extra para saber se há próxima página
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { id: 'asc' }
  });
  
  const hasMore = customers.length > limit;
  const items = hasMore ? customers.slice(0, -1) : customers;
  const nextCursor = hasMore ? items[items.length - 1].id : null;
  
  res.json({
    items,
    nextCursor,
    hasMore
  });
});
```

## 8. Segurança Adicional

### 8.1 Sanitização de Dados
```javascript
// Implementar sanitização adicional
const DOMPurify = require('isomorphic-dompurify');

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  }
  return input;
};

// Usar em todas as entradas
const sanitizedBody = Object.keys(req.body).reduce((acc, key) => {
  acc[key] = sanitizeInput(req.body[key]);
  return acc;
}, {});
```

### 8.2 Rate Limiting Específico
```javascript
// Rate limiting mais específico para endpoints sensíveis
const createCustomerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 criações por IP
  message: 'Muitas tentativas de criação. Tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', createCustomerLimiter, validate(customerSchema), async (req, res) => {
  // ... código de criação
});
```

## 9. Conclusão

Estas especificações técnicas mantêm total compatibilidade com o sistema existente enquanto adicionam funcionalidades avançadas ao módulo de cadastro. A implementação deve seguir rigorosamente os padrões já estabelecidos no projeto, garantindo:

1. **Consistência visual** - Usar apenas componentes e estilos do design system atual
2. **Compatibilidade** - Não quebrar funcionalidades existentes
3. **Performance** - Implementar otimizações necessárias
4. **Segurança** - Adicionar validações e proteções apropriadas
5. **Testabilidade** - Criar testes abrangentes
6. **Manutenibilidade** - Seguir padrões de código e documentação

O desenvolvimento deve ser feito em branches separados, com revisão de código e testes completos antes do merge com a branch principal.