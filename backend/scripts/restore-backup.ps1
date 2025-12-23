<#
.SYNOPSIS
    Script de restauração de backup do Mercadinho

.DESCRIPTION
    Restaura um backup do PostgreSQL local.
    ATENÇÃO: Este processo irá sobrescrever os dados atuais!

.PARAMETER BackupFile
    Caminho completo do arquivo de backup a ser restaurado

.PARAMETER DatabaseName
    Nome do banco de dados (padrão: mercadinho_local)

.PARAMETER PostgresUser
    Usuário do PostgreSQL (padrão: postgres)

.PARAMETER Force
    Forçar restauração sem confirmação

.EXAMPLE
    .\restore-backup.ps1 -BackupFile "C:\Backups\Mercadinho\mercadinho_20251203_120000.backup"
    .\restore-backup.ps1 -BackupFile "backup.backup" -Force

.NOTES
    Autor: Sistema Mercadinho
    Versão: 1.0
    Data: 03/12/2025
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    
    [string]$DatabaseName = "mercadinho_local",
    [string]$PostgresUser = "postgres",
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "   RESTAURAÇÃO DE BACKUP - MERCADINHO PDV" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

# Verificar se arquivo existe
if (!(Test-Path $BackupFile)) {
    Write-Host "❌ ERRO: Arquivo de backup não encontrado!" -ForegroundColor Red
    Write-Host "   $BackupFile" -ForegroundColor Red
    exit 1
}

$fileSize = (Get-Item $BackupFile).Length / 1MB
$fileDate = (Get-Item $BackupFile).CreationTime

Write-Host "📁 Arquivo de backup:" -ForegroundColor Cyan
Write-Host "   Caminho: $BackupFile" -ForegroundColor White
Write-Host "   Tamanho: $([math]::Round($fileSize, 2)) MB" -ForegroundColor White
Write-Host "   Criado em: $(Get-Date $fileDate -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor White
Write-Host ""

# Confirmação
if (!$Force) {
    Write-Host "⚠️  ATENÇÃO: Esta operação irá SOBRESCREVER todos os dados atuais!" -ForegroundColor Red
    Write-Host "   Banco: $DatabaseName" -ForegroundColor Yellow
    Write-Host ""
    $confirmation = Read-Host "Deseja continuar? (Digite 'SIM' para confirmar)"
    
    if ($confirmation -ne "SIM") {
        Write-Host "❌ Restauração cancelada pelo usuário" -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "🔄 Iniciando restauração..." -ForegroundColor Yellow

try {
    # Verificar se pg_restore está disponível
    $null = & pg_restore --version 2>&1
    
    # Executar restauração
    $pgRestoreArgs = @(
        "-U", $PostgresUser,
        "-d", $DatabaseName,
        "-v",
        "--clean",              # Limpar objetos antes de criar
        "--if-exists",          # Usar IF EXISTS ao limpar
        $BackupFile
    )
    
    $process = Start-Process -FilePath "pg_restore" -ArgumentList $pgRestoreArgs -NoNewWindow -Wait -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Host ""
        Write-Host "✅ Restauração concluída com sucesso!" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "⚠️  Restauração concluída com avisos (código: $($process.ExitCode))" -ForegroundColor Yellow
        Write-Host "   Alguns avisos são normais se o banco estava vazio" -ForegroundColor Yellow
        Write-Host ""
    }
    
} catch {
    Write-Host ""
    Write-Host "❌ Erro durante a restauração: $_" -ForegroundColor Red
    exit 1
}

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "   RESTAURAÇÃO CONCLUÍDA" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

exit 0

