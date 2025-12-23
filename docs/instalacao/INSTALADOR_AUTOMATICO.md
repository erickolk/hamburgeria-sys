# 🚀 Instalador Automático - Mercadinho PDV

> **Instalação totalmente automatizada para clientes finais**

---

## 🎯 Visão Geral

O instalador automático configura **TUDO** para você:

✅ PostgreSQL (se necessário)  
✅ Banco de dados local  
✅ Configurações do sistema  
✅ Migrations do banco  
✅ Backup automático  
✅ Atalhos e diretórios  

**O cliente só precisa executar e seguir as instruções!**

---

## 📦 Opções de Instalação

### Opção 1: Instalador Completo (Recomendado) ⭐

**Para: Clientes finais sem conhecimento técnico**

```powershell
# Executar como Administrador
.\installer\install.ps1
```

**O que faz automaticamente:**
- ✅ Verifica/instala PostgreSQL
- ✅ Cria banco de dados
- ✅ Configura .env
- ✅ Instala dependências
- ✅ Aplica migrations
- ✅ Configura backup automático
- ✅ Cria diretórios necessários

**Tempo**: ~5-10 minutos (depende da instalação do PostgreSQL)

---

### Opção 2: Instalador Simplificado

**Para: Quando PostgreSQL já está instalado**

```powershell
.\installer\install-simple.ps1
```

**O que faz:**
- ✅ Cria banco de dados
- ✅ Configura .env
- ✅ Aplica migrations

**Tempo**: ~1-2 minutos

---

### Opção 3: Com Parâmetros

**Para: Instalação com configurações pré-definidas**

```powershell
.\installer\install.ps1 `
  -VpsApiUrl "https://api.mercadinho.com/api" `
  -SyncToken "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🔧 Como Funciona

### Fluxo do Instalador Completo

```
┌─────────────────────────────────────────┐
│  Executar install.ps1 como Admin       │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  1. Verificar PostgreSQL                │
│     • Se não existe: instala via winget │
│     • Se existe: usa o instalado        │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  2. Criar Banco de Dados                │
│     • Cria mercadinho_local             │
│     • Verifica se já existe             │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  3. Configurar Diretórios               │
│     • Dados: %USERPROFILE%\Mercadinho   │
│     • Backups: C:\Backups\Mercadinho    │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  4. Criar/Configurar .env               │
│     • DATABASE_URL                      │
│     • DATABASE_MODE                     │
│     • VPS_API_URL (se fornecido)        │
│     • SYNC_TOKEN (se fornecido)         │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  5. Instalar Dependências               │
│     • npm install --production          │
│     • npx prisma generate               │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  6. Aplicar Migrations                  │
│     • Executa SQL de migration          │
│     • Cria tabelas de sincronização     │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  7. Configurar Backup (opcional)        │
│     • Cria tarefa agendada              │
│     • Diário às 23h                     │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  ✅ INSTALAÇÃO CONCLUÍDA!               │
└─────────────────────────────────────────┘
```

---

## 📋 Requisitos

### Pré-requisitos

- ✅ **Windows 10/11**
- ✅ **PowerShell 5.1+** (já vem no Windows)
- ✅ **Permissões de Administrador**
- ✅ **Internet** (para baixar PostgreSQL, se necessário)

### Opcional (para instalação automática do PostgreSQL)

- ✅ **winget** (Windows Package Manager)
  - Vem no Windows 11
  - Windows 10: Atualização opcional

---

## 🚀 Passo a Passo para o Cliente

### Instruções Simples

1. **Fazer download do instalador**
   - Receber arquivo `install.ps1`
   - Salvar em pasta do projeto

2. **Executar como Administrador**
   - Clicar com botão direito em `install.ps1`
   - Selecionar "Executar com PowerShell"
   - Ou "Executar como Administrador"

3. **Seguir as instruções na tela**
   - Responder perguntas (Sim/Não)
   - Aguardar instalação
   - Ver mensagens de progresso

4. **Concluído!**
   - Sistema pronto para usar
   - Executar: `npm run electron`

---

## ⚙️ Configurações Avançadas

### Instalação Silenciosa (Para Distribuição)

```powershell
# Instalar PostgreSQL automaticamente sem perguntar
.\installer\install.ps1 `
  -VpsApiUrl "https://api.mercadinho.com/api" `
  -SyncToken "seu_token" `
  -InstallDir "C:\Program Files\Mercadinho PDV"
```

### Personalizar Diretórios

```powershell
# Instalar em diretório específico
$env:MERCADINHO_INSTALL_DIR = "D:\Mercadinho"
.\installer\install.ps1
```

### Pular Instalação do PostgreSQL

Se PostgreSQL já estiver instalado, o instalador detecta automaticamente.

---

## 🎁 Criar Pacote para Cliente

### Estrutura Recomendada

```
Mercadinho-PDV-Installer/
├── install.ps1                    # Instalador principal
├── install-simple.ps1            # Instalador simplificado
├── backend/                      # Código do backend
├── frontend/                     # Código do frontend
├── electron/                     # Código do Electron
├── package.json                  # Dependências
└── README.md                     # Instruções

OU

Mercadinho-PDV-Installer.exe     # Instalador .exe (via electron-builder)
```

