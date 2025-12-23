# 🔧 Solução: Erro "ffmpeg.dll não foi encontrado"

> **Erro ao executar o aplicativo em outro computador**

---

## ❌ Erro

```
A execução de código não pode continuar porque ffmpeg.dll não foi encontrado.
Reinstalando o programa para corrigir o problema.
```

---

## 🔍 Causa

O erro acontece quando você copia apenas o arquivo `.exe` para outro computador, mas o Electron precisa de **todos os arquivos** da pasta `dist\win-unpacked\` para funcionar.

O `ffmpeg.dll` e outras DLLs precisam estar na mesma pasta do executável.

---

## ✅ Solução

### Opção 1: Copiar Toda a Pasta (Recomendado)

**NÃO copie apenas o `.exe`!** Copie a pasta inteira:

```
dist\win-unpacked\
```

**Ou crie um instalador:**

```powershell
npm run build:electron:win
```

Isso gerará um instalador `.exe` que instala tudo corretamente.

---

### Opção 2: Criar Instalador .exe

Para distribuir, use o instalador ao invés da pasta:

```powershell
# Criar instalador
npm run build:electron:win
```

O instalador será gerado em:
```
dist\Mercadinho-PDV-Setup-1.0.0.exe
```

Este instalador instala todos os arquivos necessários automaticamente.

---

### Opção 3: Empacotar Tudo Junto

Para distribuir a pasta, crie um ZIP com tudo:

```powershell
# Criar ZIP com toda a pasta
Compress-Archive -Path "dist\win-unpacked\*" -DestinationPath "Mercadinho-PDV.zip" -Force
```

Depois, no outro computador:
1. Extrair o ZIP
2. Executar `Mercadinho PDV.exe` da pasta extraída

---

## 📋 Arquivos Necessários

O executável precisa destes arquivos na mesma pasta:

- ✅ `Mercadinho PDV.exe` (executável principal)
- ✅ `ffmpeg.dll` (biblioteca de mídia)
- ✅ `d3dcompiler_47.dll`
- ✅ `libEGL.dll`
- ✅ `libGLESv2.dll`
- ✅ `vk_swiftshader.dll`
- ✅ `vulkan-1.dll`
- ✅ `chrome_100_percent.pak`
- ✅ `chrome_200_percent.pak`
- ✅ `icudtl.dat`
- ✅ `resources.pak`
- ✅ Pasta `resources/` (com `app.asar`)
- ✅ Pasta `locales/`
- ✅ Pasta `backend/` (se usar backend)

**Todos esses arquivos devem estar na mesma pasta do `.exe`!**

---

## 🔧 Verificar Arquivos

### No Notebook com Erro

1. Abra a pasta onde está o `Mercadinho PDV.exe`
2. Verifique se o `ffmpeg.dll` está lá
3. Se não estiver, copie TODA a pasta `dist\win-unpacked\` do computador de desenvolvimento

### Listar Arquivos Necessários

```powershell
# No computador de desenvolvimento
Get-ChildItem "dist\win-unpacked" -Filter "*.dll"
Get-ChildItem "dist\win-unpacked" -Filter "*.pak"
Get-ChildItem "dist\win-unpacked" -Filter "*.dat"
```

---

## 🚀 Distribuição Recomendada

### Para Cliente Final

**Use o instalador `.exe`:**

```powershell
# 1. Criar instalador
npm run build:electron:win

# 2. Distribuir apenas este arquivo:
dist\Mercadinho-PDV-Setup-1.0.0.exe
```

O cliente só precisa executar o instalador, que instala tudo automaticamente.

### Para Teste Rápido

**Copie toda a pasta:**

1. Copiar `dist\win-unpacked\` inteira
2. Colar no notebook
3. Executar `Mercadinho PDV.exe`

---

## ✅ Checklist de Distribuição

- [ ] Todos os arquivos `.dll` presentes
- [ ] Pasta `resources/` presente
- [ ] Pasta `locales/` presente
- [ ] Todos os arquivos `.pak` presentes
- [ ] `icudtl.dat` presente
- [ ] Se usar backend: pasta `backend/` presente

---

## 💡 Dica

**Sempre distribua a pasta completa ou use o instalador!**

Nunca copie apenas o `.exe` isoladamente.

---

[← Voltar para Troubleshooting](../README.md)

