-- Script para adicionar colunas faltantes no banco de dados
-- Execute este script no PostgreSQL para sincronizar o schema

-- Adicionar colunas faltantes na tabela customers
DO $$ 
BEGIN
    -- Verificar e adicionar email se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'email') THEN
        ALTER TABLE customers ADD COLUMN email VARCHAR(255);
        RAISE NOTICE 'Coluna email adicionada à tabela customers';
    END IF;

    -- Verificar e adicionar document se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'document') THEN
        ALTER TABLE customers ADD COLUMN document VARCHAR(20);
        RAISE NOTICE 'Coluna document adicionada à tabela customers';
    END IF;

    -- Verificar e adicionar document_type se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'document_type') THEN
        ALTER TABLE customers ADD COLUMN document_type VARCHAR(10) NOT NULL DEFAULT 'CPF';
        RAISE NOTICE 'Coluna document_type adicionada à tabela customers';
    END IF;

    -- Verificar e adicionar campos de endereço se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'address_street') THEN
        ALTER TABLE customers ADD COLUMN address_street VARCHAR(255);
        RAISE NOTICE 'Coluna address_street adicionada à tabela customers';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'address_number') THEN
        ALTER TABLE customers ADD COLUMN address_number VARCHAR(20);
        RAISE NOTICE 'Coluna address_number adicionada à tabela customers';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'address_complement') THEN
        ALTER TABLE customers ADD COLUMN address_complement VARCHAR(100);
        RAISE NOTICE 'Coluna address_complement adicionada à tabela customers';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'address_neighborhood') THEN
        ALTER TABLE customers ADD COLUMN address_neighborhood VARCHAR(100);
        RAISE NOTICE 'Coluna address_neighborhood adicionada à tabela customers';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'address_city') THEN
        ALTER TABLE customers ADD COLUMN address_city VARCHAR(100);
        RAISE NOTICE 'Coluna address_city adicionada à tabela customers';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'address_state') THEN
        ALTER TABLE customers ADD COLUMN address_state VARCHAR(2);
        RAISE NOTICE 'Coluna address_state adicionada à tabela customers';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'address_zip_code') THEN
        ALTER TABLE customers ADD COLUMN address_zip_code VARCHAR(10);
        RAISE NOTICE 'Coluna address_zip_code adicionada à tabela customers';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'address_country') THEN
        ALTER TABLE customers ADD COLUMN address_country VARCHAR(50) NOT NULL DEFAULT 'Brasil';
        RAISE NOTICE 'Coluna address_country adicionada à tabela customers';
    END IF;
END $$;

-- Adicionar colunas faltantes na tabela suppliers
DO $$ 
BEGIN
    -- Verificar e adicionar legal_name se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'suppliers' AND column_name = 'legal_name') THEN
        ALTER TABLE suppliers ADD COLUMN legal_name VARCHAR(255);
        RAISE NOTICE 'Coluna legal_name adicionada à tabela suppliers';
    END IF;

    -- Verificar e adicionar contact se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'suppliers' AND column_name = 'contact') THEN
        ALTER TABLE suppliers ADD COLUMN contact VARCHAR(255);
        RAISE NOTICE 'Coluna contact adicionada à tabela suppliers';
    END IF;

    -- Verificar e adicionar campos de endereço se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'suppliers' AND column_name = 'address_street') THEN
        ALTER TABLE suppliers ADD COLUMN address_street VARCHAR(255);
        RAISE NOTICE 'Coluna address_street adicionada à tabela suppliers';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'suppliers' AND column_name = 'address_number') THEN
        ALTER TABLE suppliers ADD COLUMN address_number VARCHAR(20);
        RAISE NOTICE 'Coluna address_number adicionada à tabela suppliers';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'suppliers' AND column_name = 'address_complement') THEN
        ALTER TABLE suppliers ADD COLUMN address_complement VARCHAR(100);
        RAISE NOTICE 'Coluna address_complement adicionada à tabela suppliers';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'suppliers' AND column_name = 'address_neighborhood') THEN
        ALTER TABLE suppliers ADD COLUMN address_neighborhood VARCHAR(100);
        RAISE NOTICE 'Coluna address_neighborhood adicionada à tabela suppliers';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'suppliers' AND column_name = 'address_city') THEN
        ALTER TABLE suppliers ADD COLUMN address_city VARCHAR(100);
        RAISE NOTICE 'Coluna address_city adicionada à tabela suppliers';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'suppliers' AND column_name = 'address_state') THEN
        ALTER TABLE suppliers ADD COLUMN address_state VARCHAR(2);
        RAISE NOTICE 'Coluna address_state adicionada à tabela suppliers';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'suppliers' AND column_name = 'address_zip_code') THEN
        ALTER TABLE suppliers ADD COLUMN address_zip_code VARCHAR(10);
        RAISE NOTICE 'Coluna address_zip_code adicionada à tabela suppliers';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'suppliers' AND column_name = 'address_country') THEN
        ALTER TABLE suppliers ADD COLUMN address_country VARCHAR(50) NOT NULL DEFAULT 'Brasil';
        RAISE NOTICE 'Coluna address_country adicionada à tabela suppliers';
    END IF;
END $$;

-- Verificar colunas adicionadas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('customers', 'suppliers')
    AND column_name LIKE 'address_%' OR column_name IN ('email', 'document', 'document_type', 'legal_name', 'contact')
ORDER BY table_name, column_name;

