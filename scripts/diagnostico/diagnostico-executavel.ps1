# Script de diagnóstico completo para o executável

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "     DIAGNÓSTICO - MERCADINHO PDV.EXE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$exePath = "dist\win-unpacked\Mercadinho PDV.exe"
$exeDir = Split-Path $exePath -Parent

Write-Host "🔍 Verificando arquivos essenciais..." -ForegroundColor Yellow
Write-Host ""

# Verificar executável
if (Test-Path $exePath) {
    $file = Get-Item $exePath
    Write-Host "✅ Executável encontrado" -ForegroundColor Green
    Write-Host "   📁 Localização: $($file.FullName)" -ForegroundColor White
    Write-Host "   📊 Tamanho: $([math]::Round($file.Length / 1MB, 2)) MB" -ForegroundColor White
    Write-Host "   📅 Modificado: $($file.LastWriteTime)" -ForegroundColor White
} else {
    Write-Host "❌ Executável NÃO encontrado: $exePath" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Verificar DLLs essenciais
Write-Host "🔍 Verificando DLLs necessárias..." -ForegroundColor Yellow
$dlls = @("ffmpeg.dll", "d3dcompiler_47.dll", "libEGL.dll", "libGLESv2.dll")
$allDllsOk = $true

foreach ($dll in $dlls) {
    $dllPath = Join-Path $exeDir $dll
    if (Test-Path $dllPath) {
        Write-Host "   ✅ $dll" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $dll - FALTANDO!" -ForegroundColor Red
        $allDllsOk = $false
    }
}

Write-Host ""

# Verificar recursos
Write-Host "🔍 Verificando recursos..." -ForegroundColor Yellow
$resources = @(
    "resources\app.asar",
    "backend",
    "locales"
)

foreach ($res in $resources) {
    $resPath = Join-Path $exeDir $res
    if (Test-Path $resPath) {
        Write-Host "   ✅ $res" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $res - Não encontrado" -ForegroundColor Yellow
    }
}

Write-Host ""

# Verificar Node.js
Write-Host "🔍 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "   ✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js NÃO encontrado no PATH!" -ForegroundColor Red
    Write-Host "   💡 Instale de: https://nodejs.org/" -ForegroundColor Yellow
}

Write-Host ""

# Verificar PostgreSQL
Write-Host "🔍 Verificando PostgreSQL..." -ForegroundColor Yellow
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue

if ($pgService) {
    foreach ($svc in $pgService) {
        $status = if ($svc.Status -eq "Running") { "✅" } else { "⚠️ " }
        $statusColor = if ($svc.Status -eq "Running") { "Green" } else { "Yellow" }
        Write-Host "   $status $($svc.Name): $($svc.Status)" -ForegroundColor $statusColor
        
        if ($svc.Status -ne "Running") {
            Write-Host "   💡 Iniciar com: Start-Service $($svc.Name)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "   ⚠️  PostgreSQL não encontrado" -ForegroundColor Yellow
    Write-Host "   💡 Pode ser necessário instalar ou configurar" -ForegroundColor Yellow
}

Write-Host ""

# Verificar backend
Write-Host "🔍 Verificando backend no build..." -ForegroundColor Yellow
$backendPath = Join-Path $exeDir "backend\src\server.js"
if (Test-Path $backendPath) {
    Write-Host "   ✅ Backend encontrado: $backendPath" -ForegroundColor Green
} else {
    Write-Host "   ❌ Backend NÃO encontrado!" -ForegroundColor Red
    Write-Host "   💡 O backend deve estar em: $backendPath" -ForegroundColor Yellow
}

Write-Host ""

# Resumo
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "     RESUMO DO DIAGNÓSTICO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$issues = @()

if (!$allDllsOk) {
    $issues += "❌ Algumas DLLs estão faltando"
}

try {
    node --version | Out-Null
} catch {
    $issues += "❌ Node.js não encontrado"
}

$pgRunning = $pgService | Where-Object { $_.Status -eq "Running" }
if (!$pgRunning) {
    $issues += "⚠️  PostgreSQL não está rodando"
}

if (!(Test-Path $backendPath)) {
    $issues += "❌ Backend não encontrado no build"
}

if ($issues.Count -eq 0) {
    Write-Host "✅ Tudo parece estar OK!" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Execute o aplicativo pelo terminal para ver logs:" -ForegroundColor Cyan
    Write-Host "   cd `"$exeDir`"" -ForegroundColor White
    Write-Host "   .\Mercadinho PDV.exe" -ForegroundColor White
} else {
    Write-Host "⚠️  Foram encontrados alguns problemas:" -ForegroundColor Yellow
    Write-Host ""
    foreach ($issue in $issues) {
        Write-Host "   $issue" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Perguntar se quer executar
Write-Host "Deseja executar o aplicativo agora para ver os logs? (S/N): " -NoNewline -ForegroundColor Cyan
$response = Read-Host

if ($response -eq "S" -or $response -eq "s") {
    Write-Host ""
    Write-Host "🚀 Executando aplicativo..." -ForegroundColor Green
    Write-Host "   (Os logs aparecerão abaixo)" -ForegroundColor Yellow
    Write-Host ""
    
    Push-Location $exeDir
    
    try {
        & ".\Mercadinho PDV.exe"
    } catch {
        Write-Host ""
        Write-Host "❌ Erro ao executar: $_" -ForegroundColor Red
    } finally {
        Pop-Location
    }
}

