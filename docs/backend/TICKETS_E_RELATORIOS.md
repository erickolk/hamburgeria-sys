# Tickets Térmicos e Relatórios em Arquivo

## 📋 Visão Geral

Este documento descreve as novas funcionalidades implementadas no sistema:

1. **Tickets Térmicos**: Geração automática de cupom não-fiscal para cada venda
2. **Relatórios em Arquivo**: Geração de arquivos de relatório mesmo quando não há dados (para controle)

---

## 🎫 Tickets Térmicos

### Funcionalidades

- ✅ Geração automática de ticket ao finalizar venda
- ✅ Suporte para impressoras térmicas 58mm e 80mm
- ✅ Formato ESC/POS compatível com a maioria das impressoras
- ✅ Reimprimir ticket de vendas anteriores
- ✅ Download do arquivo de ticket

### Como Funciona

Quando uma venda é criada (POST `/api/sales`), o sistema:

1. Processa a transação normalmente
2. Gera automaticamente um arquivo de ticket
3. Salva na pasta `backend/tickets/`
4. Retorna informações do ticket na resposta

### Formato do Ticket

```
================================================
              MERCADINHO
         CNPJ: XX.XXX.XXX/XXXX-XX
           Rua Exemplo, 123
            Tel: (XX) XXXXX-XXXX
================================================
            CUPOM NÃO FISCAL
================================================

Venda: #ABCD1234
Data: 26/11/2025 14:30:00
Vendedor: João Silva
Cliente: Maria Santos

------------------------------------------------

Produto 1
2 x R$ 10,00                           R$ 20,00

Produto 2
1 x R$ 15,50                           R$ 15,50

------------------------------------------------

Subtotal:                              R$ 35,50
Desconto:                              -R$ 5,00

      TOTAL: R$ 30,50

------------------------------------------------
PAGAMENTO:

Dinheiro:                              R$ 20,00
PIX:                                   R$ 10,50

================================================
         OBRIGADO PELA PREFERÊNCIA!
              VOLTE SEMPRE!
================================================
```

### Endpoints

#### 1. Gerar/Reimprimir Ticket

```http
POST /api/sales/:id/ticket
```

**Resposta:**
```json
{
  "message": "Ticket gerado com sucesso",
  "ticket": {
    "filename": "venda_abc123_1732636800000.txt",
    "filepath": "/caminho/para/ticket"
  }
}
```

#### 2. Download do Ticket

```http
GET /api/sales/:id/ticket/download
```

Retorna o arquivo de texto para download ou impressão.

### Configuração da Loja

Configure as variáveis de ambiente no `.env`:

```env
STORE_NAME=MERCADINHO DO JOÃO
STORE_CNPJ=12.345.678/0001-00
STORE_ADDRESS=Rua Exemplo, 123 - Centro
STORE_PHONE=(11) 98765-4321
STORE_WEBSITE=www.mercadinho.com.br
```

### Impressão

Para imprimir o ticket em uma impressora térmica:

**Windows:**
```powershell
Get-Content "caminho\do\ticket.txt" | Out-Printer -Name "Nome_da_Impressora"
```

**Linux:**
```bash
lp -d impressora_termica caminho/do/ticket.txt
```

**Programaticamente (Node.js):**
```javascript
const printer = require('printer');

printer.printDirect({
  data: fs.readFileSync(ticketPath),
  printer: 'NOME_IMPRESSORA',
  type: 'RAW',
  success: function(jobID) {
    console.log('Impressão enviada: ' + jobID);
  },
  error: function(err) {
    console.error('Erro ao imprimir:', err);
  }
});
```

---

## 📊 Relatórios em Arquivo

### Funcionalidades

- ✅ Geração de arquivo mesmo sem dados (para controle)
- ✅ Formato texto formatado para impressão
- ✅ Armazenamento automático dos relatórios
- ✅ Download individual de relatórios
- ✅ Limpeza automática de relatórios antigos

### Tipos de Relatório

1. **Vendas por Período**
   - Agrupamento por dia/mês/ano
   - Total de vendas, itens e valores

2. **Produtos Mais Vendidos**
   - Ranking de produtos
   - Quantidade e número de vendas

3. **Estoque Baixo**
   - Produtos abaixo do ponto de pedido
   - Informações de fornecedor

4. **Fluxo de Caixa**
   - Entradas e saídas
   - Por forma de pagamento

### Endpoints

#### 1. Relatório de Vendas

```http
GET /api/reports/sales?startDate=2025-01-01&endDate=2025-01-31&generateFile=true
```

