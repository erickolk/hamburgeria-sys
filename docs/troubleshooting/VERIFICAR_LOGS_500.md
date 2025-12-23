# 🔍 Como Verificar os Logs do Erro 500

## Problema
Erro 500 ao tentar listar clientes: `GET /customers? 500 (Internal Server Error)`

## ✅ Logs Adicionados

Agora a rota `/customers` tem logs detalhados que vão mostrar:
- ✅ Query params recebidos
- ✅ Where clause construída
- ✅ OrderBy configurado
- ✅ Resultado da query Prisma
- ✅ Erro específico (se houver)

## 📋 Como Ver os Logs na VPS

### Opção 1: Via EasyPanel (Mais Fácil)

1. **Vá em Serviços → backend**
2. **Clique em "Logs"** (ícone de documento ou aba "Logs")
3. **Procure por mensagens que começam com:**
   - `[GET /customers]` - mostra o que está sendo processado
   - `Erro ao buscar clientes:` - mostra o erro específico
   - `Stack:` - mostra o stack trace completo

### Opção 2: Via Console

1. **Serviços → backend → Console do Serviço → Bash**
2. Os logs devem aparecer automaticamente no console

## 🔍 O Que Procurar nos Logs

### Erro Comum 1: Prisma Client não gerado
```
Error: Cannot find module '@prisma/client'
```
**Solução**: O Prisma Client precisa ser gerado. Verifique se o script de start está executando `prisma generate`.

### Erro Comum 2: Campo não existe no banco
```
Unknown arg `xxx` in orderBy
```
**Solução**: O campo de ordenação não existe. Já corrigido com validação de campos.

### Erro Comum 3: Problema de conexão
```
Can't reach database server
```
**Solução**: Verificar DATABASE_URL e conexão com PostgreSQL.

### Erro Comum 4: Schema não sincronizado
```
The column `xxx` does not exist
```
**Solução**: O schema do Prisma não está sincronizado com o banco. Fazer baseline ou aplicar migrações.

## 📝 Exemplo de Logs Esperados (Sucesso)

```
[GET /customers] Query params: { page: '1', limit: '20' }
[GET /customers] Where clause: {}
[GET /customers] OrderBy: { "name": "asc" }
[GET /customers] Executando query Prisma...
[GET /customers] Query executada com sucesso. Encontrados 5 clientes de 5 total
```

## 📝 Exemplo de Logs com Erro

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

## 🚀 Próximos Passos

1. **Faça deploy das correções**:
   ```bash
   git add .
   git commit -m "fix: add detailed logging to customers route for debugging"
   git push
   ```

2. **Aguarde o deploy** na VPS

3. **Acesse a página de clientes** no frontend

4. **Verifique os logs** na EasyPanel

5. **Envie os logs** que aparecerem - especialmente as linhas que começam com `[GET /customers]` e `Erro ao buscar clientes:`

## ⚠️ Importante

Os logs agora mostram:
- ✅ Todos os parâmetros recebidos
- ✅ A query Prisma que está sendo executada
- ✅ O erro específico (se houver)
- ✅ Stack trace completo

Isso vai ajudar a identificar exatamente qual é o problema!

