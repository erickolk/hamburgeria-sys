# 🏪 Mercadinho PDV - Guia de Instalação no Cliente

## 📋 Visão Geral

O Mercadinho PDV é um sistema de ponto de venda (PDV) para pequenos mercados. Ele funciona com banco de dados local e opcionalmente sincroniza com um servidor VPS.

### Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      COMPUTADOR DO CLIENTE                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────┐      ┌──────────────────────────┐    │
│   │  Mercadinho PDV │ ───► │  PostgreSQL (local)      │    │
│   │  (Electron App) │      │  Banco: mercadinho_local │    │
│   └─────────────────┘      │  Porta: 5432             │    │
│           │                │  Usuário: postgres       │    │
│           │                │  Senha: postgres123      │    │
│           │                └──────────────────────────┘    │
│           │                                                 │
│           │ (opcional, se habilitado)                      │
│           ▼                                                 │
│   ┌─────────────────────────────────────────────────┐      │
│   │              Internet (Sincronização)            │      │
│   └─────────────────────────────────────────────────┘      │
│                          │                                  │
└──────────────────────────│──────────────────────────────────┘
                           ▼
                ┌─────────────────────┐
                │   VPS (Servidor)    │
                │   (se configurado)  │
                └─────────────────────┘
```

---

## 📦 O que você precisa levar no pendrive

| Arquivo | Tamanho | Descrição |
|---------|---------|-----------|
| `postgresql-15.4-1-windows-x64.exe` | ~300 MB | Instalador do PostgreSQL |
| `Mercadinho PDV Setup 1.0.0.exe` | ~200 MB | Instalador do aplicativo |

> **Localização**: `C:\temp-mercadinho-dist\`

---

## 🔧 Processo de Instalação (Passo a Passo)

### ETAPA 1: Instalar PostgreSQL

#### 1.1 Executar o instalador
- Clique duplo em `postgresql-15.4-1-windows-x64.exe`
- Se pedir permissão de administrador, clique **Sim**

#### 1.2 Durante a instalação
| Tela | O que fazer |
|------|-------------|
| Welcome | Next |
| Installation Directory | Manter padrão (`C:\Program Files\PostgreSQL\15`) → Next |
| Select Components | Manter todos selecionados → Next |
| Data Directory | Manter padrão → Next |
| **Password** | Digitar: `postgres123` → Next |
| **Port** | Manter: `5432` → Next |
| Locale | Selecionar: `Portuguese, Brazil` → Next |
| Ready to Install | Install |
| Completing | **DESMARCAR** "Launch Stack Builder" → Finish |

#### 1.3 Verificar instalação
1. Abrir o **Prompt de Comando** (cmd)
2. Digitar:
```cmd
"C:\Program Files\PostgreSQL\15\bin\psql" -U postgres -c "SELECT version();"
```
3. Digitar a senha: `postgres123`
4. Se mostrar a versão do PostgreSQL, está funcionando!

---

### ETAPA 2: Criar o Banco de Dados

#### 2.1 Abrir o prompt do PostgreSQL
```cmd
"C:\Program Files\PostgreSQL\15\bin\psql" -U postgres
```
Senha: `postgres123`

#### 2.2 Criar o banco
```sql
CREATE DATABASE mercadinho_local;
```

#### 2.3 Verificar
```sql
\l
```
Deve aparecer `mercadinho_local` na lista.

#### 2.4 Sair
```sql
\q
```

---

### ETAPA 3: Instalar o Mercadinho PDV

#### 3.1 Executar o instalador
- Clique duplo em `Mercadinho PDV Setup 1.0.0.exe`
- Se pedir permissão de administrador, clique **Sim**

#### 3.2 Durante a instalação
| Tela | O que fazer |
|------|-------------|
| Licença | Aceitar → Next |
| Diretório | Manter padrão → Next |
| Menu Iniciar | Manter padrão → Next |
| Pronto | Install |
| Concluído | Marcar "Executar Mercadinho PDV" → Finish |

---

### ETAPA 4: Primeira Execução

#### 4.1 O que acontece automaticamente:
1. O app detecta que é a primeira execução
2. Cria o arquivo `.env` com configurações padrão
3. Conecta ao PostgreSQL local
4. **Cria todas as tabelas** automaticamente (prisma db push)
5. Abre a interface

#### 4.2 Tela de carregamento
```
🏪 Mercadinho PDV
[Spinner]
Iniciando aplicativo...
Aguarde enquanto o backend está sendo iniciado.
```

#### 4.3 Se tudo der certo
- A tela de login ou dashboard aparece
- O sistema está pronto para uso!

---

## 🐛 Solução de Problemas

### Problema: "Backend não respondeu"

**Causa provável**: PostgreSQL não está rodando

**Solução**:
1. Abrir **Serviços** (services.msc)
2. Procurar por `postgresql-x64-15`
3. Se estiver "Parado", clicar com botão direito → **Iniciar**
4. Reiniciar o Mercadinho PDV

---

### Problema: "Can't reach database server at localhost:5432"

**Causa provável**: Banco não existe ou porta errada

**Solução**:
```cmd
"C:\Program Files\PostgreSQL\15\bin\psql" -U postgres -c "CREATE DATABASE mercadinho_local;"
```

---

### Problema: "The column 'is_active' does not exist"

**Causa provável**: Tabelas não foram criadas

**Solução**:
1. Abrir prompt de comando **na pasta do backend instalado**:
```cmd
cd "%LOCALAPPDATA%\Programs\Mercadinho PDV\backend"
```

2. Executar:
```cmd
set DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/mercadinho_local
npx prisma db push --accept-data-loss
```

---

### Problema: Aplicativo abre mas tela fica branca

**Causa provável**: Frontend não carregou

**Solução**:
1. Pressionar `F12` para abrir DevTools
2. Ver erros no Console
3. Pressionar `Ctrl+R` para recarregar

---

## 📁 Locais Importantes

| O quê | Caminho |
|-------|---------|
| Aplicativo instalado | `C:\Users\[USUARIO]\AppData\Local\Programs\Mercadinho PDV\` |
| Backend | `...\Mercadinho PDV\backend\` |
| Logs do app | `C:\Users\[USUARIO]\Mercadinho\logs\` |
| Banco PostgreSQL | `C:\Program Files\PostgreSQL\15\data\` |

---

## ⚙️ Configuração Padrão

O arquivo `.env` é criado automaticamente em:
`C:\Users\[USUARIO]\AppData\Local\Programs\Mercadinho PDV\backend\.env`

```env
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/mercadinho_local
DATABASE_MODE=local
PORT=3001
NODE_ENV=production
SYNC_ENABLED=false
JWT_SECRET=mercadinho_jwt_secret_key_2024_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

