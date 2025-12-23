# 🔍 Debug do Erro 500

## Problema
Erro 500 ao tentar criar/listar clientes e fornecedores.

## ✅ Correções Aplicadas

1. **Cache Service Opcional**: Agora o cache é opcional - se falhar, a aplicação continua funcionando
2. **Logs Melhorados**: Adicionei logs detalhados para identificar o problema
3. **Tratamento de Erro Robusto**: Erros de cache não quebram mais a aplicação

## 🔍 Como Verificar os Logs na VPS

### Opção 1: Via EasyPanel (Mais Fácil)

1. Vá em **Serviços** → **backend**
2. Clique em **Logs** (ícone de documento ou aba "Logs")
3. Procure por mensagens que começam com:
   - `[POST /customers]` - ao criar cliente
   - `[POST /suppliers]` - ao criar fornecedor
   - `Erro ao criar cliente:` - erros específicos
   - `Stack:` - stack trace completo

### Opção 2: Via Console

1. **Serviços** → **backend** → **Console do Serviço** → **Bash**
2. Execute:
```bash
tail -f /var/log/app.log
```
Ou se os logs estão no stdout:
```bash
# Os logs devem aparecer automaticamente no console
```

## 📋 O Que Procurar nos Logs

### Erro Comum 1: Prisma Client não gerado
```
Error: Cannot find module '@prisma/client'
```
**Solução**: Execute `npx prisma generate` no container

### Erro Comum 2: Campo obrigatório faltando
```
Argument `xxx` is missing
```
**Solução**: Verificar se todos os campos obrigatórios estão sendo enviados

### Erro Comum 3: Tipo de dado inválido
```
Invalid value for type
```
**Solução**: Verificar formato dos dados enviados

### Erro Comum 4: Cache Service
```
Cannot find module 'node-cache'
```
**Solução**: Já corrigido - cache agora é opcional

## 🚀 Próximos Passos

1. **Faça deploy das correções**:
   ```bash
   git add .
   git commit -m "fix: make cache optional and improve error handling"
   git push
   ```

2. **Verifique os logs** após o deploy

3. **Teste criar um cliente** e veja os logs em tempo real

4. **Envie os logs** se o erro persistir

## 📝 Logs Esperados (Sucesso)

Ao criar um cliente com sucesso, você deve ver:
```
[POST /customers] Dados recebidos: { ... }
```

Se houver erro, você verá:
```
Erro ao criar cliente: [mensagem do erro]
Stack: [stack trace completo]
```

## ⚠️ Importante

Os logs agora mostram:
- ✅ Dados recebidos (para debug)
- ✅ Stack trace completo (em desenvolvimento)
- ✅ Mensagens de erro detalhadas

Isso vai ajudar a identificar exatamente qual é o problema!

