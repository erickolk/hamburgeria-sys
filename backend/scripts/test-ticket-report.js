/**
 * Script de teste para geração de tickets e relatórios
 * Execute: node scripts/test-ticket-report.js
 */

const thermalPrinterService = require('../src/services/thermalPrinterService');
const reportFileService = require('../src/services/reportFileService');

// Dados de teste
const mockSale = {
  id: 'test-sale-' + Date.now(),
  date: new Date(),
  total: 125.50,
  discount: 5.00,
  user: {
    name: 'João Silva'
  },
  customer: {
    name: 'Maria Santos'
  },
  saleItems: [
    {
      quantity: 2,
      unitPrice: 25.00,
      discount: 0,
      product: {
        name: 'Arroz Tipo 1 5kg'
      }
    },
    {
      quantity: 1,
      unitPrice: 35.50,
      discount: 0,
      product: {
        name: 'Feijão Preto 1kg'
      }
    },
    {
      quantity: 3,
      unitPrice: 15.00,
      discount: 5.00,
      product: {
        name: 'Macarrão Espaguete 500g'
      }
    }
  ],
  payments: [
    {
      method: 'CASH',
      amount: 70.00
    },
    {
      method: 'PIX',
      amount: 55.50
    }
  ]
};

const mockSalesReport = [
  {
    date: '2025-11-01',
    totalSales: 15,
    totalAmount: 3250.00,
    itemsSold: 87
  },
  {
    date: '2025-11-02',
    totalSales: 12,
    totalAmount: 2890.50,
    itemsSold: 65
  },
  {
    date: '2025-11-03',
    totalSales: 18,
    totalAmount: 4120.00,
    itemsSold: 92
  }
];

const mockTopProducts = [
  {
    product: {
      name: 'Arroz Tipo 1 5kg',
      sku: 'ARR001'
    },
    totalQuantity: 150,
    totalSales: 75
  },
  {
    product: {
      name: 'Feijão Preto 1kg',
      sku: 'FEJ001'
    },
    totalQuantity: 120,
    totalSales: 60
  }
];

const mockLowStock = [
  {
    name: 'Óleo de Soja 900ml',
    stockQuantity: 5,
    reorderPoint: 20,
    costPrice: 6.50,
    supplier: {
      name: 'Distribuidora ABC'
    }
  }
];

const mockCashFlow = {
  period: {
    startDate: '2025-11-01',
    endDate: '2025-11-30'
  },
  income: {
    totalSales: 250,
    totalAmount: 42500.00,
    byPaymentMethod: {
      CASH: 15000.00,
      PIX: 12500.00,
      CARD: 15000.00
    }
  },
  summary: {
    totalIncome: 42500.00,
    totalOutcome: 0,
    netFlow: 42500.00
  }
};

