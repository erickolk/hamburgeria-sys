# Painel Admin - Mercadinho SaaS

Painel de administração para gerenciamento de licenças das empresas parceiras.

## Funcionalidades

- **Dashboard** com visão geral das licenças
- **Listar** todas as licenças com filtros
- **Criar** novas licenças para empresas
- **Renovar** licenças (adicionar meses)
- **Suspender** licenças (inadimplência)
- **Reativar** licenças suspensas

## Instalação

```bash
cd painel-admin
npm install
```

## Configuração

Crie um arquivo `.env` com a URL da API:

```env
API_BASE_URL=http://sua-vps.com:3001
```

## Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:4000

## Build para Produção

```bash
npm run build
npm run start
```

## Acesso

Use as mesmas credenciais de um usuário **ADMIN** do sistema principal.

- E-mail: admin@mercadinho.com
- Senha: 123456

## Estrutura

```
painel-admin/
├── assets/
│   └── css/main.css
├── composables/
│   ├── useAdminAuth.js    # Autenticação
│   ├── useApi.js          # Chamadas HTTP
│   └── useLicenses.js     # Gerenciamento de licenças
├── layouts/
│   └── default.vue
├── middleware/
│   └── auth.js
├── pages/
│   ├── index.vue          # Dashboard
│   ├── login.vue          # Login
│   └── licenses/
│       ├── index.vue      # Lista de licenças
│       ├── new.vue        # Nova licença
│       └── [id].vue       # Detalhes da licença
├── nuxt.config.ts
└── package.json
```

