<#
.SYNOPSIS
    Script de backup automático do banco de dados local do Mercadinho

.DESCRIPTION
    Cria backups do PostgreSQL local e mantém histórico configurável.
    Suporta compressão e limpeza automática de backups antigos.

.PARAMETER BackupDir
    Diretório onde os backups serão salvos (padrão: C:\Backups\Mercadinho)

.PARAMETER RetentionDays
    Número de dias para manter backups (padrão: 30)

.PARAMETER DatabaseName
    Nome do banco de dados (padrão: mercadinho_local)

.PARAMETER PostgresUser
    Usuário do PostgreSQL (padrão: postgres)

.EXAMPLE
    .\backup-local.ps1
    .\backup-local.ps1 -RetentionDays 60
    .\backup-local.ps1 -BackupDir "D:\Backups"

.NOTES
    Autor: Sistema Mercadinho
    Versão: 1.0
    Data: 03/12/2025
#>

param(
    [string]$BackupDir = "C:\Backups\Mercadinho",
    [int]$RetentionDays = 30,
    [string]$DatabaseName = "mercadinho_local",
    [string]$PostgresUser = "postgres"
)

# Configurações
$ErrorActionPreference = "Stop"
$LogFile = Join-Path $BackupDir "backup.log"

# Função de log
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    # Exibir no console com cores
    switch ($Level) {
        "ERROR"   { Write-Host $logMessage -ForegroundColor Red }
        "WARNING" { Write-Host $logMessage -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $logMessage -ForegroundColor Green }
        default   { Write-Host $logMessage -ForegroundColor White }
    }
    
    # Salvar no arquivo de log
    if (Test-Path $BackupDir) {
        $logMessage | Out-File -FilePath $LogFile -Append -Encoding UTF8
    }
}

# Banner
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   BACKUP AUTOMÁTICO - MERCADINHO PDV" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Log "Iniciando processo de backup"
Write-Log "Configurações:"
Write-Log "  - Banco: $DatabaseName"
Write-Log "  - Diretório: $BackupDir"
Write-Log "  - Retenção: $RetentionDays dias"

# Criar diretório de backup se não existir
try {
    if (!(Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
        Write-Log "Diretório de backup criado: $BackupDir" "SUCCESS"
    }
} catch {
    Write-Log "Erro ao criar diretório de backup: $_" "ERROR"
    exit 1
}

# Verificar se pg_dump está disponível
try {
    $pgDumpVersion = & pg_dump --version 2>&1
    Write-Log "PostgreSQL pg_dump encontrado: $pgDumpVersion"
} catch {
    Write-Log "ERRO: pg_dump não encontrado no PATH" "ERROR"
    Write-Log "Instale o PostgreSQL ou adicione ao PATH" "ERROR"
    exit 1
}

# Gerar nome do arquivo de backup
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFileName = "mercadinho_$timestamp.backup"
$backupFilePath = Join-Path $BackupDir $backupFileName

Write-Log "Iniciando backup para: $backupFileName"

# Executar backup
try {
    Write-Host ""
    Write-Host "⏳ Criando backup..." -ForegroundColor Yellow
    
    # Usar formato custom (-Fc) para melhor compressão e flexibilidade
    $pgDumpArgs = @(
        "-U", $PostgresUser,
        "-d", $DatabaseName,
        "-F", "c",              # Formato custom
        "-f", $backupFilePath,
        "-v"                    # Verbose
    )
    
    # Definir PGPASSWORD se necessário (usar variável de ambiente)
    # $env:PGPASSWORD = "sua_senha_aqui"
    
    $process = Start-Process -FilePath "pg_dump" -ArgumentList $pgDumpArgs -NoNewWindow -Wait -PassThru
    
    if ($process.ExitCode -eq 0) {
        $fileSize = (Get-Item $backupFilePath).Length
        $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
        
        Write-Log "Backup criado com sucesso!" "SUCCESS"
        Write-Log "  - Arquivo: $backupFileName" "SUCCESS"
        Write-Log "  - Tamanho: $fileSizeMB MB" "SUCCESS"
        Write-Host ""
        Write-Host "✅ Backup concluído com sucesso!" -ForegroundColor Green
        Write-Host "   📁 $backupFilePath" -ForegroundColor Cyan
        Write-Host "   📊 Tamanho: $fileSizeMB MB" -ForegroundColor Cyan
        
    } else {
        Write-Log "Erro ao criar backup (código: $($process.ExitCode))" "ERROR"
        exit 1
    }
    
} catch {
    Write-Log "Erro ao executar pg_dump: $_" "ERROR"
    exit 1
}

# Limpeza de backups antigos
Write-Host ""
Write-Host "🗑️  Verificando backups antigos..." -ForegroundColor Yellow
Write-Log "Removendo backups com mais de $RetentionDays dias"

try {
    $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
    $oldBackups = Get-ChildItem -Path $BackupDir -Filter "mercadinho_*.backup" | 
                  Where-Object { $_.CreationTime -lt $cutoffDate }
    
    if ($oldBackups.Count -gt 0) {
        foreach ($file in $oldBackups) {
            Remove-Item $file.FullName -Force
            Write-Log "  Removido: $($file.Name) ($(Get-Date $file.CreationTime -Format 'dd/MM/yyyy'))" "WARNING"
        }
        Write-Host "   Removidos: $($oldBackups.Count) backup(s) antigo(s)" -ForegroundColor Yellow
    } else {
        Write-Log "Nenhum backup antigo para remover"
        Write-Host "   ✓ Nenhum backup antigo encontrado" -ForegroundColor Green
    }
    
} catch {
    Write-Log "Erro ao limpar backups antigos: $_" "WARNING"
}

# Estatísticas finais
Write-Host ""
Write-Host "📊 Estatísticas dos backups:" -ForegroundColor Cyan

try {
    $allBackups = Get-ChildItem -Path $BackupDir -Filter "mercadinho_*.backup" | 
                  Sort-Object CreationTime -Descending
    
    $totalSize = ($allBackups | Measure-Object -Property Length -Sum).Sum
    $totalSizeGB = [math]::Round($totalSize / 1GB, 2)
    
    Write-Host "   Total de backups: $($allBackups.Count)" -ForegroundColor White
    Write-Host "   Espaço ocupado: $totalSizeGB GB" -ForegroundColor White
    
    if ($allBackups.Count -gt 0) {
        $newestBackup = $allBackups[0]
        Write-Host "   Backup mais recente: $($newestBackup.Name)" -ForegroundColor White
        Write-Host "   Data: $(Get-Date $newestBackup.CreationTime -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor White
    }
    
} catch {
    Write-Log "Erro ao calcular estatísticas: $_" "WARNING"
}

# Verificar espaço em disco
try {
    $drive = (Get-Item $BackupDir).PSDrive
    $freeSpaceGB = [math]::Round($drive.Free / 1GB, 2)
    
    Write-Host ""
    Write-Host "💾 Espaço livre no disco $($drive.Name): $freeSpaceGB GB" -ForegroundColor Cyan
    
    if ($freeSpaceGB -lt 5) {
        Write-Log "AVISO: Pouco espaço em disco! ($freeSpaceGB GB)" "WARNING"
        Write-Host "   ⚠️  AVISO: Espaço em disco baixo!" -ForegroundColor Red
    }
    
} catch {
    Write-Log "Erro ao verificar espaço em disco: $_" "WARNING"
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   BACKUP CONCLUÍDO" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Log "Processo de backup finalizado com sucesso"
exit 0

