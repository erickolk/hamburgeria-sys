# 🏪 Sistema Mercadinho - Gestão Completa para Pequenos Mercados

Sistema completo de gestão para pequenos mercados e estabelecimentos comerciais, com PDV, controle de estoque, gestão de clientes e fornecedores, relatórios, controle de caixa e muito mais.

## 📋 Índice

- [Características](#-características)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Início Rápido](#-início-rápido)
- [Documentação](#-documentação)
- [Funcionalidades](#-funcionalidades)
- [Deploy](#-deploy)
- [Contribuindo](#-contribuindo)

## ✨ Características

- ✅ **PDV Completo**: Sistema de vendas com múltiplas formas de pagamento
- ✅ **Controle de Estoque**: Gestão automática com alertas de estoque baixo
- ✅ **Gestão de Clientes e Fornecedores**: CRUD completo com histórico
- ✅ **Relatórios**: Vendas, produtos mais vendidos, estoque, fluxo de caixa
- ✅ **Tickets Térmicos**: Geração automática de cupons para impressora térmica
- ✅ **Controle de Caixa**: Abertura/fechamento de caixa com movimentações
- ✅ **Sistema de Usuários**: Perfis de acesso (Admin, Gerente, Caixa)
- ✅ **Auditoria**: Log de todas as ações críticas

## 🛠️ Tecnologias

### Backend
- Node.js + Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Swagger/OpenAPI

### Frontend
- Nuxt 3
- Vue 3
- TailwindCSS
- Pinia (State Management)

### DevOps
- Docker & Docker Compose

## 📁 Estrutura do Projeto

```
mercadinho/
├── backend/          # API REST (Node.js/Express)
├── frontend/         # Interface (Nuxt 3)
├── docker-compose.yml
└── README.md
```

## 🖥️ Versão Desktop (Electron)

O sistema também está disponível como aplicativo desktop Electron!

📖 **[Electron Setup](docs/electron/ELECTRON_SETUP.md)** - Guia completo de setup  
⚡ **[Electron Quick Start](docs/electron/ELECTRON_QUICKSTART.md)** - Início rápido

**Características:**
- ✅ Execução standalone sem navegador
- ✅ Integração de hardware (impressora térmica, leitor de código de barras)
- ✅ Distribuição fácil para múltiplos caixas
- ✅ Todas as funcionalidades web mantidas
- ✅ **Modo Offline-First** - Funciona 100% sem internet

---

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- Docker e Docker Compose (opcional)
- PostgreSQL 15+ (se não usar Docker)

### Com Docker (Recomendado)

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

### Sem Docker

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

## 📚 Documentação

> **📁 Documentação completa organizada em [`docs/`](docs/)**

### 🎯 Índice Principal

**[📚 Documentação Completa](docs/README.md)** - Navegue por todas as categorias

### 🚀 Início Rápido

- **[Instalação Automática](docs/instalacao/INSTALADOR_AUTOMATICO.md)** ⭐ - Instalador que configura tudo
- **[Quick Start Offline](docs/offline-sync/QUICK_START_OFFLINE.md)** - Ativar modo offline
- **[Início Rápido](docs/desenvolvimento/INICIO_RAPIDO.md)** - Configuração do ambiente

### 📖 Principais Categorias

- **[Sistema Offline-First](docs/offline-sync/)** - Operação offline com sincronização
- **[Electron Desktop](docs/electron/)** - Aplicativo desktop
- **[Instalação e Setup](docs/instalacao/)** - Guias de instalação
- **[Desenvolvimento](docs/desenvolvimento/)** - Implementações e melhorias
- **[Deploy](docs/deploy/)** - Deploy e produção
- **[Troubleshooting](docs/troubleshooting/)** - Soluções de problemas

### 📋 Documentação Específica

- **[Documentação Completa](docs/desenvolvimento/DOCUMENTACAO_COMPLETA.md)** - Documentação técnica completa
- **[Resumo de Funcionalidades](docs/desenvolvimento/RESUMO_FUNCIONALIDADES.md)** - Funcionalidades do sistema
- **[Tickets e Relatórios](docs/backend/TICKETS_E_RELATORIOS.md)** - Sistema de tickets
- **[Variáveis de Ambiente](docs/backend/VARIAVEIS_AMBIENTE.md)** - Configurações
- **[Checklist Deploy](docs/checklists/CHECKLIST_DEPLOY.md)** - Checklist antes de deploy

> **💡 Dica**: Veja a [estrutura completa](ESTRUTURA_DOCS.md) para entender a organização

### API Documentation

A documentação Swagger da API está disponível em:
```
http://localhost:3001/api-docs
```

## 🎯 Funcionalidades

### PDV (Ponto de Venda)
- Busca rápida de produtos (nome, SKU, código de barras)
- Carrinho de compras
- Múltiplas formas de pagamento (Dinheiro, Cartão, PIX, Fiado)
- Descontos por item ou total
- Geração automática de tickets térmicos

### Controle de Estoque
- Atualização automática em vendas e compras
- Alertas de estoque baixo
- Ajustes manuais com justificativa
- Rastreamento de lotes (opcional)
- Suporte a múltiplas unidades (UN, KG, LT, etc.)

### Gestão de Clientes e Fornecedores
- Cadastro completo com endereço
- Validação de CPF/CNPJ
- Histórico de compras
- Status ativo/inativo

### Relatórios
- Vendas por período
- Produtos mais vendidos
- Estoque baixo
- Fluxo de caixa
- **Sempre gera arquivo** (mesmo sem dados)

### Tickets Térmicos
- Geração automática a cada venda
- Formato ESC/POS (58mm e 80mm)
- Reimpressão de tickets antigos
- Download de arquivo

### Controle de Caixa
- Abertura/fechamento de caixa
- Registro de movimentações
- Relatório de fechamento diário

## 🚀 Deploy

### Variáveis de Ambiente

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
```

**Frontend (.env):**
```env
NUXT_PUBLIC_API_BASE=https://seu-backend.com
```

### Deploy no EasyPanel

Consulte o guia completo: **[Guia Deploy EasyPanel](docs/deploy/GUIA_DEPLOY_EASYPANEL.md)**

## 🧪 Testes

```bash
# Backend
cd backend
npm test

# Testes específicos
node scripts/test-ticket-report.js
```

## 📝 Scripts Disponíveis

### Backend
- `npm start` - Iniciar servidor
- `npm run dev` - Modo desenvolvimento
- `npm test` - Executar testes
- `npm run db:generate` - Gerar Prisma Client
- `npm run db:push` - Aplicar schema ao banco
- `npm run db:seed` - Popular banco com dados iniciais

### Frontend
- `npm run dev` - Modo desenvolvimento
- `npm run build` - Build para produção
- `npm run generate` - Gerar site estático

## 🔐 Segurança

- Autenticação JWT
- Validação de dados em todas as rotas
- Hash de senha com bcrypt
- Rate limiting
- CORS configurado
- Helmet para segurança HTTP

## 📞 Suporte

Para mais informações, consulte:

- **[📚 Documentação Completa](docs/README.md)** - Índice principal
- **[🐛 Troubleshooting](docs/troubleshooting/README.md)** - Soluções de problemas
- **[💻 Documentação Técnica](docs/desenvolvimento/DOCUMENTACAO_COMPLETA.md)** - Detalhes técnicos

## 📄 Licença

MIT

---

**Desenvolvido para Mercadinho - Sistema de Gestão**  
**Versão**: 1.0.0

