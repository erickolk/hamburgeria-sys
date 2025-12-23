# 🐘 Como Iniciar o PostgreSQL no Docker Desktop

## ⚠️ Problema Atual

O Electron está mostrando erro porque o PostgreSQL não está rodando. Siga os passos abaixo:

## 📋 Passo a Passo

### Opção 1: Via Docker Desktop (Recomendado)

1. **Abra o Docker Desktop** (já deve estar aberto)

2. **Vá na aba "Containers"** (já está selecionada)

3. **Clique no botão "Run"** ou procure por um container chamado `mercadinho_db`

4. **Se não existir container:**
   - Clique em **"Run"** ou **"Create"**
   - Na busca de imagens, digite: `postgres:15-alpine`
   - Clique na imagem e configure:
     - **Container name:** `mercadinho_db`
     - **Ports:** `5433:5432` (mapear porta 5433 do host para 5432 do container)
     - **Environment variables:**
       - `POSTGRES_DB=mercadinho`
       - `POSTGRES_USER=postgres`
       - `POSTGRES_PASSWORD=postgres123`
   - Clique em **"Run"**

5. **Aguarde o container iniciar** (status deve ficar "Running")

### Opção 2: Via Terminal (se Docker estiver no PATH)

Abra um terminal PowerShell **como Administrador** e execute:

```powershell
cd C:\Users\erick\OneDrive\Documentos\Projetos\mercadinho
docker compose up -d db
```

## ✅ Verificar se está Funcionando

Após iniciar o container:

1. No Docker Desktop, o container `mercadinho_db` deve aparecer como **"Running"**
2. O backend deve conseguir conectar (verifique os logs do backend)
3. O Electron deve parar de mostrar o erro

## 🔧 Configuração do Backend

Certifique-se de que o arquivo `backend/.env` existe com:

```env
DATABASE_URL=postgresql://postgres:postgres123@localhost:5433/mercadinho
PORT=3001
NODE_ENV=development
JWT_SECRET=mercadinho_jwt_secret_key_2024
```

## 🚀 Após Iniciar o PostgreSQL

1. **Reinicie o backend** (feche e abra novamente a janela do PowerShell do backend)
2. **Aguarde o Electron** detectar que o backend está online
3. **O PDV deve carregar automaticamente**

---

**Dica:** Se o container já existir mas estiver parado, clique no botão de "Play" ▶️ ao lado do container no Docker Desktop.


