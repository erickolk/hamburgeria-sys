-- Índices de performance para tabela customers
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_document ON customers(document);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active);
CREATE INDEX IF NOT EXISTS idx_customers_address_city ON customers(address_city);
CREATE INDEX IF NOT EXISTS idx_customers_address_state ON customers(address_state);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_document_type ON customers(document_type);

-- Índices compostos para queries comuns
CREATE INDEX IF NOT EXISTS idx_customers_active_name ON customers(is_active, name);
CREATE INDEX IF NOT EXISTS idx_customers_city_state ON customers(address_city, address_state);

-- Índices de performance para tabela suppliers
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_cnpj ON suppliers(cnpj);
CREATE INDEX IF NOT EXISTS idx_suppliers_email ON suppliers(email);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_suppliers_address_city ON suppliers(address_city);
CREATE INDEX IF NOT EXISTS idx_suppliers_address_state ON suppliers(address_state);
CREATE INDEX IF NOT EXISTS idx_suppliers_created_at ON suppliers(created_at);

-- Índices compostos para queries comuns
CREATE INDEX IF NOT EXISTS idx_suppliers_active_name ON suppliers(is_active, name);
CREATE INDEX IF NOT EXISTS idx_suppliers_city_state ON suppliers(address_city, address_state);