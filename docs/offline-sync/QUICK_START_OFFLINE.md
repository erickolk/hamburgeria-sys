# ⚡ Quick Start: Ativar Modo Offline

> **Guia rápido para colocar o sistema em modo offline em 10 minutos**

---

## 🚀 PARA CLIENTES FINAIS: Use o Instalador Automático!

**Não precisa fazer nada manualmente!** Execute o instalador:

```powershell
# Executar como Administrador
.\installer\install.ps1
```

O instalador configura **TUDO** automaticamente:
- ✅ PostgreSQL (se necessário)
- ✅ Banco de dados
- ✅ Configurações
- ✅ Migrations
- ✅ Backup automático

**Mais detalhes**: [INSTALADOR_AUTOMATICO.md](INSTALADOR_AUTOMATICO.md)

---

## 👨‍💻 PARA DESENVOLVEDORES: Configuração Manual

---

## 🚀 Passos Rápidos

### 1️⃣ Instalar PostgreSQL Local

```powershell
# Windows - via winget (mais rápido)
winget install PostgreSQL.PostgreSQL.15

# Ou baixar: https://www.postgresql.org/download/
```

### 2️⃣ Criar Banco de Dados

```powershell
psql -U postgres
```

```sql
CREATE DATABASE mercadinho_local;
\q
```

### 3️⃣ Configurar Backend

Criar/editar `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/mercadinho_local"
DATABASE_MODE=local
SYNC_ENABLED=true
VPS_API_URL=https://seu-servidor.com/api
PORT=3001
```

### 4️⃣ Aplicar Migrations

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
```

Ou aplicar SQL diretamente:

```bash
psql -U postgres -d mercadinho_local -f prisma/migrations/20251203_add_offline_sync/migration.sql
```

### 5️⃣ Configurar Electron

Editar `electron/main.js` ou definir variável:

```powershell
$env:DATABASE_MODE="local"
```

### 6️⃣ Iniciar Sistema

```powershell
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Electron
npm run electron
```

### 7️⃣ Configurar Sincronização

Acesse: `http://localhost:3000/settings/sync`

- **URL da VPS**: `https://seu-servidor.com/api`
- **Token**: (gerar JWT na VPS)
- **Intervalo**: `60000` (1 minuto)
- ✅ **Habilitar**

### 8️⃣ Configurar Backup

```powershell
# Executar como Administrador
cd backend/scripts
.\setup-backup-task.ps1
```

---

## ✅ Verificar se Funciona

### Teste 1: Venda Offline

1. **Desconecte** a internet
2. Faça uma venda no PDV
3. ✅ Deve funcionar normalmente

### Teste 2: Sincronização

1. **Reconecte** a internet
2. Acesse Dashboard → Card Sincronização
3. Clique "Sincronizar Agora"
4. ✅ Status deve mudar para "Sincronizado"

### Teste 3: Backup

```powershell
.\backend\scripts\backup-local.ps1
```

✅ Arquivo criado em `C:\Backups\Mercadinho\`

---

## 🎯 Pronto!

Sistema agora opera 100% offline e sincroniza automaticamente! 🎉

**Próximos passos:**
- Ler [documentação completa](OFFLINE_SYNC_SETUP.md)
- Configurar backup automático
- Testar em produção

---

**Problemas?** Veja [Troubleshooting](OFFLINE_SYNC_SETUP.md#-troubleshooting)

