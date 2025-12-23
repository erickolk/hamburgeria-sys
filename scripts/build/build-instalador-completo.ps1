# BUILD COMPLETO DO INSTALADOR - MERCADINHO PDV
# Este script prepara tudo e gera o instalador

param(
    [switch]$SkipNodeDownload,
    [switch]$SkipBackend,
    [switch]$SkipFrontend
)

$ErrorActionPreference = "Continue"
$startTime = Get-Date

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "           BUILD COMPLETO - MERCADINHO PDV                      " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

function Write-Step {
    param([string]$Step, [string]$Message)
    Write-Host ""
    Write-Host "[$Step] $Message" -ForegroundColor Yellow
    Write-Host ("-" * 60) -ForegroundColor Gray
}

function Exit-WithError {
    param([string]$Message)
    Write-Host ""
    Write-Host "ERRO: $Message" -ForegroundColor Red
    pause
    exit 1
}

# ============================================
# 1. VERIFICAR PRE-REQUISITOS
# ============================================
Write-Step "1/6" "Verificando pre-requisitos..."

$nodeVer = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Exit-WithError "Node.js nao encontrado!"
}
Write-Host "   Node.js: $nodeVer" -ForegroundColor Green

$npmVer = npm --version 2>&1
Write-Host "   npm: v$npmVer" -ForegroundColor Green

if (-not (Test-Path "package.json")) {
    Exit-WithError "Execute na raiz do projeto!"
}
Write-Host "   Diretorio OK" -ForegroundColor Green

# ============================================
# 2. BAIXAR NODE.JS PORTATIL
# ============================================
if (-not $SkipNodeDownload) {
    Write-Step "2/6" "Preparando Node.js portatil..."
    
    $nodePortablePath = "node-portable"
    $nodeVersion = "20.11.0"
    $nodeExe = Join-Path $nodePortablePath "node.exe"
    
    if (Test-Path $nodeExe) {
        $currentVersion = & $nodeExe --version 2>&1
        Write-Host "   Node.js portatil ja existe: $currentVersion" -ForegroundColor Green
    } else {
        Write-Host "   Baixando Node.js v$nodeVersion..." -ForegroundColor Cyan
        
        $nodeZipUrl = "https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-win-x64.zip"
        $nodeZipFile = Join-Path $env:TEMP "node-v$nodeVersion-win-x64.zip"
        $nodeExtractDir = Join-Path $env:TEMP "node-v$nodeVersion-win-x64"
        
        if (-not (Test-Path $nodeZipFile)) {
            try {
                $ProgressPreference = 'SilentlyContinue'
                Invoke-WebRequest -Uri $nodeZipUrl -OutFile $nodeZipFile -UseBasicParsing
                Write-Host "   Download concluido" -ForegroundColor Green
            } catch {
                Exit-WithError "Falha ao baixar Node.js: $_"
            }
        } else {
            Write-Host "   Usando cache do download" -ForegroundColor Green
        }
        
        Write-Host "   Extraindo..." -ForegroundColor Cyan
        if (Test-Path $nodeExtractDir) {
            Remove-Item -Recurse -Force $nodeExtractDir
        }
        Expand-Archive -Path $nodeZipFile -DestinationPath $env:TEMP -Force
        
        if (-not (Test-Path $nodePortablePath)) {
            New-Item -ItemType Directory -Path $nodePortablePath -Force | Out-Null
        }
        
        $filesToCopy = @("node.exe", "npm.cmd", "npx.cmd", "LICENSE")
        foreach ($file in $filesToCopy) {
            $src = Join-Path $nodeExtractDir $file
            if (Test-Path $src) {
                Copy-Item -Path $src -Destination $nodePortablePath -Force
            }
        }
        
        $npmModules = Join-Path $nodeExtractDir "node_modules"
        if (Test-Path $npmModules) {
            Copy-Item -Path $npmModules -Destination $nodePortablePath -Recurse -Force
        }
        
        Remove-Item -Recurse -Force $nodeExtractDir -ErrorAction SilentlyContinue
        
        if (Test-Path $nodeExe) {
            $installedVersion = & $nodeExe --version 2>&1
            Write-Host "   Node.js portatil instalado: $installedVersion" -ForegroundColor Green
        } else {
            Exit-WithError "Falha ao instalar Node.js portatil"
        }
    }
} else {
    Write-Step "2/6" "Pulando download do Node.js"
}

# ============================================
# 3. PREPARAR BACKEND
# ============================================
if (-not $SkipBackend) {
    Write-Step "3/6" "Preparando backend..."
    
    if (-not (Test-Path "backend")) {
        Exit-WithError "Pasta backend nao encontrada!"
    }
    
    Push-Location backend
    
    Write-Host "   Instalando dependencias..." -ForegroundColor Cyan
    $null = npm install --omit=dev 2>&1
    Write-Host "   Dependencias OK" -ForegroundColor Green
    
    Write-Host "   Gerando Prisma Client..." -ForegroundColor Cyan
    $null = npx prisma generate 2>&1
    Write-Host "   Prisma Client OK" -ForegroundColor Green
    
    Pop-Location
} else {
    Write-Step "3/6" "Pulando backend"
}

