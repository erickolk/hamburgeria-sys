# 🎯 DEPLOY EASYPANEL - PASSO A PASSO SIMPLES

## 📍 ONDE VOCÊ ESTÁ AGORA:
Você está na tela de configuração do serviço "node" (backend), na parte de escolher a **FONTE** do código.

---

## 🎬 PASSO 1: ESCOLHER DE ONDE VEM O CÓDIGO

Você vê 5 abas: **Upload**, **Github**, **Imagem Docker**, **Git**, **Dockerfile**

### ✅ ESCOLHA A OPÇÃO MAIS FÁCIL: **"Upload"**

1. **No seu computador:**
   - Abra a pasta do projeto: `C:\Users\erick\OneDrive\Documentos\Projetos\mercadinho`
   - Entre na pasta `backend`
   - Selecione TODOS os arquivos (Ctrl+A)
   - Botão direito → **"Enviar para"** → **"Pasta compactada (ZIP)"**
   - Vai criar um arquivo `backend.zip`

2. **No EasyPanel:**
   - Na aba **"Upload"** (já está selecionada)
   - Arraste o arquivo `backend.zip` para a área verde
   - OU clique e escolha o arquivo

---

## 🎬 PASSO 2: CONFIGURAR O BUILD

Depois do upload, você verá campos para preencher:

### **Build Command:**
Cole isso aqui:
```
npm ci && npx prisma generate
```

### **Start Command:**
Cole isso aqui:
```
npm start
```

### **Port:**
Digite:
```
3001
```

---

## 🎬 PASSO 3: VARIÁVEIS DE AMBIENTE

Procure um botão ou seção chamada:
- **"Environment Variables"** ou
- **"Variáveis de Ambiente"** ou
- **"Env"**

Clique e adicione estas 5 variáveis (uma por linha):

```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:SUA_SENHA_AQUI@postgresql:5432/postgres
JWT_SECRET=minha_chave_secreta_123456789_aleatoria
JWT_EXPIRES_IN=7d
```

**⚠️ IMPORTANTE:**
- Substitua `SUA_SENHA_AQUI` pela senha do PostgreSQL que você configurou
- Se o nome do serviço PostgreSQL não for "postgresql", substitua também

**Como descobrir a senha e nome:**
- Clique no serviço PostgreSQL na sidebar esquerda
- Veja as configurações ou variáveis de ambiente dele

---

## 🎬 PASSO 4: SALVAR E DEPLOY

1. Procure um botão **"Salvar"**, **"Deploy"** ou **"Criar"**
2. Clique nele
3. Aguarde alguns minutos (o build pode demorar)

---

## ✅ PRONTO! Backend configurado!

Agora vamos fazer o frontend. Me avise quando o backend estiver rodando!

---

## 🆘 SE DER ERRO:

**Erro: "Cannot find module"**
- Verifique se o Build Command está correto
- Deve ter: `npm ci && npx prisma generate`

**Erro: "Database connection failed"**
- Verifique o DATABASE_URL
- O nome do serviço PostgreSQL deve estar correto
- A senha deve estar correta

**Não encontrou onde colocar as variáveis:**
- Procure por "Settings" ou "Configurações"
- Ou "Advanced" ou "Avançado"

---

## 📸 ME MOSTRE:

Se estiver travado, me diga:
1. Qual tela você está vendo agora?
2. Quais campos/opções aparecem na tela?
3. Onde você está travado?

