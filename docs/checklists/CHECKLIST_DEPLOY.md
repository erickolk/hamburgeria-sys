# ✅ CHECKLIST - Deploy EasyPanel

## 🎯 VOCÊ ESTÁ AQUI: Configurando o BACKEND (node)

### ☑️ PASSO 1: Fonte do Código
- [ ] Escolhi a aba **"Upload"**
- [ ] Compactei a pasta `backend` em ZIP no meu computador
- [ ] Fiz upload do ZIP no EasyPanel

### ☑️ PASSO 2: Configurações
- [ ] **Build Command:** `npm ci && npx prisma generate`
- [ ] **Start Command:** `npm start`
- [ ] **Port:** `3001`

### ☑️ PASSO 3: Variáveis de Ambiente
- [ ] Adicionei: `NODE_ENV=production`
- [ ] Adicionei: `PORT=3001`
- [ ] Adicionei: `DATABASE_URL=postgresql://postgres:MINHA_SENHA@postgresql:5432/postgres`
- [ ] Adicionei: `JWT_SECRET=uma_chave_aleatoria_forte`
- [ ] Adicionei: `JWT_EXPIRES_IN=7d`

### ☑️ PASSO 4: Deploy
- [ ] Cliquei em "Salvar" ou "Deploy"
- [ ] Aguardei o build terminar
- [ ] Backend está rodando ✅

---

## 🎯 PRÓXIMO: Configurar o FRONTEND

### ☑️ PASSO 1: Criar Serviço
- [ ] Cliquei em "+ Serviço"
- [ ] Escolhi "Aplicativo"
- [ ] Nomeei: `frontend`

### ☑️ PASSO 2: Fonte
- [ ] Escolhi aba "Upload"
- [ ] Compactei pasta `frontend` em ZIP
- [ ] Fiz upload

### ☑️ PASSO 3: Configurações
- [ ] **Build Command:** `npm ci && npm run build`
- [ ] **Start Command:** `node .output/server/index.mjs`
- [ ] **Port:** `3000`

### ☑️ PASSO 4: Variáveis
- [ ] Adicionei: `NODE_ENV=production`
- [ ] Adicionei: `NUXT_PUBLIC_API_BASE=http://node:3001`

### ☑️ PASSO 5: Deploy
- [ ] Cliquei em "Salvar" ou "Deploy"
- [ ] Frontend está rodando ✅

---

## 🎯 FINAL: Executar Migrations

- [ ] Abri o terminal do serviço "node"
- [ ] Executei: `cd backend && npx prisma db push`
- [ ] (Opcional) Executei: `npm run db:seed`

---

## ✅ TUDO PRONTO!

