# Script para executar o Electron com logs visíveis

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   EXECUTANDO MERCADINHO PDV COM LOGS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$exePath = "dist\win-unpacked\Mercadinho PDV.exe"

if (!(Test-Path $exePath)) {
    Write-Host "❌ Arquivo não encontrado: $exePath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Execute primeiro: npm run build" -ForegroundColor Yellow
    exit 1
}

Write-Host "📍 Executando: $exePath" -ForegroundColor Green
Write-Host "📋 Logs aparecerão abaixo..." -ForegroundColor Yellow
Write-Host ""

# Mudar para o diretório do executável
Push-Location (Split-Path $exePath -Parent)

try {
    # Executar e mostrar output
    & ".\Mercadinho PDV.exe"
} catch {
    Write-Host ""
    Write-Host "❌ Erro ao executar: $_" -ForegroundColor Red
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   APLICAÇÃO ENCERRADA" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

