Você é um engenheiro de software full-stack sênior especializado em sistemas de varejo.
Sua tarefa é projetar e gerar um sistema completo de mercadinho não fiscal, pronto para rodar localmente via Docker, com frontend moderno em Nuxt 3 + shadcn-vue e backend em Node.js (Express) + PostgreSQL.

O sistema deve cobrir toda a gestão de um pequeno mercado: produtos, estoque, fornecedores, clientes, vendas (PDV), entradas/saídas, relatórios, controle de caixa, usuários e permissões.

O foco é ser simples, rápido, bonito, offline-ready e expansível para desktop via Electron/Tauri no futuro.

🧩 Estrutura geral do projeto
/app
 ├── /frontend      → Nuxt 3 + shadcn-vue + Tailwind
 ├── /backend       → Node.js + Express + PostgreSQL
 ├── docker-compose.yml
 └── README.md

⚙️ Backend

Node.js com Express.js

ORM: Prisma

Banco: PostgreSQL (rodando via Docker)

Autenticação JWT

Arquitetura limpa (routes → controllers → services → repositories)

Testes com Jest

Documentação Swagger/OpenAPI

Scripts de seed (usuários, produtos, etc.)

💻 Frontend

Nuxt 3 com shadcn-vue e TailwindCSS

UI minimalista, responsiva e moderna

Páginas principais: Dashboard, Produtos, Fornecedores, Clientes, PDV, Movimentações, Relatórios, Configurações

Autenticação via token JWT

Componentes reutilizáveis (botões, tabelas, modais, formulários)

Comunicação via API REST

📦 Funcionalidades obrigatórias
🔹 Estoque

Cadastro de produtos: nome, SKU, código de barras, custo, preço de venda, estoque atual, estoque mínimo, categoria, fornecedor.

Controle automático de estoque nas vendas e compras.

Ajuste manual com justificativa.

Alerta de estoque baixo.

🔹 Fornecedores

CRUD completo.

Histórico de compras por fornecedor.

🔹 Clientes

CRUD simples (nome, telefone, observações).

Histórico de compras.

🔹 PDV (Ponto de Venda)

Tela otimizada para teclado e leitor de código de barras.

Busca rápida de produtos (nome, SKU, código de barras).

Venda com múltiplas formas de pagamento (dinheiro, cartão, Pix, fiado).

Descontos por item ou totais.

Impressão ou exportação de recibo (HTML/PDF).

Lança automaticamente movimentação de estoque e entrada de caixa.

🔹 Entradas / Saídas

Registro de compras (entrada de produtos e atualização de custo médio).

Registro de retiradas, despesas e sangrias de caixa.

🔹 Caixa

Abrir / fechar caixa.

Histórico de movimentações.

Relatórios de fechamento diário.

🔹 Relatórios

Vendas por período, produto, cliente ou forma de pagamento.

Produtos mais vendidos.

Estoque baixo.

Fluxo de caixa (entradas x saídas).

Exportação CSV/PDF.

🔹 Usuários e permissões

CRUD de usuários.

Perfis: Admin, Gerente, Caixa.

Controle de acesso por role.

Log de auditoria para ações críticas.

🧠 Regras de negócio essenciais

Venda não pode ultrapassar estoque disponível, salvo configuração especial.

Cálculo de custo médio:

new_cost = (current_stock * current_cost + new_qty * new_cost_unit) / (current_stock + new_qty)


Toda venda e compra gera movimentação de estoque.

Toda ação sensível (preço, ajuste, exclusão) gera log de auditoria.

Todas as operações de venda e compra devem ser atômicas (transações no PostgreSQL).

🧱 Banco de dados (modelo simplificado)
Tabelas

users → id, name, email, password_hash, role, created_at

products → id, sku, name, barcode, cost_price, sale_price, stock_quantity, reorder_point, category, supplier_id, created_at, updated_at

suppliers → id, name, contact, phone, email, payment_terms

customers → id, name, phone, note, created_at

sales → id, user_id, customer_id, total, date, payments(json), status

sale_items → id, sale_id, product_id, qty, unit_price, discount

purchases → id, supplier_id, total, date, status

purchase_items → id, purchase_id, product_id, qty, unit_cost

stock_movements → id, product_id, qty, type(IN/OUT/ADJUST/SALE/RETURN), reason, reference_id, user_id, date

cash_registers → id, user_id, opened_at, closed_at, initial_balance, final_balance

audit_logs → id, user_id, action, entity, entity_id, details, timestamp

🔗 Endpoints principais (REST)
Autenticação

POST /auth/login → retorna JWT

POST /auth/register (admin)

Produtos

GET /products

POST /products

PUT /products/:id

DELETE /products/:id

Vendas (PDV)

POST /sales → cria venda (transação com estoque e caixa)

GET /sales/:id

POST /sales/:id/refund

Compras / Entradas

POST /purchases

GET /purchases/:id

Caixa

POST /cash/open

POST /cash/close

GET /cash/today

Relatórios

GET /reports/sales?from=&to=

GET /reports/stock-low

GET /reports/top-products

🧰 Docker e execução local

docker-compose.yml com:

Serviço backend (Node.js)

Serviço db (PostgreSQL)

Serviço frontend (Nuxt 3)

Scripts:

docker compose up --build


ou para rodar sem Docker:

cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev

🧑‍💻 Testes

Unitários: cálculo de custo médio, endpoint de venda.

Integração: fluxo de venda e compra.

Teste de permissão (caixa não pode acessar configuração).

🖥️ Interface (UX)
Telas principais:

Login

Dashboard (resumo de vendas, estoque baixo, caixa atual)

PDV (venda rápida, com teclado)

Produtos (CRUD, busca, filtros)

Fornecedores (CRUD, histórico)

Clientes (CRUD, histórico)

Entradas / Saídas

Relatórios (PDF/CSV export)

Configurações (usuários, permissões)

Estilo:

UI em português, nomes em inglês.

Design limpo, moderno e responsivo.

shadcn-vue para componentes (botões, cards, inputs, modais).

TailwindCSS para layout e spacing.

🔒 Segurança

Autenticação JWT.

Middleware de roles.

Sanitização e validação em todas as rotas.

Hash de senha com bcrypt.

HTTPS ready (para quando for para produção).

🧠 Entregáveis

Estrutura completa do projeto (frontend + backend + docker).

Scripts de seed e migrations Prisma.

Swagger/OpenAPI documentado.

Testes básicos automatizados.

README com instruções de instalação e execução.

Instrução de como empacotar em Electron/Tauri posteriormente.

🔁 Fluxo recomendado do agente

Etapa 1 (MVP):

Implementar backend com endpoints: auth, products, sales, stock_movements.

Frontend Nuxt 3 com tela de login, produtos e PDV simples.

Rodar localmente via Docker.

Etapa 2:

Adicionar fornecedores, compras, relatórios.

Etapa 3:

Adicionar controle de caixa, auditoria e exportações CSV/PDF.

Etapa 4 (opcional):

Preparar empacotamento via Electron/Tauri.

🧩 Instrução final para o agente

Gere um sistema completo seguindo as especificações acima.

Todos os nomes de variáveis, classes, tabelas e endpoints em inglês.

Todos os comentários, mensagens e textos de interface em português.

Código limpo e modular.

Estrutura pronta para rodar localmente via Docker e facilmente empacotável como app desktop.

Comece entregando o MVP funcional (Etapa 1), com documentação e comandos prontos para rodar localmente.