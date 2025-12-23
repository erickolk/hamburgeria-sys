# Checklist de Testes - Sistema de Mercadinho

## 📋 Análise do Sistema Atual

### Funcionalidades Implementadas

#### 1. **Gestão de Produtos**
- ✅ Cadastro de produtos com SKU, nome, código de barras
- ✅ Controle de estoque com quantidade e ponto de reposição
- ✅ Preços de custo e venda
- ✅ Categorias de produtos
- ✅ Rastreamento por lote (opcional)
- ✅ Unidade de venda (UN, KG, L)
- ✅ Fotos de produtos
- ✅ Ajuste de estoque com motivo
- ✅ Histórico de movimentações de estoque

#### 2. **Ponto de Venda (PDV)**
- ✅ Interface de vendas com busca por nome/SKU/código de barras
- ✅ Carrinho de compras com quantidade e desconto por item
- ✅ Múltiplas formas de pagamento (Dinheiro, Cartão, PIX, Fiado)
- ✅ Cálculo automático de troco
- ✅ Alerta de falta de dinheiro
- ✅ Finalização de venda com redução de estoque
- ✅ Cancelamento de vendas com devolução de estoque

#### 3. **Gestão de Estoque**
- ✅ Controle de lotes com validade
- ✅ Sistema FIFO (primeiro a entrar, primeiro a sair)
- ✅ Ajustes de estoque com auditoria
- ✅ Movimentações detalhadas (entrada, saída, venda, compra, ajuste)
- ✅ Alerta de estoque baixo
- ✅ Histórico completo de movimentações

#### 4. **Compras e Fornecedores**
- ✅ Cadastro de fornecedores
- ✅ Registro de compras com itens
- ✅ Atualização automática de estoque na compra
- ✅ Cálculo de custo médio ponderado
- ✅ Controle de lotes na entrada de mercadorias

#### 5. **Clientes**
- ✅ Cadastro de clientes
- ✅ Vendas com identificação do cliente
- ✅ Histórico de compras por cliente

#### 6. **Caixa e Financeiro**
- ✅ Abertura e fechamento de caixa
- ✅ Sangria e suprimento de valores
- ✅ Controle de vendas por período
- ✅ Relatório de fluxo de caixa
- ✅ Múltiplas formas de pagamento

#### 7. **Relatórios e Dashboard**
- ✅ Dashboard com vendas do dia, estoque, clientes
- ✅ Relatório de vendas por período
- ✅ Produtos mais vendidos
- ✅ Estoque baixo
- ✅ Fluxo de caixa
- ✅ Exportação de relatórios em CSV

#### 8. **Usuários e Permissões**
- ✅ Sistema de login e autenticação
- ✅ Três níveis de usuário: Admin, Gerente, Caixa
- ✅ Controle de acesso por função
- ✅ Auditoria de ações importantes

## 🧪 Checklist de Testes - Situações Reais do Mercadinho

### 📦 **1. Gestão de Produtos**

#### Cadastro de Produtos
- [ ] Cadastrar um produto novo (ex: Coca-Cola 350ml)
  - [ ] Preencher SKU único
  - [ ] Adicionar código de barras
  - [ ] Definir preço de custo e venda
  - [ ] Estabelecer ponto de reposição
  - [ ] Selecionar categoria (Bebidas)
  - [ ] Definir unidade de venda (UN)

#### Produtos com Controle de Lote
- [ ] Cadastrar produto com rastreamento por lote (ex: Leite, Iogurte)
  - [ ] Habilitar "Rastrear por lote"
  - [ ] Registrar entrada com número do lote e validade
  - [ ] Verificar se sistema usa FIFO (primeiro a vencer sai primeiro)

#### Atualização de Preços
- [ ] Aumentar preço de um produto popular
- [ ] Verificar se reflete no PDV imediatamente
- [ ] Testar promoção com desconto direto no caixa

#### Estoque Baixo
- [ ] Cadastrar produto com estoque = 5 e ponto de reposição = 10
- [ ] Realizar venda de 3 unidades
- [ ] Verificar se aparece no relatório "Estoque Baixo"
- [ ] Testar alerta visual no sistema

### 🛒 **2. Vendas no Caixa (PDV)**

#### Venda Simples
- [ ] Vender 1 Coca-Cola + 1 pacote de biscoitos
- [ ] Receber em dinheiro
- [ ] Verificar troco correto
- [ ] Confirmar redução no estoque

#### Venda com Múltiplas Formas de Pagamento
- [ ] Venda total: R$ 50,00
  - [ ] R$ 30,00 no cartão
  - [ ] R$ 20,00 no dinheiro
  - [ ] Verificar se sistema aceita sem erro

