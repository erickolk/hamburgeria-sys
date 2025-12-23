# 🚀 Guia SIMPLES - Deploy no EasyPanel

## 📋 O QUE VOCÊ JÁ FEZ:
✅ Criou o projeto "evomercearia"  
✅ Criou o serviço PostgreSQL  
✅ Criou o serviço "node" (backend)

---

## 🎯 AGORA VAMOS CONFIGURAR O BACKEND (node)

### **PASSO 1: Escolher a Fonte do Código**

Na tela que você está (com as abas: Upload, Github, Imagem Docker, Git, Dockerfile):

**ESCOLHA UMA OPÇÃO:**

#### **OPÇÃO A: Se você tem o código no GitHub/GitLab**
1. Clique na aba **"Git"** ou **"Github"**
2. Cole a URL do seu repositório: `https://github.com/seu-usuario/mercadinho.git`
3. Branch: `main` ou `master`

#### **OPÇÃO B: Se você quer fazer upload do código**
1. Fique na aba **"Upload"**
2. No seu computador, compacte a pasta `backend` em ZIP:
   - Vá na pasta `backend`
   - Selecione todos os arquivos (Ctrl+A)
   - Botão direito → Enviar para → Pasta compactada (ZIP)
3. Arraste o arquivo ZIP para a área verde no EasyPanel

#### **OPÇÃO C: Se você tem Dockerfile**
1. Clique na aba **"Dockerfile"**
2. O EasyPanel vai usar o Dockerfile automaticamente

---

### **PASSO 2: Configurar Build e Start**

Depois de escolher a fonte, você verá campos para configurar:

**Build Command:**
```bash
cd backend && npm ci && npx prisma generate
```

**Start Command:**
```bash
cd backend && npm start
```

**Working Directory:**
```
backend
```

**Port:**
```
3001
```

---

### **PASSO 3: Variáveis de Ambiente**

Procure por "Environment Variables" ou "Variáveis de Ambiente" e adicione:

```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:SUA_SENHA@postgresql:5432/postgres
JWT_SECRET=minha_chave_secreta_super_forte_123456789
JWT_EXPIRES_IN=7d
```

**⚠️ IMPORTANTE:**
- Substitua `SUA_SENHA` pela senha que você configurou no PostgreSQL
- Se o nome do serviço PostgreSQL não for "postgresql", substitua também

**Como descobrir o nome do PostgreSQL:**
- Olhe na sidebar esquerda do EasyPanel
- O nome do serviço PostgreSQL está lá (provavelmente "postgresql")

---

### **PASSO 4: Salvar e Deploy**

1. Clique em **"Salvar"** ou **"Deploy"**
2. Aguarde o build terminar (pode demorar alguns minutos)

---

## 🎯 DEPOIS: Configurar o Frontend

### **PASSO 1: Criar Serviço Frontend**

1. Clique em **"+ Serviço"** (canto superior direito)
2. Escolha **"Aplicativo"** ou **"Node.js"**
3. Nome: `frontend`

### **PASSO 2: Configurar Fonte**

**Se usou Git no backend:**
- Aba **"Git"**
- Mesma URL do repositório
- Branch: `main` ou `master`

**Se usou Upload no backend:**
- Aba **"Upload"**
- Compacte a pasta `frontend` em ZIP
- Faça upload

### **PASSO 3: Configurar Build e Start**

**Build Command:**
```bash
cd frontend && npm ci && npm run build
```

**Start Command:**
```bash
cd frontend && node .output/server/index.mjs
```

**Working Directory:**
```
frontend
```

**Port:**
```
3000
```

### **PASSO 4: Variáveis de Ambiente (Frontend)**

```
NODE_ENV=production
NUXT_PUBLIC_API_BASE=http://node:3001
```

**⚠️ IMPORTANTE:**
- Substitua `node` pelo nome exato do seu serviço backend
- Se você nomeou o backend como "backend", use: `http://backend:3001`

---

## 🔧 DEPOIS DO DEPLOY: Executar Migrations

Após o backend estar rodando:

1. No EasyPanel, clique no serviço **"node"**
2. Procure por **"Terminal"** ou **"Console"**
3. Execute:
   ```bash
   cd backend
   npx prisma db push
   ```
4. (Opcional) Para popular dados iniciais:
   ```bash
   npm run db:seed
   ```

---

## ✅ CHECKLIST FINAL

- [ ] Backend configurado e rodando
- [ ] Frontend configurado e rodando
- [ ] Variáveis de ambiente configuradas
- [ ] Migrations executadas
- [ ] Testar acesso

---

## 🆘 PROBLEMAS COMUNS

### Erro: "Cannot find module"
- Verifique se o Working Directory está correto
- Verifique se o Build Command instala as dependências

### Erro: "Database connection failed"
- Verifique o DATABASE_URL
- Verifique se o nome do serviço PostgreSQL está correto
- Verifique se os serviços estão na mesma rede

### Frontend não conecta ao backend
- Verifique NUXT_PUBLIC_API_BASE
- Use o nome do serviço backend (não localhost)

---

## 📞 PRECISA DE AJUDA?

Me diga:
1. Qual opção você escolheu para a fonte? (Git, Upload ou Dockerfile)
2. Qual é o nome exato do serviço PostgreSQL na sidebar?
3. Em qual passo você está travado?

