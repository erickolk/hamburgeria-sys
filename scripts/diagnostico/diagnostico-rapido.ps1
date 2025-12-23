# Diagnóstico Rápido do Backend Instalado

$installPath = "C:\Users\erick\AppData\Local\Programs\Mercadinho PDV"

Write-Host "`n🔍 DIAGNÓSTICO DO BACKEND INSTALADO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar estrutura
Write-Host "1️⃣ Estrutura do Backend:" -ForegroundColor Yellow
Write-Host "   server.js: $(Test-Path "$installPath\backend\src\server.js")"
Write-Host "   node_modules: $(Test-Path "$installPath\backend\node_modules")"
Write-Host "   package.json: $(Test-Path "$installPath\backend\package.json")"

# 2. Verificar dependências principais
if (Test-Path "$installPath\backend\node_modules") {
    Write-Host ""
    Write-Host "2️⃣ Dependências Principais:" -ForegroundColor Yellow
    Write-Host "   express: $(Test-Path "$installPath\backend\node_modules\express")"
    Write-Host "   @prisma/client: $(Test-Path "$installPath\backend\node_modules\@prisma")"
    Write-Host "   bcryptjs: $(Test-Path "$installPath\backend\node_modules\bcryptjs")"
}

# 3. Verificar prisma
Write-Host ""
Write-Host "3️⃣ Prisma:" -ForegroundColor Yellow
Write-Host "   schema.prisma: $(Test-Path "$installPath\backend\prisma\schema.prisma")"
Write-Host "   migrations: $(Test-Path "$installPath\backend\prisma\migrations")"

# 4. Verificar porta 3001
Write-Host ""
Write-Host "4️⃣ Porta 3001:" -ForegroundColor Yellow
$port3001 = netstat -ano | findstr :3001
if ($port3001) {
    Write-Host "   ⚠️  Porta 3001 JÁ ESTÁ EM USO!" -ForegroundColor Red
    Write-Host "   $port3001" -ForegroundColor Gray
} else {
    Write-Host "   ✅ Porta 3001 está livre"
}

# 5. Verificar PostgreSQL
Write-Host ""
Write-Host "5️⃣ PostgreSQL:" -ForegroundColor Yellow
$pg = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pg) {
    Write-Host "   ✅ Status: $($pg.Status)"
} else {
    Write-Host "   ❌ PostgreSQL não encontrado"
}

# 6. Testar conexão com banco
Write-Host ""
Write-Host "6️⃣ Testando conexão com banco:" -ForegroundColor Yellow
$env:PGPASSWORD = "postgres123"
$testConn = psql -U postgres -d mercadinho_local -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Conexão com banco OK"
} else {
    Write-Host "   ❌ Erro ao conectar ao banco"
    Write-Host "   $testConn" -ForegroundColor Gray
}
$env:PGPASSWORD = $null

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

# 7. Verificar logs do Electron
Write-Host ""
Write-Host "7️⃣ Últimos processos do Mercadinho:" -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*Mercadinho*"} | Format-Table ProcessName, Id, CPU -AutoSize

Write-Host ""
Write-Host "✅ Diagnóstico concluído" -ForegroundColor Green
Write-Host ""

