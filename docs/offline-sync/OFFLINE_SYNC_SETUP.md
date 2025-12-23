# 🔄 Guia Completo: Sistema Offline-First com Sincronização

> **Sistema de PDV com operação 100% offline e sincronização automática**

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Instalação e Configuração](#-instalação-e-configuração)
3. [Modo de Operação](#-modos-de-operação)
4. [Sincronização](#-sincronização)
5. [Backup e Restauração](#-backup-e-restauração)
6. [Resolução de Conflitos](#-resolução-de-conflitos)
7. [Troubleshooting](#-troubleshooting)
8. [FAQ](#-perguntas-frequentes)

---

## 🎯 Visão Geral

### Arquitetura

```
┌─────────────────────┐         ┌──────────────────┐
│   Electron App      │  WiFi   │  PostgreSQL VPS  │
│   (PDV Local)       │◄───────►│  (Backup Remoto) │
│                     │         │                  │
│  ┌──────────────┐   │         └──────────────────┘
│  │ PostgreSQL   │   │
│  │ LOCAL        │   │         Sincronização
│  │ (Principal)  │   │         Automática
│  └──────────────┘   │         a cada 1 minuto
└─────────────────────┘
```

### Principais Funcionalidades

✅ **Operação 100% Offline**: Sistema funciona sem internet  
✅ **Sincronização Automática**: Dados enviados quando há conexão  
✅ **Fila Inteligente**: Retry automático em caso de falha  
✅ **Backup Diário**: Backup local automático  
✅ **Resolução de Conflitos**: Tratamento de estoque negativo e outros conflitos  
✅ **Dashboard de Monitoramento**: Interface visual do status de sincronização

---

## 🚀 Instalação e Configuração

### Pré-requisitos

- **PostgreSQL 15+** instalado localmente
- **Node.js 18+**
- **Windows 10/11** (para scripts PowerShell)

### Passo 1: Instalar PostgreSQL Local

#### Opção A: PostgreSQL (Recomendado para múltiplos caixas)

```powershell
# Instalar via winget
winget install PostgreSQL.PostgreSQL.15

# Ou baixar de: https://www.postgresql.org/download/windows/
```

**Configurar banco:**

```powershell
# Abrir psql
psql -U postgres

# Criar banco de dados
CREATE DATABASE mercadinho_local;

# Criar usuário (opcional)
CREATE USER mercadinho WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE mercadinho_local TO mercadinho;

# Sair
\q
```

#### Opção B: SQLite (Para 1 caixa apenas - mais simples)

Não requer instalação. O arquivo será criado automaticamente.

### Passo 2: Configurar Variáveis de Ambiente

Criar arquivo `.env` na pasta `backend/`:

```env
# Banco de Dados Local
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/mercadinho_local"

# Ou para SQLite:
# DATABASE_URL="file:./mercadinho.db"

# Modo de banco de dados
DATABASE_MODE=local

# Sincronização
SYNC_ENABLED=true
VPS_API_URL=https://seu-servidor.com/api

# Porta
PORT=3001

# JWT Secret
JWT_SECRET=seu_jwt_secret_aqui
```

### Passo 3: Aplicar Migrations

```bash
cd backend

# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Aplicar migrations
npx prisma migrate deploy

# Ou aplicar SQL diretamente
psql -U postgres -d mercadinho_local -f prisma/migrations/20251203_add_offline_sync/migration.sql
```

### Passo 4: Configurar Sincronização

**Via Interface Web:**

1. Acesse: `http://localhost:3000/settings/sync`
2. Configure:
   - **URL da VPS**: `https://seu-servidor.com/api`
   - **Token de Sincronização**: (gerar token JWT na VPS)
   - **Intervalo**: `60000` (1 minuto em ms)
   - **Habilitado**: ✅

**Via SQL Direto:**

```sql
INSERT INTO sync_config (id, vps_api_url, sync_token, sync_interval, is_enabled, updated_at)
VALUES (
  'default',
  'https://seu-servidor.com/api',
  'seu_token_jwt_aqui',
  60000,
  true,
  NOW()
);
```

### Passo 5: Configurar Electron

Editar `electron/main.js` ou definir variável de ambiente:

```bash
# Windows
$env:DATABASE_MODE="local"

# Linux/Mac
export DATABASE_MODE=local
```

### Passo 6: Configurar Backup Automático

```powershell
# Executar como Administrador
cd backend/scripts

# Configurar tarefa agendada (backup diário às 23h)
.\setup-backup-task.ps1

# Testar backup manual
.\backup-local.ps1
```

---

## 🎮 Modos de Operação

### Modo 1: Local com Sincronização (Recomendado)

```bash
DATABASE_MODE=local
SYNC_ENABLED=true
```

- ✅ Funciona offline
- ✅ Sincroniza automaticamente quando online
- ✅ Melhor para PDV

### Modo 2: Somente Local (Sem sincronização)

```bash
DATABASE_MODE=local
SYNC_ENABLED=false
```

- ✅ Funciona offline
- ❌ Sem sincronização automática
- 📌 Útil para testes

### Modo 3: VPS Online (Modo legado)

```bash
DATABASE_MODE=vps
DATABASE_URL=<url_vps>
```

- ❌ Depende de internet
- ✅ Dados centralizados
- 📌 Não recomendado para PDV

---

## 🔄 Sincronização

### Como Funciona

```
┌─────────────────────────────────────────────────────┐
│                CICLO DE SINCRONIZAÇÃO               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1️⃣  Verificar Conexão                             │
│       ↓                                             │
│  2️⃣  UPLOAD (Local → VPS)                          │
│       • Vendas não sincronizadas                   │
│       • Movimentações de estoque                   │
│       • Abertura/Fechamento de caixa               │
│       ↓                                             │
│  3️⃣  DOWNLOAD (VPS → Local)                        │
│       • Produtos atualizados                       │
│       • Preços alterados                           │
│       • Novos clientes                             │
│       ↓                                             │
│  4️⃣  Processar Fila de Retry                       │
│       • Tentar novamente itens com erro            │
│       ↓                                             │
│  5️⃣  Atualizar Logs                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Sincronização Manual

```bash
# Via API
curl -X POST http://localhost:3001/sync/trigger \
  -H "Authorization: Bearer YOUR_TOKEN"

# Via Interface
# Acessar: Dashboard → Card de Sincronização → "Sincronizar Agora"
```

### Verificar Status

```bash
# Via API
curl http://localhost:3001/sync/status \
  -H "Authorization: Bearer YOUR_TOKEN"

# Resposta:
{
  "online": true,
  "syncing": false,
  "enabled": true,
  "pending": {
    "sales": 5,
    "queue": 2,
    "failed": 0
  },
  "lastSync": "2025-12-03T15:30:00.000Z"
}
```

### Ver Logs de Sincronização

```bash
# Via API
curl http://localhost:3001/sync/logs?limit=20

# Via SQL
SELECT * FROM sync_logs 
ORDER BY timestamp DESC 
LIMIT 20;
```

---

## 💾 Backup e Restauração

### Backup Manual

```powershell
# Executar backup
.\backend\scripts\backup-local.ps1

# Com parâmetros personalizados
.\backend\scripts\backup-local.ps1 -RetentionDays 60 -BackupDir "D:\Backups"
```

### Backup Automático

```powershell
# Configurar (requer Admin)
.\backend\scripts\setup-backup-task.ps1

# Verificar tarefa
Get-ScheduledTask -TaskName "Backup Mercadinho PDV"

# Executar manualmente
Start-ScheduledTask -TaskName "Backup Mercadinho PDV"
```

### Restaurar Backup

```powershell
# Restaurar
.\backend\scripts\restore-backup.ps1 -BackupFile "C:\Backups\Mercadinho\mercadinho_20251203_120000.backup"

# Com confirmação automática
.\backend\scripts\restore-backup.ps1 -BackupFile "backup.backup" -Force
```

### Backups - Boas Práticas

✅ **Manter 30 dias localmente**  
✅ **Copiar backups mensais para nuvem**  
✅ **Testar restauração mensalmente**  
✅ **Verificar espaço em disco semanalmente**

---

## ⚔️ Resolução de Conflitos

### Tipos de Conflitos

#### 1. Estoque Negativo

**Cenário**: Dois caixas offline vendem o mesmo produto

**Resolução**:
- ✅ **Permite** a sincronização
- 🚨 **Cria alerta** para gerente
- 📝 **Registra** em auditoria

```javascript
// Verificar alertas
GET /sync/alerts

// Marcar como revisado
POST /sync/alerts/{id}/review
{
  "notes": "Corrigido manualmente no estoque"
}
```

#### 2. Conflito de Preço

**Cenário**: Preço alterado na VPS durante venda offline

**Resolução**:
- ✅ Usa preço do **momento da venda** (local)
- 📝 Registra diferença para auditoria

#### 3. Venda Duplicada

**Cenário**: Mesma venda tenta sincronizar duas vezes

**Resolução**:
- ✅ Detecta `localId` duplicado
- ⏭️ **Pula** sincronização
- 📝 Loga ocorrência

#### 4. Conflito Temporal (Last-Write-Wins)

**Cenário**: Mesmo registro editado localmente e na VPS

**Resolução**:
- 🏆 **Mais recente ganha**
- 📅 Compara `updatedAt`

### Ver Alertas Pendentes

```sql
-- Via SQL
SELECT * FROM audit_logs 
WHERE action = 'ALERT' 
  AND details->>'reviewed' = 'false'
ORDER BY timestamp DESC;
```

---

## 🔧 Troubleshooting

### Problema: Sincronização não inicia

**Verificar:**

```bash
# 1. Configuração
SELECT * FROM sync_config;

# 2. Status do serviço
curl http://localhost:3001/sync/status

# 3. Logs do backend
# Verificar terminal onde o backend está rodando
```

**Soluções:**

- Verificar se `SYNC_ENABLED=true`
- Verificar URL da VPS
- Validar token de sincronização
- Reiniciar backend

### Problema: Muitos itens na fila

**Verificar:**

```sql
SELECT status, COUNT(*) as total 
FROM sync_queue 
GROUP BY status;
```

**Soluções:**

```bash
# Reprocessar fila manualmente
curl -X POST http://localhost:3001/sync/trigger

# Limpar itens failed (com cuidado!)
DELETE FROM sync_queue WHERE status = 'failed';
```

### Problema: Backup falhando

**Verificar:**

- PostgreSQL está rodando?
- Espaço em disco suficiente?
- Permissões de escrita?

```powershell
# Verificar serviço PostgreSQL
Get-Service -Name "postgresql*"

# Verificar espaço em disco
Get-PSDrive C | Select-Object Used,Free
```

### Problema: Electron não conecta ao banco local

**Verificar `.env`:**

```bash
DATABASE_MODE=local
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/mercadinho_local"
```

**Verificar PostgreSQL rodando:**

```bash
psql -U postgres -d mercadinho_local -c "SELECT NOW();"
```

---

## ❓ Perguntas Frequentes

### 1. Posso usar com múltiplos caixas?

✅ **Sim!** Cada caixa deve ter seu próprio banco PostgreSQL local. Sincronizam para a mesma VPS.

### 2. O que acontece se a internet cair durante uma venda?

✅ **Nada!** A venda é salva localmente e sincronizada depois.

### 3. Quanto tempo os dados ficam sem sincronizar?

⏰ **Indefinidamente**. O sistema funciona 100% offline. Sincronização ocorre quando houver conexão.

### 4. Posso voltar ao modo online (sem banco local)?

✅ **Sim**. Mude `DATABASE_MODE=vps` no `.env` e reinicie.

### 5. Como sei se está sincronizado?

📊 **Dashboard**: Veja o card de sincronização na página inicial  
🔍 **API**: `GET /sync/status`  
📝 **SQL**: `SELECT * FROM sync_logs ORDER BY timestamp DESC LIMIT 1;`

### 6. Backups são enviados para a VPS?

❌ **Não automaticamente**. Backups ficam locais. VPS recebe dados via sincronização, não backups.

### 7. SQLite ou PostgreSQL?

| Característica | SQLite | PostgreSQL |
|---|---|---|
| **Instalação** | ✅ Zero config | ⚠️ Requer instalação |
| **Performance** | ✅ Rápido | ✅ Muito rápido |
| **Múltiplos caixas** | ❌ Um por vez | ✅ Sim |
| **Backup** | ✅ Copiar arquivo | ⚠️ pg_dump |
| **Recomendado para** | 1 caixa simples | Produção/múltiplos caixas |

### 8. Como migrar de SQLite para PostgreSQL?

```bash
# 1. Exportar dados do SQLite
sqlite3 mercadinho.db .dump > dump.sql

# 2. Converter para PostgreSQL (ajustar sintaxe)
# 3. Importar no PostgreSQL
psql -U postgres -d mercadinho_local -f dump_converted.sql
```

### 9. Token de sincronização expira?

Depende da configuração JWT na VPS. Recomendado: tokens de longa duração (1 ano) para PDV.

### 10. Posso desabilitar sincronização temporariamente?

✅ **Sim**:

```sql
UPDATE sync_config SET is_enabled = false;
```

Ou via interface: Settings → Sincronização → Desabilitar

---

## 📊 Monitoramento

### Métricas Importantes

```sql
-- Vendas não sincronizadas
SELECT COUNT(*) FROM sales WHERE synced = false;

-- Itens na fila
SELECT COUNT(*) FROM sync_queue WHERE status = 'pending';

-- Taxa de sincronização
SELECT 
  COUNT(CASE WHEN synced THEN 1 END)::float / COUNT(*) * 100 as sync_rate
FROM sales;

-- Última sincronização bem-sucedida
SELECT MAX(timestamp) FROM sync_logs 
WHERE status = 'success' AND direction = 'upload';
```

### Dashboard Recomendado

1. **Status da conexão** (Online/Offline)
2. **Vendas pendentes**
3. **Última sincronização**
4. **Itens com erro**
5. **Espaço em disco**

---

## 🔐 Segurança

### Token JWT

Gerar na VPS:

```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { caixaId: 'caixa-1', role: 'sync' },
  process.env.JWT_SECRET,
  { expiresIn: '365d' }
);
```

### HTTPS Obrigatório

```javascript
// syncService.js
if (!this.vpsApiUrl.startsWith('https://')) {
  throw new Error('VPS deve usar HTTPS em produção');
}
```

### Backup Encryption (Opcional)

```powershell
# Criptografar backup
$password = ConvertTo-SecureString -String "SenhaForte123" -AsPlainText -Force
Compress-Archive -Path "backup.backup" -DestinationPath "backup.zip" -Password $password
```

---

## 📞 Suporte

### Logs Úteis

```bash
# Backend
tail -f backend/logs/app.log

# Sincronização
SELECT * FROM sync_logs ORDER BY timestamp DESC LIMIT 50;

# Fila
SELECT * FROM sync_queue WHERE status != 'success';

# Alertas
SELECT * FROM audit_logs WHERE action = 'ALERT';
```

### Contato

- 📧 Email: suporte@mercadinho.com
- 📱 WhatsApp: (00) 00000-0000
- 🐛 Issues: https://github.com/seu-repo/issues

---

## 📝 Changelog

### v1.0.0 (03/12/2025)

- ✅ Implementação inicial offline-first
- ✅ Sincronização automática
- ✅ Fila de retry inteligente
- ✅ Backup automático
- ✅ Resolução de conflitos
- ✅ Dashboard de monitoramento

---

## 📄 Licença

Copyright © 2025 Sistema Mercadinho. Todos os direitos reservados.

---

**🎉 Sistema Offline-First Implementado com Sucesso!**

