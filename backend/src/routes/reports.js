const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');
const reportFileService = require('../services/reportFileService');

const router = express.Router();
const prisma = new PrismaClient();

const decimalToNumber = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  if (typeof value.toNumber === 'function') return value.toNumber();
  return Number(value) || 0;
};

router.use(authenticateToken);

// Relatório de vendas por período
router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day', generateFile = 'true' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Data inicial e final são obrigatórias' 
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate + 'T23:59:59.999Z');

    const sales = await prisma.sale.findMany({
      where: {
        date: { gte: start, lte: end },
        status: 'COMPLETED'
      },
      include: {
        saleItems: {
          include: {
            product: {
              select: { name: true, category: true }
            }
          }
        }
      }
    });

    // Agrupar dados
    const grouped = {};
    sales.forEach(sale => {
      let key;
      const date = new Date(sale.date);
      
      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = date.getFullYear().toString();
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!grouped[key]) {
        grouped[key] = {
          date: key,
          totalSales: 0,
          totalAmount: 0,
          itemsSold: 0
        };
      }

      grouped[key].totalSales += 1;
      grouped[key].totalAmount += parseFloat(sale.total);
      grouped[key].itemsSold += sale.saleItems.reduce((sum, item) => sum + item.quantity, 0);
    });

    const result = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));

    // Gerar arquivo (mesmo sem dados, para controle)
    let fileInfo = null;
    if (generateFile === 'true') {
      try {
        fileInfo = await reportFileService.generateSalesReport(result, { startDate, endDate });
      } catch (fileError) {
        console.error('Erro ao gerar arquivo de relatório:', fileError);
      }
    }

    res.json({
      data: result,
      file: fileInfo
    });
  } catch (error) {
    console.error('Erro no relatório de vendas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Produtos mais vendidos
router.get('/top-products', async (req, res) => {
  try {
    const { startDate, endDate, limit = 10, generateFile = 'true' } = req.query;

    let where = {};
    if (startDate && endDate) {
      where.sale = {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate + 'T23:59:59.999Z')
        },
        status: 'COMPLETED'
      };
    } else {
      where.sale = { status: 'COMPLETED' };
    }

    const topProducts = await prisma.saleItem.groupBy({
      by: ['productId'],
      where,
      _sum: {
        quantity: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: parseInt(limit)
    });

    // Buscar dados dos produtos
    const productsData = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, sku: true, category: true }
        });

        return {
          product,
          totalQuantity: item._sum.quantity,
          totalSales: item._count.id
        };
      })
    );

    // Gerar arquivo (mesmo sem dados, para controle)
    let fileInfo = null;
    if (generateFile === 'true') {
      try {
        fileInfo = await reportFileService.generateTopProductsReport(productsData, { startDate, endDate });
      } catch (fileError) {
        console.error('Erro ao gerar arquivo de relatório:', fileError);
      }
    }

    res.json({
      data: productsData,
      file: fileInfo
    });
  } catch (error) {
    console.error('Erro no relatório de produtos mais vendidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Produtos com estoque baixo
router.get('/low-stock', async (req, res) => {
  try {
    const { generateFile = 'true' } = req.query;

    const products = await prisma.product.findMany({
      include: {
        supplier: {
          select: { id: true, name: true }
        }
      },
      orderBy: {
        stockQuantity: 'asc'
      }
    });

    const lowStock = products
      .filter(product => decimalToNumber(product.stockQuantity) <= decimalToNumber(product.reorderPoint))
      .map(product => ({
        ...product,
        costPrice: decimalToNumber(product.costPrice),
        salePrice: decimalToNumber(product.salePrice),
        stockQuantity: decimalToNumber(product.stockQuantity),
        reorderPoint: decimalToNumber(product.reorderPoint)
      }));

    // Gerar arquivo (mesmo sem dados, para controle)
    let fileInfo = null;
    if (generateFile === 'true') {
      try {
        fileInfo = await reportFileService.generateLowStockReport(lowStock);
      } catch (fileError) {
        console.error('Erro ao gerar arquivo de relatório:', fileError);
      }
    }

    res.json({
      data: lowStock,
      file: fileInfo
    });
  } catch (error) {
    console.error('Erro no relatório de estoque baixo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Relatório de fluxo de caixa
router.get('/cash-flow', async (req, res) => {
  try {
    const { startDate, endDate, generateFile = 'true' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Data inicial e final são obrigatórias' 
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate + 'T23:59:59.999Z');

    // Entradas (vendas)
    const salesData = await prisma.sale.aggregate({
      where: {
        date: { gte: start, lte: end },
        status: 'COMPLETED'
      },
      _sum: {
        total: true
      },
      _count: {
        id: true
      }
    });

    // Vendas por forma de pagamento
    const salesByPayment = await prisma.sale.findMany({
      where: {
        date: { gte: start, lte: end },
        status: 'COMPLETED'
      },
      select: {
        payments: true,
        total: true
      }
    });

    const paymentMethods = {};
    salesByPayment.forEach(sale => {
      if (Array.isArray(sale.payments)) {
        sale.payments.forEach(payment => {
          if (!paymentMethods[payment.method]) {
            paymentMethods[payment.method] = 0;
          }
          paymentMethods[payment.method] += parseFloat(payment.amount);
        });
      }
    });

    const reportData = {
      period: { startDate, endDate },
      income: {
        totalSales: salesData._count.id || 0,
        totalAmount: salesData._sum.total || 0,
        byPaymentMethod: paymentMethods
      },
      summary: {
        totalIncome: salesData._sum.total || 0,
        totalOutcome: 0, // Implementar quando houver controle de despesas
        netFlow: salesData._sum.total || 0
      }
    };

    // Gerar arquivo (mesmo sem dados, para controle)
    let fileInfo = null;
    if (generateFile === 'true') {
      try {
        fileInfo = await reportFileService.generateCashFlowReport(reportData, { startDate, endDate });
      } catch (fileError) {
        console.error('Erro ao gerar arquivo de relatório:', fileError);
      }
    }

    res.json({
      ...reportData,
      file: fileInfo
    });
  } catch (error) {
    console.error('Erro no relatório de fluxo de caixa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Dashboard - resumo geral
router.get('/dashboard', async (req, res) => {
  console.log('====================================');
  console.log('[Dashboard] ENDPOINT CHAMADO');
  console.log('====================================');
  try {
    // Usar data local do servidor (não UTC) para evitar problemas de timezone
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    console.log('[Dashboard] Data atual:', now.toISOString());
    console.log('[Dashboard] Início do dia:', startOfDay.toISOString());
    console.log('[Dashboard] Fim do dia:', endOfDay.toISOString());
    
    // Alternativa: buscar últimas 24 horas (caso as vendas tenham sido criadas em horário diferente)
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Buscar algumas vendas recentes para debug
    const recentSales = await prisma.sale.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { date: 'desc' },
      take: 10,
      select: { id: true, date: true, total: true, status: true }
    });

    // Buscar vendas de hoje e das últimas 24 horas
    const [
      todaySales,
      last24HoursSales,
      productSnapshot,
      totalCustomers
    ] = await Promise.all([
      prisma.sale.aggregate({
        where: {
          date: { gte: startOfDay, lte: endOfDay },
          status: 'COMPLETED'
        },
        _sum: { total: true },
        _count: { id: true }
      }),
      prisma.sale.aggregate({
        where: {
          date: { gte: last24Hours },
          status: 'COMPLETED'
        },
        _sum: { total: true },
        _count: { id: true }
      }),
      prisma.product.findMany({
        select: {
          id: true,
          stockQuantity: true,
          reorderPoint: true
        }
      }),
      prisma.customer.count()
    ]);

    const totalProducts = productSnapshot.length;
    const lowStockCount = productSnapshot.filter(
      product => decimalToNumber(product.stockQuantity) <= decimalToNumber(product.reorderPoint)
    ).length;

    // Usar vendas de hoje, mas se não houver, usar últimas 24 horas
    const salesCount = todaySales._count.id || 0;
    const revenue = decimalToNumber(todaySales._sum.total) || 0;
    
    // Usar últimas 24 horas se não houver vendas hoje
    let finalSalesCount = salesCount > 0 ? salesCount : (last24HoursSales._count.id || 0);
    let finalRevenue = revenue > 0 ? revenue : (decimalToNumber(last24HoursSales._sum.total) || 0);
    
    // Se ainda não houver vendas nas últimas 24h, usar as vendas recentes encontradas
    if (finalSalesCount === 0 && recentSales.length > 0) {
      // Calcular total das vendas recentes (últimas 10)
      const recentTotal = recentSales.reduce((sum, sale) => sum + decimalToNumber(sale.total), 0);
      finalSalesCount = recentSales.length;
      finalRevenue = recentTotal;
      console.log('[Dashboard] Usando vendas recentes:', { count: finalSalesCount, revenue: finalRevenue });
    }
    
    // Se ainda não houver vendas, buscar todas as vendas COMPLETED (sem filtro de data)
    if (finalSalesCount === 0) {
      const allCompletedSales = await prisma.sale.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { total: true },
        _count: { id: true }
      });
      console.log('[Dashboard] Todas as vendas COMPLETED:', {
        count: allCompletedSales._count.id || 0,
        revenue: decimalToNumber(allCompletedSales._sum.total) || 0
      });
    }

    // Log para debug (sempre mostrar para identificar o problema)
    console.log('[Dashboard] Vendas de hoje:', {
      hoje: {
        count: salesCount,
        revenue: revenue,
        startOfDay: startOfDay.toISOString(),
        endOfDay: endOfDay.toISOString()
      },
      ultimas24h: {
        count: last24HoursSales._count.id || 0,
        revenue: decimalToNumber(last24HoursSales._sum.total) || 0,
        desde: last24Hours.toISOString()
      },
      final: {
        count: finalSalesCount,
        revenue: finalRevenue
      },
      recentSales: recentSales.map(s => ({
        id: s.id,
        date: s.date.toISOString(),
        dateLocal: s.date.toLocaleString('pt-BR'),
        total: decimalToNumber(s.total),
        status: s.status
      }))
    });

    res.json({
      today: {
        sales: finalSalesCount,
        revenue: finalRevenue
      },
      inventory: {
        totalProducts,
        lowStockProducts: lowStockCount
      },
      customers: {
        total: totalCustomers
      }
    });
  } catch (error) {
    console.error('Erro no dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar arquivos de relatórios gerados
router.get('/files', async (req, res) => {
  try {
    const { type } = req.query;
    const reports = await reportFileService.listReports(type);
    res.json(reports);
  } catch (error) {
    console.error('Erro ao listar relatórios:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Download de arquivo de relatório
router.get('/files/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const report = await reportFileService.getReport(filename);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(report.content);
  } catch (error) {
    console.error('Erro ao baixar relatório:', error);
    if (error.message === 'Relatório não encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Limpar relatórios antigos
router.delete('/files/cleanup', requireRole(['ADMIN']), async (req, res) => {
  try {
    const { daysOld = 90 } = req.query;
    const result = await reportFileService.cleanOldReports(parseInt(daysOld));
    res.json({
      message: 'Limpeza concluída',
      ...result
    });
  } catch (error) {
    console.error('Erro ao limpar relatórios:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;