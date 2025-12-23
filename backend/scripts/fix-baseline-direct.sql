-- ============================================
-- SCRIPT DE BASELINE DIRETO - COPIE E COLE NO CONSOLE DO POSTGRESQL
-- ============================================
-- Este script resolve o erro P3005 fazendo baseline direto no banco
-- Execute no console do PostgreSQL (serviço postgresql na EasyPanel)

-- 1. Criar tabela _prisma_migrations se não existir
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

-- 2. Inserir migração 1
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

-- 3. Inserir migração 2
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

-- 4. Verificar se funcionou
SELECT migration_name, finished_at, started_at
FROM "_prisma_migrations" 
ORDER BY started_at;

-- Se você ver 2 linhas acima, o baseline foi feito com sucesso!
-- Agora o backend deve conseguir iniciar normalmente.

