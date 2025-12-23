# 🔧 Solução: Executável não inicia (nada acontece)

> **Quando você clica no .exe e nada acontece**

---

## ❌ Sintomas

- Clica duas vezes no `Mercadinho PDV.exe`
- Nada acontece (nenhuma janela aparece)
- Nenhuma mensagem de erro visível

---

## 🔍 Diagnóstico Rápido

### Passo 1: Executar pelo Terminal

**NUNCA** clique duas vezes! Execute pelo terminal para ver os erros:

```powershell
cd "dist\win-unpacked"
.\Mercadinho PDV.exe
```

Ou use o script:

```powershell
.\scripts/dev/executar-com-logs.ps1
```

Isso mostrará os erros no terminal!

---

## 🔍 Causas Comuns

### 1. Backend não inicia (mais comum)

**Sintomas:**
- App inicia mas não abre janela
- Logs mostram erro do backend

**Soluções:**

#### A) Node.js não encontrado

```powershell
# Verificar
node --version

# Se não tiver, instalar: https://nodejs.org/
```

#### B) PostgreSQL não está rodando

```powershell
# Verificar
Get-Service -Name "postgresql*"

# Se não estiver rodando, iniciar
Start-Service postgresql-x64-15
```

#### C) Backend não encontrado

O backend precisa estar em `resources\backend\` dentro do app. Verifique:

```powershell
# Verificar se backend existe no build
Test-Path "dist\win-unpacked\backend"
```

---

### 2. Frontend não encontrado

**Sintomas:**
- Backend inicia
- Erro ao carregar interface

**Solução:**

O frontend deve estar dentro do `app.asar`. Se não estiver, o build está incompleto.

**Refazer build:**

```powershell
npm run build:frontend
npm run build:electron
```

---

### 3. Erro silencioso

**Sintomas:**
- Nada acontece
- Sem logs visíveis

**Solução:**

Execute pelo terminal sempre! Isso mostra os erros.

---

## 🔧 Soluções Passo a Passo

### Solução 1: Verificar Pré-requisitos

```powershell
# 1. Node.js instalado?
node --version

# 2. PostgreSQL rodando?
Get-Service -Name "postgresql*"

# 3. Todos os arquivos presentes?
Test-Path "dist\win-unpacked\Mercadinho PDV.exe"
Test-Path "dist\win-unpacked\ffmpeg.dll"
Test-Path "dist\win-unpacked\resources\app.asar"
```

### Solução 2: Executar com Logs

```powershell
# Usar o script
.\scripts/dev/executar-com-logs.ps1

# OU manualmente
cd "dist\win-unpacked"
.\Mercadinho PDV.exe
```

### Solução 3: Verificar Logs do Backend

O backend pode estar falhando. Veja os logs no terminal quando executar.

---

## 📋 Checklist de Verificação

- [ ] Node.js instalado? (`node --version`)
- [ ] PostgreSQL rodando? (`Get-Service postgresql*`)
- [ ] Todos os arquivos na pasta `dist\win-unpacked\`?
- [ ] Executou pelo terminal para ver erros?
- [ ] Backend existe em `dist\win-unpacked\backend\`?
- [ ] Frontend foi buildado? (`Test-Path "frontend\.output"`)

---

## 🚨 Erros Comuns

### "Node.js não encontrado"

**Solução:**
1. Instalar Node.js: https://nodejs.org/
2. Reiniciar o terminal
3. Verificar: `node --version`

### "Backend não respondeu"

**Solução:**
1. Verificar PostgreSQL rodando
2. Verificar banco de dados existe
3. Ver logs do backend no terminal

### "Frontend não encontrado"

**Solução:**
1. Refazer build do frontend: `npm run build:frontend`
2. Refazer build do Electron: `npm run build:electron`

---

## 💡 Dica Importante

**SEMPRE execute pelo terminal primeiro!**

Isso permite ver os erros que estão acontecendo. Cliques duplos escondem os erros.

---

## 📚 Documentação Relacionada

- **[Solução Problemas Executável](../SOLUCAO_PROBLEMAS_EXECUTAVEL.md)** - Guia completo
- **[Erro ffmpeg.dll](ERRO_FFMPEG_DLL.md)** - Erro de DLL faltando

---

[← Voltar para Troubleshooting](../README.md)

