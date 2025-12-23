<#
.SYNOPSIS
    Configura tarefa agendada para backup automático do Mercadinho

.DESCRIPTION
    Cria uma tarefa agendada no Windows para executar backup diário automático.
    Requer permissões de administrador.

.PARAMETER BackupTime
    Horário do backup (padrão: 23:00)

.PARAMETER ScriptPath
    Caminho do script de backup (padrão: caminho atual)

.EXAMPLE
    .\setup-backup-task.ps1
    .\setup-backup-task.ps1 -BackupTime "02:00"

.NOTES
    Autor: Sistema Mercadinho
    Versão: 1.0
    Data: 03/12/2025
    REQUER: Permissões de Administrador
#>

param(
    [string]$BackupTime = "23:00",
    [string]$ScriptPath = ""
)

# Verificar se está rodando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (!$isAdmin) {
    Write-Host "❌ Este script precisa ser executado como Administrador!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Clique com botão direito no PowerShell e selecione 'Executar como Administrador'" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   CONFIGURAR BACKUP AUTOMÁTICO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Determinar caminho do script
if ($ScriptPath -eq "") {
    $ScriptPath = Join-Path $PSScriptRoot "backup-local.ps1"
}

if (!(Test-Path $ScriptPath)) {
    Write-Host "❌ Script de backup não encontrado: $ScriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Script de backup: $ScriptPath" -ForegroundColor White
Write-Host "⏰ Horário agendado: $BackupTime" -ForegroundColor White
Write-Host ""

# Remover tarefa existente se houver
$taskName = "Backup Mercadinho PDV"
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($existingTask) {
    Write-Host "🗑️  Removendo tarefa agendada existente..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Criar ação
$action = New-ScheduledTaskAction `
    -Execute "PowerShell.exe" `
    -Argument "-ExecutionPolicy Bypass -NoProfile -File `"$ScriptPath`""

# Criar trigger (diariamente no horário especificado)
$trigger = New-ScheduledTaskTrigger `
    -Daily `
    -At $BackupTime

# Criar configurações
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable:$false

# Criar principal (executar como SYSTEM)
$principal = New-ScheduledTaskPrincipal `
    -UserId "SYSTEM" `
    -RunLevel Highest

# Criar descrição
$description = @"
Backup automático do banco de dados local do Mercadinho PDV.
Executa diariamente às $BackupTime.
Mantém histórico de 30 dias.
"@

# Registrar tarefa
try {
    $task = Register-ScheduledTask `
        -TaskName $taskName `
        -Action $action `
        -Trigger $trigger `
        -Settings $settings `
        -Principal $principal `
        -Description $description
    
    Write-Host "✅ Tarefa agendada criada com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Detalhes da tarefa:" -ForegroundColor Cyan
    Write-Host "   Nome: $taskName" -ForegroundColor White
    Write-Host "   Horário: Todo dia às $BackupTime" -ForegroundColor White
    Write-Host "   Status: $($task.State)" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "❌ Erro ao criar tarefa agendada: $_" -ForegroundColor Red
    exit 1
}

# Opção de testar backup agora
Write-Host "Deseja executar um backup de teste agora? (S/N): " -NoNewline
$response = Read-Host

if ($response -eq "S" -or $response -eq "s") {
    Write-Host ""
    Write-Host "🧪 Executando backup de teste..." -ForegroundColor Yellow
    Write-Host ""
    
    & $ScriptPath
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "   CONFIGURAÇÃO CONCLUÍDA" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Dicas:" -ForegroundColor Cyan
Write-Host "   • Backups serão salvos em: C:\Backups\Mercadinho" -ForegroundColor White
Write-Host "   • Verifique o Agendador de Tarefas para gerenciar" -ForegroundColor White
Write-Host "   • Execute manualmente: .\backup-local.ps1" -ForegroundColor White
Write-Host ""

exit 0

