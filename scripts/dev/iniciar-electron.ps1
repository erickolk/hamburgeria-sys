# Script para iniciar apenas o Electron (assumindo backend/frontend já rodando)
# Uso: .\iniciar-electron.ps1

Write-Host "Iniciando Electron Desktop..." -ForegroundColor Cyan
Write-Host ""

# Verificar se backend esta rodando
Write-Host "Verificando backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "Backend esta online!" -ForegroundColor Green
    }
} catch {
    Write-Host "AVISO: Backend nao esta respondendo na porta 3001" -ForegroundColor Yellow
    Write-Host "   Certifique-se de que o backend esta rodando" -ForegroundColor Yellow
}

Write-Host ""

# Verificar se frontend esta rodando
Write-Host "Verificando frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "Frontend esta online!" -ForegroundColor Green
    }
} catch {
    Write-Host "AVISO: Frontend nao esta respondendo na porta 3000" -ForegroundColor Yellow
    Write-Host "   Certifique-se de que o frontend esta rodando" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Iniciando Electron..." -ForegroundColor Cyan
Write-Host ""

# Iniciar Electron sem tentar iniciar backend
$env:START_BACKEND = "false"
npm run dev:electron-only



