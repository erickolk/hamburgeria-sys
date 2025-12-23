# Script para gerar instalador como Administrador
# Este script usa o build-completo-automatico.ps1 que executa todas as etapas necessárias:
# - Prepara backend (instala deps + gera Prisma Client)
# - Builda frontend (gera arquivos estáticos)
# - Valida tudo antes de continuar
# - Executa electron-builder

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   GERANDO INSTALADOR NSIS (Modo Administrador)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verificar se está rodando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ Este script precisa ser executado como Administrador!" -ForegroundColor Red
    Write-Host "`nReinicie o PowerShell como Administrador e execute novamente." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Executando como Administrador..." -ForegroundColor Green
Write-Host ""

# Verificar se o script de build completo existe
$buildScriptPath = Join-Path $PSScriptRoot "build-completo-automatico.ps1"
if (-not (Test-Path $buildScriptPath)) {
    Write-Host "❌ Script build-completo-automatico.ps1 não encontrado!" -ForegroundColor Red
    Write-Host "   Certifique-se de que o arquivo existe na raiz do projeto." -ForegroundColor Yellow
    pause
    exit 1
}

# Executar o script de build completo
Write-Host "🚀 Executando build completo automatizado..." -ForegroundColor Green
Write-Host "   (Este script prepara backend, frontend e gera o instalador)" -ForegroundColor Gray
Write-Host ""

& $buildScriptPath

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "   ✅ BUILD CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    
    # Verificar se o instalador foi gerado
    $installerPattern = "C:\temp-mercadinho-dist\Mercadinho PDV Setup *.exe"
    if (Test-Path $installerPattern) {
        $installer = Get-ChildItem $installerPattern | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        $sizeMB = [math]::Round($installer.Length / 1MB, 2)
        
        Write-Host "🎉 INSTALADOR GERADO:" -ForegroundColor Green
        Write-Host "   Arquivo: $($installer.FullName)" -ForegroundColor White
        Write-Host "   Tamanho: $sizeMB MB" -ForegroundColor White
        Write-Host ""
        Write-Host "✅ Pronto para distribuir!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Instalador não encontrado, mas aplicativo pode estar em:" -ForegroundColor Yellow
        Write-Host "   C:\temp-mercadinho-dist\win-unpacked\Mercadinho PDV.exe" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "   ❌ BUILD FALHOU" -ForegroundColor Red
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifique os erros acima e tente novamente." -ForegroundColor Yellow
}

Write-Host ""
pause

