# 🔧 Solução: Erro "Acesso Negado" no Build do Electron

> **Erro ao remover arquivos durante o build: `Acesso negado`**

---

## ❌ Erro Encontrado

```
⨯ remove C:\Users\erick\...\dist\win-unpacked\chrome_100_percent.pak: Acesso negado.
```

Este erro ocorre quando arquivos na pasta `dist/win-unpacked/` estão **bloqueados por processos em execução**.

---

## 🔍 Causa

**O aplicativo está rodando!** Instâncias do `Mercadinho PDV.exe` estão abertas e bloqueando os arquivos, impedindo que o electron-builder os remova/atualize.

---

## ✅ Solução Rápida

### Passo 1: Fechar Todas as Instâncias

```powershell
# Fechar todas as instâncias do aplicativo
Get-Process | Where-Object {$_.ProcessName -like "*Mercadinho*"} | Stop-Process -Force

# OU manualmente: fechar todas as janelas do aplicativo
```

### Passo 2: Limpar Pasta de Build

```powershell
# Remover pasta dist/win-unpacked
Remove-Item -Recurse -Force "dist\win-unpacked" -ErrorAction SilentlyContinue
```

### Passo 3: Tentar Build Novamente

```powershell
# Build do instalador
npm run build:electron
```

---

## 🔧 Solução Detalhada

### Opção 1: Script Automático (Recomendado)

```powershell
# Fechar instâncias
Get-Process | Where-Object {$_.ProcessName -like "*Mercadinho*"} | Stop-Process -Force

# Aguardar processos encerrarem
Start-Sleep -Seconds 2

# Limpar pasta
if (Test-Path "dist\win-unpacked") {
    Remove-Item -Recurse -Force "dist\win-unpacked"
}

# Rebuildar
npm run build:electron
```

### Opção 2: Limpar Tudo e Rebuildar

```powershell
# Fechar aplicativo
Get-Process | Where-Object {$_.ProcessName -like "*Mercadinho*"} | Stop-Process -Force

# Remover toda pasta dist
Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue

# Rebuildar completo
npm run build
```

### Opção 3: Verificar Processos Bloqueando

```powershell
# Ver quais processos estão usando os arquivos
Get-Process | Where-Object {
    $_.Path -like "*mercadinho*" -or 
    $_.ProcessName -like "*electron*" -or
    $_.ProcessName -like "*Mercadinho*"
} | Select-Object ProcessName, Id, Path

# Fechar processos específicos
Stop-Process -Id <ID_DO_PROCESSO> -Force
```

---

## 🛡️ Prevenção

### Antes de Fazer Build

1. ✅ **Fechar todas as instâncias** do aplicativo
2. ✅ **Fechar o aplicativo** se estiver rodando
3. ✅ **Verificar processos** bloqueando arquivos

### Comando de Verificação

```powershell
# Verificar se há instâncias rodando
$processes = Get-Process | Where-Object {$_.ProcessName -like "*Mercadinho*"}
if ($processes) {
    Write-Host "⚠️  Aplicativo está rodando! Feche antes de fazer build." -ForegroundColor Yellow
    $processes | Stop-Process -Force
    Start-Sleep -Seconds 2
}
```

---

## 📋 Checklist Antes do Build

- [ ] Fechar todas as janelas do aplicativo
- [ ] Verificar processos (`Get-Process | Where-Object {$_.ProcessName -like "*Mercadinho*"}`)
- [ ] Limpar pasta `dist/win-unpacked` (opcional mas recomendado)
- [ ] Executar build

---

## 🚀 Build Completo (Com Limpeza)

```powershell
# Script completo para build limpo
Write-Host "Fechando aplicativo..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*Mercadinho*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "Limpando build anterior..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "dist\win-unpacked" -ErrorAction SilentlyContinue

Write-Host "Iniciando build..." -ForegroundColor Green
npm run build:electron
```

---

## ⚠️ Notas Importantes

1. **Sempre feche o aplicativo** antes de fazer build
2. **Aguarde alguns segundos** após fechar para processos encerrarem completamente
3. **Se o erro persistir**, reinicie o computador ou tente como Administrador

---

## 🎯 Resultado Esperado

Após fechar as instâncias e limpar a pasta:

```
✅ Processos fechados
✅ Pasta limpa
✅ Build iniciando...
✅ Build concluído com sucesso!
```

---

[← Voltar para Troubleshooting](../README.md)

