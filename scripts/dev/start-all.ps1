# Script para iniciar todos os serviços do Mercadinho
# Uso: .\start-all.ps1

Write-Host "Iniciando Sistema Mercadinho..." -ForegroundColor Green
Write-Host ""

# Verificar se PostgreSQL esta rodando
Write-Host "Verificando PostgreSQL..." -ForegroundColor Yellow
$pgRunning = Get-Process -Name "postgres" -ErrorAction SilentlyContinue
if (-not $pgRunning) {
    Write-Host "AVISO: PostgreSQL nao parece estar rodando!" -ForegroundColor Yellow
    Write-Host "   Inicie o Docker ou PostgreSQL manualmente" -ForegroundColor Yellow
    Write-Host ""
}

# 1. Iniciar Backend
Write-Host "Iniciando Backend (porta 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3

# Aguardar backend estar online
Write-Host "Aguardando backend estar online..." -ForegroundColor Yellow
$backendReady = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            Write-Host "Backend esta online!" -ForegroundColor Green
            break
        }
    } catch {
        Start-Sleep -Seconds 1
    }
}

if (-not $backendReady) {
    Write-Host "AVISO: Backend nao respondeu apos 30 segundos" -ForegroundColor Yellow
    Write-Host "   Continuando mesmo assim..." -ForegroundColor Yellow
}

# 2. Iniciar Frontend
Write-Host ""
Write-Host "Iniciando Frontend (porta 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 5

# Aguardar frontend estar online
Write-Host "Aguardando frontend estar online..." -ForegroundColor Yellow
$frontendReady = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $frontendReady = $true
            Write-Host "Frontend esta online!" -ForegroundColor Green
            break
        }
    } catch {
        Start-Sleep -Seconds 1
    }
}

if (-not $frontendReady) {
    Write-Host "AVISO: Frontend nao respondeu apos 30 segundos" -ForegroundColor Yellow
    Write-Host "   Continuando mesmo assim..." -ForegroundColor Yellow
}

# 3. Iniciar Electron
Write-Host ""
Write-Host "Iniciando Electron Desktop..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev:electron-only" -WindowStyle Normal

Write-Host ""
Write-Host "Todos os servicos iniciados!" -ForegroundColor Green
Write-Host ""
Write-Host "Servicos rodando:" -ForegroundColor White
Write-Host "   - Backend:  http://localhost:3001" -ForegroundColor Gray
Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "   - Electron: Janela desktop aberta" -ForegroundColor Gray
Write-Host ""
Write-Host "Para parar os servicos, feche as janelas do PowerShell" -ForegroundColor Yellow

