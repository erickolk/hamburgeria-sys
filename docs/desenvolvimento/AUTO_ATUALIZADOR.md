# Sistema de Auto-Atualização

## Visão Geral

O Mercadinho PDV possui um sistema de auto-atualização que verifica novas versões **semanalmente** e notifica o usuário quando há uma atualização disponível.

### Características

- **Verificação semanal**: Não sobrecarrega o servidor
- **Notificação não intrusiva**: Toast discreto no canto da tela
- **Confirmação do usuário**: Só baixa/instala com permissão
- **Backup automático**: Antes de instalar, faz backup do banco
- **Opção de pular versão**: Usuário pode ignorar uma versão específica

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    VPS (evomercearia)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  API: /updates/latest.json                          │   │
│  │  Arquivo: updates/release-info.json                 │   │
│  │  Download: /uploads/Mercadinho-PDV-X.X.X.exe        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ GET /updates/latest.json
                              │ (1x por semana)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Cliente (Electron)                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  electron/updater.js - Serviço de verificação       │   │
│  │  Armazena: ~/Mercadinho/update-state.json           │   │
│  │  Downloads: ~/Mercadinho/downloads/                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Como Publicar uma Nova Versão

### Passo 1: Gerar o Build

```powershell
cd c:\Users\Admin\Documents\Projetos\mercadinho

# Atualizar versão no package.json
# Ex: "version": "1.1.0"

# Build completo
npm run build:full
```

O instalador será gerado em: `C:\temp-mercadinho-dist\Mercadinho PDV Setup X.X.X.exe`

### Passo 2: Fazer Upload do Instalador

Copie o instalador para o servidor VPS:

```bash
# Via SCP
scp "Mercadinho PDV Setup 1.1.0.exe" user@vps:/var/www/uploads/

# Ou via painel do EasyPanel/servidor
```

A URL de download será algo como:
```
https://evomercearia-backend.d3vbpv.easypanel.host/uploads/Mercadinho-PDV-Setup-1.1.0.exe
```

### Passo 3: Publicar a Versão na API

**Opção A: Via API (recomendado)**

```bash
# Login como admin
curl -X POST https://evomercearia-backend.d3vbpv.easypanel.host/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mercadinho.com","password":"sua_senha"}'

# Publicar versão
curl -X POST https://evomercearia-backend.d3vbpv.easypanel.host/updates/release \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "1.1.0",
    "downloadUrl": "https://evomercearia-backend.d3vbpv.easypanel.host/uploads/Mercadinho-PDV-Setup-1.1.0.exe",
    "changelog": "- Sistema de licenciamento\n- Auto-atualização\n- Correções de bugs",
    "size": "~180 MB",
    "mandatory": false
  }'
```

**Opção B: Via arquivo JSON**

Crie/edite o arquivo `backend/updates/release-info.json` no servidor:

```json
{
  "version": "1.1.0",
  "downloadUrl": "https://evomercearia-backend.d3vbpv.easypanel.host/uploads/Mercadinho-PDV-Setup-1.1.0.exe",
  "changelog": "- Sistema de licenciamento\n- Auto-atualização\n- Correções de bugs",
  "releaseDate": "2024-12-23T10:00:00.000Z",
  "size": "~180 MB",
  "mandatory": false,
  "minVersion": "1.0.0"
}
```

### Passo 4: Verificar

Acesse no navegador:
```
https://evomercearia-backend.d3vbpv.easypanel.host/updates/latest.json
```

Deve retornar as informações da nova versão.

---

## Configuração do Servidor

### Criar Diretório de Updates

No servidor VPS:

```bash
mkdir -p /app/backend/updates
mkdir -p /var/www/uploads  # Para os instaladores
```

### Configurar NGINX (se necessário)

```nginx
# Servir arquivos de download
location /uploads/ {
    alias /var/www/uploads/;
    add_header Content-Disposition "attachment";
}
```

### Variáveis de Ambiente

No backend, configure:

```env
UPDATES_DIR=/app/backend/updates
```

---

## Fluxo do Cliente

### 1. Verificação Automática

Ao abrir o app, após 5 segundos:

1. Verifica se já passou 7 dias desde última verificação
2. Se sim, faz GET em `/updates/latest.json`
3. Compara versões
4. Se houver nova versão, mostra toast de notificação

### 2. Download

Quando usuário clica em "Atualizar":

1. Baixa o instalador para `~/Mercadinho/downloads/`
2. Mostra progresso na UI
3. Ao concluir, pergunta se quer instalar

### 3. Instalação

Quando usuário confirma instalação:

1. Executa `backup-database.ps1` (silencioso)
2. Executa o instalador com `/S` (silencioso)
3. Fecha o app

O instalador:
1. Detecta que é atualização
2. Faz backup pré-instalação
3. Instala nova versão
4. Executa `prisma migrate deploy`

---

## Estrutura de Arquivos

### No Servidor (VPS)

```
backend/
├── src/routes/updates.js      # API de atualizações
└── updates/
    ├── release-info.json      # Info da versão atual
    └── CHANGELOG.md           # Histórico de versões

/var/www/uploads/
└── Mercadinho-PDV-Setup-1.1.0.exe
```

### No Cliente (PC)

```
~/Mercadinho/
├── update-state.json          # Estado: última verificação, versão pulada
├── downloads/                 # Instaladores baixados
│   └── Mercadinho-PDV-Setup-1.1.0.exe
├── backups/                   # Backups do banco
└── logs/                      # Logs de operação
```

---

## Endpoints da API

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/updates/latest.json` | Info da versão atual | Não |
| GET | `/updates/check?version=X.X.X` | Verifica se há update | Não |
| GET | `/updates/changelog` | Changelog completo | Não |
| POST | `/updates/release` | Publicar nova versão | Admin |
| GET | `/updates/release` | Ver release atual | Admin |

---

## Forçar Verificação Manual

O usuário pode forçar verificação de atualizações:

1. Menu → Configurações → Verificar Atualizações

Ou via console do DevTools (F12):

```javascript
window.electronAPI.checkForUpdates(true)  // force = true
```

---

## Troubleshooting

### Cliente não verifica atualizações

1. Verifique `~/Mercadinho/update-state.json` - pode ter `lastCheck` recente
2. Delete o arquivo para forçar verificação
3. Ou use `checkForUpdates(true)` para forçar

### Download falha

1. Verifique URL do download no `release-info.json`
2. Teste a URL no navegador
3. Verifique firewall/proxy do cliente

### Instalação falha

1. Verifique logs em `~/Mercadinho/logs/`
2. Tente instalar manualmente o .exe baixado
3. Execute como Administrador

### Versão não atualiza no servidor

1. Verifique se `release-info.json` foi salvo corretamente
2. Reinicie o backend se necessário
3. Limpe cache do CDN/proxy se houver

