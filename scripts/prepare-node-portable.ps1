# Script para baixar e preparar Node.js portavel
# Este script baixa a versao portavel do Node.js para ser incluida no instalador

param(
    [string]$NodeVersion = "20.19.0",  # Versao LTS estavel (atualizada para suportar dependencias modernas)
    [string]$OutputDir = "node-portable"
)

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "   PREPARACAO DO NODE.JS PORTATIL" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Diretorio de saida na raiz do projeto
$projectRoot = Split-Path -Parent $PSScriptRoot
if (-not $projectRoot -or -not (Test-Path $projectRoot)) {
    $projectRoot = Get-Location
}
$nodePortableDir = Join-Path $projectRoot $OutputDir

# URL do Node.js para Windows x64
$nodeZipUrl = "https://nodejs.org/dist/v$NodeVersion/node-v$NodeVersion-win-x64.zip"
$nodeZipFile = Join-Path $env:TEMP "node-v$NodeVersion-win-x64.zip"
$nodeExtractDir = Join-Path $env:TEMP "node-v$NodeVersion-win-x64"

Write-Host "[INFO] Versao do Node.js: v$NodeVersion" -ForegroundColor Yellow
Write-Host "[INFO] Diretorio de saida: $nodePortableDir" -ForegroundColor Yellow
Write-Host ""

# Verificar se ja existe
if (Test-Path $nodePortableDir) {
    $nodeExe = Join-Path $nodePortableDir "node.exe"
    if (Test-Path $nodeExe) {
        Write-Host "[OK] Node.js portatil ja existe em: $nodePortableDir" -ForegroundColor Green
        Write-Host ""
        
        # Verificar versao
        $currentVersion = & $nodeExe --version 2>&1
        Write-Host "   Versao atual: $currentVersion" -ForegroundColor Gray
        
        if ($currentVersion -eq "v$NodeVersion") {
            Write-Host "   [OK] Versao correta instalada!" -ForegroundColor Green
            exit 0
        } else {
            Write-Host "   [!] Versao diferente, atualizando..." -ForegroundColor Yellow
            Remove-Item -Recurse -Force $nodePortableDir
        }
    }
}

# Criar diretorio de saida
Write-Host "[1/6] Criando diretorio de saida..." -ForegroundColor Yellow
if (-not (Test-Path $nodePortableDir)) {
    New-Item -ItemType Directory -Path $nodePortableDir -Force | Out-Null
}
Write-Host "   [OK] Diretorio criado" -ForegroundColor Green
Write-Host ""

# Baixar Node.js
Write-Host "[2/6] Baixando Node.js v$NodeVersion..." -ForegroundColor Yellow
Write-Host "   URL: $nodeZipUrl" -ForegroundColor Gray

if (-not (Test-Path $nodeZipFile)) {
    try {
        # Usar .NET para download mais confiavel
        $webClient = New-Object System.Net.WebClient
        $webClient.DownloadFile($nodeZipUrl, $nodeZipFile)
        Write-Host "   [OK] Download concluido!" -ForegroundColor Green
    } catch {
        Write-Host "   [ERRO] Erro ao baixar: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   [OK] Arquivo ja existe em cache" -ForegroundColor Green
}
Write-Host ""

# Extrair
Write-Host "[3/6] Extraindo arquivos..." -ForegroundColor Yellow

if (Test-Path $nodeExtractDir) {
    Remove-Item -Recurse -Force $nodeExtractDir
}

try {
    Expand-Archive -Path $nodeZipFile -DestinationPath $env:TEMP -Force
    Write-Host "   [OK] Extracao concluida!" -ForegroundColor Green
} catch {
    Write-Host "   [ERRO] Erro ao extrair: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Copiar apenas arquivos necessarios (reduzir tamanho)
Write-Host "[4/6] Copiando arquivos necessarios..." -ForegroundColor Yellow

$essentialFiles = @(
    "node.exe",
    "npm.cmd",
    "npx.cmd",
    "LICENSE"
)

# Copiar executaveis principais
foreach ($file in $essentialFiles) {
    $sourcePath = Join-Path $nodeExtractDir $file
    $destPath = Join-Path $nodePortableDir $file
    
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "   [OK] Copiado: $file" -ForegroundColor Green
    }
}

# Copiar pasta node_modules (npm)
$npmModulesSource = Join-Path $nodeExtractDir "node_modules"
$npmModulesDest = Join-Path $nodePortableDir "node_modules"

if (Test-Path $npmModulesSource) {
    Copy-Item -Path $npmModulesSource -Destination $npmModulesDest -Recurse -Force
    Write-Host "   [OK] Copiado: node_modules (npm)" -ForegroundColor Green
}

Write-Host ""

# Verificar instalacao
Write-Host "[5/6] Verificando instalacao..." -ForegroundColor Yellow

$nodeExe = Join-Path $nodePortableDir "node.exe"
if (Test-Path $nodeExe) {
    $version = & $nodeExe --version 2>&1
    Write-Host "   [OK] Node.js instalado: $version" -ForegroundColor Green
} else {
    Write-Host "   [ERRO] node.exe nao encontrado!" -ForegroundColor Red
    exit 1
}

# Verificar npm
$npmCmd = Join-Path $nodePortableDir "npm.cmd"
if (Test-Path $npmCmd) {
    # Usar o node portatil para rodar npm
    $npmVersion = & $nodeExe (Join-Path $nodePortableDir "node_modules\npm\bin\npm-cli.js") --version 2>&1
    Write-Host "   [OK] npm instalado: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "   [!] npm.cmd nao encontrado (opcional)" -ForegroundColor Yellow
}

Write-Host ""

# Limpar temporarios
Write-Host "[6/6] Limpando arquivos temporarios..." -ForegroundColor Yellow
if (Test-Path $nodeExtractDir) {
    Remove-Item -Recurse -Force $nodeExtractDir -ErrorAction SilentlyContinue
}
Write-Host "   [OK] Limpeza concluida" -ForegroundColor Green

Write-Host ""

# Calcular tamanho
$size = (Get-ChildItem -Path $nodePortableDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
$sizeRounded = [math]::Round($size, 2)

Write-Host "=======================================================" -ForegroundColor Green
Write-Host "   [SUCESSO] NODE.JS PORTATIL PREPARADO COM SUCESSO!" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
Write-Host ""
Write-Host "   Local: $nodePortableDir" -ForegroundColor White
Write-Host "   Tamanho: $sizeRounded MB" -ForegroundColor White
Write-Host "   Versao: v$NodeVersion" -ForegroundColor White
Write-Host ""