# ============================================
# 4. BUILDAR FRONTEND
# ============================================
if (-not $SkipFrontend) {
    Write-Step "4/6" "Buildando frontend..."
    
    if (-not (Test-Path "frontend")) {
        Exit-WithError "Pasta frontend nao encontrada!"
    }
    
    Push-Location frontend
    
    Write-Host "   Instalando dependencias..." -ForegroundColor Cyan
    $null = npm install 2>&1
    Write-Host "   Dependencias OK" -ForegroundColor Green
    
    Write-Host "   Gerando arquivos estaticos (pode demorar)..." -ForegroundColor Cyan
    npm run generate
    
    $frontendIndex = ".output\public\index.html"
    if (-not (Test-Path $frontendIndex)) {
        Pop-Location
        Exit-WithError "Frontend nao foi buildado!"
    }
    Write-Host "   Frontend OK" -ForegroundColor Green
    
    Pop-Location
} else {
    Write-Step "4/6" "Pulando frontend"
}

# ============================================
# 5. VALIDACAO FINAL
# ============================================
Write-Step "5/6" "Validacao final..."

$errors = @()

if (-not (Test-Path "node-portable\node.exe")) {
    $errors += "Node.js portatil"
} else {
    Write-Host "   Node.js portatil: OK" -ForegroundColor Green
}

if (-not (Test-Path "backend\node_modules\.prisma\client\index.js")) {
    $errors += "Prisma Client"
} else {
    Write-Host "   Prisma Client: OK" -ForegroundColor Green
}

if (-not (Test-Path "frontend\.output\public\index.html")) {
    $errors += "Frontend buildado"
} else {
    Write-Host "   Frontend: OK" -ForegroundColor Green
}

if (-not (Test-Path "electron\main.js")) {
    $errors += "Electron main.js"
} else {
    Write-Host "   Electron: OK" -ForegroundColor Green
}

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "   ERROS:" -ForegroundColor Red
    foreach ($err in $errors) {
        Write-Host "   - $err faltando" -ForegroundColor Red
    }
    Exit-WithError "Corrija os erros antes de continuar"
}

# ============================================
# 6. GERAR INSTALADOR
# ============================================
Write-Step "6/6" "Gerando instalador..."

$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
$env:WIN_CSC_LINK = ""
$env:WIN_CSC_KEY_PASSWORD = ""
$env:SKIP_NOTARIZATION = "true"

Get-Process | Where-Object {$_.ProcessName -like "*Mercadinho*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign" -ErrorAction SilentlyContinue

Write-Host "   Executando electron-builder..." -ForegroundColor Cyan
Write-Host "   (Isso pode levar alguns minutos)" -ForegroundColor Gray
Write-Host ""

npm run build:electron

if ($LASTEXITCODE -ne 0) {
    Exit-WithError "Falha no electron-builder"
}

# ============================================
# RESULTADO
# ============================================
Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "                    VERIFICANDO RESULTADO                       " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green

$outputDir = "C:\temp-mercadinho-dist"
$unpackedDir = "$outputDir\win-unpacked"

$installers = Get-ChildItem "$outputDir\*.exe" -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "*Setup*" }
if ($installers) {
    $installer = $installers | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    $sizeMB = [math]::Round($installer.Length / 1MB, 2)
    Write-Host ""
    Write-Host "   INSTALADOR GERADO!" -ForegroundColor Green
    Write-Host "   $($installer.FullName)" -ForegroundColor White
    Write-Host "   Tamanho: $sizeMB MB" -ForegroundColor White
}

if (Test-Path $unpackedDir) {
    Write-Host ""
    Write-Host "   Estrutura:" -ForegroundColor Cyan
    
    if (Test-Path "$unpackedDir\node-portable\node.exe") {
        Write-Host "   [OK] Node.js portatil" -ForegroundColor Green
    } else {
        Write-Host "   [X] Node.js portatil" -ForegroundColor Red
    }
    
    if (Test-Path "$unpackedDir\backend\src\server.js") {
        Write-Host "   [OK] Backend" -ForegroundColor Green
    } else {
        Write-Host "   [X] Backend" -ForegroundColor Red
    }
    
    if (Test-Path "$unpackedDir\backend\node_modules\.prisma\client\index.js") {
        Write-Host "   [OK] Prisma Client" -ForegroundColor Green
    } else {
        Write-Host "   [X] Prisma Client" -ForegroundColor Red
    }
    
    if (Test-Path "$unpackedDir\frontend\.output\public\index.html") {
        Write-Host "   [OK] Frontend" -ForegroundColor Green
    } else {
        Write-Host "   [X] Frontend" -ForegroundColor Red
    }
}

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "                  BUILD CONCLUIDO!                              " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "   Tempo: $($duration.Minutes)m $($duration.Seconds)s" -ForegroundColor White
Write-Host ""
Write-Host "   ATALHOS DE DEBUG:" -ForegroundColor Cyan
Write-Host "   F12 = DevTools" -ForegroundColor White
Write-Host "   Ctrl+Shift+L = Pasta de logs" -ForegroundColor White
Write-Host ""

pause
