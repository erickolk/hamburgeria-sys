# Variáveis de Ambiente

## Variáveis Existentes

Consulte o arquivo `.env` para as variáveis já configuradas do sistema.

## Novas Variáveis - Tickets e Relatórios

Adicione estas variáveis ao seu arquivo `.env`:

```env
# Informações da Loja (para impressão em tickets)
STORE_NAME=MERCADINHO DO JOÃO
STORE_CNPJ=12.345.678/0001-00
STORE_ADDRESS=Rua Exemplo, 123 - Centro - Cidade/UF
STORE_PHONE=(11) 98765-4321
STORE_WEBSITE=www.mercadinho.com.br
```

## Descrição das Variáveis

### STORE_NAME
- **Obrigatório**: Sim
- **Descrição**: Nome da loja que aparecerá no cabeçalho do ticket
- **Exemplo**: `MERCADINHO DO JOÃO`

### STORE_CNPJ
- **Obrigatório**: Não (mas recomendado)
- **Descrição**: CNPJ da empresa para impressão no ticket
- **Formato**: `XX.XXX.XXX/XXXX-XX`
- **Exemplo**: `12.345.678/0001-00`

### STORE_ADDRESS
- **Obrigatório**: Não (mas recomendado)
- **Descrição**: Endereço completo da loja
- **Exemplo**: `Rua Exemplo, 123 - Centro - São Paulo/SP`

### STORE_PHONE
- **Obrigatório**: Não (mas recomendado)
- **Descrição**: Telefone de contato
- **Formato**: `(XX) XXXXX-XXXX` ou `(XX) XXXX-XXXX`
- **Exemplo**: `(11) 98765-4321`

### STORE_WEBSITE
- **Obrigatório**: Não
- **Descrição**: Website ou rede social da loja
- **Exemplo**: `www.mercadinho.com.br` ou `@mercadinho.instagram`

## Valores Padrão

Se as variáveis não forem configuradas, os seguintes valores serão usados:

- `STORE_NAME`: `MERCADINHO`
- `STORE_CNPJ`: _(vazio)_
- `STORE_ADDRESS`: _(vazio)_
- `STORE_PHONE`: _(vazio)_
- `STORE_WEBSITE`: _(vazio)_

## Exemplo Completo de .env

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/mercadinho"

# JWT
JWT_SECRET="sua_chave_secreta_aqui"

# Server
PORT=3001
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Informações da Loja
STORE_NAME=MERCADINHO DO JOÃO
STORE_CNPJ=12.345.678/0001-00
STORE_ADDRESS=Rua Exemplo, 123 - Centro - São Paulo/SP
STORE_PHONE=(11) 98765-4321
STORE_WEBSITE=www.mercadinho.com.br
```

## Validação

Para testar se as variáveis estão configuradas corretamente:

1. Execute o servidor
2. Faça uma venda de teste
3. Verifique o ticket gerado em `backend/tickets/`
4. Confira se as informações da loja aparecem corretamente

## Notas Importantes

- ⚠️ As informações configuradas aparecerão em **todos os tickets** impressos
- 📝 Certifique-se de que o CNPJ está correto se for usar os tickets como comprovante
- 🔒 Não compartilhe o arquivo `.env` publicamente
- 📋 Mantenha uma cópia de backup das configurações



