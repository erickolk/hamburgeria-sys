# 🚀 Instalador NSIS Automatizado - Mercadinho PDV

> **Instalador completo que configura TUDO automaticamente com apenas 2 cliques!**

---

## 🎯 O Que Este Instalador Faz

Quando o cliente executa o instalador `.exe`, **TUDO** é configurado automaticamente:

✅ **Instalação dos arquivos**  
✅ **Verifica e instala PostgreSQL** (se necessário via winget)  
✅ **Cria banco de dados** `mercadinho_local`  
✅ **Configura arquivo `.env`** com todas as variáveis  
✅ **Instala dependências npm** do backend  
✅ **Aplica migrations** do banco de dados  
✅ **Configura backup automático**  
✅ **Cria diretórios necessários**  
✅ **Cria atalhos** no Desktop e Menu Iniciar  

**O cliente só precisa:**
1. Clicar duas vezes no instalador
2. Aceitar os termos
3. Escolher pasta de instalação (opcional)
4. Aguardar a instalação automática
5. **PRONTO!** Sistema funcionando!

---

## 📦 Como Gerar o Instalador

### Pré-requisitos

1. **Node.js** instalado
2. **npm** instalado
3. **Dependências** do projeto instaladas

### Passo a Passo

```powershell
# 1. Instalar dependências (se ainda não instalou)
npm install

# 2. Build do frontend
npm run build:frontend

# 3. Build do instalador Electron
npm run build:electron
```

### Resultado

Após o build, você terá:

```
dist/
├── Mercadinho-PDV-Setup-1.0.0.exe  ← INSTALADOR COMPLETO
└── win-unpacked/                    ← Aplicativo não empacotado (para testes)
```

---

## 🔧 Estrutura do Instalador

### Arquivos Principais

1. **`build/installer.nsh`**
   - Script NSIS customizado
   - Executa configuração automática após instalação
   - Cria flag de primeira execução

2. **`installer/auto-setup.ps1`**
   - Script PowerShell de configuração automática
   - Instala PostgreSQL (se necessário)
   - Cria banco de dados
   - Configura `.env`
   - Instala dependências
   - Aplica migrations

3. **`electron/main.js`**
   - Detecta primeira execução
   - Marca setup como completo
   - Integra com sistema de instalação

### Fluxo de Instalação

```
1. Cliente executa .exe
   ↓
2. NSIS instala arquivos
   ↓
3. NSIS executa auto-setup.ps1
   ↓
4. Script PowerShell configura TUDO
   ↓
5. NSIS cria first-run.flag
   ↓
6. Instalação concluída!
   ↓
7. Cliente executa aplicativo
   ↓
8. Electron detecta primeira execução
   ↓
9. Sistema funcionando! ✅
```

---

## ⚙️ Configuração do Instalador

### `package.json` - Seção `build.nsis`

```json
{
  "build": {
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "Mercadinho PDV",
      "installerIcon": "electron/assets/icon.ico",
      "runAfterFinish": true,
      "menuCategory": "Business",
      "include": "build/installer.nsh",
      "deleteAppDataOnUninstall": false
    },
    "extraResources": [
      {
        "from": "installer/auto-setup.ps1",
        "to": "installer/auto-setup.ps1"
      }
    ]
  }
}
```

### Script NSIS (`build/installer.nsh`)

O script NSIS executa automaticamente após a instalação dos arquivos:

- Copia o script PowerShell para diretório temporário
- Executa o script com permissões de Administrador
- Cria flag de primeira execução
- Limpa arquivos temporários

---

## 📝 O Que o Script PowerShell Faz

### `installer/auto-setup.ps1`

O script executa **6 etapas** automaticamente:

#### **ETAPA 1: Verificar/Instalar PostgreSQL**
- Verifica se PostgreSQL está instalado
- Se não estiver, tenta instalar via `winget`
- Aguarda serviço iniciar

#### **ETAPA 2: Criar Banco de Dados**
- Verifica se banco `mercadinho_local` existe
- Cria banco se não existir
- Usa credenciais padrão (postgres/postgres123)

#### **ETAPA 3: Criar Diretórios**
- Cria `%USERPROFILE%\Mercadinho` (dados)
- Cria `C:\Backups\Mercadinho` (backups)

