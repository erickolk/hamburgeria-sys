# Organização do Projeto Mercadinho

Este documento descreve a estrutura organizada do projeto.

## 📁 Estrutura da Raiz

A raiz do projeto contém apenas os arquivos essenciais:

```
mercadinho/
├── package.json              # Configuração principal do projeto
├── package-lock.json         # Lock file do npm
├── README.md                 # Documentação principal
├── docker-compose.yml        # Configuração Docker (desenvolvimento)
├── docker-compose.prod.yml   # Configuração Docker (produção)
│
├── backend/                  # API Backend (Node.js/Express)
├── frontend/                 # Interface Frontend (Nuxt 3)
├── electron/                 # Código Electron (Desktop App)
├── build/                    # Arquivos de build do instalador
├── installer/                # Scripts de instalação
├── node-portable/            # Node.js portable para distribuição
├── scripts/                  # Scripts organizados por categoria
└── docs/                     # Documentação completa
```

## 📂 Estrutura de Scripts

Os scripts foram organizados em subpastas dentro de `scripts/`:

### `scripts/build/`
Scripts relacionados à construção e build do aplicativo.

### `scripts/dev/`
Scripts para desenvolvimento e execução local.

### `scripts/diagnostico/`
Scripts de diagnóstico e troubleshooting.

### `scripts/db/`
Scripts relacionados ao banco de dados.

Veja [`scripts/README.md`](../scripts/README.md) para mais detalhes.

## 📚 Documentação

A documentação está organizada em `docs/`:

- `docs/historicos/` - Documentos históricos e temporários
- `docs/backend/` - Documentação do backend
- `docs/frontend/` - Documentação do frontend
- `docs/electron/` - Documentação do Electron
- `docs/instalacao/` - Guias de instalação
- `docs/deploy/` - Guias de deploy
- `docs/troubleshooting/` - Soluções de problemas
- E outras categorias...

## 🔄 Mudanças Realizadas

### Arquivos Movidos

1. **Scripts de Build** → `scripts/build/`
   - `build-alternativo.ps1`
   - `build-como-admin.bat`
   - `build-completo-automatico.ps1`
   - `build-instalador-admin.ps1`
   - `build-instalador-completo.ps1`
   - `build-instalador.ps1`

2. **Scripts de Desenvolvimento** → `scripts/dev/`
   - `iniciar-com-backend.ps1`
   - `iniciar-electron.ps1`
   - `iniciar-postgres.ps1`
   - `executar-app-com-logs-completos.ps1`
   - `executar-com-logs.ps1`
   - `start-all.ps1`
   - `testar-electron.ps1`

3. **Scripts de Diagnóstico** → `scripts/diagnostico/`
   - `diagnostico-app-instalado.ps1`
   - `diagnostico-executavel.ps1`
   - `diagnostico-rapido.ps1`

4. **Scripts de Banco de Dados** → `scripts/db/`
   - `fix-pg-password.bat`
   - `redefinir-senha-postgres.ps1`

5. **Documentos Históricos** → `docs/historicos/`
   - Todos os arquivos `.md` temporários e históricos

### Referências Atualizadas

As referências nos documentos ativos foram atualizadas para refletir os novos caminhos:
- `docs/troubleshooting/CORRECAO_MODAL_CONFIGURACOES.md`
- `docs/troubleshooting/EXECUTAVEL_NAO_INICIA.md`
- `docs/desenvolvimento/MODULO_CONFIGURACOES_COMPLETO.md`

## ✅ Benefícios

1. **Raiz Limpa**: Apenas arquivos essenciais na raiz
2. **Organização Clara**: Scripts agrupados por função
3. **Fácil Navegação**: Estrutura lógica e intuitiva
4. **Manutenção Simplificada**: Fácil encontrar e atualizar scripts
5. **Documentação Organizada**: Históricos separados da documentação ativa

## 📝 Notas

- Os documentos históricos foram preservados em `docs/historicos/` para referência futura
- Todos os scripts mantêm sua funcionalidade original, apenas foram reorganizados
- As referências nos documentos ativos foram atualizadas automaticamente

