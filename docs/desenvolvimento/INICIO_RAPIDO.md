# 🚀 INÍCIO RÁPIDO - Tickets e Relatórios

## ⏱️ 5 Minutos para Começar

---

## 1️⃣ Configurar Variáveis de Ambiente (2 min)

Abra o arquivo `.env` e adicione:

```env
# Informações da Loja
STORE_NAME=MEU MERCADINHO
STORE_CNPJ=12.345.678/0001-00
STORE_ADDRESS=Rua Exemplo, 123 - Centro - Cidade/UF
STORE_PHONE=(11) 98765-4321
STORE_WEBSITE=www.meumercadinho.com.br
```

**💡 Dica:** Substitua pelos dados reais da sua loja!

---

## 2️⃣ Reiniciar Servidor (1 min)

```bash
cd backend
npm start
```

Ou se já estiver rodando, reinicie.

---

## 3️⃣ Fazer uma Venda de Teste (2 min)

### Pelo PDV (Frontend):
1. Acesse o PDV
2. Adicione produtos
3. Finalize a venda
4. ✅ **Ticket gerado automaticamente!**

### Pela API:
```bash
POST http://localhost:3001/api/sales
Authorization: Bearer {seu-token}
Content-Type: application/json

{
  "customerId": "id-opcional",
  "items": [
    {
      "productId": "id-do-produto",
      "quantity": 2,
      "unitPrice": 10.00,
      "discount": 0
    }
  ],
  "payments": [
    {
      "method": "CASH",
      "amount": 20.00
    }
  ],
  "discount": 0
}
```

**Resposta esperada:**
```json
{
  "id": "uuid-da-venda",
  "total": 20.00,
  ...
  "ticket": {
    "filename": "venda_uuid_timestamp.txt",
    "generated": true
  }
}
```

---

## 4️⃣ Verificar Arquivos Gerados

### Tickets:
```bash
# Windows
explorer backend\tickets

# Linux/Mac
open backend/tickets
```

### Relatórios (gerar um):
```bash
GET http://localhost:3001/api/reports/sales?startDate=2025-01-01&endDate=2025-12-31&generateFile=true
Authorization: Bearer {seu-token}
```

Depois:
```bash
# Windows
explorer backend\reports

# Linux/Mac
open backend/reports
```

---

## 5️⃣ Testar Recursos

### Reimprimir Ticket:
```bash
POST http://localhost:3001/api/sales/{id-da-venda}/ticket
Authorization: Bearer {seu-token}
```

### Baixar Ticket:
```bash
GET http://localhost:3001/api/sales/{id-da-venda}/ticket/download
Authorization: Bearer {seu-token}
```

### Gerar Relatório sem Dados:
```bash
GET http://localhost:3001/api/reports/sales?startDate=2099-01-01&endDate=2099-12-31&generateFile=true
Authorization: Bearer {seu-token}
```

✅ **Deve gerar arquivo com mensagem de controle!**

---

## 🖨️ Imprimir Ticket em Impressora Térmica

### Windows PowerShell:
```powershell
# Listar impressoras
Get-Printer

# Imprimir
Get-Content "backend\tickets\venda_*.txt" | Out-Printer -Name "SUA_IMPRESSORA"
```

### Linux:
```bash
# Listar impressoras
lpstat -p

# Imprimir
lp -d sua_impressora backend/tickets/venda_*.txt
```

---

## 📊 Endpoints Disponíveis

### Tickets:
```
POST   /api/sales                        # Criar venda (gera ticket)
POST   /api/sales/:id/ticket             # Reimprimir ticket
GET    /api/sales/:id/ticket/download    # Baixar ticket
```

### Relatórios:
```
GET    /api/reports/sales                # Relatório de vendas + arquivo
GET    /api/reports/top-products         # Produtos mais vendidos + arquivo
GET    /api/reports/low-stock            # Estoque baixo + arquivo
GET    /api/reports/cash-flow            # Fluxo de caixa + arquivo
GET    /api/reports/files                # Listar arquivos gerados
GET    /api/reports/files/:filename      # Baixar relatório
DELETE /api/reports/files/cleanup        # Limpar antigos (admin)
```

**Parâmetro importante:** `?generateFile=true` (padrão: true)

---

## 🧪 Executar Testes

```bash
cd backend
node scripts/test-ticket-report.js
```

Deve ver:
```
✅ TODOS OS TESTES CONCLUÍDOS COM SUCESSO!

📁 Arquivos gerados:
   • Tickets: backend/tickets/
   • Relatórios: backend/reports/
```

---

## 📁 Estrutura de Diretórios

```
backend/
├── tickets/                    ← Tickets gerados aqui
│   └── venda_*.txt
├── reports/                    ← Relatórios gerados aqui
│   └── relatorio_*.txt
└── src/
    └── services/
        ├── thermalPrinterService.js    ← Serviço de tickets
        └── reportFileService.js        ← Serviço de relatórios
```

---

## ⚠️ Solução de Problemas

### Pasta não existe?
```bash
cd backend
node scripts/setup-directories.js
```

### Ticket não foi gerado?
1. Verifique os logs do servidor
2. Confirme que a pasta `backend/tickets` existe
3. Verifique permissões de escrita

### Relatório vazio é normal?
✅ **SIM!** Quando não há dados, o sistema gera arquivo com mensagem de controle.

### Erro ao imprimir?
1. Verifique se a impressora está ligada
2. Teste com um arquivo .txt simples
3. Confirme que é uma impressora térmica compatível

---

## 📚 Documentação Completa

Para mais detalhes, consulte:

- 📖 **TICKETS_E_RELATORIOS.md** - Guia completo de uso
- ⚙️ **VARIAVEIS_AMBIENTE.md** - Todas as configurações
- 📋 **IMPLEMENTACOES_CONCLUIDAS.md** - Detalhes técnicos
- 🎯 **RESUMO_FUNCIONALIDADES.md** - Visão geral

---

## ✅ Checklist de Início

- [ ] Variáveis de ambiente configuradas no `.env`
- [ ] Servidor reiniciado
- [ ] Venda de teste criada
- [ ] Ticket gerado e visualizado
- [ ] Relatório gerado (com ou sem dados)
- [ ] Arquivos visualizados nas pastas
- [ ] Teste de impressão realizado (opcional)

---

## 🎉 Pronto!

Seu sistema agora:
- ✅ Gera ticket para cada venda
- ✅ Gera relatórios mesmo sem dados
- ✅ Mantém histórico completo
- ✅ Pronto para auditoria

**Dúvidas?** Consulte a documentação completa!

---

*Desenvolvido para Mercadinho - Sistema de Gestão*  
*Versão: 1.0.0*  
*Data: 26/11/2025*



