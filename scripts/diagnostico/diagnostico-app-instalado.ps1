# Script de Diagnóstico para Aplicativo Instalado
# Executa o aplicativo com logs visíveis para diagnosticar problemas

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   DIAGNÓSTICO: Mercadinho PDV Instalado" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Encontrar diretório de instalação
$installDirs = @(
    "C:\Program Files\Mercadinho PDV",
    "C:\Program Files (x86)\Mercadinho PDV",
    "$env:LOCALAPPDATA\Programs\Mercadinho PDV",
    "$env:APPDATA\Mercadinho PDV"
)

$exePath = $null
foreach ($dir in $installDirs) {
    $testPath = Join-Path $dir "Mercadinho PDV.exe"
    if (Test-Path $testPath) {
        $exePath = $testPath
        Write-Host "✅ Aplicativo encontrado em: $dir" -ForegroundColor Green
        break
    }
}

if (-not $exePath) {
    Write-Host "❌ Aplicativo não encontrado nos locais padrão!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Locais verificados:" -ForegroundColor Yellow
    foreach ($dir in $installDirs) {
        Write-Host "  - $dir" -ForegroundColor Gray
    }
    exit 1
}

Write-Host ""

# Verificar estrutura de arquivos
Write-Host "📁 Verificando estrutura de arquivos..." -ForegroundColor Yellow

$exeDir = Split-Path $exePath -Parent

# Verificar backend
$backendPath = Join-Path $exeDir "resources\backend"
if (Test-Path $backendPath) {
    Write-Host "  ✅ Backend encontrado" -ForegroundColor Green
} else {
    $backendPath = Join-Path $exeDir "backend"
    if (Test-Path $backendPath) {
        Write-Host "  ✅ Backend encontrado (local alternativo)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Backend NÃO encontrado!" -ForegroundColor Red
    }
}

# Verificar frontend
$frontendPaths = @(
    Join-Path $exeDir "resources\app\frontend\.output\public\index.html",
    Join-Path $exeDir "resources\frontend\.output\public\index.html",
    Join-Path $exeDir "frontend\.output\public\index.html"
)

$frontendFound = $false
foreach ($fp in $frontendPaths) {
    if (Test-Path $fp) {
        Write-Host "  ✅ Frontend encontrado: $fp" -ForegroundColor Green
        $frontendFound = $true
        break
    }
}

if (-not $frontendFound) {
    Write-Host "  ❌ Frontend NÃO encontrado!" -ForegroundColor Red
    Write-Host "  Caminhos testados:" -ForegroundColor Yellow
    foreach ($fp in $frontendPaths) {
        Write-Host "    - $fp" -ForegroundColor Gray
    }
}

Write-Host ""

# Verificar Node.js
Write-Host "🔍 Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ❌ Node.js NÃO encontrado!" -ForegroundColor Red
    Write-Host "  ⚠️  O aplicativo precisa do Node.js instalado para rodar o backend" -ForegroundColor Yellow
}

Write-Host ""

# Verificar PostgreSQL
Write-Host "🐘 Verificando PostgreSQL..." -ForegroundColor Yellow
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService) {
    Write-Host "  ✅ PostgreSQL encontrado: $($pgService.Name)" -ForegroundColor Green
    if ($pgService.Status -eq "Running") {
        Write-Host "  ✅ Serviço está rodando" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Serviço NÃO está rodando (Status: $($pgService.Status))" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠️  PostgreSQL não encontrado" -ForegroundColor Yellow
}

Write-Host ""

# Executar aplicativo com logs
Write-Host "🚀 Executando aplicativo com logs..." -ForegroundColor Cyan
Write-Host "   (Aguarde alguns segundos para ver os logs)" -ForegroundColor Gray
Write-Host ""

# Criar arquivo de log
$logFile = Join-Path $env:TEMP "mercadinho-diagnostico.log"

# Executar aplicativo redirecionando saída
$process = Start-Process -FilePath $exePath -NoNewWindow -PassThru -RedirectStandardOutput $logFile -RedirectStandardError $logFile

Write-Host "⏳ Processo iniciado (PID: $($process.Id))" -ForegroundColor Cyan
Write-Host "   Aguardando 10 segundos para capturar logs iniciais..." -ForegroundColor Gray

Start-Sleep -Seconds 10

# Ler log
if (Test-Path $logFile) {
    Write-Host ""
    Write-Host "📄 ÚLTIMAS LINHAS DO LOG:" -ForegroundColor Cyan
    Write-Host ("─" * 60) -ForegroundColor Gray
    Get-Content $logFile -Tail 50 | ForEach-Object {
        Write-Host $_ -ForegroundColor White
    }
    Write-Host ("─" * 60) -ForegroundColor Gray
    Write-Host ""
    Write-Host "📁 Log completo em: $logFile" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Arquivo de log não foi criado" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   Diagnóstico concluído!" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Se a janela não apareceu, verifique:" -ForegroundColor Yellow
Write-Host "   1. Log completo em: $logFile" -ForegroundColor White
Write-Host "   2. Gerenciador de Tarefas para ver processos" -ForegroundColor White
Write-Host "   3. Se Node.js está instalado" -ForegroundColor White
Write-Host "   4. Se PostgreSQL está rodando" -ForegroundColor White

