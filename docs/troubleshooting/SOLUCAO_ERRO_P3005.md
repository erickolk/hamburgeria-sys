# Solução para Erro P3005 do Prisma

## Problema

O erro `P3005 - The database schema is not empty` ocorre quando:
- O banco de dados já tem tabelas/schema
- Mas o Prisma não encontra o histórico de migrações na tabela `_prisma_migrations`
- O Prisma não consegue determinar quais migrações já foram aplicadas

## Soluções

### ✅ Solução 1: Script Automático (Recomendado)

O script `migrate-with-baseline.js` já está configurado no `start:prod`. Ele:
1. Detecta automaticamente se o banco tem schema
2. Tenta aplicar migrações normalmente
3. Se falhar com P3005, faz baseline automático
4. Tenta aplicar migrações novamente

**Na VPS, apenas faça o deploy novamente.** O script deve resolver automaticamente.

### ✅ Solução 2: Baseline Manual Simples

Se a solução 1 não funcionar, execute manualmente:

```bash
cd backend
npm run db:baseline-only
```

Este script apenas marca todas as migrações existentes como já aplicadas, sem tentar executá-las.

### ✅ Solução 3: Baseline via SQL

Se você tem acesso direto ao banco PostgreSQL:

1. Conecte-se ao banco:
```bash
psql -h evomercearia_postgresql -U seu_usuario -d evomercearia
```

2. Execute o script SQL:
```sql
\i backend/prisma/migrations/baseline_existing_database.sql
```

Ou copie e cole o conteúdo do arquivo `baseline_existing_database.sql`.

### ✅ Solução 4: Usar Prisma CLI diretamente

Se você tem acesso SSH à VPS:

```bash
cd /caminho/do/projeto/backend

# Marcar cada migração como aplicada
npx prisma migrate resolve --applied 20251122181424_add_customer_supplier_enhanced_fields
npx prisma migrate resolve --applied 20251124_alter_text_to_varchar

# Depois gerar o Prisma Client
npx prisma generate
```

## Verificar se funcionou

Após fazer o baseline, verifique:

1. A tabela `_prisma_migrations` deve existir
2. Deve ter registros para cada migração
3. O erro P3005 não deve mais aparecer nos logs

Para verificar:
```sql
SELECT migration_name, finished_at 
FROM "_prisma_migrations" 
ORDER BY started_at;
```

## Próximos Passos

Após resolver o baseline:

1. **Aplicar índices de performance** (se ainda não aplicados):
```bash
psql -h evomercearia_postgresql -U seu_usuario -d evomercearia -f backend/prisma/migrations/add_performance_indexes.sql
```

2. **Iniciar a aplicação**:
```bash
npm run start:prod
```

## Notas Importantes

- ⚠️ O baseline marca migrações como aplicadas **sem executá-las**
- ✅ Use apenas se o banco já tem o schema correto
- ✅ Migrações futuras funcionarão normalmente após o baseline
- ✅ O script automático tenta fazer isso sozinho na próxima vez

## Arquivos Criados

- `backend/scripts/migrate-with-baseline.js` - Script automático (usado no start:prod)
- `backend/scripts/baseline-only.js` - Script manual simples
- `backend/prisma/migrations/baseline_existing_database.sql` - SQL para baseline manual
- `backend/scripts/baseline-manual.md` - Guia detalhado

