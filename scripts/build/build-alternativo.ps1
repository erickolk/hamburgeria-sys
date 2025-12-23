$env:ELECTRON_BUILDER_CACHE = "$env:TEMP\electron-builder-cache"
$env:OUTPUT_DIR = "C:\temp-mercadinho-dist"

Write-Host "🔨 Build com configuração alternativa..." -ForegroundColor Green
electron-builder --config.output=$env:OUTPUT_DIR
