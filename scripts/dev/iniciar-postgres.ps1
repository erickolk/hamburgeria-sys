# Script para iniciar PostgreSQL no Docker Desktop
# Este script tenta iniciar o container do PostgreSQL

Write-Host "Iniciando PostgreSQL no Docker..." -ForegroundColor Cyan

# Verificar se Docker Desktop esta rodando
$dockerProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
if (-not $dockerProcess) {
    Write-Host "AVISO: Docker Desktop nao parece estar rodando!" -ForegroundColor Yellow
    Write-Host "Por favor, inicie o Docker Desktop manualmente" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Depois, execute no Docker Desktop:" -ForegroundColor White
    Write-Host "  1. Vá em 'Containers'" -ForegroundColor Gray
    Write-Host "  2. Clique em 'Run' ou 'Start'" -ForegroundColor Gray
    Write-Host "  3. Procure por 'mercadinho_db' ou crie um novo container" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Ou use o docker-compose.yml:" -ForegroundColor White
    Write-Host "  docker compose up -d db" -ForegroundColor Gray
    exit 1
}

Write-Host "Docker Desktop esta rodando!" -ForegroundColor Green

# Tentar usar docker-compose se disponivel
$dockerCompose = Get-Command docker-compose -ErrorAction SilentlyContinue
if ($dockerCompose) {
    Write-Host "Iniciando container com docker-compose..." -ForegroundColor Cyan
    docker-compose up -d db
    if ($LASTEXITCODE -eq 0) {
        Write-Host "PostgreSQL iniciado com sucesso!" -ForegroundColor Green
        exit 0
    }
}

# Tentar docker compose (sem hifen)
$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
    Write-Host "Iniciando container com docker compose..." -ForegroundColor Cyan
    docker compose up -d db
    if ($LASTEXITCODE -eq 0) {
        Write-Host "PostgreSQL iniciado com sucesso!" -ForegroundColor Green
        exit 0
    }
}

Write-Host ""
Write-Host "Nao foi possivel iniciar automaticamente." -ForegroundColor Yellow
Write-Host ""
Write-Host "Por favor, inicie manualmente no Docker Desktop:" -ForegroundColor White
Write-Host "  1. Abra o Docker Desktop" -ForegroundColor Gray
Write-Host "  2. Vá em 'Containers'" -ForegroundColor Gray
Write-Host "  3. Clique em 'Run' ou use o docker-compose.yml" -ForegroundColor Gray
Write-Host ""
Write-Host "Configuracao do container:" -ForegroundColor White
Write-Host "  Image: postgres:15-alpine" -ForegroundColor Gray
Write-Host "  Porta: 5433:5432" -ForegroundColor Gray
Write-Host "  Database: mercadinho" -ForegroundColor Gray
Write-Host "  User: postgres" -ForegroundColor Gray
Write-Host "  Password: postgres123" -ForegroundColor Gray


