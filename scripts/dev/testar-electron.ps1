# Script para testar as correções do Electron
# Verifica Node.js e executa o Electron com logs visíveis

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🧪 TESTE DAS CORREÇÕES DO ELECTRON" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Node.js
Write-Host "1️⃣  Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Node.js NÃO encontrado!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Erro ao verificar Node.js: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Verificar se backend existe
Write-Host "2️⃣  Verificando backend..." -ForegroundColor Yellow
$backendPath = "backend\src\server.js"
if (Test-Path $backendPath) {
    Write-Host "   ✅ Backend encontrado: $backendPath" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Backend não encontrado (normal em modo dev sem build)" -ForegroundColor Yellow
}

Write-Host ""

# 3. Executar Electron com START_BACKEND para testar verificação de Node.js
Write-Host "3️⃣  Iniciando Electron com START_BACKEND=true..." -ForegroundColor Yellow
Write-Host "   (Isso testará a verificação de Node.js e logs melhorados)" -ForegroundColor Gray
Write-Host ""
Write-Host "   📋 Você deve ver:" -ForegroundColor Cyan
Write-Host "      - ✅ Verificação de Node.js funcionando" -ForegroundColor Gray
Write-Host "      - ✅ Logs limpos (sem warnings repetitivos)" -ForegroundColor Gray
Write-Host "      - ✅ Mensagens de erro claras (se houver problemas)" -ForegroundColor Gray
Write-Host ""
Write-Host "   Pressione Ctrl+C para parar o teste" -ForegroundColor Yellow
Write-Host ""

# Executar Electron
$env:START_BACKEND = "true"
npm run dev:electron-only

