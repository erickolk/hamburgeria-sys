# Script para executar o aplicativo e ver TODOS os logs

Write-Host "`n🔍 EXECUTANDO APLICATIVO COM LOGS COMPLETOS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Fechar processos anteriores
Write-Host "🔄 Fechando processos anteriores..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*Mercadinho*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Criar arquivo de log
$logFile = "$env:TEMP\mercadinho-electron-full.log"
Write-Host "📄 Logs serão salvos em: $logFile" -ForegroundColor Gray
Write-Host ""

# Executar aplicativo
$appPath = "C:\Users\erick\AppData\Local\Programs\Mercadinho PDV\Mercadinho PDV.exe"

Write-Host "🚀 Iniciando aplicativo..." -ForegroundColor Cyan
Write-Host "   Aguarde 30 segundos para capturar logs..." -ForegroundColor Gray
Write-Host ""

# Iniciar processo e capturar saída
$process = Start-Process -FilePath $appPath -PassThru -RedirectStandardOutput $logFile -RedirectStandardError $logFile -WindowStyle Normal

Write-Host "✅ Aplicativo iniciado (PID: $($process.Id))" -ForegroundColor Green
Write-Host ""
Write-Host "⏳ Aguardando 30 segundos..." -ForegroundColor Yellow

Start-Sleep -Seconds 30

# Mostrar logs
Write-Host ""
Write-Host "📄 LOGS CAPTURADOS:" -ForegroundColor Cyan
Write-Host ("═" * 80) -ForegroundColor Gray

if (Test-Path $logFile) {
    Get-Content $logFile | ForEach-Object {
        if ($_ -match "erro|error|fail|❌") {
            Write-Host $_ -ForegroundColor Red
        } elseif ($_ -match "warn|aviso|⚠️") {
            Write-Host $_ -ForegroundColor Yellow
        } elseif ($_ -match "sucesso|success|✅|ok") {
            Write-Host $_ -ForegroundColor Green
        } else {
            Write-Host $_ -ForegroundColor White
        }
    }
} else {
    Write-Host "⚠️  Arquivo de log não foi criado" -ForegroundColor Yellow
}

Write-Host ("═" * 80) -ForegroundColor Gray
Write-Host ""

# Verificar backend
Write-Host "🔍 Verificando backend..." -ForegroundColor Cyan
$port = netstat -ano | findstr :3001
if ($port) {
    Write-Host "✅ Backend rodando na porta 3001" -ForegroundColor Green
} else {
    Write-Host "❌ Backend NÃO está rodando" -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   Diagnóstico concluído" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Veja o aplicativo aberto e verifique:" -ForegroundColor Yellow
Write-Host "   - Se mostra interface ou tela de erro" -ForegroundColor White
Write-Host "   - Qual mensagem aparece" -ForegroundColor White
Write-Host ""
Write-Host "📁 Log completo em: $logFile" -ForegroundColor Gray
Write-Host ""













