# Guia do Técnico - Atualização do Mercadinho PDV

## Índice

1. [Visão Geral](#visão-geral)
2. [Preparação do Pendrive](#preparação-do-pendrive)
3. [Checklist Pré-Atualização](#checklist-pré-atualização)
4. [Processo de Atualização](#processo-de-atualização)
5. [Backup e Restauração](#backup-e-restauração)
6. [Troubleshooting](#troubleshooting)
7. [Informações Técnicas](#informações-técnicas)

---

## Visão Geral

O sistema de atualização do Mercadinho PDV foi projetado para:

- **Preservar dados**: Nunca apagar vendas, produtos ou clientes existentes
- **Backup automático**: Criar cópia de segurança antes de qualquer atualização
- **Recuperação fácil**: Permitir restauração rápida em caso de problemas

### Fluxo de Atualização

```
1. Fechar aplicativo
2. Backup automático do banco
3. Instalação da nova versão
4. Aplicação de migrations (adiciona novas tabelas/campos)
5. Verificação
```

---

## Preparação do Pendrive

### Estrutura do Pendrive

```
PENDRIVE/
├── Mercadinho PDV Setup X.X.X.exe   # Instalador (baixar do repositório)
├── atualizar.bat                     # Script de atualização
├── backup-manual.bat                 # Backup manual
├── restaurar-backup.bat              # Restauração
├── LEIA-ME-ATUALIZACAO.txt           # Instruções para o cliente
└── tools/                            # Pasta opcional
    ├── backup-database.ps1
    ├── restore-database.ps1
    └── update-system.ps1
```

### Onde Obter os Arquivos

1. **Instalador**: Baixar da pasta `C:/temp-mercadinho-dist/` após o build
2. **Scripts**: Copiar da pasta `installer/` do projeto

### Comando para Preparar Pendrive

```powershell
# No PowerShell (como Admin)
$pendrive = "E:"  # Altere para a letra do seu pendrive
$projeto = "C:\Users\Admin\Documents\Projetos\mercadinho"

# Copiar arquivos
Copy-Item "$projeto\installer\atualizar.bat" $pendrive
Copy-Item "$projeto\installer\backup-manual.bat" $pendrive
Copy-Item "$projeto\installer\restaurar-backup.bat" $pendrive
Copy-Item "$projeto\installer\LEIA-ME-ATUALIZACAO.txt" $pendrive
Copy-Item "$projeto\installer\backup-database.ps1" $pendrive
Copy-Item "$projeto\installer\restore-database.ps1" $pendrive
Copy-Item "$projeto\installer\update-system.ps1" $pendrive

# Copiar instalador (após o build)
Copy-Item "C:\temp-mercadinho-dist\Mercadinho PDV Setup*.exe" $pendrive
```

---

## Checklist Pré-Atualização

### No Escritório (Antes de ir ao Cliente)

- [ ] Novo instalador gerado e testado
- [ ] Scripts copiados para o pendrive
- [ ] Pendrive testado em outra máquina
- [ ] Versão anterior do instalador de backup (caso precise reverter)

### No Cliente (Antes de Iniciar)

- [ ] **Mercadinho PDV fechado** (verificar na bandeja do sistema)
- [ ] **PostgreSQL rodando** (verificar em `services.msc`)
- [ ] **Nenhuma venda em andamento**
- [ ] **Caixa fechado** (se aplicável)
- [ ] **Horário apropriado** (evitar horário de pico)

### Verificar PostgreSQL

1. Pressione `Win + R`
2. Digite `services.msc` e pressione Enter
3. Procure por `postgresql-x64-15` (ou versão instalada)
4. Status deve ser **"Em execução"**

Se não estiver rodando:
- Clique com botão direito → **Iniciar**

---

## Processo de Atualização

### Passo 1: Backup Manual (Recomendado)

Mesmo que o script faça backup automático, é bom ter um backup extra:

```batch
# Clique duplo em:
backup-manual.bat
```

O backup será salvo em: `C:\Users\[Usuario]\Mercadinho\backups\`

### Passo 2: Executar Atualização

1. Clique com **botão direito** em `atualizar.bat`
2. Selecione **"Executar como administrador"**
3. Aguarde o processo (3-10 minutos dependendo do tamanho do banco)

### Passo 3: Verificação

Após a atualização:

1. Abra o Mercadinho PDV
2. Faça login normalmente
3. Verifique se os dados estão corretos:
   - Produtos cadastrados
   - Clientes cadastrados
   - Últimas vendas
4. Teste uma operação simples (consulta de produto)

### Passo 4: Documentar

Anote no relatório de visita:
- Versão anterior
- Versão nova
- Horário da atualização
- Backup realizado (sim/não)
- Problemas encontrados

---

## Backup e Restauração

### Locais de Backup

```
C:\Users\[Usuario]\Mercadinho\
├── backups\
│   ├── mercadinho_backup_2024-12-20_14-30-00.sql
│   ├── mercadinho_backup_2024-12-19_10-15-00.sql
│   └── ... (últimos 5 backups)
└── logs\
    ├── backup-2024-12-20.log
    ├── update-2024-12-20.log
    └── restore-2024-12-20.log
```

### Fazer Backup Manual

```batch
# Via script
backup-manual.bat

# Via PowerShell (mais opções)
powershell -ExecutionPolicy Bypass -File backup-database.ps1 -BackupDir "D:\MeuBackup"
```

### Restaurar Backup

```batch
# Interativo (mostra lista de backups)
restaurar-backup.bat

# Direto (backup específico)
powershell -ExecutionPolicy Bypass -File restore-database.ps1 -BackupFile "C:\...\backup.sql" -Force
```

### Backup Antes de Reinstalar Windows

Se o cliente precisar formatar o computador:

1. Copie toda a pasta `C:\Users\[Usuario]\Mercadinho\backups\` para o pendrive
2. Após reinstalar, instale o Mercadinho PDV normalmente
3. Copie o backup de volta
4. Execute `restaurar-backup.bat`

---

## Troubleshooting

### Erro: "PostgreSQL não encontrado"

**Causa**: PostgreSQL não está instalado ou não está no PATH

**Solução**:
1. Verifique se PostgreSQL está instalado em `C:\Program Files\PostgreSQL\`
2. Se não estiver, execute `Instalar-Pre-Requisitos.bat`
3. Reinicie o computador

### Erro: "Não foi possível conectar ao banco"

**Causa**: Serviço PostgreSQL não está rodando

**Solução**:
1. Abra `services.msc`
2. Encontre `postgresql-x64-15`
3. Clique direito → Iniciar
4. Tente novamente

### Erro: "Falha no backup"

**Causa**: Banco em uso ou permissões

**Solução**:
1. Feche completamente o Mercadinho PDV
2. Verifique na bandeja do sistema se não há ícone do app
3. Execute como Administrador
4. Tente novamente

### Erro: "migrate deploy falhou"

**Causa**: Primeira instalação ou migrations ausentes

**Solução**: O sistema automaticamente tenta `db push` como fallback. Se persistir:
1. Verifique se a pasta `prisma\migrations` existe no backend
2. Execute manualmente:
   ```
   cd backend
   npx prisma migrate deploy
   ```

### Dados Sumiram Após Atualização

**Ação Imediata**:
1. **NÃO FECHE** o prompt de comando se ainda estiver aberto
2. Anote qualquer mensagem de erro
3. Execute `restaurar-backup.bat`
4. Selecione o backup mais recente
5. Digite `SIM` para confirmar
6. Reinicie o Mercadinho PDV

### App Não Abre Após Atualização

**Verificar**:
1. Logs em `C:\Users\[Usuario]\Mercadinho\logs\`
2. Arquivo mais recente (`app-YYYY-MM-DD.log`)

**Soluções Comuns**:
- **Erro de porta**: Outra instância rodando. Reinicie o computador.
- **Erro de Prisma**: Execute o instalador novamente.
- **Erro de Node**: Reinstale o aplicativo.

---

## Informações Técnicas

### Caminhos Importantes

| Item | Caminho |
|------|---------|
| Aplicativo | `%LOCALAPPDATA%\Programs\Mercadinho PDV\` |
| Dados do usuário | `%USERPROFILE%\Mercadinho\` |
| Backups | `%USERPROFILE%\Mercadinho\backups\` |
| Logs | `%USERPROFILE%\Mercadinho\logs\` |
| Backend | `[App]\backend\` |
| Frontend | `[App]\frontend\.output\public\` |
| Node.js | `[App]\node-portable\` |

### Configuração do Banco

```
Host: localhost
Porta: 5432
Usuário: postgres
Senha: postgres123
Banco: mercadinho_local
```

### Verificar Versão Instalada

1. Abra o Mercadinho PDV
2. Menu → Sobre (ou Configurações)
3. Ou verifique o arquivo `package.json` na pasta do app

### Comandos Úteis (PowerShell como Admin)

```powershell
# Verificar serviço PostgreSQL
Get-Service postgresql*

# Iniciar PostgreSQL
Start-Service postgresql-x64-15

# Listar backups
Get-ChildItem "$env:USERPROFILE\Mercadinho\backups" | Sort-Object LastWriteTime -Descending

# Ver logs recentes
Get-Content "$env:USERPROFILE\Mercadinho\logs\app-$(Get-Date -Format 'yyyy-MM-dd').log" -Tail 50

# Testar conexão com banco
$env:PGPASSWORD='postgres123'; & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "SELECT version();"
```

### Contato Suporte

- **Email**: suporte@mercadinho.com
- **WhatsApp**: (XX) XXXXX-XXXX
- **Horário**: Seg-Sex, 8h-18h

---

## Histórico de Versões

| Versão | Data | Mudanças |
|--------|------|----------|
| 1.0.0 | 2024-12-20 | Versão inicial |
| 1.1.0 | - | Sistema de licenciamento |

