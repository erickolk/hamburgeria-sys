# Script para iniciar Electron com backend automático
# Uso: .\iniciar-com-backend.ps1

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 INICIANDO MERCADINHO COM BACKEND AUTOMÁTICO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "🔍 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Node.js NÃO encontrado!" -ForegroundColor Red
        Write-Host "   💡 Instale Node.js de: https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "   ❌ Erro ao verificar Node.js: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Verificar backend
Write-Host "🔍 Verificando backend..." -ForegroundColor Yellow
$backendPath = "backend\src\server.js"
if (Test-Path $backendPath) {
    Write-Host "   ✅ Backend encontrado: $backendPath" -ForegroundColor Green
} else {
    Write-Host "   ❌ Backend NÃO encontrado!" -ForegroundColor Red
    Write-Host "   💡 Certifique-se de que o backend existe" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Verificar se Electron está instalado
Write-Host "🔍 Verificando Electron..." -ForegroundColor Yellow
if (Test-Path "node_modules\electron\dist\electron.exe") {
    Write-Host "   ✅ Electron encontrado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Electron não encontrado, tentando instalar..." -ForegroundColor Yellow
    npm install electron --save-dev
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Erro ao instalar Electron" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🚀 Iniciando aplicação..." -ForegroundColor Cyan
Write-Host "   (Backend será iniciado automaticamente)" -ForegroundColor Gray
Write-Host ""

# Definir variáveis de ambiente e iniciar
$env:START_BACKEND = "true"
$env:NODE_ENV = "development"

# Executar Electron
.\node_modules\electron\dist\electron.exe .

