# 🔄 Rebuild Necessário Após Correções

> **As correções no código requerem rebuild do aplicativo**

---

## ✅ Correções Aplicadas

Foi corrigido o `electron/main.js` para resolver os problemas:
- ❌ Backend não iniciava
- ❌ Função não definida
- ❌ Caminhos incorretos

---

## 🚀 Como Rebuildar

### Passo 1: Limpar Build Anterior

```powershell
# Remover pasta dist (opcional, mas recomendado)
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
```

### Passo 2: Rebuildar Aplicativo

```powershell
# Build completo (frontend + electron)
npm run build
```

Isso vai:
1. Buildar o frontend
2. Empacotar tudo no Electron
3. Gerar o executável corrigido

---

## ✅ Testar Após Rebuild

### Opção 1: Pelo Terminal (Ver Logs)

```powershell
cd "dist\win-unpacked"
.\Mercadinho PDV.exe
```

### Opção 2: Usar Script

```powershell
.\executar-com-logs.ps1
```

---

## 🔍 O Que Foi Corrigido

1. **Caminho do backend em produção**
   - Antes: Tentava usar `resources/backend/`
   - Agora: Usa `backend/` na mesma pasta do executável

2. **Uso do Node.js**
   - Antes: Tentava usar o executável do Electron como Node.js
   - Agora: Usa Node.js do sistema (`node`)

3. **Função inexistente**
   - Antes: Chamava `waitForBackend()` que não existia
   - Agora: Usa `waitForBackendAndFrontend()` correta

4. **Tratamento de erros**
   - Adicionadas mensagens de erro claras
   - Verificação se backend existe antes de iniciar

---

## 📋 Após o Rebuild

Você deve ver:
- ✅ Backend iniciando corretamente
- ✅ Mensagens claras de erro (se houver)
- ✅ Aplicativo funcionando

Se ainda houver problemas, execute pelo terminal para ver os logs!

---

**Execute agora**: `npm run build`

