<#
.SYNOPSIS
    Script para Build Limpo do Instalador Electron
    Fecha instâncias abertas, limpa pastas e faz build

.DESCRIPTION
    Este script:
    1. Fecha todas as instâncias do Mercadinho PDV
    2. Limpa a pasta dist/win-unpacked
    3. Executa o build do instalador Electron

.EXAMPLE
    .\build-instalador.ps1
#>

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   BUILD DO INSTALADOR - MERCADINHO PDV" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Passo 1: Fechar instâncias do aplicativo
Write-Host "▶ Passo 1/4: Verificando processos em execução..." -ForegroundColor Yellow

$processes = Get-Process | Where-Object {$_.ProcessName -like "*Mercadinho*"} -ErrorAction SilentlyContinue

if ($processes) {
    Write-Host "   ⚠️  Encontradas $($processes.Count) instância(s) do aplicativo rodando" -ForegroundColor Yellow
    Write-Host "   🛑 Fechando instâncias..." -ForegroundColor Cyan
    
    $processes | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
    
    Write-Host "   ✅ Instâncias fechadas!" -ForegroundColor Green
} else {
    Write-Host "   ✅ Nenhuma instância rodando" -ForegroundColor Green
}

Write-Host ""

# Passo 2: Limpar pasta de build
Write-Host "▶ Passo 2/4: Limpando pasta de build..." -ForegroundColor Yellow

if (Test-Path "dist\win-unpacked") {
    try {
        Remove-Item -Recurse -Force "dist\win-unpacked" -ErrorAction Stop
        Write-Host "   ✅ Pasta dist\win-unpacked removida!" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Não foi possível remover completamente: $_" -ForegroundColor Yellow
        Write-Host "   💡 Tente fechar manualmente e executar novamente" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✅ Pasta não existe, tudo ok!" -ForegroundColor Green
}

Write-Host ""

# Passo 3: Verificar se frontend está buildado
Write-Host "▶ Passo 3/4: Verificando build do frontend..." -ForegroundColor Yellow

if (Test-Path "frontend\.output") {
    Write-Host "   ✅ Frontend já está buildado!" -ForegroundColor Green
    $buildFrontend = Read-Host "   Deseja rebuildar o frontend? (s/N)"
    
    if ($buildFrontend -eq "s" -or $buildFrontend -eq "S") {
        Write-Host "   🔨 Buildando frontend..." -ForegroundColor Cyan
        npm run build:frontend
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   ❌ Erro ao buildar frontend!" -ForegroundColor Red
            exit 1
        }
        Write-Host "   ✅ Frontend buildado!" -ForegroundColor Green
    }
} else {
    Write-Host "   ⚠️  Frontend não está buildado!" -ForegroundColor Yellow
    Write-Host "   🔨 Buildando frontend..." -ForegroundColor Cyan
    npm run build:frontend
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Erro ao buildar frontend!" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✅ Frontend buildado!" -ForegroundColor Green
}

Write-Host ""

# Passo 4: Build do instalador
Write-Host "▶ Passo 4/4: Buildando instalador Electron..." -ForegroundColor Yellow
Write-Host ""

npm run build:electron

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "   ✅ BUILD CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 Instalador gerado em:" -ForegroundColor Cyan
    Write-Host "   dist\Mercadinho-PDV-Setup-1.0.0.exe" -ForegroundColor White
    Write-Host ""
    
    if (Test-Path "dist\Mercadinho-PDV-Setup-1.0.0.exe") {
        $fileInfo = Get-Item "dist\Mercadinho-PDV-Setup-1.0.0.exe"
        $sizeMB = [math]::Round($fileInfo.Length / 1MB, 2)
        Write-Host "   Tamanho: $sizeMB MB" -ForegroundColor Gray
        Write-Host "   Data: $($fileInfo.LastWriteTime)" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "🚀 Pronto para distribuir!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "   ❌ ERRO NO BUILD!" -ForegroundColor Red
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifique os erros acima e tente novamente." -ForegroundColor Yellow
    exit 1
}