#### Venda com Desconto
- [ ] Aplicar desconto de R$ 5,00 em um item
- [ ] Aplicar desconto geral na venda
- [ ] Verificar cálculos no cupom

#### Venda Fiado
- [ ] Vender para cliente cadastrado no fiado
- [ ] Selecionar cliente na venda
- [ ] Verificar se aparece no relatório de vendas

#### Cancelamento de Venda
- [ ] Realizar venda normalmente
- [ ] Cancelar imediatamente (antes de fechar caixa)
- [ ] Verificar se estoque foi restaurado
- [ ] Confirmar se venda aparece como "Cancelada"

#### Venda de Produto por Quilo
- [ ] Vender 0.750kg de presunto
- [ ] Verificar cálculo do preço
- [ ] Testar precisão na balança

#### Venda com Estoque Insuficiente
- [ ] Tentar vender 10 unidades quando tem apenas 5
- [ ] Verificar se sistema bloqueia
- [ ] Testar mensagem de erro para o operador

### 📈 **3. Compras e Entrada de Mercadorias**

#### Compra Simples
- [ ] Comprar 50 unidades de Coca-Cola do fornecedor
- [ ] Registrar nota fiscal (opcional)
- [ ] Verificar aumento no estoque
- [ ] Confirmar cálculo de custo médio

#### Compra com Lotes e Validades
- [ ] Comprar leite com 3 lotes diferentes
  - [ ] Lote A: 20 unidades, vence em 10 dias
  - [ ] Lote B: 30 unidades, vence em 5 dias
  - [ ] Lote C: 15 unidades, vence em 15 dias
- [ ] Verificar se sistema vende lote B primeiro (mais próximo do vencimento)

#### Compra com Preço Diferente
- [ ] Comprar produto que já existe por preço diferente
- [ ] Verificar se custo médio é recalculado
- [ ] Exemplo: custo antigo R$ 2,00, novo custo R$ 2,50

### 👥 **4. Clientes**

#### Cadastro de Cliente
- [ ] Cadastrar cliente com telefone
- [ ] Adicionar observações (ex: "Cliente preferencial")
- [ ] Verificar se aparece na lista de clientes

#### Venda para Cliente Cadastrado
- [ ] Realizar venda selecionando cliente
- [ ] Verificar histórico de compras do cliente
- [ ] Testar relatório de vendas por cliente

### 🏪 **5. Situações do Dia a Dia**

#### Abertura de Caixa
- [ ] Abrir caixa com R$ 100,00 de fundo
- [ ] Registrar valor inicial
- [ ] Verificar se aparece no relatório

#### Sangria durante o dia
- [ ] Retirar R$ 200,00 para pagamento de fornecedor
- [ ] Registrar motivo: "Pagamento de mercadorias"
- [ ] Confirmar se subtrai do total do caixa

#### Suprimento de Caixa
- [ ] Adicionar R$ 50,00 para troco
- [ ] Registrar motivo: "Troco para notas grandes"
- [ ] Verificar se adiciona ao total do caixa

#### Fechamento de Caixa
- [ ] Fechar caixa no final do dia
- [ ] Comparar valor esperado com valor contado
- [ ] Verificar diferença (se houver)
- [ ] Gerar relatório de fechamento

#### Quebra de Estoque
- [ ] Registrar perda de 5 garrafas de leite vencidas
- [ ] Fazer ajuste de estoque negativo
- [ ] Adicionar motivo detalhado
- [ ] Verificar se aparece nas movimentações

#### Troca de Mercadoria
- [ ] Cliente quer trocar produto defeituoso
- [ ] Cancelar item específico da venda
- [ ] Vender novo produto
- [ ] Verificar estoque (devolução + nova venda)

### 📊 **6. Relatórios e Análises**

#### Dashboard Diário
- [ ] Verificar vendas do dia no dashboard
- [ ] Confirmar número de clientes atendidos
- [ ] Verificar produtos com estoque baixo
- [ ] Comparar com dia anterior

#### Relatório de Vendas
- [ ] Gerar relatório de vendas da semana
- [ ] Exportar em CSV
- [ ] Verificar total de vendas e itens
- [ ] Confirmar formas de pagamento utilizadas

#### Produtos Mais Vendidos
- [ ] Gerar relatório do mês
- [ ] Identificar top 10 produtos
- [ ] Verificar quantidade vendida de cada um
- [ ] Usar para planejar compras

