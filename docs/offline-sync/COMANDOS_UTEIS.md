# 🛠️ Comandos Úteis - Sistema Offline-First

> **Referência rápida de comandos para operação e manutenção**

---

## 🗄️ PostgreSQL

### Gerenciamento do Serviço

```powershell
# Verificar status
Get-Service -Name "postgresql*"

# Iniciar serviço
Start-Service postgresql-x64-15

# Parar serviço
Stop-Service postgresql-x64-15

# Reiniciar serviço
Restart-Service postgresql-x64-15
```

### Operações no Banco

```bash
# Conectar ao banco
psql -U postgres -d mercadinho_local

# Criar banco
createdb -U postgres mercadinho_local

# Dropar banco (CUIDADO!)
dropdb -U postgres mercadinho_local

# Listar bancos
psql -U postgres -c "\l"

# Tamanho do banco
psql -U postgres -d mercadinho_local -c "SELECT pg_size_pretty(pg_database_size('mercadinho_local'));"
```

### Queries Úteis

```sql
-- Vendas não sincronizadas
SELECT COUNT(*) FROM sales WHERE synced = false;

-- Últimas sincronizações
SELECT * FROM sync_logs 
ORDER BY timestamp DESC 
LIMIT 10;

-- Fila de sincronização
SELECT status, COUNT(*) 
FROM sync_queue 
GROUP BY status;

-- Espaço ocupado por tabela
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Últimas 10 vendas
SELECT 
    id,
    total,
    synced,
    date,
    created_at
FROM sales
ORDER BY created_at DESC
LIMIT 10;

-- Produtos com estoque baixo
SELECT 
    name,
    stock_quantity,
    reorder_point
FROM products
WHERE stock_quantity <= reorder_point
ORDER BY stock_quantity ASC;
```

---

## 🔄 Sincronização

### Via cURL

```bash
# Status da sincronização
curl http://localhost:3001/sync/status \
  -H "Authorization: Bearer YOUR_TOKEN"

# Forçar sincronização
curl -X POST http://localhost:3001/sync/trigger \
  -H "Authorization: Bearer YOUR_TOKEN"

# Ver logs
curl http://localhost:3001/sync/logs?limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Ver fila
curl http://localhost:3001/sync/queue \
  -H "Authorization: Bearer YOUR_TOKEN"

# Estatísticas
curl http://localhost:3001/sync/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Configuração
curl http://localhost:3001/sync/config \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Via PowerShell

```powershell
# Status da sincronização
$token = "YOUR_TOKEN"
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:3001/sync/status" -Headers $headers

# Forçar sincronização
Invoke-RestMethod -Uri "http://localhost:3001/sync/trigger" -Method POST -Headers $headers

# Ver logs
Invoke-RestMethod -Uri "http://localhost:3001/sync/logs?limit=20" -Headers $headers
```

---

## 💾 Backup

### Backup Manual

```powershell
# Backup com configurações padrão
.\backend\scripts\backup-local.ps1

# Backup personalizado
.\backend\scripts\backup-local.ps1 `
  -BackupDir "D:\Backups" `
  -RetentionDays 60 `
  -DatabaseName "mercadinho_local"

# Backup com senha do PostgreSQL
$env:PGPASSWORD = "sua_senha"
.\backend\scripts\backup-local.ps1
```

### Restauração

```powershell
# Restaurar backup
.\backend\scripts\restore-backup.ps1 `
  -BackupFile "C:\Backups\Mercadinho\mercadinho_20251203_120000.backup"

# Restaurar sem confirmação (CUIDADO!)
.\backend\scripts\restore-backup.ps1 `
  -BackupFile "backup.backup" `
  -Force
```

### Backup Direto (pg_dump)

```bash
# Backup formato custom
pg_dump -U postgres -d mercadinho_local -F c -f backup.backup

# Backup formato SQL
pg_dump -U postgres -d mercadinho_local -f backup.sql

