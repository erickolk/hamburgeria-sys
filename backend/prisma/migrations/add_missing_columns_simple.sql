-- Script SIMPLES para adicionar colunas faltantes
-- Execute este SQL diretamente no PostgreSQL

-- Adicionar colunas na tabela customers (se não existirem)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS document VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS document_type VARCHAR(10) DEFAULT 'CPF';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_street VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_number VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_complement VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_neighborhood VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_city VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_state VARCHAR(2);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_zip_code VARCHAR(10);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_country VARCHAR(50) DEFAULT 'Brasil';

-- Adicionar colunas na tabela suppliers (se não existirem)
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS legal_name VARCHAR(255);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS contact VARCHAR(255);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address_street VARCHAR(255);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address_number VARCHAR(20);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address_complement VARCHAR(100);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address_neighborhood VARCHAR(100);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address_city VARCHAR(100);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address_state VARCHAR(2);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address_zip_code VARCHAR(10);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address_country VARCHAR(50) DEFAULT 'Brasil';

-- Verificar se as colunas foram adicionadas
SELECT 'customers' as tabela, column_name 
FROM information_schema.columns 
WHERE table_name = 'customers' 
  AND (column_name LIKE 'address_%' OR column_name IN ('email', 'document', 'document_type'))
ORDER BY column_name;

SELECT 'suppliers' as tabela, column_name 
FROM information_schema.columns 
WHERE table_name = 'suppliers' 
  AND (column_name LIKE 'address_%' OR column_name IN ('legal_name', 'contact'))
ORDER BY column_name;