---

## 🔄 Sincronização com VPS (Opcional)

Para habilitar sincronização com servidor remoto:

1. Editar o arquivo `.env`
2. Alterar:
```env
SYNC_ENABLED=true
VPS_API_URL=https://seu-servidor.com/api
SYNC_TOKEN=seu_token_aqui
```
3. Reiniciar o aplicativo

---

## 📞 Comandos Úteis

### Verificar se PostgreSQL está rodando
```cmd
sc query postgresql-x64-15
```

### Conectar ao banco manualmente
```cmd
"C:\Program Files\PostgreSQL\15\bin\psql" -U postgres -d mercadinho_local
```

### Ver logs do aplicativo
```cmd
notepad "%USERPROFILE%\Mercadinho\logs\app-2025-12-09.log"
```

### Recriar tabelas do zero
```cmd
cd "%LOCALAPPDATA%\Programs\Mercadinho PDV\backend"
set DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/mercadinho_local
npx prisma db push --force-reset
```
⚠️ **CUIDADO**: Isso apaga todos os dados!

---

## ✅ Checklist de Instalação

- [ ] PostgreSQL 15 instalado
- [ ] Senha do PostgreSQL: `postgres123`
- [ ] Porta do PostgreSQL: `5432`
- [ ] Serviço `postgresql-x64-15` rodando
- [ ] Banco `mercadinho_local` criado
- [ ] Mercadinho PDV instalado
- [ ] Aplicativo abre sem erros
- [ ] Tela de login/dashboard aparece

---

## 📝 Notas

- O aplicativo é **offline-first**: funciona sem internet
- Dados são salvos localmente no PostgreSQL
- Sincronização com VPS é opcional e configurável
- Logs são salvos em `%USERPROFILE%\Mercadinho\logs\`
- Pressione `F12` a qualquer momento para abrir ferramentas de debug

---

*Documento gerado em: Dezembro 2025*
*Versão do Sistema: 1.0.0*


