# 🔧 Resumo: Soluções para Problemas do Executável

> **Soluções rápidas para os problemas encontrados**

---

## ❌ Problema 1: Erro "ffmpeg.dll não foi encontrado" (Notebook)

### ✅ Solução

**NÃO copie apenas o `.exe`!** Copie **TODA A PASTA**:

```
dist\win-unpacked\
```

**Ou crie um instalador:**

```powershell
npm run build:electron:win
```

Isso gera `dist\Mercadinho-PDV-Setup-1.0.0.exe` que instala tudo automaticamente.

---

## ❌ Problema 2: Nada acontece ao clicar no .exe (PC de Dev)

### ✅ Solução

**Execute pelo terminal para ver os erros:**

```powershell
cd "dist\win-unpacked"
.\Mercadinho PDV.exe
```

Ou use o script:

```powershell
.\executar-com-logs.ps1
```

### Possíveis Causas

1. **Node.js não encontrado**
   ```powershell
   node --version  # Verificar se está instalado
   ```

2. **PostgreSQL não está rodando**
   ```powershell
   Get-Service -Name "postgresql*"  # Verificar
   Start-Service postgresql-x64-15   # Iniciar se necessário
   ```

3. **Backend não inicia**
   - Veja os logs no terminal
   - Verifique se o backend existe em `dist\win-unpacked\backend\`
---

## 🚀 Para Distribuir no Notebook

### Opção 1: Copiar Pasta Completa (Teste)

1. Copie toda a pasta `dist\win-unpacked\`
2. Cole no notebook
3. Execute `Mercadinho PDV.exe`

### Opção 2: Criar Instalador (Recomendado)

```powershell
npm run build:electron:win
```

Distribuir apenas: `dist\Mercadinho-PDV-Setup-1.0.0.exe`

---

## 📋 Checklist Rápido

### No PC de Desenvolvimento

- [ ] Executar pelo terminal: `.\executar-com-logs.ps1`
- [ ] Ver logs de erro
- [ ] Verificar Node.js instalado
- [ ] Verificar PostgreSQL rodando

### No Notebook

- [ ] Copiou TODA a pasta (não apenas o .exe)?
- [ ] Todos os arquivos `.dll` presentes?
- [ ] Pasta `resources/` presente?

---

## 📚 Documentação Completa

- **[Solução Completa](SOLUCAO_PROBLEMAS_EXECUTAVEL.md)** - Guia detalhado
- **[Erro ffmpeg.dll](docs/troubleshooting/ERRO_FFMPEG_DLL.md)** - Detalhes do erro
- **[Executável não inicia](docs/troubleshooting/EXECUTAVEL_NAO_INICIA.md)** - Soluções detalhadas

---

## ⚡ Solução Rápida

### Para ver o que está acontecendo:

```powershell
.\executar-com-logs.ps1
```

Isso mostrará todos os erros no terminal!

---

**Última atualização**: 03/12/2025

