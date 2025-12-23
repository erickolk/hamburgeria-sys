# 🚨 Solução Rápida para Erro P3005

## Problema
O container do backend está crashando porque o Prisma tenta aplicar migrações em um banco que já tem schema, mas sem histórico de migrações.

## ✅ Solução: Baseline Direto no PostgreSQL

Como o container não inicia, vamos fazer o baseline diretamente no banco PostgreSQL:

### Passo 1: Acessar Console do PostgreSQL

1. Na EasyPanel, vá em **Serviços** → **postgresql**
2. Clique em **Console do Serviço**
3. Selecione **Bash** ou **Sh**

### Passo 2: Conectar ao Banco

```bash
psql -U postgres -d evomercearia
```

Ou se pedir senha:
```bash
psql -h localhost -U postgres -d evomercearia
```

### Passo 3: Executar Script de Baseline

Copie e cole TODO o conteúdo do arquivo `backend/scripts/fix-baseline-direct.sql`:

```sql
-- Criar tabela _prisma_migrations se não existir
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id" VARCHAR(36) PRIMARY KEY,
  "checksum" VARCHAR(64) NOT NULL,
  "finished_at" TIMESTAMP,
  "migration_name" VARCHAR(255) NOT NULL,
  "logs" TEXT,
  "rolled_back_at" TIMESTAMP,
  "started_at" TIMESTAMP NOT NULL DEFAULT now(),
  "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

-- Inserir migração 1
INSERT INTO "_prisma_migrations" 
  ("id", "checksum", "migration_name", "started_at", "finished_at", "applied_steps_count")
VALUES 
  (
    'baseline_20251122181424',
    '0000000000000000000000000000000000000000000000000000000000000000',
    '20251122181424_add_customer_supplier_enhanced_fields',
    now(),
    now(),
    1
  )
ON CONFLICT (id) DO NOTHING;

-- Inserir migração 2
INSERT INTO "_prisma_migrations" 
  ("id", "checksum", "migration_name", "started_at", "finished_at", "applied_steps_count")
VALUES 
  (
    'baseline_20251124_alter_text',
    '0000000000000000000000000000000000000000000000000000000000000000',
    '20251124_alter_text_to_varchar',
    now(),
    now(),
    1
  )
ON CONFLICT (id) DO NOTHING;

-- Verificar
SELECT migration_name, finished_at 
FROM "_prisma_migrations" 
ORDER BY started_at;
```

### Passo 4: Verificar Resultado

Você deve ver 2 linhas retornadas:
- `20251122181424_add_customer_supplier_enhanced_fields`
- `20251124_alter_text_to_varchar`

### Passo 5: Reiniciar Backend

1. Volte para o serviço **backend** na EasyPanel
2. Clique em **Implantar** novamente
3. O backend deve iniciar normalmente agora! ✅

## 🔍 Verificar se Funcionou

Após fazer o baseline, os logs do backend devem mostrar:
- ✅ `Prisma Client generated`
- ✅ `Server running on port...`
- ❌ **NÃO** deve mais aparecer `Error: P3005`

## 📝 Nota

Este baseline marca as migrações como aplicadas sem executá-las. Isso é seguro porque o banco já tem o schema correto - só faltava o histórico de migrações.

