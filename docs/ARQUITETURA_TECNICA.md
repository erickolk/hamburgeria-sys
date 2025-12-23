# 🏗️ Mercadinho PDV - Arquitetura Técnica

## 📐 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ELECTRON APP                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         MAIN PROCESS                                    │ │
│  │  electron/main.js                                                       │ │
│  │  - Gerencia janela principal                                           │ │
│  │  - Inicia backend Express                                              │ │
│  │  - Aplica migrations automaticamente                                   │ │
│  │  - Cria .env se não existir                                           │ │
│  │  - Serve frontend HTTP local                                           │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                         │
│                    ┌───────────────┴───────────────┐                        │
│                    ▼                               ▼                        │
│  ┌─────────────────────────────┐   ┌─────────────────────────────────────┐ │
│  │     RENDERER PROCESS        │   │         BACKEND PROCESS              │ │
│  │                             │   │                                       │ │
│  │  Nuxt.js SPA (Vue 3)       │   │  Express.js (Node.js)                │ │
│  │  - Interface do usuário    │◄──┤  - API REST                          │ │
│  │  - Tailwind CSS            │   │  - Prisma ORM                        │ │
│  │  - Porta 3000              │   │  - Porta 3001                        │ │
│  │                             │   │                                       │ │
│  └─────────────────────────────┘   └───────────────┬───────────────────────┘ │
│                                                     │                        │
└─────────────────────────────────────────────────────│────────────────────────┘
                                                      │
                                                      ▼
                                    ┌─────────────────────────────────────┐
                                    │         POSTGRESQL LOCAL            │
                                    │                                     │
                                    │  Host: localhost                    │
                                    │  Porta: 5432                        │
                                    │  Banco: mercadinho_local            │
                                    │  Usuário: postgres                  │
                                    │  Senha: postgres123                 │
                                    │                                     │
                                    └─────────────────────────────────────┘
```

---

## 📁 Estrutura de Arquivos

```
mercadinho/
├── electron/
│   ├── main.js              # Processo principal Electron
│   ├── preload.js           # Script de preload (IPC)
│   └── assets/
│       └── icon.png         # Ícone do app
│
├── backend/
│   ├── src/
│   │   ├── server.js        # Servidor Express
│   │   ├── routes/          # Rotas da API
│   │   ├── services/        # Lógica de negócio
│   │   ├── middleware/      # Autenticação, etc
│   │   └── config/          # Swagger, etc
│   ├── prisma/
│   │   ├── schema.prisma    # Modelo do banco
│   │   └── migrations/      # Histórico de alterações
│   └── .env                 # Configurações (criado automaticamente)
│
├── frontend/
│   ├── pages/               # Páginas (Nuxt auto-routing)
│   ├── components/          # Componentes Vue
│   ├── composables/         # Hooks reutilizáveis
│   ├── assets/              # CSS, imagens
│   └── .output/public/      # Build estático (gerado)
│
├── node-portable/           # Node.js embutido para produção
│   ├── node.exe
│   ├── npm.cmd
│   └── npx.cmd
│
├── installer/               # Scripts de instalação
│   ├── install-prerequisites.ps1
│   ├── auto-setup.ps1
│   └── ...
│
├── build/
│   └── installer.nsh        # Script NSIS customizado
│
├── docs/                    # Documentação
│
└── package.json             # Configurações e scripts
```

---

## 🔄 Fluxo de Inicialização (Produção)

```
1. Usuário abre "Mercadinho PDV.exe"
           │
           ▼
2. Electron main.js executa
           │
           ▼
3. Verifica se backend está rodando (porta 3001)
           │
           ├── SIM ──► Pula para passo 8
           │
           ▼
4. Localiza Node.js embutido (node-portable/node.exe)
           │
           ▼
5. Verifica Prisma Client existe
           │
           ├── NÃO ──► Erro: "Prisma Client não encontrado"
           │
           ▼
6. Verifica/Cria arquivo .env
           │
           ▼
7. Aplica migrations (se necessário)
   - Verifica flag: ~/.Mercadinho/.migrations-applied
   - Executa: prisma db push --accept-data-loss
           │
           ▼
8. Inicia backend: node backend/src/server.js
           │
           ▼
9. Aguarda backend responder em /health
           │
           ├── TIMEOUT (120s) ──► Mostra erro
           │
           ▼
10. Inicia servidor HTTP local para frontend (porta 3000)
           │
           ▼
11. Carrega BrowserWindow com http://localhost:3000
           │
           ▼
12. App pronto para uso!
```

---

## 🗄️ Modelo de Dados (Prisma Schema)

### Entidades Principais

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      String   @default("operator")
  is_active Boolean  @default(true)
  // ...
}

model Product {
  id          String   @id @default(cuid())
  name        String
  barcode     String?  @unique
  price       Decimal
  cost_price  Decimal?
  stock       Int      @default(0)
  min_stock   Int      @default(5)
  is_active   Boolean  @default(true)
  category    Category? @relation(...)
  supplier    Supplier? @relation(...)
  // ...
}

model Sale {
  id          String   @id @default(cuid())
  total       Decimal
  payment     String
  status      String   @default("COMPLETED")
  items       SaleItem[]
  customer    Customer? @relation(...)
  // ...
}

model Category { ... }
model Supplier { ... }
model Customer { ... }
model StockMovement { ... }
model CashRegister { ... }
model Purchase { ... }
```

---

## 🔌 API REST (Backend)

### Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Status do backend |
| GET | `/products` | Listar produtos |
| POST | `/products` | Criar produto |
| GET | `/sales` | Listar vendas |
| POST | `/sales` | Registrar venda |
| GET | `/reports/dashboard` | Dados do dashboard |
| GET | `/categories` | Listar categorias |
| GET | `/suppliers` | Listar fornecedores |
| GET | `/customers` | Listar clientes |
| POST | `/cash/open` | Abrir caixa |
| POST | `/cash/close` | Fechar caixa |

### Autenticação
- JWT Token
- Header: `Authorization: Bearer <token>`
- Pode ser desabilitada em dev (AUTH_DISABLED=true)

---

## 📦 Build e Distribuição

### Scripts de Build

```bash
# Build completo (Node portable + Backend + Frontend + Electron)
npm run build:full

# Apenas frontend
npm run build:frontend

# Apenas electron-builder
npm run build:electron
```

### Configuração electron-builder (package.json)

```json
{
  "build": {
    "appId": "com.mercadinho.pdv",
    "productName": "Mercadinho PDV",
    "files": ["electron/**/*", "frontend/.output/**/*"],
    "extraFiles": [
      { "from": "backend", "to": "backend" },
      { "from": "node-portable", "to": "node-portable" },
      { "from": "frontend/.output/public", "to": "frontend/.output/public" }
    ],
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "include": "build/installer.nsh"
    }
  }
}
```

### Saída do Build

```
C:\temp-mercadinho-dist\
├── Mercadinho PDV Setup 1.0.0.exe    # Instalador
├── win-unpacked/                      # Versão descompactada
│   ├── Mercadinho PDV.exe
│   ├── backend/
│   ├── node-portable/
│   ├── frontend/
│   └── resources/
└── *.zip                              # Pacotes de pré-requisitos
```

---

## ⚙️ Configuração (.env)

```env
# Banco de dados
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/mercadinho_local
DATABASE_MODE=local

# Servidor
PORT=3001
NODE_ENV=production

# Sincronização (opcional)
SYNC_ENABLED=false
VPS_API_URL=https://seu-servidor.com/api
SYNC_TOKEN=seu_token_aqui

# Autenticação
JWT_SECRET=mercadinho_jwt_secret_key_2024_production
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=http://localhost:3000
```

---

## 🔐 Segurança

### Configurações Implementadas

1. **CORS**: Configurado para aceitar requisições de localhost
2. **Rate Limiting**: Máximo 100 req/15min por IP
3. **Helmet**: Headers de segurança HTTP
4. **JWT**: Tokens com expiração de 7 dias
5. **Prisma**: Queries parametrizadas (anti SQL injection)

### trust proxy

```javascript
// backend/src/server.js
app.set('trust proxy', false);  // Importante para rate limiting
```

---

## 📊 Logs

### Localização
```
Windows: C:\Users\[USUARIO]\Mercadinho\logs\
Arquivo: app-YYYY-MM-DD.log
```

### Formato
```
[2025-12-09T14:36:04.337Z] [INFO] ⚡ Mercadinho PDV - Electron iniciado
[2025-12-09T14:36:04.340Z] [INFO] 📊 Modo: PRODUÇÃO
[2025-12-09T14:36:06.544Z] [INFO] ✅ Prisma Client encontrado
[2025-12-09T14:36:25.509Z] [INFO] [Backend] 🚀 Servidor rodando na porta 3001
```

### Atalhos de Debug
- `F12` - Abrir DevTools
- `Ctrl+Shift+I` - Abrir DevTools (alternativo)
- `Ctrl+Shift+L` - Abrir pasta de logs
- `Ctrl+R` - Recarregar página

---

## 🔄 Sincronização (Offline-First)

### Comportamento

1. **Sempre usa banco local** como fonte primária
2. **Se SYNC_ENABLED=true**:
   - Tenta enviar dados para VPS periodicamente
   - Mantém fila de operações pendentes
   - Resolve conflitos automaticamente

### Tabelas de Sincronização

```prisma
model SyncQueue {
  id        String   @id @default(cuid())
  entity    String   // "sale", "product", etc
  action    String   // "create", "update", "delete"
  data      Json
  status    String   @default("pending")
  attempts  Int      @default(0)
  // ...
}
```

---

## 🐛 Debug e Troubleshooting

### Comandos Úteis

```powershell
# Verificar PostgreSQL
Get-Service postgresql*

# Logs do app
Get-Content "$env:USERPROFILE\Mercadinho\logs\app-$(Get-Date -Format 'yyyy-MM-dd').log" -Tail 50

# Recriar migrations
cd "$env:LOCALAPPDATA\Programs\Mercadinho PDV\backend"
$env:DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/mercadinho_local"
npx prisma db push --force-reset

# Verificar instalação
Test-Path "$env:LOCALAPPDATA\Programs\Mercadinho PDV\backend\src\server.js"
Test-Path "$env:LOCALAPPDATA\Programs\Mercadinho PDV\node-portable\node.exe"
```

---

## 📚 Tecnologias Utilizadas

| Componente | Tecnologia | Versão |
|------------|------------|--------|
| Desktop | Electron | 28.3.3 |
| Frontend | Nuxt.js | 3.20.1 |
| UI Framework | Vue.js | 3.5.24 |
| CSS | Tailwind CSS | 3.x |
| Backend | Express.js | 4.x |
| ORM | Prisma | 5.22.0 |
| Banco de Dados | PostgreSQL | 15.x |
| Runtime | Node.js | 20.11.0 |
| Build | electron-builder | 24.x |

---

*Documentação técnica - Dezembro 2025*