**Resposta:**
```json
{
  "data": [...],
  "file": {
    "filename": "relatorio_vendas_20250126_143000.txt",
    "filepath": "/caminho/para/arquivo",
    "recordCount": 50,
    "generated": true
  }
}
```

#### 2. Produtos Mais Vendidos

```http
GET /api/reports/top-products?startDate=2025-01-01&endDate=2025-01-31&limit=10&generateFile=true
```

#### 3. Estoque Baixo

```http
GET /api/reports/low-stock?generateFile=true
```

#### 4. Fluxo de Caixa

```http
GET /api/reports/cash-flow?startDate=2025-01-01&endDate=2025-01-31&generateFile=true
```

#### 5. Listar Arquivos de Relatórios

```http
GET /api/reports/files
GET /api/reports/files?type=vendas
```

**Resposta:**
```json
[
  {
    "filename": "relatorio_vendas_20250126_143000.txt",
    "filepath": "/caminho/para/arquivo",
    "size": 2048,
    "createdAt": "2025-01-26T14:30:00.000Z"
  }
]
```

#### 6. Download de Relatório

```http
GET /api/reports/files/:filename
```

Retorna o arquivo para download.

#### 7. Limpar Relatórios Antigos (Admin)

```http
DELETE /api/reports/files/cleanup?daysOld=90
```

### Exemplo de Relatório sem Dados

```
================================================================================
                          RELATÓRIO DE VENDAS
================================================================================

Data de geração: 26/11/2025
Período: 01/01/2025 a 31/01/2025
Total de registros: 0

--------------------------------------------------------------------------------

              *** NENHUM DADO ENCONTRADO PARA O PERÍODO ***

Este relatório foi gerado para fins de controle.
Não foram encontradas vendas no período especificado.

================================================================================
                            Fim do Relatório
================================================================================
```

### Controle de Arquivos

**Localização dos arquivos:**
- Tickets: `backend/tickets/`
- Relatórios: `backend/reports/`

**Limpeza automática:**
- Tickets: mantidos por 30 dias
- Relatórios: mantidos por 90 dias

**Para executar limpeza manual:**

```javascript
// Limpar tickets antigos (30+ dias)
const thermalPrinterService = require('./services/thermalPrinterService');
await thermalPrinterService.cleanOldTickets(30);

// Limpar relatórios antigos (90+ dias)
const reportFileService = require('./services/reportFileService');
await reportFileService.cleanOldReports(90);
```

---

## 🔧 Manutenção

### Estrutura de Diretórios

```
backend/
├── tickets/                    # Arquivos de tickets gerados
│   └── venda_*.txt
├── reports/                    # Arquivos de relatórios gerados
│   └── relatorio_*.txt
└── src/
    └── services/
        ├── thermalPrinterService.js   # Serviço de tickets
        └── reportFileService.js       # Serviço de relatórios
```

### Backup

Recomenda-se fazer backup regular dos diretórios `tickets/` e `reports/` para:
- Auditoria
- Controle fiscal
- Histórico de operações

### Monitoramento

Monitore o espaço em disco:

```bash
# Linux/Mac
du -sh backend/tickets backend/reports

# Windows PowerShell
(Get-ChildItem -Path "backend\tickets" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
(Get-ChildItem -Path "backend\reports" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
```

---

## 📝 Observações Importantes

1. **Tickets sempre são gerados**: Mesmo se houver erro na geração do ticket, a venda é processada normalmente.

2. **Relatórios sempre são criados**: Mesmo sem dados, o arquivo é gerado para controle e auditoria.

3. **Formato dos arquivos**: Todos os arquivos são em texto puro (UTF-8) para máxima compatibilidade.

4. **Performance**: A geração de arquivos é assíncrona e não afeta o desempenho das operações.

5. **Segurança**: Apenas usuários autenticados podem acessar tickets e relatórios.

---

## 🐛 Troubleshooting

### Ticket não foi gerado

1. Verifique se a pasta `backend/tickets` existe
2. Verifique permissões de escrita
3. Consulte os logs do servidor

### Relatório sem dados aparece vazio

Isso é esperado! O relatório é gerado para fins de controle, mesmo sem dados.

### Erro ao imprimir ticket

1. Verifique se a impressora está configurada corretamente
2. Teste com um arquivo de texto simples primeiro
3. Verifique drivers ESC/POS

---

## 📚 Referências

- ESC/POS Command Reference
- Thermal Printer Programming Guide
- Node.js File System API

---

**Desenvolvido para Mercadinho - Sistema de Gestão**



