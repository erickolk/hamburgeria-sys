# Documentação Técnica - Módulo de Cadastro de Clientes e Fornecedores

## 1. Análise da Estrutura Atual do Sistema

### 1.1 Stack Tecnológica
- **Frontend**: Nuxt 3 + Vue 3 + Tailwind CSS
- **Backend**: Node.js + Express + Prisma ORM
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (temporariamente desabilitada para testes)
- **Deploy**: Docker + Docker Compose

### 1.2 Padrões Existentes
- Arquitetura RESTful com endpoints padronizados
- Validação com Joi
- Paginação e busca em todas as listagens
- Middleware de autenticação com roles
- Tratamento de erros padronizado
- UI consistente com Tailwind CSS

## 2. Arquitetura do Módulo

### 2.1 Visão Geral
O módulo de cadastro de clientes e fornecedores já está parcialmente implementado no sistema. Esta documentação detalha a estrutura existente e aprimoramentos necessários.

### 2.2 Estrutura de Diretórios
```
backend/
├── src/
│   ├── routes/
│   │   ├── customers.js        # Rotas de clientes (existente)
│   │   └── suppliers.js        # Rotas de fornecedores (existente)
│   ├── middleware/
│   │   └── auth.js             # Autenticação (existente)
│   ├── utils/
│   │   └── validation.js       # Validações (existente)
│   └── server.js               # Configuração do servidor (existente)

frontend/
├── pages/
│   ├── customers/
│   │   └── index.vue           # Listagem de clientes (existente)
│   └── suppliers/
│   │   └── index.vue           # Listagem de fornecedores (existente)
├── composables/
│   ├── useApi.js               # Composable de API (existente)
│   └── useAuth.js              # Composable de autenticação (existente)
└── plugins/
    └── _toast.client.ts         # Notificações (existente)
```

## 3. Modelos de Dados

### 3.1 Schema Prisma Atual

#### Customer (Clientes)
```prisma
model Customer {
  id        String   @id @default(cuid())
  name      String
  phone     String?
  note      String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  sales Sale[]

  @@map("customers")
}
```

#### Supplier (Fornecedores)
```prisma
model Supplier {
  id           String  @id @default(cuid())
  name         String
  contact      String?
  phone        String?
  email        String?
  paymentTerms String? @map("payment_terms")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relations
  products  Product[]
  purchases Purchase[]

  @@map("suppliers")
}
```

### 3.2 Campos Necessários para Cadastro Completo

#### Clientes (Pessoa Física e Jurídica)
- **Dados Básicos**: nome/razão social, fantasia, CPF/CNPJ, RG, Inscrição Estadual
- **Contato**: e-mail, telefones (comercial, celular, residencial)
- **Endereço**: CEP, logradouro, número, complemento, bairro, cidade, estado, país
- **Status**: ativo/inativo, bloqueado, observações

#### Fornecedores
- **Dados Básicos**: nome, razão social, CNPJ, Inscrição Estadual
- **Contato**: e-mail, telefones, contato principal
- **Endereço**: completo (mesmo formato do cliente)
- **Comercial**: prazo de pagamento, condições comerciais
- **Status**: ativo/inativo, observações

## 4. Endpoints REST

### 4.1 Clientes

#### Listar Clientes
```http
GET /api/customers?search={texto}&page={numero}&limit={numero}
```

**Parâmetros Query:**
- `search` (opcional): texto para busca por nome ou telefone
- `page` (opcional): número da página (padrão: 1)
- `limit` (opcional): itens por página (padrão: 20)

