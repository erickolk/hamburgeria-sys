# Script de Build Completo Automatizado - Mercadinho PDV
# Este script executa todas as etapas necessárias para gerar um instalador completo:
# 1. Verifica pré-requisitos
# 2. Prepara backend (instala deps + gera Prisma Client)
# 3. Builda frontend (gera arquivos estáticos)
# 4. Valida tudo antes de continuar
# 5. Executa electron-builder
# 6. Verifica estrutura gerada

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   BUILD COMPLETO AUTOMATIZADO - MERCADINHO PDV" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$scriptFailed = $false

# Função para verificar se comando existe
function Test-Command {
    param([string]$Command)
    try {
        $null = Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Função para exibir erro e sair
function Exit-WithError {
    param([string]$Message)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "   ❌ ERRO: $Message" -ForegroundColor Red
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host ""
    pause
    exit 1
}

# ============================================
# ETAPA 1: Verificar Pré-requisitos
# ============================================
Write-Host "1️⃣ Verificando pré-requisitos..." -ForegroundColor Yellow
Write-Host ""

# Verificar Node.js
if (-not (Test-Command "node")) {
    Exit-WithError "Node.js não encontrado! Instale Node.js de https://nodejs.org/"
}
$nodeVersion = node --version
Write-Host "   ✅ Node.js instalado: $nodeVersion" -ForegroundColor Green

# Verificar npm
if (-not (Test-Command "npm")) {
    Exit-WithError "npm não encontrado! npm deve vir com Node.js."
}
$npmVersion = npm --version
Write-Host "   ✅ npm instalado: $npmVersion" -ForegroundColor Green

# Verificar PostgreSQL (opcional - apenas aviso)
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService) {
    if ($pgService.Status -eq "Running") {
        Write-Host "   ✅ PostgreSQL está rodando" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  PostgreSQL encontrado mas não está rodando (Status: $($pgService.Status))" -ForegroundColor Yellow
        Write-Host "      O aplicativo pode não funcionar sem PostgreSQL rodando" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  PostgreSQL não encontrado (opcional para build)" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# ETAPA 2: Preparar Backend
# ============================================
Write-Host "2️⃣ Preparando backend..." -ForegroundColor Yellow
Write-Host ""

# Verificar se diretório backend existe
if (-not (Test-Path "backend")) {
    Exit-WithError "Diretório 'backend' não encontrado! Execute este script na raiz do projeto."
}

Set-Location backend

# Instalar dependências de produção
Write-Host "   📦 Instalando dependências de produção..." -ForegroundColor Gray
try {
    npm install --production
    if ($LASTEXITCODE -ne 0) {
        Exit-WithError "Falha ao instalar dependências do backend"
    }
    Write-Host "   ✅ Dependências instaladas" -ForegroundColor Green
} catch {
    Exit-WithError "Erro ao instalar dependências do backend: $_"
}

# Gerar Prisma Client (CRÍTICO!)
Write-Host "   🔧 Gerando Prisma Client..." -ForegroundColor Gray
try {
    npx prisma generate
    if ($LASTEXITCODE -ne 0) {
        Exit-WithError "Falha ao gerar Prisma Client"
    }
    Write-Host "   ✅ Prisma Client gerado" -ForegroundColor Green
} catch {
    Exit-WithError "Erro ao gerar Prisma Client: $_"
}

# Verificar se Prisma Client foi gerado
$prismaClientPath = "node_modules\.prisma\client\index.js"
if (-not (Test-Path $prismaClientPath)) {
    Exit-WithError "Prisma Client não foi gerado corretamente! Arquivo não encontrado: $prismaClientPath"
}
Write-Host "   ✅ Prisma Client verificado: $prismaClientPath" -ForegroundColor Green

# Verificar se server.js existe
if (-not (Test-Path "src\server.js")) {
    Exit-WithError "Arquivo server.js não encontrado em backend/src/"
}
Write-Host "   ✅ Backend server.js encontrado" -ForegroundColor Green

Set-Location ..

Write-Host ""

# ============================================
# ETAPA 3: Buildar Frontend
# ============================================
Write-Host "3️⃣ Buildando frontend..." -ForegroundColor Yellow
Write-Host ""

# Verificar se diretório frontend existe
if (-not (Test-Path "frontend")) {
    Exit-WithError "Diretório 'frontend' não encontrado! Execute este script na raiz do projeto."
}

Set-Location frontend

# Instalar dependências
Write-Host "   📦 Instalando dependências..." -ForegroundColor Gray
try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Exit-WithError "Falha ao instalar dependências do frontend"
    }
    Write-Host "   ✅ Dependências instaladas" -ForegroundColor Green
} catch {
    Exit-WithError "Erro ao instalar dependências do frontend: $_"
}

# Gerar arquivos estáticos (CRÍTICO!)
Write-Host "   🏗️  Gerando arquivos estáticos (npm run generate)..." -ForegroundColor Gray
try {
    npm run generate
    if ($LASTEXITCODE -ne 0) {
        Exit-WithError "Falha ao gerar arquivos estáticos do frontend"
    }
    Write-Host "   ✅ Arquivos estáticos gerados" -ForegroundColor Green
} catch {
    Exit-WithError "Erro ao gerar arquivos estáticos: $_"
}

# Verificar se index.html foi gerado
$frontendIndexPath = ".output\public\index.html"
if (-not (Test-Path $frontendIndexPath)) {
    Exit-WithError "Frontend não foi buildado corretamente! Arquivo não encontrado: $frontendIndexPath"
}
Write-Host "   ✅ Frontend buildado verificado: $frontendIndexPath" -ForegroundColor Green

Set-Location ..

Write-Host ""

# ============================================
# ETAPA 4: Validação Final Antes do Build
# ============================================
Write-Host "4️⃣ Validação final..." -ForegroundColor Yellow
Write-Host ""

$validationErrors = @()

# Verificar Prisma Client
if (-not (Test-Path "backend\node_modules\.prisma\client\index.js")) {
    $validationErrors += "Prisma Client não encontrado"
} else {
    Write-Host "   ✅ Prisma Client: OK" -ForegroundColor Green
}

# Verificar Frontend buildado
if (-not (Test-Path "frontend\.output\public\index.html")) {
    $validationErrors += "Frontend não buildado"
} else {
    Write-Host "   ✅ Frontend buildado: OK" -ForegroundColor Green
}

# Verificar Backend server.js
if (-not (Test-Path "backend\src\server.js")) {
    $validationErrors += "Backend server.js não encontrado"
} else {
    Write-Host "   ✅ Backend server.js: OK" -ForegroundColor Green
}

# Verificar Electron main.js
if (-not (Test-Path "electron\main.js")) {
    $validationErrors += "Electron main.js não encontrado"
} else {
    Write-Host "   ✅ Electron main.js: OK" -ForegroundColor Green
}

if ($validationErrors.Count -gt 0) {
    Write-Host ""
    Write-Host "   ❌ Erros de validação encontrados:" -ForegroundColor Red
    foreach ($error in $validationErrors) {
        Write-Host "      - $error" -ForegroundColor Red
    }
    Exit-WithError "Validação falhou. Corrija os erros acima antes de continuar."
}

Write-Host ""

# ============================================
# ETAPA 5: Fechar processos e configurar ambiente
# ============================================
Write-Host "5️⃣ Preparando ambiente para build..." -ForegroundColor Yellow
Write-Host ""

# Fechar processos do aplicativo
Write-Host "   🛑 Fechando processos do aplicativo..." -ForegroundColor Gray
Get-Process | Where-Object {$_.ProcessName -like "*Mercadinho*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "   ✅ Processos fechados" -ForegroundColor Green

# Configurar variáveis de ambiente para desabilitar code signing
Write-Host "   ⚙️  Configurando variáveis de ambiente..." -ForegroundColor Gray
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
$env:WIN_CSC_LINK = ""
$env:WIN_CSC_KEY_PASSWORD = ""
$env:SKIP_NOTARIZATION = "true"
Write-Host "   ✅ Variáveis configuradas" -ForegroundColor Green

# Limpar cache do electron-builder
Write-Host "   🧹 Limpando cache do electron-builder..." -ForegroundColor Gray
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign" -ErrorAction SilentlyContinue
Write-Host "   ✅ Cache limpo" -ForegroundColor Green

Write-Host ""

# ============================================
# ETAPA 6: Executar Electron Builder
# ============================================
Write-Host "6️⃣ Executando electron-builder..." -ForegroundColor Green
Write-Host "   (Isso pode levar alguns minutos...)" -ForegroundColor Gray
Write-Host ""

try {
    npm run build:electron
    if ($LASTEXITCODE -ne 0) {
        Exit-WithError "Falha ao executar electron-builder"
    }
} catch {
    Exit-WithError "Erro ao executar electron-builder: $_"
}

Write-Host ""

# ============================================
# ETAPA 7: Verificar Estrutura Gerada
# ============================================
Write-Host "7️⃣ Verificando estrutura gerada..." -ForegroundColor Yellow
Write-Host ""

$buildPath = "C:\temp-mercadinho-dist\win-unpacked"

# Verificar instalador
$installerPattern = "C:\temp-mercadinho-dist\Mercadinho PDV Setup *.exe"
if (Test-Path $installerPattern) {
    $installer = Get-ChildItem $installerPattern | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    $sizeMB = [math]::Round($installer.Length / 1MB, 2)
    Write-Host "   ✅ Instalador gerado: $($installer.FullName)" -ForegroundColor Green
    Write-Host "      Tamanho: $sizeMB MB" -ForegroundColor Gray
} else {
    Write-Host "   ⚠️  Instalador não encontrado" -ForegroundColor Yellow
}

# Verificar estrutura do aplicativo
if (Test-Path $buildPath) {
    Write-Host "   ✅ Diretório de build encontrado: $buildPath" -ForegroundColor Green
    
    # Verificar backend
    $backendCheck = Test-Path "$buildPath\backend\src\server.js"
    if ($backendCheck) {
        Write-Host "   ✅ Backend incluído no build" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Backend não encontrado no build" -ForegroundColor Yellow
    }
    
    # Verificar Prisma Client no build
    $prismaCheck = Test-Path "$buildPath\backend\node_modules\.prisma\client\index.js"
    if ($prismaCheck) {
        Write-Host "   ✅ Prisma Client incluído no build" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Prisma Client não encontrado no build" -ForegroundColor Yellow
    }
    
    # Verificar executável
    $exeCheck = Test-Path "$buildPath\Mercadinho PDV.exe"
    if ($exeCheck) {
        Write-Host "   ✅ Executável gerado" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Executável não encontrado" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  Diretório de build não encontrado" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# CONCLUSÃO
# ============================================
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "   ✅ BUILD COMPLETO CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

if (Test-Path $installerPattern) {
    $installer = Get-ChildItem $installerPattern | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    Write-Host "🎉 INSTALADOR PRONTO PARA DISTRIBUIÇÃO:" -ForegroundColor Green
    Write-Host "   $($installer.FullName)" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ Próximos passos:" -ForegroundColor Cyan
    Write-Host "   1. Teste o instalador em uma máquina limpa" -ForegroundColor White
    Write-Host "   2. Verifique se PostgreSQL está rodando na máquina de destino" -ForegroundColor White
    Write-Host "   3. Verifique se Node.js está instalado na máquina de destino" -ForegroundColor White
} else {
    Write-Host "⚠️  Instalador não foi gerado, mas aplicativo pode estar em:" -ForegroundColor Yellow
    Write-Host "   $buildPath\Mercadinho PDV.exe" -ForegroundColor White
}

Write-Host ""
pause