# Backup compactado
pg_dump -U postgres -d mercadinho_local | gzip > backup.sql.gz

# Backup de tabela específica
pg_dump -U postgres -d mercadinho_local -t sales -f sales_backup.sql
```

### Restauração Direta (pg_restore)

```bash
# Restaurar formato custom
pg_restore -U postgres -d mercadinho_local backup.backup

# Restaurar com limpeza
pg_restore -U postgres -d mercadinho_local --clean --if-exists backup.backup

# Restaurar formato SQL
psql -U postgres -d mercadinho_local -f backup.sql
```

---

## 🏃 Inicialização

### Desenvolvimento

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Electron
npm run electron
```

### Produção

```bash
# Build do frontend
cd frontend
npm run build

# Iniciar backend em produção
cd backend
NODE_ENV=production npm start

# Electron em produção
npm run electron-prod
```

---

## 🔍 Debug e Logs

### Ver Logs do Backend

```bash
# Tail em tempo real (Linux/Mac)
tail -f backend/logs/app.log

# PowerShell
Get-Content backend/logs/app.log -Wait -Tail 50
```

### Ver Logs de Sincronização

```sql
-- Logs de hoje
SELECT * FROM sync_logs 
WHERE timestamp::date = CURRENT_DATE
ORDER BY timestamp DESC;

-- Logs de erro
SELECT * FROM sync_logs 
WHERE status = 'error'
ORDER BY timestamp DESC
LIMIT 20;

-- Logs por entidade
SELECT 
    entity,
    direction,
    status,
    COUNT(*) as total
FROM sync_logs
GROUP BY entity, direction, status;
```

### Debug do Electron

```bash
# Abrir DevTools automaticamente
NODE_ENV=development npm run electron

# Ver logs do processo principal
# No código: console.log() aparecerá no terminal

# Ver logs do renderer
# DevTools → Console
```

---

## 🧹 Manutenção

### Limpar Logs Antigos

```sql
-- Remover logs com mais de 90 dias
DELETE FROM sync_logs 
WHERE timestamp < NOW() - INTERVAL '90 days';

-- Remover itens da fila com sucesso
DELETE FROM sync_queue 
WHERE status = 'success' 
  AND created_at < NOW() - INTERVAL '7 days';
```

### Vacuuming do PostgreSQL

```bash
# Vacuum completo
psql -U postgres -d mercadinho_local -c "VACUUM FULL;"

# Analyze (atualizar estatísticas)
psql -U postgres -d mercadinho_local -c "ANALYZE;"

# Reindex
psql -U postgres -d mercadinho_local -c "REINDEX DATABASE mercadinho_local;"
```

### Limpar Backups Antigos Manualmente

```powershell
# Remover backups com mais de 60 dias
$limit = (Get-Date).AddDays(-60)
Get-ChildItem "C:\Backups\Mercadinho\*.backup" | 
  Where-Object { $_.CreationTime -lt $limit } | 
  Remove-Item -Force

# Ver total de backups
Get-ChildItem "C:\Backups\Mercadinho\*.backup" | Measure-Object -Property Length -Sum
```

---

## 📊 Monitoramento

### Verificar Vendas Pendentes

```sql
SELECT 
    DATE(created_at) as data,
    COUNT(*) as total_vendas,
    SUM(CASE WHEN synced THEN 1 ELSE 0 END) as sincronizadas,
    SUM(CASE WHEN NOT synced THEN 1 ELSE 0 END) as pendentes
FROM sales
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY data DESC;
```

### Verificar Performance de Sincronização

```sql
SELECT 
    entity,
    COUNT(*) as tentativas,
    AVG(EXTRACT(EPOCH FROM (timestamp - LAG(timestamp) OVER (PARTITION BY entity ORDER BY timestamp)))) as intervalo_medio_segundos
FROM sync_logs
WHERE direction = 'upload'
  AND timestamp >= NOW() - INTERVAL '1 day'
GROUP BY entity;
```

### Alertas Críticos

