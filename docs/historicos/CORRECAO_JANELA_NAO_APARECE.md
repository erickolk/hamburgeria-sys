# 🔧 Correção: Janela Não Aparece Quando Aplicativo é Executado

## 🎯 Problema Identificado

Quando o aplicativo instalado é executado, o processo aparece no Gerenciador de Tarefas, mas a janela não é exibida visualmente.

### Causa

O aplicativo está configurado para não mostrar a janela até que o conteúdo seja carregado (`show: false`). Se o backend não iniciar ou o frontend não for encontrado, o evento `ready-to-show` nunca é disparado, e a janela nunca aparece.

---

## ✅ Correções Aplicadas

### 1. Timeout de Segurança para Mostrar Janela

Adicionado timeout de 5 segundos que força a exibição da janela mesmo se o conteúdo não carregar:

```javascript
// Timeout de segurança: mostrar janela após 5 segundos mesmo se não carregar
setTimeout(() => {
  if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
    console.log('⏰ Timeout: mostrando janela mesmo sem conteúdo carregado');
    mainWindow.show();
    // Carrega página de "Iniciando..." com spinner
  }
}, 5000);
```

### 2. Páginas de Erro Visíveis

Quando há erros, em vez de apenas logs no console, agora são exibidas páginas HTML com mensagens claras:

- **Frontend não encontrado**: Lista todos os caminhos testados
- **Backend não respondeu**: Explica possíveis causas
- **Página de "Iniciando..."**: Mostra spinner enquanto aguarda

### 3. Melhor Tratamento de Erros

- Logs mais detalhados de todos os caminhos testados
- Janela sempre aparece, mesmo com erros
- Mensagens de erro mais informativas para o usuário

---

## 🔍 Como Diagnosticar Problemas

### Script de Diagnóstico

Execute o script de diagnóstico para verificar:

```powershell
.\diagnostico-app-instalado.ps1
```

Este script:
- ✅ Encontra o aplicativo instalado
- ✅ Verifica estrutura de arquivos (backend, frontend)
- ✅ Verifica Node.js instalado
- ✅ Verifica PostgreSQL
- ✅ Executa o aplicativo e captura logs
- ✅ Mostra últimos 50 linhas do log

### Verificar Logs Manualmente

Os logs do aplicativo são salvos em:
```
%TEMP%\mercadinho-diagnostico.log
```

---

## 📋 Próximos Passos

### 1. Rebuild do Aplicativo

Após essas correções, você precisa fazer um novo build:

```powershell
# Como Administrador
.\build-instalador-admin.ps1
```

### 2. Testar Instalação

1. Desinstale a versão anterior
2. Instale a nova versão gerada
3. Execute o aplicativo
4. **A janela deve aparecer mesmo se houver erros!**

### 3. Se Ainda Não Funcionar

Execute o diagnóstico:

```powershell
.\diagnostico-app-instalado.ps1
```

E verifique:
- ✅ Node.js está instalado?
- ✅ PostgreSQL está rodando?
- ✅ Backend está no lugar certo?
- ✅ Frontend está no lugar certo?

---

## 🔧 Possíveis Problemas Adicionais

### Node.js Não Instalado

O aplicativo precisa do Node.js instalado para rodar o backend. Verifique:

```powershell
node --version
```

Se não estiver instalado, instale de: https://nodejs.org/

### PostgreSQL Não Rodando

O backend precisa do PostgreSQL. Verifique o serviço:

```powershell
Get-Service -Name "postgresql*"
```

### Frontend Não Encontrado

Se o frontend não estiver sendo encontrado, verifique a estrutura após a instalação:

```
C:\Program Files\Mercadinho PDV\
├── resources\
│   ├── app\
│   │   └── frontend\
│   │       └── .output\
│   │           └── public\
│   │               └── index.html
```

---

## ✅ Resultado Esperado

Após as correções:

1. ✅ Janela aparece sempre (mesmo com erros)
2. ✅ Mensagens de erro são visíveis
3. ✅ Logs detalhados para diagnóstico
4. ✅ Timeout de segurança para garantir que janela apareça

---

**Status:** ✅ Correções aplicadas - Pronto para rebuild

