# 🖥️ Guia de Setup - Electron Desktop App

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Pré-requisitos](#pré-requisitos)
4. [Instalação](#instalação)
5. [Desenvolvimento](#desenvolvimento)
6. [Build de Produção](#build-de-produção)
7. [Integração de Hardware](#integração-de-hardware)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

---

## 🎯 Visão Geral

O sistema Mercadinho foi migrado para uma aplicação desktop usando **Electron**, permitindo:

- ✅ Execução standalone sem navegador
- ✅ Integração de hardware (impressora térmica, leitor de código de barras)
- ✅ Distribuição fácil para múltiplos caixas
- ✅ Todas as funcionalidades web mantidas

### Arquitetura

```
┌─────────────────────────────────────────┐
│         Electron Main Process            │
│  ┌───────────────────────────────────┐  │
│  │  Backend Express (child process)  │  │
│  │  Porta: 3001                     │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  BrowserWindow (Renderer)         │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  Nuxt 3 (SPA Mode)           │  │  │
│  │  │  Frontend compilado           │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  IPC Handlers                      │  │
│  │  - Impressora térmica             │  │
│  │  - Leitor código de barras        │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 📁 Estrutura do Projeto

```
mercadinho/
├── backend/              # Backend Express (sem mudanças)
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   └── services/
│   └── prisma/
│
├── frontend/             # Nuxt 3 (modo SPA)
│   ├── pages/
│   ├── composables/
│   ├── stores/
│   └── nuxt.config.ts   # Ajustado para SPA
│
├── electron/             # 🆕 Código Electron
│   ├── main.js           # Main process
│   ├── preload.js        # Preload script
│   ├── ipc/              # IPC handlers
│   │   ├── printer.js    # Impressora térmica
│   │   └── barcode.js    # Leitor código barras
│   └── assets/           # Ícones e recursos
│
├── package.json          # 🆕 Scripts e dependências Electron
└── .gitignore
```

---

## 📦 Pré-requisitos

### Obrigatórios

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 15+ (banco de dados)
- **npm** ou **yarn**

### Opcionais (para build)

- **Windows SDK** (para build Windows)
- **Visual Studio Build Tools** (para dependências nativas)

### Verificar Instalação

```bash
node --version    # Deve ser 18+
npm --version     # Deve ser 9+
psql --version    # PostgreSQL instalado
```

---

## 🚀 Instalação

### 1. Instalar Dependências

Na raiz do projeto:

```bash
npm install
```

Este comando instala:
- Dependências do Electron
- Dependências do backend
- Dependências do frontend

### 2. Configurar Backend

```bash
cd backend
cp .env.example .env  # Se existir
```

Edite `.env` e configure:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/mercadinho
JWT_SECRET=sua_chave_secreta_forte
PORT=3001
NODE_ENV=development
```

### 3. Configurar Banco de Dados

```bash
cd backend
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Verificar Instalação

```bash
# Testar backend
cd backend
npm run dev
# Deve iniciar em http://localhost:3001

# Testar frontend (em outro terminal)
cd frontend
npm run dev
# Deve iniciar em http://localhost:3000
```

---

## 💻 Desenvolvimento

### Modo Desenvolvimento Completo

Inicia backend, frontend e Electron simultaneamente:

```bash
npm run dev
```

**O que acontece:**
1. Backend inicia em `http://localhost:3001`
2. Frontend inicia em `http://localhost:3000`
3. Aguarda frontend estar pronto
4. Abre janela Electron apontando para `http://localhost:3000`

### Modo Desenvolvimento Parcial

#### Apenas Electron (backend/frontend já rodando)

```bash
npm run dev:electron-only
```

#### Apenas Backend

```bash
npm run dev:backend
```

#### Apenas Frontend

```bash
npm run dev:frontend
```

### Hot Reload

- **Frontend**: Hot reload automático (Nuxt dev server)
- **Backend**: Hot reload com nodemon
- **Electron**: Recarregar janela com `Ctrl+R` ou `Cmd+R`

### DevTools

O DevTools do Electron abre automaticamente em desenvolvimento. Use:
- `Ctrl+Shift+I` (Windows/Linux)
- `Cmd+Option+I` (macOS)

---

## 📦 Build de Produção

### Build Completo

```bash
npm run build
```

**O que acontece:**
1. Compila frontend Nuxt (SPA)
2. Empacota com Electron Builder
3. Gera instalador em `dist/`

### Build Apenas Frontend

```bash
npm run build:frontend
```

### Build Apenas Electron

```bash
npm run build:electron
```

### Build por Plataforma

#### Windows

```bash
npm run build:electron:win
```

Gera: `dist/Mercadinho-PDV-Setup-1.0.0.exe`

#### Linux

```bash
electron-builder --linux
```

Gera: `dist/Mercadinho-PDV-1.0.0.AppImage`

#### macOS

```bash
electron-builder --mac
```

Gera: `dist/Mercadinho-PDV-1.0.0.dmg`

### Build de Diretório (sem instalador)

```bash
npm run build:electron:dir
```

Útil para testar o app empacotado sem criar instalador.

### Localização dos Arquivos Gerados

```
dist/
├── Mercadinho-PDV-Setup-1.0.0.exe    # Instalador Windows
├── win-unpacked/                      # App descompactado
│   ├── Mercadinho PDV.exe
│   ├── resources/
│   │   ├── app/
│   │   │   ├── electron/
│   │   │   ├── backend/
│   │   │   └── frontend/
│   │   └── backend/                   # Backend empacotado
│   └── ...
└── ...
```

---

## 🔌 Integração de Hardware

### Impressora Térmica

#### Uso no Frontend (Nuxt)

```javascript
// Em qualquer componente Vue
const printTicket = async (saleId) => {
  if (window.electronAPI) {
    const result = await window.electronAPI.printThermal({ saleId });
    if (result.success) {
      console.log('Ticket gerado:', result.filename);
    } else {
      console.error('Erro:', result.error);
    }
  } else {
    // Fallback para web: usar API REST
    const response = await $fetch(`/api/sales/${saleId}/ticket`);
  }
};
```

#### API Electron

```javascript
// window.electronAPI.printThermal(ticketData)
// ticketData pode ser:
// - { saleId: 'abc123' } - Busca venda no banco
// - { sale: {...} } - Dados completos da venda
```

#### Configuração da Impressora

Por enquanto, o sistema gera arquivo `.txt` em formato ESC/POS. Para impressão direta:

1. **Método 1: Copiar arquivo para impressora**
   ```bash
   # Windows PowerShell
   Get-Content "backend\tickets\venda_*.txt" | Out-Printer -Name "SUA_IMPRESSORA"
   ```

2. **Método 2: Integração futura com node-escpos**
   - Será implementado no `electron/ipc/printer.js`
   - Suportará USB, Serial, Network

### Leitor de Código de Barras

#### HID Keyboard Emulation (Recomendado)

A maioria dos leitores funciona como teclado HID, então **funciona automaticamente**:

1. Configure o leitor para modo "HID Keyboard"
2. Aponte para o campo de busca do PDV
3. Leia o código de barras
4. O código aparece automaticamente no campo

#### Auto-focus no Campo de Busca

No componente PDV (`frontend/pages/pos.vue`), adicione:

```vue
<template>
  <input
    ref="searchInput"
    v-model="searchQuery"
    @focus="handleBarcodeInput"
    autofocus
  />
</template>

<script setup>
const searchInput = ref(null);

onMounted(() => {
  // Focar campo de busca ao carregar
  searchInput.value?.focus();
});

// Detectar quando código de barras foi lido
// Leitores HID geralmente enviam Enter após o código
const handleBarcodeInput = (event) => {
  // Lógica de busca automática
};
</script>
```

#### Integração USB Direta (Futuro)

Para leitores que não funcionam como HID:

```javascript
// Em desenvolvimento
const result = await window.electronAPI.readBarcode();
```

---

## 🐛 Troubleshooting

### Backend não inicia

**Sintoma:** Electron mostra erro "Backend não está acessível"

**Soluções:**

1. Verificar se PostgreSQL está rodando:
   ```bash
   # Windows
   Get-Service postgresql*

   # Linux
   sudo systemctl status postgresql
   ```

2. Verificar `DATABASE_URL` no `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/mercadinho
   ```

3. Verificar logs do backend:
   - Em desenvolvimento: console do terminal
   - Em produção: logs do Electron (DevTools)

4. Testar backend manualmente:
   ```bash
   cd backend
   npm start
   # Acessar http://localhost:3001/health
   ```

### Frontend não carrega

**Sintoma:** Janela Electron fica em branco

**Soluções:**

1. Verificar se frontend está rodando:
   ```bash
   cd frontend
   npm run dev
   # Acessar http://localhost:3000
   ```

2. Verificar build do frontend:
   ```bash
   cd frontend
   npm run build
   ```

3. Verificar console do Electron (DevTools):
   - `Ctrl+Shift+I` para abrir
   - Verificar erros no console

### Erro "Cannot find module"

**Sintoma:** Erro ao iniciar Electron

**Soluções:**

1. Reinstalar dependências:
   ```bash
   rm -rf node_modules backend/node_modules frontend/node_modules
   npm install
   ```

2. Verificar se todos os módulos foram instalados:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

### Build falha

**Sintoma:** `electron-builder` retorna erro

**Soluções:**

1. Verificar se frontend foi buildado:
   ```bash
   npm run build:frontend
   ```

2. Verificar espaço em disco (build precisa de ~500MB)

3. Limpar build anterior:
   ```bash
   rm -rf dist/
   npm run build
   ```

4. Verificar dependências nativas:
   ```bash
   # Windows: Instalar Visual Studio Build Tools
   # Linux: Instalar build-essential
   ```

### Impressora não funciona

**Sintoma:** Ticket não é impresso

**Soluções:**

1. Verificar se arquivo foi gerado:
   ```bash
   ls backend/tickets/
   ```

2. Testar impressão manual:
   ```bash
   # Windows
   type backend\tickets\venda_*.txt > PRN
   ```

3. Verificar permissões:
   - Electron pode precisar de permissões para acessar USB/Serial
   - Windows: Executar como administrador (se necessário)

### Leitor de código de barras não funciona

**Sintoma:** Código não aparece no campo de busca

**Soluções:**

1. Verificar configuração do leitor:
   - Deve estar em modo "HID Keyboard"
   - Não deve ter sufixo/sufixo configurado (ou configurar Enter)

2. Verificar foco do campo:
   - Campo de busca deve estar focado
   - Adicionar `autofocus` no input

3. Testar em aplicativo simples:
   - Abrir Bloco de Notas
   - Ler código de barras
   - Se funcionar, problema é no frontend

---

## ❓ FAQ

### Posso usar o backend externo?

Sim! Configure no `electron/main.js`:

```javascript
// Desabilitar auto-start do backend
if (process.env.USE_EXTERNAL_BACKEND === 'true') {
  // Não iniciar backend
} else {
  startBackend();
}
```

E defina `USE_EXTERNAL_BACKEND=true` no ambiente.

### Como adicionar ícone customizado?

1. Coloque os ícones em `electron/assets/`:
   - `icon.png` (512x512) - Linux/macOS
   - `icon.ico` (256x256) - Windows
   - `icon.icns` - macOS

2. Rebuild:
   ```bash
   npm run build
   ```

### Como atualizar o app automaticamente?

Implementar `electron-updater` (futuro):

```javascript
const { autoUpdater } = require('electron-updater');
autoUpdater.checkForUpdatesAndNotify();
```

### Posso usar SQLite em vez de PostgreSQL?

Sim, mas requer alterações:

1. Alterar `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./mercadinho.db"
   }
   ```

2. Regerar Prisma:
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

### Como debugar em produção?

1. Habilitar DevTools no build:
   ```javascript
   // electron/main.js
   if (process.env.DEBUG === 'true') {
     mainWindow.webContents.openDevTools();
   }
   ```

2. Executar com flag:
   ```bash
   DEBUG=true ./Mercadinho\ PDV.exe
   ```

### O app precisa de internet?

Não! O app funciona completamente offline:
- Backend roda localmente
- Frontend é SPA estático
- Banco PostgreSQL pode ser local

Internet é necessária apenas para:
- Atualizações automáticas (futuro)
- Sincronização com servidor central (futuro)

---

## 📚 Referências

- [Documentação Electron](https://www.electronjs.org/docs)
- [Documentação Nuxt 3](https://nuxt.com/docs)
- [Documentação electron-builder](https://www.electron.build/)
- [Documentação Prisma](https://www.prisma.io/docs)

---

## 🎯 Checklist de Validação

Antes de distribuir, validar:

- [ ] Backend inicia automaticamente
- [ ] Frontend Nuxt carrega corretamente
- [ ] Login funciona (JWT)
- [ ] PDV carrega produtos
- [ ] Venda finaliza e atualiza estoque
- [ ] Impressão térmica via IPC funciona
- [ ] Leitor código de barras funciona (HID)
- [ ] Aplicativo fecha corretamente (mata backend)
- [ ] Build gera .exe instalável
- [ ] Instalador funciona em máquina limpa
- [ ] App funciona sem internet

---

**Versão:** 1.0.0  
**Data:** 2025-01-27  
**Autor:** Sistema Mercadinho

