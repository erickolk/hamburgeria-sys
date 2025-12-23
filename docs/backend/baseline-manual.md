# Como fazer baseline manual do banco de dados

Se o script automático não funcionar, você pode fazer o baseline manualmente:

## Opção 1: Usar o script SQL

1. Conecte-se ao banco de dados PostgreSQL:
```bash
psql -h evomercearia_postgresql -U seu_usuario -d evomercearia
```

2. Execute o script SQL:
```bash
\i backend/prisma/migrations/baseline_existing_database.sql
```

Ou copie e cole o conteúdo do arquivo `baseline_existing_database.sql` no psql.

## Opção 2: Usar Prisma Studio ou ferramenta gráfica

1. Conecte-se ao banco usando qualquer cliente PostgreSQL
2. Execute o SQL do arquivo `baseline_existing_database.sql`

## Opção 3: Usar Prisma CLI diretamente

Se você tem acesso SSH à VPS:

```bash
cd /caminho/do/projeto/backend
npx prisma migrate resolve --applied 20251122181424_add_customer_supplier_enhanced_fields
npx prisma migrate resolve --applied 20251124_alter_text_to_varchar
```

## Verificar se funcionou

Após fazer o baseline, tente iniciar a aplicação novamente. O erro P3005 não deve mais aparecer.