#### **ETAPA 4: Configurar .env**
- Gera arquivo `.env` completo
- Gera JWT_SECRET aleatório
- Configura todas as variáveis necessárias

#### **ETAPA 5: Instalar Dependências e Migrations**
- Instala pacotes npm do backend
- Gera Prisma Client
- Aplica migrations do banco de dados

#### **ETAPA 6: Configurar Backup Automático**
- Configura tarefa agendada de backup
- Define backup diário automático

---

## 🔍 Detecção de Primeira Execução

### Como Funciona

1. **Durante instalação:**
   - NSIS cria arquivo `first-run.flag` no diretório de instalação

2. **Na primeira execução:**
   - Electron verifica se `first-run.flag` existe
   - Se existir e `setup-complete.flag` não existir, é primeira execução
   - Após verificar, cria `setup-complete.flag` em `%USERPROFILE%\Mercadinho\`

3. **Próximas execuções:**
   - Electron detecta que setup já foi completado
   - Inicia normalmente sem verificações extras

### Código em `electron/main.js`

```javascript
function isFirstRun() {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) return false;

  const installFlag = app.isPackaged 
    ? path.join(path.dirname(process.execPath), 'first-run.flag')
    : path.join(__dirname, '..', 'first-run.flag');
  
  const setupComplete = fs.existsSync(SETUP_COMPLETE_FLAG);
  
  return fs.existsSync(installFlag) && !setupComplete;
}
```

---

## 📋 Requisitos do Sistema

### Para o Cliente Final

- **Windows 10/11** (64-bit)
- **Privilégios de Administrador** (para instalação)
- **Conexão com Internet** (para instalar PostgreSQL via winget, se necessário)
- **Espaço em disco:** ~500MB

### Opcional

- **Node.js** já instalado (se não, o script pode instalar)
- **PostgreSQL** já instalado (se não, o script tenta instalar via winget)

---

## 🐛 Troubleshooting

### Problema: PostgreSQL não instala automaticamente

**Causa:** winget não disponível ou erro na instalação

**Solução:**
1. Instalar PostgreSQL manualmente: https://www.postgresql.org/download/windows/
2. Executar instalador novamente

### Problema: Script PowerShell bloqueado

**Causa:** Política de execução do PowerShell

**Solução:** O script usa `-ExecutionPolicy Bypass` automaticamente

### Problema: Banco de dados não cria

**Causa:** PostgreSQL não está rodando ou credenciais incorretas

**Solução:**
1. Verificar serviço PostgreSQL: `Get-Service postgresql*`
2. Iniciar serviço se necessário
3. Verificar senha padrão (postgres123)

### Problema: Migrations não aplicam

**Causa:** Dependências npm não instaladas ou Prisma não configurado

**Solução:**
1. Executar manualmente:
   ```powershell
   cd "$env:ProgramFiles\Mercadinho PDV\backend"
   npm install
   npx prisma generate
   npx prisma migrate deploy
   ```

---

## 📚 Documentação Relacionada

- [INSTALADOR_AUTOMATICO.md](INSTALADOR_AUTOMATICO.md) - Guia dos scripts PowerShell
- [OFFLINE_SYNC_SETUP.md](../offline-sync/OFFLINE_SYNC_SETUP.md) - Configuração offline
- [ELECTRON_SETUP.md](../electron/ELECTRON_SETUP.md) - Setup do Electron

---

## ✅ Checklist de Build

Antes de gerar o instalador, verifique:

- [ ] Frontend buildado (`npm run build:frontend`)
- [ ] Backend funciona localmente
- [ ] Script `installer/auto-setup.ps1` existe
- [ ] Script `build/installer.nsh` existe
- [ ] Ícone do instalador configurado (`electron/assets/icon.ico`)
- [ ] Versão atualizada no `package.json`

---

## 🎉 Resultado Final

Após instalação bem-sucedida:

```
✅ PostgreSQL instalado e rodando
✅ Banco mercadinho_local criado
✅ Arquivo .env configurado
✅ Dependências instaladas
✅ Migrations aplicadas
✅ Backup automático configurado
✅ Atalhos criados
✅ Sistema pronto para uso!
```

O cliente pode abrir o aplicativo e começar a usar **IMEDIATAMENTE**! 🚀

---

**Criado em:** 2025-01-03  
**Versão:** 1.0.0  
**Autor:** Sistema Mercadinho PDV

