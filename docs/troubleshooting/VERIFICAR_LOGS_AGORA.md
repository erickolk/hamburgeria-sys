# 🔍 Verificar Logs do Erro 500 - URGENTE

## Situação
✅ CORS está funcionando (não há mais erro de CORS)  
❌ Backend retorna erro 500 ao listar clientes

## 📋 Como Ver os Logs na EasyPanel

### Passo 1: Acessar Logs do Backend
1. Vá em **Serviços** → **backend**
2. Clique no ícone de **envelope** ou na aba **"Logs"**
3. Ou clique em **"Visualizar"** na última implantação

### Passo 2: Procurar por Estas Mensagens

Procure por linhas que começam com:
- `[GET /customers]` - mostra o que está sendo processado
- `Erro ao buscar clientes:` - mostra o erro específico
- `Erro no Prisma:` - mostra erro do Prisma
- `Stack:` - mostra o stack trace completo

### Passo 3: Copiar os Logs

Copie TODAS as linhas que aparecerem, especialmente:
- Qualquer linha com `[GET /customers]`
- Qualquer linha com `Erro`
- Qualquer linha com `Stack:`

## 🔍 Possíveis Causas do Erro 500

### 1. Prisma Client não gerado
```
Error: Cannot find module '@prisma/client'
```
**Solução**: O Prisma Client precisa ser gerado

### 2. Campo não existe no banco
```
Unknown arg `xxx` in orderBy
```
**Solução**: Campo de ordenação inválido (já corrigido com validação)

### 3. Problema de conexão com banco
```
Can't reach database server
```
**Solução**: Verificar DATABASE_URL

### 4. Schema não sincronizado
```
The column `xxx` does not exist
```
**Solução**: Fazer baseline ou aplicar migrações

## 📝 Exemplo de Logs Esperados

### Se funcionar:
```
[GET /customers] Query params: { page: '1', limit: '20' }
[GET /customers] Where clause: {}
[GET /customers] OrderBy: { "name": "asc" }
[GET /customers] Executando query Prisma...
[GET /customers] Query executada com sucesso. Encontrados 0 clientes de 0 total
```

### Se houver erro:
```
[GET /customers] Query params: { page: '1', limit: '20' }
[GET /customers] Where clause: {}
[GET /customers] OrderBy: { "name": "asc" }
[GET /customers] Executando query Prisma...
[GET /customers] Erro no Prisma: [mensagem do erro]
[GET /customers] Stack: [stack trace]
Erro ao buscar clientes: [mensagem do erro]
Stack: [stack trace completo]
```

## 🚀 Ação Imediata

1. **Acesse os logs** na EasyPanel
2. **Copie todas as mensagens** relacionadas a `/customers`
3. **Envie para mim** para eu identificar o problema exato

Os logs detalhados que adicionei vão mostrar exatamente qual é o problema!