#### Estoque Baixo
- [ ] Verificar relatório de estoque baixo
- [ ] Identificar produtos que precisam de reposição
- [ ] Priorizar compras urgentes
- [ ] Verificar se ponto de reposição está adequado

#### Fluxo de Caixa
- [ ] Gerar relatório de fluxo de caixa do mês
- [ ] Verificar entradas e saídas
- [ ] Identificar períodos de maior movimento
- [ ] Planejar capital de giro

### 🔐 **7. Segurança e Controle**

#### Login e Permissões
- [ ] Testar login com usuário "Caixa"
- [ ] Verificar se só pode vender (não pode alterar produtos)
- [ ] Testar login com "Gerente"
- [ ] Verificar permissões de cancelamento e ajustes
- [ ] Testar login com "Admin"
- [ ] Verificar acesso total ao sistema

#### Auditoria
- [ ] Realizar ação importante (excluir produto)
- [ ] Verificar se aparece no log de auditoria
- [ ] Confirmar usuário e timestamp

### 🛠️ **8. Situações de Problema**

#### Sem Internet
- [ ] Testar funcionalidade offline (se aplicável)
- [ ] Verificar mensagem de erro clara
- [ ] Testar recuperação quando voltar internet

#### Estoque Negativo
- [ ] Tentar vender quando estoque = 0
- [ ] Verificar se sistema bloqueia
- [ ] Testar mensagem para operador

#### Produto sem Cadastro
- [ ] Tentar vender produto não cadastrado
- [ ] Verificar busca no PDV
- [ ] Testar agilidade para cadastrar rápido

#### Múltiplos Operadores
- [ ] Dois caixas abertos simultaneamente
- [ ] Verificar se não há conflito de estoque
- [ ] Testar relatórios separados por operador

### 📱 **9. Testes de Usabilidade**

#### Velocidade no Caixa
- [ ] Medir tempo para vender 5 itens
- [ ] Verificar se é rápido o suficiente
- [ ] Testar com fila de clientes

#### Interface Intuitiva
- [ ] Novo operador conseguir vender sem treinamento?
- [ ] Botões são grandes e claros?
- [ ] Cores ajudam na identificação?

#### Erros Comuns
- [ ] Digitar código de barras errado
- [ ] Esquecer de selecionar forma de pagamento
- [ ] Tentar finalizar venda sem itens
- [ ] Verificar mensagens de erro amigáveis

### 🎯 **10. Testes Finais de Integração**

#### Cenário Completo - Dia de Trabalho
1. [ ] Abrir caixa (R$ 100,00)
2. [ ] Receber mercadorias (compras)
3. [ ] Atualizar preços se necessário
4. [ ] Realizar 10 vendas com diferentes situações
5. [ ] Fazer sangria (R$ 200,00)
6. [ ] Cancelar 1 venda
7. [ ] Fechar caixa e conferir
8. [ ] Gerar relatórios do dia

#### Performance com Dados Reais
- [ ] Cadastrar 100 produtos
- [ ] Registrar 500 vendas
- [ ] Verificar velocidade das consultas
- [ ] Testar relatórios com muitos dados

#### Backup e Recuperação
- [ ] Verificar se dados estão sendo salvos
- [ ] Testar exportação de relatórios
- [ ] Simular recuperação de dados

---

## 📝 Formulário de Testes - Controle

### Semana de Testes

**Data:** ___/___/_____  **Responsável:** _________________

**Produtos Testados:** ___/___  **Status:** ☐ OK ☐ Parcial ☐ NOK

**Vendas Testadas:** ___/___  **Status:** ☐ OK ☐ Parcial ☐ NOK

**Estoque Testado:** ___/___  **Status:** ☐ OK ☐ Parcial ☐ NOK

**Relatórios Testados:** ___/___  **Status:** ☐ OK ☐ Parcial ☐ NOK

### Observações Importantes:

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

### Pendências Encontradas:

1. ________________________________________________________________

2. ________________________________________________________________

3. ________________________________________________________________

### Avaliação Final:

☐ Sistema pronto para uso

☐ Sistema aceitável com ajustes

☐ Sistema necessita correções importantes

**Assinatura do Responsável:** ___________________________________

---

## 💡 Dicas para o Teste

1. **Comece pelos testes básicos** (cadastro, venda simples)
2. **Teste com dados reais** do seu mercadinho
3. **Envolva os funcionários** no teste
4. **Anote todos os problemas** encontrados
5. **Teste durante períodos movimentados**
6. **Verifique a velocidade** do sistema
7. **Confirme os relatórios** com seus lançamentos manuais
8. **Teste a impressão** de cupons (se aplicável)

Boa sorte nos testes! 🍀