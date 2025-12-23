# 🚀 Guia Rápido - Testar Novas Melhorias

## ⚡ Início Rápido (3 passos)

### 1️⃣ Iniciar o Banco de Dados

```bash
# Na raiz do projeto
docker-compose up -d
```

Aguarde alguns segundos até o PostgreSQL estar pronto.

---

### 2️⃣ Aplicar Mudanças no Banco

```bash
cd backend

# Gerar o Prisma Client
npm run db:generate

# Aplicar mudanças no banco
npm run db:push

# Popular com dados de exemplo (RECOMENDADO)
npm run db:seed
```

> **💡 Dica**: O seed vai criar 8 categorias de exemplo e alguns produtos com fotos e observações!

---

### 3️⃣ Iniciar os Servidores

```bash
# Em um terminal - Backend
cd backend
npm run dev

# Em outro terminal - Frontend
cd frontend
npm run dev
```

---

## ✅ Testando as Novas Funcionalidades

### 🏷️ Gerenciar Categorias

1. Acesse: **http://localhost:3000**
2. Faça login com: `admin@mercadinho.com` / `123456`
3. Vá em: **Configurações** → **Categorias**
4. Teste:
   - ✨ Criar nova categoria
   - ✏️ Editar categoria existente
   - 🗑️ Tentar excluir (verá validação se houver produtos)

---

### 📦 Novo Produto com Todas as Features

1. Vá em: **Produtos** → **Novo Produto**
2. Preencha os dados básicos
3. **Categoria**: 
   - Selecione uma existente no dropdown
   - OU clique em **"+ Nova"** para criar rapidamente
4. **Unidade de Venda**:
   - Teste as novas opções: UN, PC, CX, DZ, KG, LT, MT, OUTRA
5. **Observações**:
   - Digite informações adicionais no campo de texto
   - Ex: "Manter refrigerado" ou "Produto fracionado"
6. **Fotos**:
   - Cole uma URL de imagem (pode usar de exemplo):
     - `https://via.placeholder.com/200/FF0000/FFFFFF?text=Foto+1`
     - `https://via.placeholder.com/200/00FF00/FFFFFF?text=Foto+2`
   - Clique em **"Adicionar Foto"**
   - Adicione várias fotos
   - Clique em **"Marcar"** para definir qual é a principal (★)
   - Teste remover uma foto clicando no **×**
7. Clique em **Salvar**

---

### ✏️ Editar Produto Existente

1. Na listagem de **Produtos**, clique em **"Editar"** em qualquer produto
2. Você verá a nova página de edição
3. Teste modificar:
   - ✅ Categoria (pode criar nova se quiser)
   - ✅ Unidade de venda
   - ✅ Observações
   - ✅ Adicionar/remover fotos
   - ✅ Alterar foto principal
4. Clique em **Salvar Alterações**

---

### 📋 Ver Produtos com Novas Informações

1. Na listagem de **Produtos**
2. Observe:
   - ✅ Unidades de venda exibidas corretamente (un, pc, cx, kg, lt, etc)
   - ✅ Categorias aparecendo na coluna "Categoria"

---

## 🎯 URLs de Fotos para Teste

Você pode usar estas URLs para testar as fotos:

```
https://via.placeholder.com/400/FF6B6B/FFFFFF?text=Produto+Vermelho
https://via.placeholder.com/400/4ECDC4/FFFFFF?text=Produto+Azul
https://via.placeholder.com/400/FFE66D/000000?text=Produto+Amarelo
https://via.placeholder.com/400/95E1D3/000000?text=Produto+Verde
https://picsum.photos/400/400
```

Ou use qualquer URL pública de imagem!

---

## 🔍 Checklist de Teste

### Categorias
- [ ] Criar nova categoria
- [ ] Editar categoria existente
- [ ] Ver contagem de produtos por categoria
- [ ] Tentar excluir categoria com produtos (deve falhar com mensagem)
- [ ] Excluir categoria sem produtos (deve funcionar)

### Produtos - Novo
- [ ] Selecionar categoria no dropdown
- [ ] Criar categoria rápida com botão "+ Nova"
- [ ] Selecionar diferentes unidades de venda
- [ ] Adicionar observações
- [ ] Adicionar múltiplas fotos
- [ ] Definir foto principal
- [ ] Remover foto
- [ ] Salvar produto completo

### Produtos - Edição
- [ ] Abrir edição de produto existente
- [ ] Modificar categoria
- [ ] Modificar unidade de venda
- [ ] Editar observações
- [ ] Adicionar mais fotos
- [ ] Remover foto existente
- [ ] Alterar foto principal
- [ ] Salvar alterações

### Visualização
- [ ] Ver unidades corretas na listagem
- [ ] Ver categorias na listagem
- [ ] Fotos aparecem na edição

---

## 🐛 Problemas Comuns

### ❌ Banco não conecta
```bash
# Verificar se o Docker está rodando
docker ps

# Reiniciar o banco
docker-compose down
docker-compose up -d
```

### ❌ Erro ao rodar db:push
```bash
# Certificar que o banco está rodando
docker-compose ps

# Tentar novamente
cd backend
npm run db:push
```

### ❌ Categorias não aparecem
```bash
# Rodar o seed novamente
cd backend
npm run db:seed
```

---

## 📚 Dados de Exemplo Criados pelo Seed

Após rodar `npm run db:seed`, você terá:

### Usuários
- **Admin**: `admin@mercadinho.com` / `123456`
- **Gerente**: `gerente@mercadinho.com` / `123456`
- **Caixa**: `caixa@mercadinho.com` / `123456`

### Categorias (8)
- Bebidas
- Alimentos
- Higiene
- Limpeza
- Frios
- Mercearia
- Padaria
- Hortifruti

### Produtos (12)
- Produtos diversos já vinculados às categorias
- Queijo Minas e Azeitona com observações de exemplo

---

## 🎉 Pronto!

Todas as funcionalidades estão implementadas e prontas para uso!

Se encontrar algum problema, verifique:
1. ✅ Banco de dados está rodando
2. ✅ Migrations foram aplicadas (`db:push`)
3. ✅ Seed foi executado (opcional, mas recomendado)
4. ✅ Backend e Frontend estão rodando

---

**Bom teste! 🚀**

