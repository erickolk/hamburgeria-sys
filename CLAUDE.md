# Hamburgeria Sys — Contexto para Claude Code

## Stack
- Frontend: Nuxt 3 (Vue 3) + Tailwind CSS — pages em `frontend/pages/`, composables em `frontend/composables/`
- Backend: Node.js + Express (CommonJS, `require`) — rotas em `backend/src/routes/`, middleware em `backend/src/middleware/`
- ORM: Prisma Client 5.x — schema em `backend/prisma/schema.prisma`
- Banco: PostgreSQL local
- Desktop: Electron

## Convenções obrigatórias
- Backend usa CommonJS (`require`, não `import`)
- PrismaClient instanciado dentro da rota (não singleton global)
- Validação sempre via Joi usando `backend/src/utils/validation.js`
- Autenticação via middleware `authenticateToken` de `backend/src/middleware/auth.js`
- Campos monetários: `@db.Decimal(10,2)` | Quantidades: `@db.Decimal(12,3)`
- snake_case no banco via `@map`, camelCase no código JS
- Paginação padrão: query params `page` e `limit`
- Soft delete com campo `isActive` onde aplicável

## Este projeto é um fork de um PDV de mercado
### Módulos MANTIDOS (não alterar estrutura):
- Fornecedores (`suppliers`)
- Usuários e permissões (`users`, middleware auth)

### Módulos ADAPTADOS:
- Produtos → agora representam itens do cardápio (podem ter `recipeId`)
- Estoque → agora controla ingredientes com unidades fracionadas (g, kg, ml, L, un)

### Módulos NOVOS (a construir):
- `Ingredient` — ingredientes com custo médio e unidade
- `Recipe` / `RecipeIngredient` — ficha técnica
- `ProductionBatch` — controle de pré-produção
- CMV teórico — calculado na criação de venda

## Comandos do projeto
```bash