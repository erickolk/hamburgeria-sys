-- Script SQL para fazer baseline de um banco de dados existente
-- Execute este script manualmente se o script automático não funcionar
-- 
-- Este script marca todas as migrações existentes como já aplicadas
-- para resolver o erro P3005 do Prisma

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

-- Inserir migrações existentes como já aplicadas
-- Ajuste os nomes das migrações conforme suas migrações reais

-- Migração 1: add_customer_supplier_enhanced_fields
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

-- Migração 2: alter_text_to_varchar
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

-- Verificar migrações inseridas
SELECT migration_name, finished_at 
FROM "_prisma_migrations" 
ORDER BY started_at;

