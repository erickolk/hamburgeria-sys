# 🔧 Aplicar Campos Faltantes no Banco de Dados

## Problema Identificado

O banco de dados não tem os campos que o Prisma espera:
- ❌ `customers.email` não existe
- ❌ `suppliers.legal_name` não existe
- ❌ Outros campos de endereço podem estar faltando

## ✅ Solução: Executar Script SQL

### Opção 1: Via Console do PostgreSQL (Recomendado)

1. **Acesse o console do PostgreSQL**:
   - EasyPanel → **Serviços** → **postgresql** → **Console do Serviço** → **Bash**

2. **Conecte ao banco**:
   ```bash
   psql -U postgres -d evomercearia
   ```

3. **Execute o script SQL**:
   ```bash
   \i /app/backend/prisma/migrations/add_missing_columns.sql
   ```
   
   Ou copie e cole o conteúdo do arquivo `backend/prisma/migrations/add_missing_columns.sql`

4. **Verifique se funcionou**:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'customers' AND column_name = 'email';
   ```
   
   Deve retornar uma linha com `email`.

### Opção 2: Via EasyPanel (Se tiver acesso)

1. **Acesse o console do PostgreSQL**
2. **Cole o conteúdo do arquivo** `add_missing_columns.sql`
3. **Execute**

### Opção 3: Usar Prisma DB Push (Alternativa)

Se você tem acesso SSH à VPS:

```bash
cd /caminho/do/projeto/backend
npx prisma db push
```

⚠️ **Atenção**: `db push` pode fazer alterações no schema. Use com cuidado em produção.

## 📋 Campos que Serão Adicionados

### Tabela `customers`:
- `email` VARCHAR(255)
- `document` VARCHAR(20)
- `document_type` VARCHAR(10)
- `address_street` VARCHAR(255)
- `address_number` VARCHAR(20)
- `address_complement` VARCHAR(100)
- `address_neighborhood` VARCHAR(100)
- `address_city` VARCHAR(100)
- `address_state` VARCHAR(2)
- `address_zip_code` VARCHAR(10)
- `address_country` VARCHAR(50)

### Tabela `suppliers`:
- `legal_name` VARCHAR(255)
- `contact` VARCHAR(255)
- `address_street` VARCHAR(255)
- `address_number` VARCHAR(20)
- `address_complement` VARCHAR(100)
- `address_neighborhood` VARCHAR(100)
- `address_city` VARCHAR(100)
- `address_state` VARCHAR(2)
- `address_zip_code` VARCHAR(10)
- `address_country` VARCHAR(50)

## ✅ Verificar se Funcionou

Após executar o script, teste novamente:
- Acesse a página de clientes no frontend
- O erro 500 não deve mais aparecer
- Os clientes devem ser listados corretamente

## 🔍 Se Ainda Houver Erro

Verifique os logs do backend para ver se há outros campos faltantes e me envie os logs.

