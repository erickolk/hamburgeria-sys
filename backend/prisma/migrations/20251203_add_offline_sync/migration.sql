-- AlterTable Sales: adicionar campos de sincronização
ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "synced" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "synced_at" TIMESTAMP(3);
ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "local_id" TEXT NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "vps_id" TEXT;
ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "created_locally" BOOLEAN NOT NULL DEFAULT true;

-- Criar índices únicos
CREATE UNIQUE INDEX IF NOT EXISTS "sales_local_id_key" ON "sales"("local_id");
CREATE UNIQUE INDEX IF NOT EXISTS "sales_vps_id_key" ON "sales"("vps_id");
CREATE INDEX IF NOT EXISTS "sales_synced_created_at_idx" ON "sales"("synced", "created_at");

-- AlterTable SaleItems: adicionar campos de sincronização
ALTER TABLE "sale_items" ADD COLUMN IF NOT EXISTS "synced" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "sale_items" ADD COLUMN IF NOT EXISTS "synced_at" TIMESTAMP(3);

-- AlterTable Products: adicionar campos de sincronização
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "last_sync_at" TIMESTAMP(3);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "vps_updated_at" TIMESTAMP(3);

-- AlterTable StockMovements: adicionar campos de sincronização
ALTER TABLE "stock_movements" ADD COLUMN IF NOT EXISTS "synced" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "stock_movements" ADD COLUMN IF NOT EXISTS "synced_at" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "stock_movements_synced_date_idx" ON "stock_movements"("synced", "date");

-- AlterTable Customers: adicionar campos de sincronização
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "synced" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "synced_at" TIMESTAMP(3);

-- AlterTable CashRegisters: adicionar campos de sincronização
ALTER TABLE "cash_registers" ADD COLUMN IF NOT EXISTS "synced" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "cash_registers" ADD COLUMN IF NOT EXISTS "synced_at" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "cash_registers_synced_opened_at_idx" ON "cash_registers"("synced", "opened_at");

-- CreateTable SyncQueue
CREATE TABLE IF NOT EXISTS "sync_queue" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_attempt" TIMESTAMP(3),
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_queue_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "sync_queue_status_created_at_idx" ON "sync_queue"("status", "created_at");
CREATE INDEX IF NOT EXISTS "sync_queue_entity_entity_id_idx" ON "sync_queue"("entity", "entity_id");

-- CreateTable SyncLog
CREATE TABLE IF NOT EXISTS "sync_logs" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "sync_logs_timestamp_idx" ON "sync_logs"("timestamp");
CREATE INDEX IF NOT EXISTS "sync_logs_entity_direction_idx" ON "sync_logs"("entity", "direction");

-- CreateTable SyncConfig
CREATE TABLE IF NOT EXISTS "sync_config" (
    "id" TEXT NOT NULL,
    "vps_api_url" VARCHAR(255) NOT NULL,
    "sync_token" VARCHAR(500) NOT NULL,
    "sync_interval" INTEGER NOT NULL DEFAULT 60000,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_sync" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sync_config_pkey" PRIMARY KEY ("id")
);

-- Inserir configuração padrão de sincronização
INSERT INTO "sync_config" ("id", "vps_api_url", "sync_token", "sync_interval", "is_enabled", "updated_at")
VALUES ('default', 'https://seu-servidor.com/api', 'CHANGE_THIS_TOKEN', 60000, false, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

