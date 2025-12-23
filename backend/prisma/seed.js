require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.auditLog.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.productBatch.deleteMany();
  await prisma.productPhoto.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.cashRegister.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuários
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@mercadinho.com',
      passwordHash: hashedPassword,
      role: 'ADMIN'
    }
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Gerente',
      email: 'gerente@mercadinho.com',
      passwordHash: hashedPassword,
      role: 'MANAGER'
    }
  });

  const cashier = await prisma.user.create({
    data: {
      name: 'Operador de Caixa',
      email: 'caixa@mercadinho.com',
      passwordHash: hashedPassword,
      role: 'CASHIER'
    }
  });

  console.log('✅ Usuários criados');

  // Criar fornecedores
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'Distribuidora Central',
        contact: 'João Silva',
        phone: '(11) 99999-1111',
        email: 'contato@distribuidoracentral.com'
      }
    }),
    prisma.supplier.create({
      data: {
        name: 'Atacado do Norte',
        contact: 'Maria Santos',
        phone: '(11) 99999-2222',
        email: 'vendas@atacadonorte.com'
      }
    }),
    prisma.supplier.create({
      data: {
        name: 'Fornecedor Local',
        contact: 'Pedro Costa',
        phone: '(11) 99999-3333',
        email: 'pedro@fornecedorlocal.com'
      }
    })
  ]);

  console.log('✅ Fornecedores criados');

  // Criar categorias
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Bebidas' } }),
    prisma.category.create({ data: { name: 'Alimentos' } }),
    prisma.category.create({ data: { name: 'Higiene' } }),
    prisma.category.create({ data: { name: 'Limpeza' } }),
    prisma.category.create({ data: { name: 'Frios' } }),
    prisma.category.create({ data: { name: 'Mercearia' } }),
    prisma.category.create({ data: { name: 'Padaria' } }),
    prisma.category.create({ data: { name: 'Hortifruti' } })
  ]);

  console.log('✅ Categorias criadas');

  // Criar produtos
  const products = await Promise.all([
    // Bebidas
    prisma.product.create({
      data: {
        name: 'Coca-Cola 2L',
        sku: 'BEB001',
        barcode: '7894900011517',
        category: 'Bebidas',
        categoryId: categories[0].id,
        costPrice: 4.50,
        salePrice: 7.99,
        stockQuantity: 50,
        reorderPoint: 15,
        supplierId: suppliers[0].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'Água Mineral 500ml',
        sku: 'BEB002',
        barcode: '7891000100103',
        category: 'Bebidas',
        categoryId: categories[0].id,
        costPrice: 0.80,
        salePrice: 1.50,
        stockQuantity: 100,
        reorderPoint: 30,
        supplierId: suppliers[0].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'Cerveja Skol Lata 350ml',
        sku: 'BEB003',
        barcode: '7891149003297',
        category: 'Bebidas',
        categoryId: categories[0].id,
        costPrice: 2.20,
        salePrice: 3.99,
        stockQuantity: 80,
        reorderPoint: 25,
        supplierId: suppliers[1].id
      }
    }),
    
    // Alimentos
    prisma.product.create({
      data: {
        name: 'Arroz Tio João 5kg',
        sku: 'ALI001',
        barcode: '7896036094501',
        category: 'Alimentos',
        categoryId: categories[1].id,
        costPrice: 12.50,
        salePrice: 18.99,
        stockQuantity: 30,
        reorderPoint: 10,
        supplierId: suppliers[0].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'Feijão Carioca 1kg',
        sku: 'ALI002',
        barcode: '7896036094518',
        category: 'Alimentos',
        categoryId: categories[1].id,
        costPrice: 4.80,
        salePrice: 7.99,
        stockQuantity: 40,
        reorderPoint: 12,
        supplierId: suppliers[0].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'Açúcar Cristal 1kg',
        sku: 'ALI003',
        barcode: '7896036094525',
        category: 'Alimentos',
        categoryId: categories[1].id,
        costPrice: 2.80,
        salePrice: 4.99,
        stockQuantity: 25,
        reorderPoint: 10,
        supplierId: suppliers[1].id
      }
    }),
    
    // Higiene
    prisma.product.create({
      data: {
        name: 'Sabonete Dove 90g',
        sku: 'HIG001',
        barcode: '7891150013711',
        category: 'Higiene',
        categoryId: categories[2].id,
        costPrice: 2.50,
        salePrice: 4.49,
        stockQuantity: 60,
        reorderPoint: 20,
        supplierId: suppliers[2].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'Shampoo Seda 325ml',
        sku: 'HIG002',
        barcode: '7891150047303',
        category: 'Higiene',
        categoryId: categories[2].id,
        costPrice: 8.90,
        salePrice: 14.99,
        stockQuantity: 35,
        reorderPoint: 15,
        supplierId: suppliers[2].id
      }
    }),
    
    // Limpeza
    prisma.product.create({
      data: {
        name: 'Detergente Ypê 500ml',
        sku: 'LIM001',
        barcode: '7896098900116',
        category: 'Limpeza',
        categoryId: categories[3].id,
        costPrice: 1.80,
        salePrice: 2.99,
        stockQuantity: 45,
        reorderPoint: 18,
        supplierId: suppliers[2].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'Papel Higiênico Neve 4 rolos',
        sku: 'LIM002',
        barcode: '7896098900123',
        category: 'Limpeza',
        categoryId: categories[3].id,
        costPrice: 6.20,
        salePrice: 9.99,
        stockQuantity: 20,
        reorderPoint: 8,
        supplierId: suppliers[1].id
      }
    })
  ]);

  console.log('✅ Produtos criados');

  // Produtos com unidade fracionada e rastreio de lote
  const queijoMinas = await prisma.product.create({
    data: {
      name: 'Queijo Minas Frescal (kg)',
      sku: 'FRA001',
      barcode: null,
      category: 'Frios',
      categoryId: categories[4].id, // Frios
      observations: 'Produto fracionado vendido por quilo. Manter refrigerado.',
      costPrice: 30.00,
      salePrice: 45.00,
      stockQuantity: 20.0,
      reorderPoint: 5.0,
      supplierId: suppliers[2].id,
      saleUnit: 'KG',
      batchTracking: true
    }
  });

  const loteQueijo1 = await prisma.productBatch.create({
    data: {
      productId: queijoMinas.id,
      lotNumber: 'LQ-001',
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
      quantity: 10.0
    }
  });

  const loteQueijo2 = await prisma.productBatch.create({
    data: {
      productId: queijoMinas.id,
      lotNumber: 'LQ-002',
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 35),
      quantity: 10.0
    }
  });

  const azeiteGranel = await prisma.product.create({
    data: {
      name: 'Azeitona a granel (kg)',
      sku: 'FRA002',
      barcode: null,
      category: 'Mercearia',
      categoryId: categories[5].id, // Mercearia
      observations: 'Produto vendido a granel. Pesar antes de informar o valor.',
      costPrice: 12.00,
      salePrice: 19.90,
      stockQuantity: 50.0,
      reorderPoint: 10.0,
      supplierId: suppliers[1].id,
      saleUnit: 'KG',
      batchTracking: false
    }
  });

  console.log('✅ Produtos fracionados e lotes criados');

  // Criar clientes
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Ana Silva',
        phone: '(11) 98888-1111',
        note: 'Cliente preferencial'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Carlos Santos',
        phone: '(11) 98888-2222',
        note: 'Prefere cartão'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Mariana Costa',
        phone: '(11) 98888-3333',
        note: 'Gosta de promoções'
      }
    })
  ]);

  console.log('✅ Clientes criados');

  // Criar algumas vendas de exemplo
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Venda 1 - Ontem
  const sale1 = await prisma.sale.create({
    data: {
      date: yesterday,
      customerId: customers[0].id,
      userId: cashier.id,
      total: 23.97,
      status: 'COMPLETED',
      payments: [
        { method: 'CASH', amount: 23.97 }
      ],
      saleItems: {
        create: [
          {
            productId: products[0].id, // Coca-Cola
            quantity: 2,
            unitPrice: 7.99
          },
          {
            productId: products[1].id, // Água
            quantity: 3,
            unitPrice: 1.50
          },
          {
            productId: products[8].id, // Detergente
            quantity: 1,
            unitPrice: 2.49
          }
        ]
      }
    }
  });

  // Venda 2 - Hoje
  const sale2 = await prisma.sale.create({
    data: {
      date: today,
      customerId: customers[1].id,
      userId: cashier.id,
      total: 45.96,
      status: 'COMPLETED',
      payments: [
        { method: 'CARD', amount: 45.96 }
      ],
      saleItems: {
        create: [
          {
            productId: products[3].id, // Arroz
            quantity: 1,
            unitPrice: 18.99
          },
          {
            productId: products[4].id, // Feijão
            quantity: 2,
            unitPrice: 7.99
          },
          {
            productId: products[6].id, // Sabonete
            quantity: 2,
            unitPrice: 4.49
          }
        ]
      }
    }
  });

  console.log('✅ Vendas de exemplo criadas');

  // Atualizar estoque dos produtos vendidos
  await prisma.product.update({
    where: { id: products[0].id },
    data: { stockQuantity: { decrement: 2 } }
  });
  await prisma.product.update({
    where: { id: products[1].id },
    data: { stockQuantity: { decrement: 3 } }
  });
  await prisma.product.update({
    where: { id: products[8].id },
    data: { stockQuantity: { decrement: 1 } }
  });
  await prisma.product.update({
    where: { id: products[3].id },
    data: { stockQuantity: { decrement: 1 } }
  });
  await prisma.product.update({
    where: { id: products[4].id },
    data: { stockQuantity: { decrement: 2 } }
  });
  await prisma.product.update({
    where: { id: products[6].id },
    data: { stockQuantity: { decrement: 2 } }
  });

  console.log('✅ Estoque atualizado');

  // Criar movimentações de estoque
  await Promise.all([
    prisma.stockMovement.create({
      data: {
        productId: products[0].id,
        type: 'OUT',
        quantity: 2,
        reason: `Venda #${sale1.id}`,
        userId: cashier.id
      }
    }),
    prisma.stockMovement.create({
      data: {
        productId: products[1].id,
        type: 'OUT',
        quantity: 3,
        reason: `Venda #${sale1.id}`,
        userId: cashier.id
      }
    }),
    prisma.stockMovement.create({
      data: {
        productId: products[3].id,
        type: 'OUT',
        quantity: 1,
        reason: `Venda #${sale2.id}`,
        userId: cashier.id
      }
    })
  ]);

  console.log('✅ Movimentações de estoque criadas');

  console.log('🎉 Seed concluído com sucesso!');
  console.log('\n📋 Dados criados:');
  console.log('👥 Usuários:');
  console.log('   - admin@mercadinho.com (senha: 123456) - ADMIN');
  console.log('   - gerente@mercadinho.com (senha: 123456) - MANAGER');
  console.log('   - caixa@mercadinho.com (senha: 123456) - CASHIER');
  console.log('🏪 3 fornecedores');
  console.log('🏷️  8 categorias');
  console.log('📦 12 produtos em diferentes categorias');
  console.log('👤 3 clientes');
  console.log('💰 2 vendas de exemplo');
  console.log('📊 Movimentações de estoque');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });