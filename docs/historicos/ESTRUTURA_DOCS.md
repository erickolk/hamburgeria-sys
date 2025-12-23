# 📁 Nova Estrutura de Documentação

> **Documentação reorganizada em `docs/` por categorias**

---

## 🎯 O Que Mudou?

Todos os arquivos markdown foram organizados na pasta **`docs/`** com subpastas por categoria para facilitar a navegação e manutenção.

---

## 📂 Nova Estrutura

```
docs/
├── README.md                        ⭐ Índice principal
│
├── offline-sync/                    Sistema offline-first
│   ├── README.md
│   ├── QUICK_START_OFFLINE.md
│   ├── OFFLINE_SYNC_SETUP.md
│   ├── README_OFFLINE_SYNC.md
│   ├── IMPLEMENTACAO_COMPLETA.md
│   ├── RESUMO_FINAL_IMPLEMENTACAO.md
│   ├── COMANDOS_UTEIS.md
│   └── INDICE_OFFLINE_SYNC.md
│
├── electron/                        Aplicativo desktop
│   ├── README.md
│   ├── ELECTRON_SETUP.md
│   ├── ELECTRON_QUICKSTART.md
│   ├── ELECTRON_IMPLEMENTACAO.md
│   └── RECARREGAR_ELECTRON.md
│
├── instalacao/                      Instalação e setup
│   ├── README.md
│   ├── INSTALADOR_AUTOMATICO.md
│   ├── RESUMO_INSTALADOR.md
│   └── INICIAR_POSTGRES.md
│
├── desenvolvimento/                 Implementações
│   ├── README.md
│   ├── IMPLEMENTACOES_CONCLUIDAS.md
│   ├── IMPLEMENTACOES_MELHORIAS.md
│   ├── IMPLEMENTACOES_PDV.md
│   ├── MODULO_CONFIGURACOES_COMPLETO.md
│   ├── DOCUMENTACAO_COMPLETA.md
│   ├── RESUMO_FUNCIONALIDADES.md
│   ├── NOVIDADES_IMPLEMENTADAS.md
│   ├── README_NOVIDADES.md
│   ├── INICIO_RAPIDO.md
│   └── GUIA_INICIAR_MELHORIAS.md
│
├── deploy/                          Deploy e produção
│   ├── README.md
│   ├── DEPLOY_PASSO_A_PASSO.md
│   └── GUIA_DEPLOY_EASYPANEL.md
│
├── troubleshooting/                 Soluções de problemas
│   ├── README.md
│   ├── CORRECAO_MODAL_CONFIGURACOES.md
│   ├── CORRECAO_TICKET_PDV.md
│   ├── CORRECAO_FRONTEND_RELATORIOS.md
│   ├── CORRECAO_CORS.md
│   ├── DEBUG_ERRO_500.md
│   ├── VERIFICAR_LOGS_500.md
│   ├── VERIFICAR_LOGS_AGORA.md
│   ├── RESOLVER_AGORA.md
│   ├── SOLUCAO_ERRO_P3005.md
│   └── SOLUCAO_RAPIDA_P3005.md
│
├── backend/                         Documentação backend
│   ├── README.md
│   ├── APLICAR_CAMPOS_FALTANTES.md
│   ├── REGENERAR_PRISMA_CLIENT.md
│   ├── TICKETS_E_RELATORIOS.md
│   ├── VARIAVEIS_AMBIENTE.md
│   └── baseline-manual.md
│
├── frontend/                        Documentação frontend
│   ├── README.md
│   └── fix-useToast.md
│
├── checklists/                      Checklists
│   ├── README.md
│   ├── CHECKLIST_DEPLOY.md
│   └── CHECKLIST_TESTES_MERCADINHO.md
│
└── referencias/                     Referências gerais
    ├── README.md
    ├── INDICE_ARQUIVOS.md
    ├── console.md
    ├── conversacomagenteai.md
    ├── prompt_mercadinho.md
    └── importante.md
```

---

## 🔗 Atualização de Links

### Links Relativos

Os links nos documentos foram mantidos relativos. Se um documento referencia outro na mesma pasta, use apenas o nome do arquivo:

```markdown
[Link para outro arquivo](NOME_ARQUIVO.md)
```

### Links para Outras Categorias

Para links entre categorias, use caminhos relativos:

```markdown
[Instalação](../instalacao/README.md)
[Offline Sync](../offline-sync/README.md)
```

---

## 📍 Como Navegar

### Ponto de Entrada Principal

Comece sempre pelo: **[docs/README.md](docs/README.md)**

### Por Categoria

Cada subpasta tem um `README.md` que serve como índice local da categoria.

---

## 🔄 Arquivos que Permanecem na Raiz

Estes arquivos permanecem na raiz do projeto (fora de `docs/`):

- ✅ **`README.md`** - README principal do projeto
- ✅ **`ESTRUTURA_DOCS.md`** - Este arquivo (referência da estrutura)

---

## 📝 Migração de Links

### Antes

```markdown
[QUICK_START_OFFLINE.md](QUICK_START_OFFLINE.md)
[INSTALADOR_AUTOMATICO.md](INSTALADOR_AUTOMATICO.md)
```

### Depois

```markdown
[docs/instalacao/INSTALADOR_AUTOMATICO.md](docs/instalacao/INSTALADOR_AUTOMATICO.md)
[docs/offline-sync/QUICK_START_OFFLINE.md](docs/offline-sync/QUICK_START_OFFLINE.md)
```

### Dentro da Mesma Categoria

```markdown
[Quick Start](QUICK_START_OFFLINE.md)
[Setup Completo](OFFLINE_SYNC_SETUP.md)
```

---

## ✅ Benefícios da Nova Estrutura

### ✅ Organização

- Documentação agrupada por categoria
- Fácil encontrar o que precisa
- Estrutura clara e lógica

### ✅ Manutenção

- Cada categoria tem seu próprio índice
- Fácil adicionar novos documentos
- Links organizados por contexto

### ✅ Navegação

- README principal como ponto de entrada
- READMEs em cada categoria
- Links relativos funcionam perfeitamente

---

## 🆘 Precisa de Ajuda?

1. **Não encontrou um documento?** → Veja [docs/README.md](docs/README.md)
2. **Quer ver por categoria?** → Entre na pasta da categoria
3. **Links quebrados?** → Verifique se o caminho está correto

---

**Última atualização**: 03/12/2025

