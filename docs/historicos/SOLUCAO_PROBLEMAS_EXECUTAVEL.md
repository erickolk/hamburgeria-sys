# 🔧 Solução: Problemas ao Executar o Aplicativo

> **Guia completo para resolver problemas ao executar o Mercadinho PDV.exe**

---

## ❌ Problemas Encontrados

### Problema 1: Erro "ffmpeg.dll não foi encontrado" no Notebook

```
A execução de código não pode continuar porque ffmpeg.dll não foi encontrado.
```

### Problema 2: Nada acontece ao clicar no .exe (Computador de Desenvolvimento)

O aplicativo não inicia ou não mostra nenhuma janela.

---

## ✅ Soluções

### Solução 1: Erro ffmpeg.dll

**Causa**: Você copiou apenas o arquivo `.exe` isoladamente.

**Solução**: Copie **TODA A PASTA** `dist\win-unpacked\` ou use o instalador.

#### Opção A: Copiar Pasta Completa (Para Teste)

1. No computador de desenvolvimento, encontre a pasta:
   ```
   dist\win-unpacked\
   ```

2. Copie **TODA A PASTA** para o notebook:
   - Não copie apenas o `.exe`!
   - Copie todos os arquivos e subpastas

3. No notebook, execute `Mercadinho PDV.exe` da pasta copiada

#### Opção B: Usar Instalador (Recomendado para Distribuição)

```powershell
# Criar instalador .exe completo
npm run build:electron:win
```

O instalador será gerado em:
```
dist\Mercadinho-PDV-Setup-1.0.0.exe
```

Este instalador instala tudo automaticamente no notebook.

---

### Solução 2: Nada acontece ao clicar no .exe

**Possíveis causas:**

1. **Backend não inicia** (Node.js não encontrado)
2. **Erro silencioso** (sem feedback visual)
3. **PostgreSQL não está rodando**

#### Diagnóstico

Execute pelo terminal para ver erros:

```powershell
cd "dist\win-unpacked"
.\Mercadinho PDV.exe
```

Isso mostrará os erros no terminal.

#### Soluções

**1. Verificar Node.js**

O backend precisa do Node.js instalado. Verifique:

```powershell
node --version
```

Se não tiver Node.js, instale de: https://nodejs.org/

**2. Verificar PostgreSQL**

O backend precisa do PostgreSQL rodando:

```powershell
# Verificar se está rodando
Get-Service -Name "postgresql*"

# Se não estiver, iniciar
Start-Service postgresql-x64-15
```

**3. Verificar Logs**

Os logs aparecem no terminal quando você executa pelo prompt. Procure por:
- `[Backend Error]` - Erros do backend
- `❌` - Erros gerais
- `✅` - Sucessos

---

## 🔍 Checklist de Diagnóstico

### No Computador de Desenvolvimento

- [ ] Node.js instalado? (`node --version`)
- [ ] PostgreSQL rodando? (`Get-Service postgresql*`)
- [ ] Todos os arquivos na pasta `dist\win-unpacked\`?
- [ ] Executar pelo terminal para ver erros

### No Notebook (Erro ffmpeg)

- [ ] Copiou TODA a pasta ou apenas o .exe?
- [ ] Todos os arquivos `.dll` presentes?
- [ ] Pasta `resources/` presente?
- [ ] Pasta `locales/` presente?

---

## 📋 Arquivos Necessários

Para o aplicativo funcionar, você precisa de:

### Arquivos Essenciais

- ✅ `Mercadinho PDV.exe`
- ✅ `ffmpeg.dll`
- ✅ `d3dcompiler_47.dll`
- ✅ `libEGL.dll`
- ✅ `libGLESv2.dll`
- ✅ `vk_swiftshader.dll`
- ✅ `vulkan-1.dll`
- ✅ `chrome_100_percent.pak`
- ✅ `chrome_200_percent.pak`
- ✅ `icudtl.dat`
- ✅ `resources.pak`
- ✅ `snapshot_blob.bin`
- ✅ `v8_context_snapshot.bin`

### Pastas Essenciais

- ✅ `resources/` (contém `app.asar` com o código)
- ✅ `locales/` (idiomas)
- ✅ `backend/` (se usar backend local)

---

## 🚀 Distribuição Correta

### Para Teste Rápido

**Copiar pasta completa:**

```powershell
# Compactar tudo
Compress-Archive -Path "dist\win-unpacked\*" -DestinationPath "Mercadinho-PDV.zip"

# No outro computador: extrair tudo e executar
```

### Para Cliente Final

**Usar instalador:**

```powershell
# Criar instalador
npm run build:electron:win

# Distribuir apenas:
dist\Mercadinho-PDV-Setup-1.0.0.exe
```

O cliente instala tudo automaticamente!

---

## 🐛 Executar com Logs

Para ver o que está acontecendo:

```powershell
# Abrir terminal no diretório
cd "dist\win-unpacked"

# Executar e ver logs
.\Mercadinho PDV.exe
```

Os logs mostrarão:
- Se o backend iniciou
- Se encontrou o banco de dados
- Se carregou o frontend
- Qualquer erro que ocorreu

---

## 💡 Dicas

### Não Funciona no Notebook?

1. **Copie toda a pasta** `dist\win-unpacked\`
2. **Ou use o instalador** `.exe` do build
3. **Verifique** se todos os arquivos `.dll` estão presentes

### Nada Acontece no PC de Dev?

1. **Execute pelo terminal** para ver erros
2. **Verifique Node.js** instalado
3. **Verifique PostgreSQL** rodando
4. **Veja os logs** que aparecem no terminal

---

## 📚 Documentação Relacionada

- **[Erro ffmpeg.dll](docs/troubleshooting/ERRO_FFMPEG_DLL.md)** - Detalhes do erro
- **[Electron Setup](docs/electron/ELECTRON_SETUP.md)** - Configuração completa

---

## ✅ Resumo

1. **Erro ffmpeg.dll**: Copie toda a pasta, não apenas o .exe
2. **Nada acontece**: Execute pelo terminal para ver erros
3. **Distribuição**: Use o instalador .exe para clientes

---

**Última atualização**: 03/12/2025