**Resposta de Sucesso (200):**
```json
{
  "customers": [
    {
      "id": "clxxxxx",
      "name": "João Silva",
      "phone": "(11) 99999-9999",
      "email": "joao@email.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### Obter Cliente por ID
```http
GET /api/customers/{id}
```

#### Criar Cliente
```http
POST /api/customers
```

**Body:**
```json
{
  "name": "João Silva",
  "phone": "(11) 99999-9999",
  "email": "joao@email.com",
  "note": "Cliente VIP"
}
```

#### Atualizar Cliente
```http
PUT /api/customers/{id}
```

#### Excluir Cliente
```http
DELETE /api/customers/{id}
```

### 4.2 Fornecedores

#### Listar Fornecedores
```http
GET /api/suppliers?search={texto}&page={numero}&limit={numero}
```

**Parâmetros Query:**
- `search` (opcional): texto para busca por nome, contato ou email
- `page` (opcional): número da página (padrão: 1)
- `limit` (opcional): itens por página (padrão: 20)

**Resposta de Sucesso (200):**
```json
{
  "suppliers": [
    {
      "id": "clxxxxx",
      "name": "Fornecedor ABC",
      "contact": "Maria Souza",
      "phone": "(11) 8888-8888",
      "email": "contato@abc.com",
      "paymentTerms": "30 dias"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

## 5. Validações

### 5.1 Schema Joi para Clientes
```javascript
const customerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres',
    'any.required': 'Nome é obrigatório'
  }),
  phone: Joi.string().pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/).optional().messages({
    'string.pattern.base': 'Telefone deve estar no formato (XX) XXXXX-XXXX'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Email deve ter um formato válido'
  }),
  note: Joi.string().max(500).optional().messages({
    'string.max': 'Observação deve ter no máximo 500 caracteres'
  })
});
```

### 5.2 Schema Joi para Fornecedores
```javascript
const supplierSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  contact: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/).optional(),
  email: Joi.string().email().optional(),
  paymentTerms: Joi.string().max(100).optional()
});
```

## 6. Frontend - Nuxt 3

### 6.1 Padrão de Páginas
As páginas seguem o padrão já existente com:
- Middleware de autenticação
- Layout padrão do sistema
- Tabelas com Tailwind CSS
- Formulários modais
- Notificações toast

### 6.2 Composables Existentes

#### useApi.js
```javascript
const { get, post, put, del } = useApi()
```

#### useAuth.js
```javascript
const { user, isAuthenticated } = useAuth()
```

### 6.3 Estrutura de Componentes
```vue
<template>
  <div>
    <!-- Cabeçalho com título e botão novo -->
    <!-- Barra de busca -->
    <!-- Tabela de dados -->
    <!-- Modal de formulário -->
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth'] })

// Estado
const items = ref([])
const search = ref('')
const loading = ref(false)

// Composables
const { get, post, put, del } = useApi()
const { $toast } = useNuxtApp()

// Métodos
const loadItems = async () => { ... }
const saveItem = async () => { ... }
const deleteItem = async (id) => { ... }
</script>
```

## 7. Testes

### 7.1 Backend - Jest + Supertest
```javascript
// Exemplo de teste de integração
describe('Customers API', () => {
  test('POST /api/customers deve criar cliente', async () => {
    const response = await request(app)
      .post('/api/customers')
      .send({
        name: 'Teste Cliente',
        phone: '(11) 99999-9999',
        email: 'teste@email.com'
      })
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Teste Cliente');
  });
});
```

### 7.2 Frontend - Vitest + Vue Test Utils
```javascript
// Exemplo de teste de componente
test('deve renderizar lista de clientes', async () => {
  const wrapper = mount(CustomersList, {
    global: {
      stubs: {
        NuxtLink: true
      }
    }
  });
  
  expect(wrapper.text()).toContain('Clientes');
});
```

## 8. Segurança e Validações

### 8.1 Autenticação
- Middleware `authenticateToken` aplicado a todas as rotas
- Validação de roles com `requireRole` quando necessário

### 8.2 Validações de Entrada
- Sanitização com Joi (stripUnknown: true)
- Validação de CPF/CNPJ com regex
- Validação de telefone com formato brasileiro
- Prevenção de XSS

### 8.3 Rate Limiting
- Limite de 100 requests por IP a cada 15 minutos
- Configurado globalmente no servidor

## 9. Deploy e CI/CD

### 9.1 Docker
O sistema já possui Dockerfile configurado com:
- Instalação de dependências
- Aplicação de migrações Prisma
- Build e start do servidor

### 9.2 Migrações de Banco
```bash
# Desenvolvimento
npm run migrate:dev

# Produção
npm run migrate:deploy
```

### 9.3 Pipeline de CI
Sugestão de pipeline (adicionar ao CI existente):
```yaml
steps:
  - name: Lint
    run: npm run lint
  
  - name: Testes Backend
    run: npm run test:backend
  
  - name: Testes Frontend
    run: npm run test:frontend
  
  - name: Build
    run: npm run build
  
  - name: Migrações
    run: npm run migrate:deploy
```

## 10. Melhorias Recomendadas

### 10.1 Campos Adicionais (Requer Migração)
- Adicionar campos de endereço completo
- Adicionar campo de tipo (pessoa física/jurídica)
- Adicionar campos de documentos (CPF, CNPJ, RG)
- Adicionar status ativo/inativo

### 10.2 Funcionalidades
- Importação/exportação em CSV/Excel
- Histórico de transações por cliente/fornecedor
- Relatórios de análise
- Integração com serviços de CEP
- Validação de CPF/CNPJ com webservice

### 10.3 Performance
- Índices de banco para campos de busca
- Cache de consultas frequentes
- Paginação server-side otimizada

## 11. Manutenção e Troubleshooting

### 11.1 Logs
- Logs de erro detalhados no console
- Auditoria de alterações (se implementada)
- Tracking de performance

### 11.2 Debug
- Modo debug disponível via variável de ambiente
- Prisma Studio para inspeção de dados
- Ferramentas de desenvolvimento do Nuxt

## 12. Conclusão

O módulo de cadastro de clientes e fornecedores já possui estrutura base implementada. As melhorias devem seguir os padrões existentes do sistema, mantendo consistência de código, UI/UX e arquitetura. A implementação deve respeitar:

1. **Padrões visuais existentes** - Usar apenas componentes e estilos do design system atual
2. **Arquitetura RESTful** - Seguir padrões de endpoints e respostas
3. **Validações consistentes** - Usar Joi para validação de entrada
4. **Testes automatizados** - Implementar testes unitários e de integração
5. **Documentação** - Manter documentação atualizada
6. **Deploy sem breaking changes** - Garantir compatibilidade com versões anteriores

Para implementar melhorias significativas (novos campos, funcionalidades complexas), criar migrações Prisma apropriadas e testar extensivamente antes do deploy em produção.