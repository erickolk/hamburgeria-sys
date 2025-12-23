# Script para redefinir senha do PostgreSQL
# EXECUTAR COMO ADMINISTRADOR!

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   REDEFINIR SENHA DO POSTGRESQL" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se eh admin
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERRO: Execute este script como Administrador!" -ForegroundColor Red
    Write-Host "Clique com botao direito no PowerShell e selecione 'Executar como Administrador'" -ForegroundColor Yellow
    pause
    exit 1
}

$pgDataDir = "C:\Program Files\PostgreSQL\16\data"
$pgBinDir = "C:\Program Files\PostgreSQL\16\bin"
$pgHbaFile = "$pgDataDir\pg_hba.conf"
$pgHbaBackup = "$pgDataDir\pg_hba.conf.backup"
$novaSenha = "postgres123"

Write-Host "Nova senha sera: $novaSenha" -ForegroundColor Yellow
Write-Host ""

# 1. Fazer backup do pg_hba.conf
Write-Host "[1/5] Fazendo backup do pg_hba.conf..." -ForegroundColor Yellow
if (Test-Path $pgHbaFile) {
    Copy-Item $pgHbaFile $pgHbaBackup -Force
    Write-Host "  Backup criado!" -ForegroundColor Green
} else {
    Write-Host "  ERRO: pg_hba.conf nao encontrado em $pgHbaFile" -ForegroundColor Red
    pause
    exit 1
}

# 2. Parar o servico PostgreSQL
Write-Host "[2/5] Parando servico PostgreSQL..." -ForegroundColor Yellow
Stop-Service -Name "postgresql-x64-16" -Force
Start-Sleep -Seconds 3
Write-Host "  Servico parado!" -ForegroundColor Green

# 3. Modificar pg_hba.conf para trust
Write-Host "[3/5] Configurando acesso temporario..." -ForegroundColor Yellow
$hbaContent = Get-Content $pgHbaFile
$hbaModified = $hbaContent -replace "scram-sha-256", "trust" -replace "md5", "trust"
Set-Content $pgHbaFile $hbaModified -Encoding UTF8
Write-Host "  pg_hba.conf modificado!" -ForegroundColor Green

# 4. Iniciar PostgreSQL e alterar senha
Write-Host "[4/5] Iniciando PostgreSQL e alterando senha..." -ForegroundColor Yellow
Start-Service -Name "postgresql-x64-16"
Start-Sleep -Seconds 5

# Alterar senha
$env:PGPASSWORD = ""
& "$pgBinDir\psql.exe" -U postgres -h localhost -p 5432 -c "ALTER USER postgres WITH PASSWORD '$novaSenha';"

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Senha alterada com sucesso!" -ForegroundColor Green
} else {
    Write-Host "  AVISO: Pode ter havido um problema ao alterar a senha" -ForegroundColor Yellow
}

# 5. Restaurar pg_hba.conf e reiniciar
Write-Host "[5/5] Restaurando configuracao e reiniciando..." -ForegroundColor Yellow
Stop-Service -Name "postgresql-x64-16" -Force
Start-Sleep -Seconds 2

# Restaurar backup
Copy-Item $pgHbaBackup $pgHbaFile -Force

Start-Service -Name "postgresql-x64-16"
Start-Sleep -Seconds 3
Write-Host "  PostgreSQL reiniciado!" -ForegroundColor Green

# Testar conexao
Write-Host ""
Write-Host "Testando conexao..." -ForegroundColor Yellow
$env:PGPASSWORD = $novaSenha
$testResult = & "$pgBinDir\psql.exe" -U postgres -h localhost -p 5432 -c "SELECT version();" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "   SENHA REDEFINIDA COM SUCESSO!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Usuario: postgres" -ForegroundColor White
    Write-Host "  Senha: $novaSenha" -ForegroundColor White
    Write-Host "  Porta: 5432" -ForegroundColor White
    Write-Host ""
    
    # Criar banco mercadinho se nao existir
    Write-Host "Verificando banco 'mercadinho'..." -ForegroundColor Yellow
    $dbCheck = & "$pgBinDir\psql.exe" -U postgres -h localhost -p 5432 -tc "SELECT 1 FROM pg_database WHERE datname='mercadinho'" 2>&1
    
    if ($dbCheck -notmatch "1") {
        Write-Host "  Criando banco 'mercadinho'..." -ForegroundColor Cyan
        & "$pgBinDir\psql.exe" -U postgres -h localhost -p 5432 -c "CREATE DATABASE mercadinho;" 2>&1
        Write-Host "  Banco criado!" -ForegroundColor Green
    } else {
        Write-Host "  Banco 'mercadinho' ja existe!" -ForegroundColor Green
    }
} else {
    Write-Host ""
    Write-Host "ERRO: Falha ao conectar. Resultado:" -ForegroundColor Red
    Write-Host $testResult -ForegroundColor Red
}

Write-Host ""
pause

