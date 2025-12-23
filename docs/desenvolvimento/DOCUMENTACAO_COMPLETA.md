# 📚 DOCUMENTAÇÃO COMPLETA DO PROJETO MERCADINHO

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Estrutura de Diretórios](#estrutura-de-diretórios)
5. [Banco de Dados](#banco-de-dados)
6. [Backend - API REST](#backend---api-rest)
7. [Frontend - Nuxt 3](#frontend---nuxt-3)
8. [Funcionalidades Principais](#funcionalidades-principais)
9. [Autenticação e Autorização](#autenticação-e-autorização)
10. [Configuração e Deploy](#configuração-e-deploy)
11. [Variáveis de Ambiente](#variáveis-de-ambiente)
12. [Fluxos Principais](#fluxos-principais)
13. [Integrações e Serviços](#integrações-e-serviços)

---

## 🎯 VISÃO GERAL

O **Mercadinho** é um sistema completo de gestão para pequenos mercados e estabelecimentos comerciais. O sistema oferece funcionalidades de PDV (Ponto de Venda), controle de estoque, gestão de clientes e fornecedores, relatórios, controle de caixa e muito mais.

### Características Principais

- ✅ **PDV Completo**: Sistema de vendas com múltiplas formas de pagamento
- ✅ **Controle de Estoque**: Gestão automática com alertas de estoque baixo
- ✅ **Gestão de Clientes e Fornecedores**: CRUD completo com histórico
- ✅ **Relatórios**: Vendas, produtos mais vendidos, estoque, fluxo de caixa
- ✅ **Tickets Térmicos**: Geração automática de cupons para impressora térmica
- ✅ **Controle de Caixa**: Abertura/fechamento de caixa com movimentações
- ✅ **Sistema de Usuários**: Perfis de acesso (Admin, Gerente, Caixa)
- ✅ **Auditoria**: Log de todas as ações críticas

### Stack Tecnológica

- **Backend**: Node.js + Express.js + Prisma ORM + PostgreSQL
- **Frontend**: Nuxt 3 + Vue 3 + TailwindCSS + Pinia
- **Containerização**: Docker + Docker Compose
- **Autenticação**: JWT (JSON Web Tokens)

---

## 🏗️ ARQUITETURA DO SISTEMA

### Arquitetura Geral

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Nuxt 3)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Pages   │  │Components│  │ Composables│            │
│  └──────────┘  └──────────┘  └──────────┘             │
│       │              │              │                  │
│       └──────────────┴──────────────┘                  │
│                    │                                    │
│              ┌──────▼──────┐                            │
│              │   useApi()  │                            │
│              └──────┬──────┘                            │
└─────────────────────┼───────────────────────────────────┘
                      │ HTTP/REST
                      │ (JWT Auth)
┌─────────────────────▼───────────────────────────────────┐
│              BACKEND (Express.js)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Routes  │→ │Middleware│→ │ Services │             │
│  └──────────┘  └──────────┘  └────┬─────┘             │
│       │              │              │                  │
│       └──────────────┴──────────────┘                  │
│                    │                                    │
│              ┌─────▼─────┐                             │
│              │   Prisma   │                             │
│              │    ORM     │                             │
│              └─────┬─────┘                             │
└────────────────────┼───────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────┐
│            POSTGRESQL DATABASE                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Products │  │  Sales   │  │  Users   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │Customers │  │Suppliers │  │  Cash    │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

### Padrão de Arquitetura

O sistema segue uma arquitetura em camadas:

1. **Camada de Apresentação (Frontend)**
   - Páginas Vue.js
   - Componentes reutilizáveis
   - Composables para lógica compartilhada
   - Stores Pinia para gerenciamento de estado

2. **Camada de API (Backend)**
   - Rotas Express.js
   - Middleware de autenticação/autorização
   - Validação de dados
   - Serviços de negócio

3. **Camada de Dados**
   - Prisma ORM
   - PostgreSQL Database
   - Migrations e Seeds

---

## 🛠️ TECNOLOGIAS UTILIZADAS

### Backend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Node.js | 18+ | Runtime JavaScript |
| Express.js | ^4.18.2 | Framework web |
| Prisma | ^5.7.1 | ORM para PostgreSQL |
| PostgreSQL | 15 | Banco de dados relacional |
| JWT | ^9.0.2 | Autenticação |
| bcryptjs | ^2.4.3 | Hash de senhas |
| Joi | ^17.11.0 | Validação de dados |
| Swagger | ^6.2.8 | Documentação da API |
| Helmet | ^7.1.0 | Segurança HTTP |
| CORS | ^2.8.5 | Controle de origem cruzada |
| Morgan | ^1.10.0 | Logging HTTP |
| express-rate-limit | ^7.1.5 | Rate limiting |

### Frontend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Nuxt 3 | ^3.8.4 | Framework Vue.js |
| Vue 3 | ^3.x | Framework frontend |
| TailwindCSS | ^3.3.6 | Framework CSS |
| Pinia | ^2.1.7 | Gerenciamento de estado |
| @headlessui/vue | ^1.7.16 | Componentes UI |
| @heroicons/vue | ^2.0.18 | Ícones |
| vue-toastification | ^2.0.0 | Notificações |
| Zod | ^3.22.4 | Validação de schemas |

### DevOps

| Tecnologia | Uso |
|------------|-----|
| Docker | Containerização |
| Docker Compose | Orquestração de containers |

---

## 📁 ESTRUTURA DE DIRETÓRIOS

```
mercadinho/
├── backend/                          # Backend Node.js/Express
│   ├── src/
│   │   ├── config/                   # Configurações
│   │   │   └── swagger.js            # Configuração Swagger
│   │   ├── middleware/               # Middlewares
│   │   │   └── auth.js               # Autenticação JWT
│   │   ├── routes/                   # Rotas da API
│   │   │   ├── auth.js               # Autenticação
│   │   │   ├── products.js           # Produtos
│   │   │   ├── sales.js              # Vendas
│   │   │   ├── customers.js          # Clientes
│   │   │   ├── suppliers.js          # Fornecedores
│   │   │   ├── purchases.js          # Compras
│   │   │   ├── stock-movements.js    # Movimentações de estoque
│   │   │   ├── cash.js               # Caixa
│   │   │   ├── categories.js         # Categorias
│   │   │   ├── users.js              # Usuários
│   │   │   ├── reports.js            # Relatórios
│   │   │   └── product-photos.js     # Fotos de produtos
│   │   ├── services/                 # Serviços de negócio
│   │   │   ├── thermalPrinterService.js  # Geração de tickets
│   │   │   ├── reportFileService.js      # Geração de relatórios
│   │   │   ├── cacheService.js           # Cache
│   │   │   └── documentValidation.js     # Validação de documentos
│   │   ├── utils/                    # Utilitários
│   │   │   └── validation.js         # Schemas de validação
│   │   └── server.js                 # Servidor Express
│   ├── prisma/
│   │   ├── schema.prisma             # Schema do banco
│   │   ├── migrations/               # Migrations do banco
│   │   └── seed.js                   # Seed de dados iniciais
│   ├── scripts/                      # Scripts auxiliares
│   │   ├── setup-directories.js      # Setup de diretórios
│   │   ├── test-ticket-report.js      # Testes de tickets/relatórios
│   │   └── upsert-admin.js           # Criar usuário admin
│   ├── tests/                        # Testes
│   ├── tickets/                      # Tickets gerados
│   ├── reports/                      # Relatórios gerados
│   ├── package.json
│   ├── Dockerfile
│   └── .env                          # Variáveis de ambiente
│
├── frontend/                         # Frontend Nuxt 3
│   ├── pages/                        # Páginas (rotas)
│   │   ├── index.vue                 # Dashboard
│   │   ├── login.vue                 # Login
│   │   ├── pos.vue                   # PDV
│   │   ├── products/                 # Produtos
│   │   │   ├── index.vue             # Listagem
│   │   │   ├── new.vue               # Novo produto
│   │   │   └── [id].vue              # Editar produto
│   │   ├── sales/                    # Vendas
│   │   │   └── index.vue
│   │   ├── customers/                # Clientes
│   │   │   └── index.vue
│   │   ├── suppliers/                # Fornecedores
│   │   │   └── index.vue
│   │   ├── purchases/                # Compras
│   │   │   └── index.vue
│   │   ├── stock-movements/          # Movimentações
│   │   │   └── index.vue
│   │   ├── cash/                     # Caixa
│   │   │   └── index.vue
│   │   ├── reports/                  # Relatórios
│   │   │   └── index.vue
│   │   └── settings/                 # Configurações
│   │       ├── index.vue             # Usuários
│   │       └── categories.vue        # Categorias
│   ├── components/                   # Componentes Vue
│   │   ├── CustomerForm.vue
│   │   ├── CustomerList.vue
│   │   ├── SupplierForm.vue
│   │   ├── Modal.vue
│   │   └── UserMenu.vue
│   ├── composables/                  # Composables (lógica reutilizável)
│   │   ├── useApi.js                 # Cliente HTTP
│   │   └── useAuth.js                # Autenticação
│   ├── stores/                       # Stores Pinia
│   │   └── cart.js                   # Carrinho de compras
│   ├── layouts/                      # Layouts
│   │   ├── default.vue               # Layout padrão
│   │   └── auth.vue                  # Layout de autenticação
│   ├── middleware/                   # Middlewares Nuxt
│   │   ├── auth.js                   # Verificar autenticação
│   │   └── admin.js                  # Verificar permissão admin
│   ├── plugins/                      # Plugins Nuxt
│   │   ├── _toast.client.ts          # Toast notifications
│   │   └── _init-auth.client.ts      # Inicializar auth
│   ├── assets/                       # Assets estáticos
│   │   └── css/
│   │       └── main.css              # Estilos globais
│   ├── nuxt.config.ts                # Configuração Nuxt
│   ├── tailwind.config.js            # Configuração Tailwind
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml                 # Docker Compose
├── docker-compose.prod.yml            # Docker Compose produção
└── README.md                          # Documentação principal
```

---

## 🗄️ BANCO DE DADOS

### Modelo de Dados (Prisma Schema)

O banco de dados utiliza PostgreSQL e é gerenciado pelo Prisma ORM. Principais entidades:

#### **User** (Usuários)
- `id`: String (CUID)
- `name`: String
- `email`: String (único)
- `passwordHash`: String
- `role`: Enum (ADMIN, MANAGER, CASHIER)
- `createdAt`, `updatedAt`: DateTime

#### **Product** (Produtos)
- `id`: String (CUID)
- `sku`: String (único)
- `name`: String
- `barcode`: String? (único, opcional)
- `costPrice`: Decimal
- `salePrice`: Decimal
- `stockQuantity`: Decimal
- `reorderPoint`: Decimal
- `saleUnit`: Enum (UN, PC, CX, DZ, KG, LT, MT, OUTRA)
- `batchTracking`: Boolean
- `categoryId`: String? (FK)
- `supplierId`: String? (FK)
- `observations`: Text?

#### **Category** (Categorias)
- `id`: String (CUID)
- `name`: String (único)
- `createdAt`, `updatedAt`: DateTime

#### **Supplier** (Fornecedores)
- `id`: String (CUID)
- `name`: String
- `legalName`: String?
- `contact`: String?
- `phone`: String?
- `email`: String?
- `cnpj`: String?
- `stateRegistration`: String?
- `paymentTerms`: String?
- `isActive`: Boolean
- Campos de endereço completo
- `createdAt`, `updatedAt`: DateTime

#### **Customer** (Clientes)
- `id`: String (CUID)
- `name`: String
- `phone`: String?
- `email`: String?
- `document`: String? (CPF/CNPJ)
- `documentType`: String (CPF/CNPJ)
- `isActive`: Boolean
- `note`: Text?
- Campos de endereço completo
- `createdAt`, `updatedAt`: DateTime

#### **Sale** (Vendas)
- `id`: String (CUID)
- `userId`: String (FK)
- `customerId`: String? (FK)
- `total`: Decimal
- `discount`: Decimal
- `payments`: JSON (array de métodos de pagamento)
- `status`: Enum (PENDING, COMPLETED, CANCELLED, REFUNDED)
- `date`: DateTime
- `createdAt`: DateTime

#### **SaleItem** (Itens de Venda)
- `id`: String (CUID)
- `saleId`: String (FK)
- `productId`: String (FK)
- `quantity`: Decimal
- `unitPrice`: Decimal
- `discount`: Decimal
- `batchId`: String? (FK)

#### **Purchase** (Compras)
- `id`: String (CUID)
- `supplierId`: String (FK)
- `userId`: String (FK)
- `total`: Decimal
- `status`: Enum (PENDING, COMPLETED, CANCELLED)
- `date`: DateTime
- `createdAt`: DateTime

#### **PurchaseItem** (Itens de Compra)
- `id`: String (CUID)
- `purchaseId`: String (FK)
- `productId`: String (FK)
- `quantity`: Decimal
- `unitCost`: Decimal
- `batchId`: String? (FK)

#### **StockMovement** (Movimentações de Estoque)
- `id`: String (CUID)
- `productId`: String (FK)
- `quantity`: Decimal
- `type`: Enum (IN, OUT, ADJUST, SALE, PURCHASE, RETURN)
- `reason`: String?
- `referenceId`: String? (ID da venda/compra)
- `userId`: String (FK)
- `date`: DateTime
- `batchId`: String? (FK)

#### **CashRegister** (Caixa)
- `id`: String (CUID)
- `userId`: String (FK)
- `openedAt`: DateTime
- `closedAt`: DateTime?
- `initialBalance`: Decimal
- `finalBalance`: Decimal?
- `status`: String (OPEN/CLOSED)

#### **CashMovement** (Movimentações de Caixa)
- `id`: String (CUID)
- `cashRegisterId`: String (FK)
- `userId`: String (FK)
- `type`: Enum (OPENING, WITHDRAWAL, SUPPLY, SALE, CLOSING)
- `amount`: Decimal
- `reason`: String?
- `timestamp`: DateTime

#### **ProductBatch** (Lotes de Produtos)
- `id`: String (CUID)
- `productId`: String (FK)
- `lotNumber`: String
- `expiryDate`: DateTime?
- `quantity`: Decimal

#### **ProductPhoto** (Fotos de Produtos)
- `id`: String (CUID)
- `productId`: String (FK)
- `url`: String
- `isMain`: Boolean
- `createdAt`: DateTime

#### **AuditLog** (Logs de Auditoria)
- `id`: String (CUID)
- `userId`: String (FK)
- `action`: String
- `entity`: String
- `entityId`: String
- `details`: JSON?
- `timestamp`: DateTime

### Relacionamentos Principais

- **User** → **Sales**, **Purchases**, **StockMovements**, **CashRegisters**
- **Product** → **SaleItems**, **PurchaseItems**, **StockMovements**, **Batches**, **Photos**
- **Supplier** → **Products**, **Purchases**
- **Customer** → **Sales**
- **Category** → **Products**
- **Sale** → **SaleItems**
- **Purchase** → **PurchaseItems**
- **CashRegister** → **CashMovements**

---

## 🔌 BACKEND - API REST

### Base URL

- **Desenvolvimento**: `http://localhost:3001`
- **Produção**: Configurável via `FRONTEND_URL` e `API_BASE`

### Autenticação

Todas as rotas (exceto `/auth/login` e `/health`) requerem autenticação via JWT:

```
Authorization: Bearer <token>
```

### Endpoints Principais

#### **Autenticação** (`/auth`)

- `POST /auth/login` - Fazer login
  - Body: `{ email, password }`
  - Retorna: `{ token, user }`

- `POST /auth/register` - Registrar usuário (apenas ADMIN)
  - Body: `{ name, email, password, role }`
  - Headers: `Authorization: Bearer <token>`

#### **Produtos** (`/products`)

- `GET /products` - Listar produtos
  - Query params: `page`, `limit`, `search`, `categoryId`, `supplierId`
  
- `GET /products/:id` - Obter produto por ID

- `POST /products` - Criar produto
  - Body: `{ sku, name, barcode?, costPrice, salePrice, stockQuantity, ... }`

- `PUT /products/:id` - Atualizar produto

- `DELETE /products/:id` - Deletar produto

- `GET /products/:id/photos` - Listar fotos do produto

- `POST /products/:id/photos` - Adicionar foto ao produto

#### **Vendas** (`/sales`)

- `GET /sales` - Listar vendas
  - Query params: `startDate`, `endDate`, `status`, `page`, `limit`

- `GET /sales/:id` - Obter venda por ID

- `POST /sales` - Criar venda
  - Body: `{ customerId?, items[], payments[], discount? }`
  - **Gera ticket automaticamente**

- `POST /sales/:id/ticket` - Reimprimir ticket

- `GET /sales/:id/ticket/download` - Baixar arquivo do ticket

#### **Clientes** (`/customers`)

- `GET /customers` - Listar clientes
  - Query params: `page`, `limit`, `search`, `isActive`

- `GET /customers/:id` - Obter cliente por ID

- `POST /customers` - Criar cliente

- `PUT /customers/:id` - Atualizar cliente

- `DELETE /customers/:id` - Deletar cliente

#### **Fornecedores** (`/suppliers`)

- `GET /suppliers` - Listar fornecedores
  - Query params: `page`, `limit`, `search`, `isActive`

- `GET /suppliers/:id` - Obter fornecedor por ID

- `POST /suppliers` - Criar fornecedor

- `PUT /suppliers/:id` - Atualizar fornecedor

- `DELETE /suppliers/:id` - Deletar fornecedor

#### **Compras** (`/purchases`)

- `GET /purchases` - Listar compras
  - Query params: `startDate`, `endDate`, `status`, `supplierId`

- `GET /purchases/:id` - Obter compra por ID

- `POST /purchases` - Criar compra
  - Body: `{ supplierId, items[], status? }`

- `PUT /purchases/:id` - Atualizar compra

#### **Movimentações de Estoque** (`/stock-movements`)

- `GET /stock-movements` - Listar movimentações
  - Query params: `productId`, `type`, `startDate`, `endDate`

- `POST /stock-movements` - Criar movimentação manual
  - Body: `{ productId, quantity, type, reason }`

#### **Caixa** (`/cash`)

- `POST /cash/open` - Abrir caixa
  - Body: `{ initialBalance }`

- `POST /cash/close` - Fechar caixa
  - Body: `{ finalBalance }`

- `GET /cash/today` - Obter movimentações do dia

- `GET /cash/registers` - Listar registros de caixa

#### **Relatórios** (`/reports`)

- `GET /reports/sales` - Relatório de vendas
  - Query params: `startDate`, `endDate`, `generateFile=true`
  - **Sempre gera arquivo** (mesmo sem dados)

- `GET /reports/top-products` - Produtos mais vendidos
  - Query params: `startDate`, `endDate`, `limit`, `generateFile=true`

- `GET /reports/low-stock` - Estoque baixo
  - Query params: `generateFile=true`

- `GET /reports/cash-flow` - Fluxo de caixa
  - Query params: `startDate`, `endDate`, `generateFile=true`

- `GET /reports/files` - Listar arquivos gerados

- `GET /reports/files/:filename` - Baixar relatório

#### **Categorias** (`/categories`)

- `GET /categories` - Listar categorias

- `POST /categories` - Criar categoria

- `PUT /categories/:id` - Atualizar categoria

- `DELETE /categories/:id` - Deletar categoria

#### **Usuários** (`/users`)

- `GET /users` - Listar usuários (apenas ADMIN)

- `GET /users/:id` - Obter usuário por ID

- `POST /users` - Criar usuário (apenas ADMIN)

- `PUT /users/:id` - Atualizar usuário

- `DELETE /users/:id` - Deletar usuário

### Documentação Swagger

A documentação completa da API está disponível em:

```
http://localhost:3001/api-docs
```

---

## 💻 FRONTEND - NUXT 3

### Estrutura de Páginas

#### **Dashboard** (`/`)
- Visão geral do sistema
- Resumo de vendas
- Estoque baixo
- Status do caixa

#### **PDV** (`/pos`)
- Tela de vendas otimizada
- Busca rápida de produtos
- Carrinho de compras
- Múltiplas formas de pagamento
- Geração automática de ticket

#### **Produtos** (`/products`)
- Listagem com busca e filtros
- Cadastro/edição de produtos
- Upload de fotos
- Controle de estoque

#### **Vendas** (`/sales`)
- Histórico de vendas
- Detalhes da venda
- Reimpressão de tickets

#### **Clientes** (`/customers`)
- CRUD de clientes
- Histórico de compras
- Validação de CPF/CNPJ

#### **Fornecedores** (`/suppliers`)
- CRUD de fornecedores
- Histórico de compras
- Validação de CNPJ

#### **Compras** (`/purchases`)
- Registro de compras
- Atualização automática de estoque
- Histórico de compras

#### **Movimentações** (`/stock-movements`)
- Ajustes manuais de estoque
- Histórico de movimentações

#### **Caixa** (`/cash`)
- Abertura/fechamento de caixa
- Movimentações do dia
- Relatório de fechamento

#### **Relatórios** (`/reports`)
- Geração de relatórios
- Download de arquivos
- Visualização online

#### **Configurações** (`/settings`)
- Gestão de usuários
- Gestão de categorias

### Composables

#### **useApi()**
Cliente HTTP para comunicação com a API:
- Métodos: `get()`, `post()`, `put()`, `delete()`
- Adiciona token JWT automaticamente
- Tratamento de erros
- Logout automático em 401

#### **useAuth()**
Gerenciamento de autenticação:
- `login(email, password)`
- `logout()`
- `user` (ref reativo)
- `token` (ref reativo)
- `isLoggedIn` (computed)
- `isAdmin`, `isManager`, `isCashier` (computed)
- `hasRole(roles)`

### Stores (Pinia)

#### **useCartStore**
Gerenciamento do carrinho de compras:
- `items`: Array de itens
- `customer`: Cliente selecionado
- `payments`: Formas de pagamento
- `discount`: Desconto total
- `subtotal`, `total`, `change`: Computed
- `addItem()`, `removeItem()`, `updateQuantity()`
- `setCustomer()`, `addPayment()`, `setDiscount()`
- `clear()`, `getSaleData()`

### Middleware

#### **auth.js**
Protege rotas que requerem autenticação:
- Redireciona para `/login` se não autenticado

#### **admin.js**
Protege rotas que requerem permissão de admin:
- Redireciona para `/` se não for admin

---

## ⚙️ FUNCIONALIDADES PRINCIPAIS

### 1. PDV (Ponto de Venda)

**Fluxo de Venda:**
1. Operador busca produto (nome, SKU ou código de barras)
2. Adiciona ao carrinho
3. Define quantidade e preço (se necessário)
4. Aplica descontos (por item ou total)
5. Seleciona cliente (opcional)
6. Define formas de pagamento
7. Finaliza venda
8. **Ticket é gerado automaticamente**

**Características:**
- Busca rápida e intuitiva
- Suporte a leitor de código de barras
- Múltiplas formas de pagamento (Dinheiro, Cartão, PIX, Fiado)
- Cálculo automático de troco
- Validação de estoque
- Atualização automática de estoque
- Geração de movimentação de estoque
- Geração de movimentação de caixa

### 2. Controle de Estoque

**Funcionalidades:**
- Atualização automática em vendas e compras
- Alertas de estoque baixo
- Ajustes manuais com justificativa
- Rastreamento de lotes (opcional)
- Histórico completo de movimentações
- Suporte a múltiplas unidades (UN, KG, LT, etc.)

**Regras de Negócio:**
- Venda não pode ultrapassar estoque disponível
- Cálculo de custo médio em compras:
  ```
  novo_custo = (estoque_atual * custo_atual + qtd_nova * custo_unitario) / (estoque_atual + qtd_nova)
  ```

### 3. Gestão de Clientes e Fornecedores

**Clientes:**
- Cadastro completo com endereço
- Validação de CPF/CNPJ
- Histórico de compras
- Status ativo/inativo
- Observações

**Fornecedores:**
- Cadastro completo com dados fiscais
- Validação de CNPJ
- Histórico de compras
- Status ativo/inativo
- Termos de pagamento

### 4. Relatórios

**Tipos de Relatórios:**
1. **Vendas por Período**
   - Total de vendas
   - Quantidade de transações
   - Formas de pagamento
   - Vendas por cliente

2. **Produtos Mais Vendidos**
   - Ranking de produtos
   - Quantidade vendida
   - Receita por produto

3. **Estoque Baixo**
   - Produtos abaixo do ponto de reposição
   - Quantidade atual vs. mínima

4. **Fluxo de Caixa**
   - Entradas e saídas
   - Saldo diário
   - Movimentações por tipo

**Características:**
- **Sempre gera arquivo** (mesmo sem dados)
- Arquivo em formato texto (.txt)
- Compatível com impressão
- Download via API
- Histórico de arquivos gerados

### 5. Tickets Térmicos

**Funcionalidades:**
- Geração automática a cada venda
- Formato ESC/POS (58mm e 80mm)
- Reimpressão de tickets antigos
- Download de arquivo
- Configuração de dados da loja via variáveis de ambiente

**Formato do Ticket:**
```
================================================
              MERCADINHO TESTE
         CNPJ: 12.345.678/0001-00
           Rua Teste, 123 - Centro
            Tel: (11) 98765-4321
================================================
            CUPOM NÃO FISCAL
================================================

Venda: #ABC12345
Data: 26/11/2025 14:30:00
Vendedor: João Silva
Cliente: Maria Santos

------------------------------------------------

Arroz Tipo 1 5kg
2 x R$ 25,00                          R$ 50,00

------------------------------------------------

Subtotal:                             R$ 85,50
Desconto:                             -R$ 5,00

         TOTAL: R$ 80,50

------------------------------------------------
PAGAMENTO:

Dinheiro:                             R$ 50,00
PIX:                                  R$ 30,50

================================================
         OBRIGADO PELA PREFERÊNCIA!
              VOLTE SEMPRE!
================================================
```

### 6. Controle de Caixa

**Funcionalidades:**
- Abertura de caixa com saldo inicial
- Fechamento de caixa com saldo final
- Registro de todas as movimentações
- Histórico de aberturas/fechamentos
- Relatório de fechamento diário
- Controle de sangrias e suprimentos

### 7. Sistema de Usuários e Permissões

**Perfis:**
- **ADMIN**: Acesso total ao sistema
- **MANAGER**: Acesso a relatórios e gestão (sem configurações)
- **CASHIER**: Acesso apenas ao PDV e vendas

**Funcionalidades:**
- CRUD de usuários (apenas ADMIN)
- Controle de acesso por rota
- Log de auditoria para ações críticas
- Autenticação via JWT
- Sessão persistente (localStorage)

---

## 🔐 AUTENTICAÇÃO E AUTORIZAÇÃO

### Fluxo de Autenticação

1. **Login:**
   ```
   POST /auth/login
   Body: { email, password }
   Response: { token, user }
   ```

2. **Armazenamento:**
   - Token JWT salvo em `localStorage`
   - Dados do usuário salvos em `localStorage`
   - Token enviado em todas as requisições via header `Authorization`

3. **Validação:**
   - Middleware `authenticateToken` valida token em cada requisição
   - Token expira em 7 dias (configurável)
   - Logout automático em caso de token inválido

### Middleware de Autorização

#### **authenticateToken**
- Valida token JWT
- Adiciona `req.user` à requisição
- Retorna 401 se token inválido/expirado

#### **requireRole(roles)**
- Verifica se usuário tem permissão
- Compara `req.user.role` com roles permitidos
- Retorna 403 se sem permissão

### Proteção de Rotas (Frontend)

#### **Middleware `auth.js`**
```javascript
// Protege rotas que requerem autenticação
export default defineNuxtRouteMiddleware((to, from) => {
  const { isLoggedIn } = useAuth()
  if (!isLoggedIn.value) {
    return navigateTo('/login')
  }
})
```

#### **Middleware `admin.js`**
```javascript
// Protege rotas que requerem permissão admin
export default defineNuxtRouteMiddleware((to, from) => {
  const { isAdmin } = useAuth()
  if (!isAdmin.value) {
    return navigateTo('/')
  }
})
```

### Modo de Desenvolvimento

⚠️ **ATENÇÃO**: Em desenvolvimento, a autenticação pode estar desabilitada para facilitar testes. Verifique a flag `AUTH_DISABLED` nos arquivos:
- `backend/src/middleware/auth.js`
- `frontend/composables/useAuth.js`

---

## 🚀 CONFIGURAÇÃO E DEPLOY

### Desenvolvimento Local

#### **Pré-requisitos:**
- Node.js 18+
- Docker e Docker Compose (opcional)
- PostgreSQL 15+ (se não usar Docker)

#### **Com Docker (Recomendado):**

```bash
# Clonar repositório
git clone <repo-url>
cd mercadinho

# Iniciar containers
docker-compose up --build

# Backend: http://localhost:3001
# Frontend: http://localhost:3000
# PostgreSQL: localhost:5433
```

#### **Sem Docker:**

**Backend:**
```bash
cd backend
npm install
cp .env.example .env  # Configurar variáveis
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Produção

#### **Variáveis de Ambiente Necessárias:**

**Backend (.env):**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=chave_secreta_forte
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://seu-frontend.com

# Informações da Loja (para tickets)
STORE_NAME=MEU MERCADINHO
STORE_CNPJ=12.345.678/0001-00
STORE_ADDRESS=Rua Exemplo, 123
STORE_PHONE=(11) 98765-4321
STORE_WEBSITE=www.mercadinho.com.br
```

**Frontend (.env):**
```env
NUXT_PUBLIC_API_BASE=https://seu-backend.com
```

#### **Deploy no EasyPanel:**

1. **Backend:**
   - Build Command: `npm ci && npx prisma generate`
   - Start Command: `npm start`
   - Port: `3001`
   - Adicionar variáveis de ambiente

2. **Frontend:**
   - Build Command: `npm ci && npm run build`
   - Start Command: `node .output/server/index.mjs`
   - Port: `3000`
   - Adicionar variáveis de ambiente

3. **Database:**
   - Criar serviço PostgreSQL
   - Configurar `DATABASE_URL` no backend

4. **Migrations:**
   - Executar no terminal do backend:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

### Scripts Disponíveis

**Backend:**
- `npm start` - Iniciar servidor
- `npm run dev` - Modo desenvolvimento (nodemon)
- `npm test` - Executar testes
- `npm run db:generate` - Gerar Prisma Client
- `npm run db:push` - Aplicar schema ao banco
- `npm run db:seed` - Popular banco com dados iniciais
- `npm run db:reset` - Resetar banco e popular
- `npm run db:baseline` - Baseline de migrations

**Frontend:**
- `npm run dev` - Modo desenvolvimento
- `npm run build` - Build para produção
- `npm run generate` - Gerar site estático
- `npm run preview` - Preview do build

---

## 🔧 VARIÁVEIS DE AMBIENTE

### Backend

| Variável | Obrigatório | Descrição | Exemplo |
|----------|-------------|-----------|----------|
| `NODE_ENV` | Não | Ambiente (development/production) | `production` |
| `PORT` | Não | Porta do servidor | `3001` |
| `DATABASE_URL` | Sim | URL de conexão PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Sim | Chave secreta para JWT | `chave_aleatoria_forte` |
| `JWT_EXPIRES_IN` | Não | Tempo de expiração do token | `7d` |
| `FRONTEND_URL` | Não | URL do frontend (CORS) | `https://frontend.com` |
| `STORE_NAME` | Não | Nome da loja (tickets) | `MEU MERCADINHO` |
| `STORE_CNPJ` | Não | CNPJ da loja (tickets) | `12.345.678/0001-00` |
| `STORE_ADDRESS` | Não | Endereço da loja (tickets) | `Rua Exemplo, 123` |
| `STORE_PHONE` | Não | Telefone da loja (tickets) | `(11) 98765-4321` |
| `STORE_WEBSITE` | Não | Website da loja (tickets) | `www.mercadinho.com.br` |

### Frontend

| Variável | Obrigatório | Descrição | Exemplo |
|----------|-------------|-----------|----------|
| `NUXT_PUBLIC_API_BASE` | Sim | URL base da API | `http://localhost:3001` |

---

## 🔄 FLUXOS PRINCIPAIS

### Fluxo de Venda (PDV)

```
1. Operador acessa /pos
2. Busca produto (nome/SKU/código de barras)
3. Adiciona ao carrinho (useCartStore)
4. Define quantidade e preço
5. Aplica descontos (opcional)
6. Seleciona cliente (opcional)
7. Define formas de pagamento
8. Clica em "Finalizar Venda"
9. Frontend: POST /sales com dados do carrinho
10. Backend:
    - Valida dados
    - Verifica estoque
    - Cria registro de venda (transação)
    - Atualiza estoque dos produtos
    - Cria movimentações de estoque
    - Cria movimentação de caixa
    - Gera ticket térmico
    - Retorna venda criada
11. Frontend:
    - Limpa carrinho
    - Mostra sucesso
    - Opção de imprimir ticket
```

### Fluxo de Compra

```
1. Operador acessa /purchases
2. Seleciona fornecedor
3. Adiciona produtos e quantidades
4. Define custo unitário de cada item
5. Clica em "Registrar Compra"
6. Frontend: POST /purchases
7. Backend:
    - Valida dados
    - Cria registro de compra (transação)
    - Atualiza estoque dos produtos
    - Calcula custo médio
    - Cria movimentações de estoque
    - Retorna compra criada
8. Frontend: Mostra sucesso
```

### Fluxo de Abertura de Caixa

```
1. Operador acessa /cash
2. Clica em "Abrir Caixa"
3. Informa saldo inicial
4. Frontend: POST /cash/open
5. Backend:
    - Verifica se já existe caixa aberto
    - Cria registro de CashRegister
    - Cria movimentação de abertura
    - Retorna caixa aberto
6. Frontend: Atualiza status do caixa
```

### Fluxo de Geração de Relatório

```
1. Operador acessa /reports
2. Seleciona tipo de relatório
3. Define período (se aplicável)
4. Clica em "Gerar Relatório"
5. Frontend: GET /reports/{tipo}?generateFile=true
6. Backend:
    - Busca dados no banco
    - Gera arquivo de texto (mesmo sem dados)
    - Salva arquivo em /reports/
    - Retorna dados + info do arquivo
7. Frontend:
    - Mostra dados na tela
    - Oferece download do arquivo
```

---

## 🔗 INTEGRAÇÕES E SERVIÇOS

### Serviços do Backend

#### **thermalPrinterService.js**
Geração de tickets térmicos:
- Formato ESC/POS
- Suporte 58mm e 80mm
- Configuração via variáveis de ambiente
- Salva arquivo em `backend/tickets/`

#### **reportFileService.js**
Geração de relatórios em arquivo:
- Formato texto (.txt)
- Sempre gera arquivo (mesmo sem dados)
- Salva arquivo em `backend/reports/`
- Limpeza automática de arquivos antigos

#### **cacheService.js**
Sistema de cache:
- Cache de consultas frequentes
- Invalidação automática
- Redução de carga no banco

#### **documentValidation.js**
Validação de documentos:
- Validação de CPF
- Validação de CNPJ
- Formatação automática

### Integrações Futuras

- **Leitor de Código de Barras**: Integração com leitores USB/Bluetooth
- **Impressora Térmica**: Integração direta com impressoras (via driver)
- **Nota Fiscal Eletrônica**: Integração com APIs de emissão de NF-e
- **Gateway de Pagamento**: Integração com gateways (Mercado Pago, PagSeguro)
- **Backup Automático**: Backup automático do banco de dados

---

## 📝 NOTAS IMPORTANTES

### Segurança

- ⚠️ **Nunca** commitar arquivos `.env` no repositório
- ⚠️ **Sempre** usar senhas fortes para `JWT_SECRET`
- ⚠️ **Habilitar** HTTPS em produção
- ⚠️ **Configurar** CORS corretamente para produção
- ⚠️ **Validar** todas as entradas do usuário

### Performance

- Cache implementado para consultas frequentes
- Índices no banco de dados para melhor performance
- Paginação em todas as listagens
- Lazy loading de imagens

### Manutenção

- Logs de auditoria para ações críticas
- Backup regular do banco de dados
- Limpeza automática de arquivos antigos (tickets/relatórios)
- Monitoramento de erros

### Extensibilidade

- Arquitetura modular facilita adição de novas funcionalidades
- Prisma facilita alterações no schema
- API REST facilita integrações
- Frontend componentizado facilita reutilização

---

## 📞 SUPORTE E DOCUMENTAÇÃO ADICIONAL

### Documentação Interna

- `RESUMO_FUNCIONALIDADES.md` - Resumo das funcionalidades
- `IMPLEMENTACOES_CONCLUIDAS.md` - Implementações realizadas
- `TICKETS_E_RELATORIOS.md` - Guia de tickets e relatórios
- `VARIAVEIS_AMBIENTE.md` - Variáveis de ambiente
- `INICIO_RAPIDO.md` - Guia de início rápido
- `CHECKLIST_DEPLOY.md` - Checklist de deploy
- `GUIA_DEPLOY_EASYPANEL.md` - Guia de deploy no EasyPanel

### API Documentation

- Swagger UI: `http://localhost:3001/api-docs`

### Testes

```bash
# Backend
cd backend
npm test

# Testes específicos
node scripts/test-ticket-report.js
```

---

## 🎯 CONCLUSÃO

Este documento fornece uma visão completa do sistema Mercadinho, incluindo:

- ✅ Arquitetura e estrutura do projeto
- ✅ Tecnologias e dependências
- ✅ Modelo de dados completo
- ✅ Endpoints da API
- ✅ Estrutura do frontend
- ✅ Funcionalidades principais
- ✅ Configuração e deploy
- ✅ Fluxos de negócio

Para mais informações específicas, consulte a documentação interna do projeto ou a documentação Swagger da API.

---

**Versão do Documento**: 1.0.0  
**Data**: 2025-01-27  
**Autor**: Sistema Mercadinho

