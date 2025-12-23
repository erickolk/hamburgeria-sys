-- Add isActive field to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;

-- Create company_settings table
CREATE TABLE IF NOT EXISTS "company_settings" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "cnpj" VARCHAR(18) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "website" VARCHAR(255),
    "zip_code" VARCHAR(10) NOT NULL,
    "street" VARCHAR(255) NOT NULL,
    "number" VARCHAR(20) NOT NULL,
    "complement" VARCHAR(100),
    "neighborhood" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_settings_pkey" PRIMARY KEY ("id")
);

-- Insert default company settings if table is empty
INSERT INTO "company_settings" (
    "id", 
    "name", 
    "cnpj", 
    "phone", 
    "zip_code", 
    "street", 
    "number", 
    "neighborhood", 
    "city", 
    "state",
    "updated_at"
)
SELECT 
    'default_company_settings',
    'Meu Mercadinho',
    '00.000.000/0000-00',
    '(00) 00000-0000',
    '00000-000',
    'Rua Principal',
    'S/N',
    'Centro',
    'Cidade',
    'SP',
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "company_settings");