async function runTests() {
  console.log('🧪 Iniciando testes de Tickets e Relatórios\n');
  console.log('=' .repeat(60));

  try {
    // Teste 1: Gerar ticket
    console.log('\n1️⃣  TESTE: Gerando ticket de venda...');
    const storeInfo = {
      name: 'MERCADINHO TESTE',
      document: '12.345.678/0001-00',
      address: 'Rua Teste, 123 - Centro',
      phone: '(11) 98765-4321',
      website: 'www.teste.com.br'
    };

    const ticketResult = await thermalPrinterService.generateSaleTicket(mockSale, storeInfo);
    console.log('   ✅ Ticket gerado com sucesso!');
    console.log(`   📄 Arquivo: ${ticketResult.filename}`);
    console.log(`   📁 Local: ${ticketResult.filepath}`);
    
    // Exibir preview do ticket
    console.log('\n   📋 Preview do ticket:');
    console.log('   ' + '-'.repeat(58));
    const ticketLines = ticketResult.content.split('\n');
    ticketLines.slice(0, 15).forEach(line => {
      console.log('   ' + line);
    });
    console.log('   ' + '...'.repeat(19));
    console.log('   ' + '-'.repeat(58));

    // Teste 2: Gerar relatório de vendas COM dados
    console.log('\n2️⃣  TESTE: Gerando relatório de vendas (COM dados)...');
    const salesReport = await reportFileService.generateSalesReport(
      mockSalesReport,
      { startDate: '2025-11-01', endDate: '2025-11-03' }
    );
    console.log('   ✅ Relatório gerado com sucesso!');
    console.log(`   📄 Arquivo: ${salesReport.filename}`);
    console.log(`   📊 Registros: ${salesReport.recordCount}`);

    // Teste 3: Gerar relatório de vendas SEM dados
    console.log('\n3️⃣  TESTE: Gerando relatório de vendas (SEM dados - para controle)...');
    const emptyReport = await reportFileService.generateSalesReport(
      [],
      { startDate: '2025-12-01', endDate: '2025-12-31' }
    );
    console.log('   ✅ Relatório vazio gerado com sucesso!');
    console.log(`   📄 Arquivo: ${emptyReport.filename}`);
    console.log(`   📊 Registros: ${emptyReport.recordCount}`);
    console.log('   ℹ️  Arquivo gerado para fins de controle');

    // Teste 4: Gerar relatório de produtos mais vendidos
    console.log('\n4️⃣  TESTE: Gerando relatório de produtos mais vendidos...');
    const topProductsReport = await reportFileService.generateTopProductsReport(
      mockTopProducts,
      { startDate: '2025-11-01', endDate: '2025-11-30' }
    );
    console.log('   ✅ Relatório gerado com sucesso!');
    console.log(`   📄 Arquivo: ${topProductsReport.filename}`);
    console.log(`   📊 Produtos: ${topProductsReport.recordCount}`);

    // Teste 5: Gerar relatório de estoque baixo
    console.log('\n5️⃣  TESTE: Gerando relatório de estoque baixo...');
    const lowStockReport = await reportFileService.generateLowStockReport(mockLowStock);
    console.log('   ✅ Relatório gerado com sucesso!');
    console.log(`   📄 Arquivo: ${lowStockReport.filename}`);
    console.log(`   📊 Produtos: ${lowStockReport.recordCount}`);

    // Teste 6: Gerar relatório de fluxo de caixa
    console.log('\n6️⃣  TESTE: Gerando relatório de fluxo de caixa...');
    const cashFlowReport = await reportFileService.generateCashFlowReport(
      mockCashFlow,
      { startDate: '2025-11-01', endDate: '2025-11-30' }
    );
    console.log('   ✅ Relatório gerado com sucesso!');
    console.log(`   📄 Arquivo: ${cashFlowReport.filename}`);

    // Teste 7: Listar arquivos gerados
    console.log('\n7️⃣  TESTE: Listando tickets gerados...');
    const tickets = await thermalPrinterService.listTickets();
    console.log(`   📄 Total de tickets: ${tickets.length}`);
    
    console.log('\n8️⃣  TESTE: Listando relatórios gerados...');
    const reports = await reportFileService.listReports();
    console.log(`   📄 Total de relatórios: ${reports.length}`);

    // Resumo
    console.log('\n' + '='.repeat(60));
    console.log('✅ TODOS OS TESTES CONCLUÍDOS COM SUCESSO!\n');
    
    console.log('📁 Arquivos gerados:');
    console.log(`   • Tickets: backend/tickets/`);
    console.log(`   • Relatórios: backend/reports/`);
    
    console.log('\n💡 Próximos passos:');
    console.log('   1. Verifique os arquivos gerados nos diretórios acima');
    console.log('   2. Abra os arquivos .txt para ver o formato');
    console.log('   3. Configure as variáveis de ambiente no .env');
    console.log('   4. Teste com dados reais através da API\n');

  } catch (error) {
    console.error('\n❌ ERRO nos testes:', error);
    process.exit(1);
  }
}

// Executar testes
runTests().catch(console.error);



