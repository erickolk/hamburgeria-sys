# 🔧 Solução: Backend Não Está Iniciando

## 🎯 Situação Atual

✅ **Instalador gerado com sucesso**  
✅ **Janela aparece** (correções funcionaram!)  
❌ **Backend não responde após 60 segundos**

A janela aparece mostrando:
> "Erro ao conectar ao backend"  
> "O backend não respondeu após 60 segundos"

---

## 🔍 Possíveis Causas

### 1. PostgreSQL Não Está Rodando

O backend precisa do PostgreSQL para funcionar.

**Verificar:**
```powershell
Get-Service -Name "postgresql*"
```

**Se não estiver rodando, iniciar:**
```powershell
# Como Administrador
Start-Service -Name "postgresql-x64-*"  # Ajuste o nome conforme sua instalação
```

---

### 2. Node.js Não Está Instalado

O aplicativo precisa do Node.js para rodar o backend como processo filho.

**Verificar:**
```powershell
node --version
```

**Se não estiver instalado:**
1. Baixar de: https://nodejs.org/
2. Instalar normalmente
3. Reiniciar o computador (para atualizar PATH)

---

### 3. Banco de Dados Não Existe

O backend precisa do banco `mercadinho_local`.

**Verificar e criar:**
```powershell
# Conectar ao PostgreSQL
psql -U postgres

# No prompt do PostgreSQL:
CREATE DATABASE mercadinho_local;
\q
```

**Ou usar o script de instalação:**
```powershell
# O instalador deveria ter criado, mas pode não ter funcionado
```

---

### 4. Porta 3001 Já Está Em Uso

Outro processo pode estar usando a porta do backend.

**Verificar:**
```powershell
netstat -ano | findstr :3001
```

**Se estiver em uso:**
- Fechar o processo que está usando
- Ou alterar a porta no código

---

### 5. Backend Não Está No Local Correto

O aplicativo procura o backend em:

```
C:\Program Files\Mercadinho PDV\resources\backend\src\server.js
```

**Verificar estrutura após instalação:**
```powershell
# Verificar se backend foi instalado
Test-Path "C:\Program Files\Mercadinho PDV\resources\backend\src\server.js"
```

---

### 6. Erro Ao Iniciar Backend

O backend pode estar falhando ao iniciar por algum erro no código ou configuração.

**Verificar logs:**
- Os logs do backend são impressos no console
- Mas em produção, não vemos o console diretamente

---

## 🔧 Soluções Rápidas

### Solução 1: Verificar Requisitos

Execute este comando para verificar tudo de uma vez:

```powershell
Write-Host "🔍 Verificando requisitos..." -ForegroundColor Cyan

# PostgreSQL
$pg = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pg) {
    Write-Host "✅ PostgreSQL: $($pg.Name) - Status: $($pg.Status)" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL não encontrado" -ForegroundColor Red
}

# Node.js
$node = node --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js: $node" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js não encontrado" -ForegroundColor Red
}

# Porta 3001
$port = netstat -ano | findstr :3001
if ($port) {
    Write-Host "⚠️  Porta 3001 está em uso:" -ForegroundColor Yellow
    Write-Host $port -ForegroundColor Gray
} else {
    Write-Host "✅ Porta 3001 está livre" -ForegroundColor Green
}
```

### Solução 2: Instalar Requisitos Faltando

**Se PostgreSQL não estiver instalado:**
- Instalar PostgreSQL: https://www.postgresql.org/download/windows/
- Ou usar o instalador automático que deveria ter instalado

**Se Node.js não estiver instalado:**
- Instalar Node.js LTS: https://nodejs.org/
- Versão recomendada: 18.x ou 20.x

---

## 🔍 Diagnóstico Detalhado

### Verificar Logs do Aplicativo

O aplicativo salva logs. Encontrar onde:

1. **Verificar processos rodando:**
   ```powershell
   Get-Process | Where-Object {$_.ProcessName -like "*Mercadinho*"}
   ```

2. **Executar com log visível:**
   - Abrir PowerShell
   - Navegar até o diretório de instalação
   - Executar manualmente para ver logs

### Executar Script de Diagnóstico

```powershell
.\diagnostico-app-instalado.ps1
```

Este script:
- ✅ Verifica estrutura de arquivos
- ✅ Verifica PostgreSQL
- ✅ Verifica Node.js
- ✅ Executa aplicativo e captura logs

---

## 💡 Recomendações

### Para Clientes (Distribuição)

O aplicativo precisa de:
1. ✅ **Node.js instalado** (requisito obrigatório)
2. ✅ **PostgreSQL instalado** (requisito obrigatório)
3. ✅ **Banco de dados criado** (deveria ser automático)

**Opções:**

**A) Instalador Completo** (Futuro)
- Incluir Node.js no instalador
- Incluir PostgreSQL no instalador
- Configurar tudo automaticamente

**B) Requisitos Pré-instalados** (Atual)
- Cliente instala Node.js antes
- Cliente instala PostgreSQL antes
- Aplicativo só configura banco

### Para Desenvolvimento

O aplicativo funciona porque:
- Node.js já está instalado
- PostgreSQL já está instalado
- Banco já está criado

---

## 📝 Próximos Passos

1. ✅ **Verificar requisitos** no computador onde está testando
2. ✅ **Instalar o que falta** (Node.js ou PostgreSQL)
3. ✅ **Testar novamente** o aplicativo
4. ✅ **Se ainda não funcionar**, verificar logs detalhados

---

**Status:** 🟡 **Aguardando verificação de requisitos (PostgreSQL e Node.js)**

