# 🔧 INSTRUÇÕES: Gerar Instalador como Administrador

## ✅ Correção Aplicada

Removi as flags problemáticas (`--config.win.sign=null`) da linha de comando e a propriedade `sign: null` do `package.json` que estava causando o erro "Cannot find module 'null'".

Agora o electron-builder usará apenas as variáveis de ambiente para desabilitar o code signing.

---

## 🚀 Passos para Gerar o Instalador

### 1. Fechar Todas as Instâncias

Feche todas as janelas do aplicativo que possam estar abertas.

### 2. Abrir PowerShell como Administrador

- Pressione `Win + X`
- Selecione **"Windows PowerShell (Admin)"** ou **"Terminal (Admin)"**
- Ou clique com botão direito no PowerShell e escolha **"Executar como Administrador"**

### 3. Navegar até o Projeto

```powershell
cd "C:\Users\erick\OneDrive\Documentos\Projetos\mercadinho"
```

### 4. Executar o Script de Build

**Opção A: Usar o script automatizado (RECOMENDADO)**

```powershell
.\build-instalador-admin.ps1
```

Este script:
- ✅ Verifica se está rodando como Administrador
- ✅ Fecha processos automaticamente
- ✅ Configura variáveis de ambiente
- ✅ Limpa cache
- ✅ Executa o build
- ✅ Mostra resultado

**Opção B: Executar manualmente**

```powershell
# Fechar processos
Get-Process | Where-Object {$_.ProcessName -like "*Mercadinho*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Configurar variáveis
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
$env:WIN_CSC_LINK = ""
$env:WIN_CSC_KEY_PASSWORD = ""

# Limpar cache
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign" -ErrorAction SilentlyContinue

# Executar build
npm run build:electron
```

---

## 📍 Onde Estará o Instalador?

Após o build bem-sucedido, o instalador estará em:

```
C:\temp-mercadinho-dist\Mercadinho-PDV-Setup-1.0.0.exe
```

---

## ✅ Verificar Sucesso

Após o build, você verá:

```
✅ BUILD CONCLUÍDO COM SUCESSO!
🎉 INSTALADOR GERADO:
   Arquivo: C:\temp-mercadinho-dist\Mercadinho-PDV-Setup-1.0.0.exe
   Tamanho: XXX MB
```

---

## ⚠️ Se Ainda Der Erro

Se ainda aparecer erro de code signing mesmo como Administrador, você pode:

1. **Verificar se o aplicativo empacotado foi gerado:**
   ```
   C:\temp-mercadinho-dist\win-unpacked\Mercadinho PDV.exe
   ```
   Se foi gerado, você pode distribuir essa pasta completa.

2. **Criar um ZIP autoextraível como alternativa:**
   ```powershell
   Compress-Archive -Path "C:\temp-mercadinho-dist\win-unpacked\*" -DestinationPath "C:\temp-mercadinho-dist\Mercadinho-PDV-Portable.zip" -Force
   ```

---

## 💡 Dica

Se você quiser automatizar ainda mais, pode criar um atalho na área de trabalho que execute o script como Administrador automaticamente!