```sql
-- Vendas muito antigas não sincronizadas
SELECT 
    id,
    total,
    created_at,
    AGE(NOW(), created_at) as idade
FROM sales
WHERE NOT synced
  AND created_at < NOW() - INTERVAL '7 days'
ORDER BY created_at ASC;

-- Itens falhando constantemente
SELECT 
    entity,
    entity_id,
    attempts,
    error
FROM sync_queue
WHERE status = 'failed'
ORDER BY attempts DESC;
```

---

## 🔐 Segurança

### Gerar Token JWT

```javascript
// Node.js REPL
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { caixaId: 'caixa-1', role: 'sync' },
  'SEU_JWT_SECRET',
  { expiresIn: '365d' }
);
console.log(token);
```

### Alterar Senha do PostgreSQL

```bash
psql -U postgres -c "ALTER USER postgres PASSWORD 'nova_senha_forte';"
```

### Verificar Conexões Ativas

```sql
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start
FROM pg_stat_activity
WHERE datname = 'mercadinho_local';
```

---

## 🚑 Emergência

### Sistema Não Sincroniza

```bash
# 1. Verificar conexão VPS
curl https://seu-servidor.com/api/health

# 2. Verificar configuração
psql -U postgres -d mercadinho_local -c "SELECT * FROM sync_config;"

# 3. Verificar fila
psql -U postgres -d mercadinho_local -c "SELECT status, COUNT(*) FROM sync_queue GROUP BY status;"

# 4. Forçar sincronização
curl -X POST http://localhost:3001/sync/trigger -H "Authorization: Bearer TOKEN"

# 5. Reiniciar backend
# Ctrl+C e iniciar novamente
```

### Recuperar de Backup

```powershell
# 1. Parar sistema
Stop-Process -Name "electron" -Force
Stop-Service postgresql-x64-15

# 2. Iniciar PostgreSQL
Start-Service postgresql-x64-15

# 3. Restaurar
.\backend\scripts\restore-backup.ps1 -BackupFile "backup.backup" -Force

# 4. Reiniciar sistema
npm run electron
```

### Resetar Sincronização

```sql
-- CUIDADO: Isso irá resincronizar TUDO

-- Resetar status de sincronização
UPDATE sales SET synced = false, synced_at = NULL;
UPDATE sale_items SET synced = false, synced_at = NULL;
UPDATE stock_movements SET synced = false, synced_at = NULL;
UPDATE customers SET synced = false, synced_at = NULL;
UPDATE cash_registers SET synced = false, synced_at = NULL;

-- Limpar fila
DELETE FROM sync_queue;

-- Limpar logs (opcional)
DELETE FROM sync_logs;
```

---

## 📞 Comandos de Suporte

### Coletar Informações para Suporte

```powershell
# Criar arquivo de diagnóstico
$output = "diagnostico_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"

# Sistema
"=== SISTEMA ===" | Out-File $output
Get-ComputerInfo | Select-Object WindowsVersion, OsArchitecture | Out-File $output -Append

# PostgreSQL
"`n=== POSTGRESQL ===" | Out-File $output -Append
Get-Service -Name "postgresql*" | Out-File $output -Append

# Banco de Dados
"`n=== BANCO ===" | Out-File $output -Append
psql -U postgres -d mercadinho_local -c "SELECT version();" | Out-File $output -Append

# Sincronização
"`n=== SINCRONIZACAO ===" | Out-File $output -Append
psql -U postgres -d mercadinho_local -c "SELECT * FROM sync_config;" | Out-File $output -Append
psql -U postgres -d mercadinho_local -c "SELECT COUNT(*) FROM sales WHERE NOT synced;" | Out-File $output -Append

# Abrir arquivo
notepad $output
```

---

## 📚 Referências Rápidas

- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Prisma Docs**: https://www.prisma.io/docs
- **Electron Docs**: https://www.electronjs.org/docs

---

**💡 Dica**: Adicione este arquivo aos favoritos para acesso rápido!

