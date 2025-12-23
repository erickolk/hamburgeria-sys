# 🔧 Solução: Erro de Permissão no Build do Electron

> **Erro ao criar symbolic links durante o build do Electron Builder**

---

## ❌ Erro Encontrado

```
ERROR: Cannot create symbolic link : O cliente não tem o privilégio necessário.
```

Este erro aparece ao tentar extrair arquivos do `winCodeSign` durante o build do Electron.

---

## ✅ Boa Notícia

**O arquivo `.exe` FOI GERADO mesmo com o erro!**

O erro ocorre apenas durante a extração de ferramentas de code signing (assinatura de código) que não são essenciais para o build funcionar. O aplicativo foi empacotado com sucesso.

---

## 📍 Localização do Arquivo

O executável está em:
```
dist\win-unpacked\Mercadinho PDV.exe
```

Você pode executá-lo diretamente daí!

---

## 🔍 Verificar se Funciona

### Teste Rápido

```powershell
# Verificar se o arquivo existe
Test-Path "dist\win-unpacked\Mercadinho PDV.exe"

# Ver informações do arquivo
Get-Item "dist\win-unpacked\Mercadinho PDV.exe" | Select-Object Name, Length, LastWriteTime

# Executar o app (opcional)
Start-Process "dist\win-unpacked\Mercadinho PDV.exe"
```

---

## 🔧 Soluções para o Erro (Opcional)

### Opção 1: Ignorar o Erro (Recomendado)

O erro não impede o funcionamento. O executável foi gerado corretamente. Você pode ignorar e usar o app normalmente.

### Opção 2: Desabilitar Code Signing

Se quiser evitar o erro, adicione no `package.json`:

```json
{
  "build": {
    "win": {
      "sign": null,
      "signDlls": false
    }
  }
}
```

### Opção 3: Executar como Administrador

```powershell
# Executar PowerShell como Administrador
# Depois executar:
npm run build:electron
```

### Opção 4: Limpar Cache

```powershell
# Limpar cache do electron-builder
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign"

# Tentar build novamente
npm run build:electron
```

---

## 📝 Sobre o Erro

### Por que acontece?

O `electron-builder` tenta extrair ferramentas de code signing que incluem arquivos do macOS (`.dylib`). No Windows, isso requer criar symbolic links, o que precisa de privilégios administrativos.

### É crítico?

**Não!** O code signing é apenas para distribuição oficial. Para desenvolvimento e testes locais, não é necessário.

### O que foi gerado?

- ✅ Aplicativo empacotado completo
- ✅ Todos os arquivos necessários
- ✅ Executável funcionando
- ❌ Code signing não configurado (não é problema para uso local)

---

## 🚀 Criar Instalador .exe

Para gerar um instalador `.exe` completo (sem code signing):

```powershell
# Build apenas do instalador
npm run build:electron:win

# OU build completo
npm run build
```

O instalador será gerado em:
```
dist\Mercadinho-PDV-Setup-1.0.0.exe
```

---

## ✅ Conclusão

**Tudo funcionou!** O erro é apenas um aviso sobre code signing, mas o aplicativo foi gerado corretamente.

Você pode usar o arquivo `dist\win-unpacked\Mercadinho PDV.exe` normalmente!

---

[← Voltar para Troubleshooting](../README.md)