### Script de Empacotamento

```powershell
# Criar pasta para distribuição
$distDir = "Mercadinho-PDV-Distribuicao"
New-Item -ItemType Directory -Path $distDir -Force

# Copiar arquivos necessários
Copy-Item -Path "installer\*.ps1" -Destination "$distDir\" -Recurse
Copy-Item -Path "backend" -Destination "$distDir\" -Recurse -Exclude "node_modules"
Copy-Item -Path "frontend" -Destination "$distDir\" -Recurse -Exclude "node_modules"
Copy-Item -Path "electron" -Destination "$distDir\" -Recurse
Copy-Item -Path "package.json" -Destination "$distDir\"

# Criar README
@"
# Instalação - Mercadinho PDV

## Instruções Rápidas

1. Clique com botão direito em 'install.ps1'
2. Selecione 'Executar como Administrador'
3. Siga as instruções na tela
4. Pronto! Execute o sistema depois.

Para mais detalhes, veja INSTALADOR_AUTOMATICO.md
"@ | Out-File -FilePath "$distDir\README.md" -Encoding UTF8

Write-Host "✅ Pacote criado em: $distDir" -ForegroundColor Green
```

---

## 🔐 Segurança

### Senha do PostgreSQL

O instalador solicita a senha do PostgreSQL. Por padrão, tenta usar:
- Senha fornecida pelo usuário
- Senha padrão: `postgres123` (se deixar em branco)

**⚠️ IMPORTANTE**: Em produção, sempre usar senha forte!

### JWT Secret

O instalador gera automaticamente um JWT secret seguro com 32 caracteres.

### Tokens de Sincronização

Tokens são solicitados opcionalmente. Podem ser configurados depois na interface.

---

## 🐛 Troubleshooting

### Problema: "Script não pode ser executado"

**Solução:**
```powershell
# Alterar política de execução (temporariamente)
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# Ou executar diretamente
powershell.exe -ExecutionPolicy Bypass -File .\installer\install.ps1
```

### Problema: "PostgreSQL não encontrado"

**Soluções:**
1. Instalar manualmente: https://www.postgresql.org/download/windows/
2. Ou permitir instalação automática via winget
3. Verificar se serviço está rodando: `Get-Service postgresql*`

### Problema: "Erro ao criar banco de dados"

**Verificar:**
- PostgreSQL está rodando?
- Senha está correta?
- Usuário tem permissões?

```powershell
# Testar conexão
psql -U postgres -c "SELECT version();"
```

### Problema: "Erro ao aplicar migrations"

**Solução:**
```powershell
# Aplicar manualmente
cd backend
npx prisma migrate deploy

# Ou via SQL direto
psql -U postgres -d mercadinho_local -f prisma\migrations\20251203_add_offline_sync\migration.sql
```

---

## 📊 Verificar Instalação

### Teste Rápido

```powershell
# 1. Verificar banco de dados
psql -U postgres -d mercadinho_local -c "SELECT COUNT(*) FROM sales;"

# 2. Verificar .env
cat backend\.env

# 3. Verificar diretórios
Test-Path "$env:USERPROFILE\Mercadinho"
Test-Path "C:\Backups\Mercadinho"

# 4. Verificar backup automático
Get-ScheduledTask -TaskName "Backup Mercadinho PDV"
```

### Log de Instalação

O instalador salva configuração em:
```
%USERPROFILE%\Mercadinho\install-config.json
```

---

## 📞 Suporte

### Em Caso de Problemas

1. Verificar se todos os pré-requisitos estão instalados
2. Verificar logs de erro no PowerShell
3. Ver arquivo `install-config.json` para detalhes
4. Consultar [Troubleshooting completo](OFFLINE_SYNC_SETUP.md#troubleshooting)

---

## 🎯 Para Desenvolvedores

### Criar Nova Versão do Instalador

1. Testar instalação completa
2. Verificar todas as etapas
3. Atualizar este documento se necessário
4. Testar em máquina limpa (VM recomendado)

### Personalizar Instalador

O instalador é modular. Cada etapa pode ser modificada:

- `Etapa 1`: Verificação de PostgreSQL
- `Etapa 2`: Criação de banco
- `Etapa 3`: Configuração de diretórios
- `Etapa 4`: Configuração de .env
- `Etapa 5`: Instalação de dependências
- `Etapa 6`: Configuração de backup
- `Etapa 7`: Finalização

---

## ✅ Checklist de Instalação

Após executar o instalador, verificar:

- [ ] PostgreSQL está rodando
- [ ] Banco `mercadinho_local` existe
- [ ] Arquivo `backend\.env` existe
- [ ] Diretórios de dados criados
- [ ] Backup automático configurado (se escolhido)
- [ ] Sistema inicia: `npm run electron`

---

<div align="center">

**🚀 Instalação Automatizada - Zero Configuração Manual!**

O cliente só executa e usa! 🎉

</div>

