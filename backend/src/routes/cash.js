const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

// Obter status do caixa atual
router.get('/status', async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const cashRegister = await prisma.cashRegister.findFirst({
      where: {
        openedAt: { gte: startOfDay, lt: endOfDay },
        closedAt: null
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    if (!cashRegister) {
      return res.json({ 
        isOpen: false, 
        message: 'Caixa fechado' 
      });
    }

    // Calcular vendas do dia
    const salesData = await prisma.sale.aggregate({
      where: {
        date: { gte: startOfDay, lt: endOfDay },
        status: 'COMPLETED'
      },
      _sum: { total: true },
      _count: { id: true }
    });

    res.json({
      isOpen: true,
      cashRegister: {
        id: cashRegister.id,
        openedAt: cashRegister.openedAt,
        openingAmount: cashRegister.initialBalance,
        openedBy: cashRegister.user
      },
      todaySales: {
        count: salesData._count.id || 0,
        total: salesData._sum.total || 0
      },
      currentAmount: parseFloat(cashRegister.initialBalance) + (salesData._sum.total || 0)
    });
  } catch (error) {
    console.error('Erro ao verificar status do caixa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Abrir caixa
router.post('/open', requireRole(['ADMIN', 'MANAGER', 'CASHIER']), async (req, res) => {
  try {
    const { openingAmount = 0 } = req.body;
    const userId = req.user.id;

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Verificar se já existe caixa aberto hoje
    const existingCash = await prisma.cashRegister.findFirst({
      where: {
        openedAt: { gte: startOfDay, lt: endOfDay },
        closedAt: null
      }
    });

    if (existingCash) {
      return res.status(400).json({ 
        error: 'Já existe um caixa aberto hoje' 
      });
    }

    const cashRegister = await prisma.cashRegister.create({
      data: {
        initialBalance: parseFloat(openingAmount),
        openedAt: new Date(),
        userId: userId
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json({
      message: 'Caixa aberto com sucesso',
      cashRegister
    });
  } catch (error) {
    console.error('Erro ao abrir caixa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Fechar caixa
router.post('/close', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { closingAmount, notes } = req.body;
    const userId = req.user.id;

    if (closingAmount === undefined || closingAmount === null) {
      return res.status(400).json({ 
        error: 'Valor de fechamento é obrigatório' 
      });
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Buscar caixa aberto
    const cashRegister = await prisma.cashRegister.findFirst({
      where: {
        openedAt: { gte: startOfDay, lt: endOfDay },
        closedAt: null
      }
    });

    if (!cashRegister) {
      return res.status(400).json({ 
        error: 'Não há caixa aberto para fechar' 
      });
    }

    // Calcular vendas do dia e por forma de pagamento
    const sales = await prisma.sale.findMany({
      where: {
        date: { gte: startOfDay, lt: endOfDay },
        status: 'COMPLETED'
      },
      select: {
        total: true,
        payments: true
      }
    });

    const salesTotal = sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    
    // Agregar por forma de pagamento
    const paymentsByMethod = {};
    sales.forEach(sale => {
      const payments = Array.isArray(sale.payments) ? sale.payments : [];
      payments.forEach(payment => {
        const method = payment.method || 'CASH';
        if (!paymentsByMethod[method]) {
          paymentsByMethod[method] = 0;
        }
        paymentsByMethod[method] += parseFloat(payment.amount || 0);
      });
    });

    // Buscar movimentações de caixa (sangrias e suprimentos)
    const movements = await prisma.cashMovement.findMany({
      where: {
        cashRegisterId: cashRegister.id,
        type: { in: ['WITHDRAWAL', 'SUPPLY'] }
      }
    });

    const withdrawals = movements
      .filter(m => m.type === 'WITHDRAWAL')
      .reduce((sum, m) => sum + parseFloat(m.amount), 0);

    const supplies = movements
      .filter(m => m.type === 'SUPPLY')
      .reduce((sum, m) => sum + parseFloat(m.amount), 0);

    // Cálculo do esperado em dinheiro
    const cashPayments = paymentsByMethod['CASH'] || 0;
    const expectedAmount = parseFloat(cashRegister.initialBalance) + cashPayments + supplies - withdrawals;
    const difference = parseFloat(closingAmount) - expectedAmount;

    const updatedCashRegister = await prisma.cashRegister.update({
      where: { id: cashRegister.id },
      data: {
        finalBalance: parseFloat(closingAmount),
        closedAt: new Date(),
        status: 'CLOSED'
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    res.json({
      message: 'Caixa fechado com sucesso',
      cashRegister: updatedCashRegister,
      summary: {
        openingAmount: parseFloat(cashRegister.initialBalance),
        salesTotal: salesTotal,
        paymentsByMethod: {
          CASH: paymentsByMethod['CASH'] || 0,
          CARD: paymentsByMethod['CARD'] || 0,
          PIX: paymentsByMethod['PIX'] || 0,
          CREDIT: paymentsByMethod['CREDIT'] || 0
        },
        withdrawals: withdrawals,
        supplies: supplies,
        expectedAmount: expectedAmount,
        closingAmount: parseFloat(closingAmount),
        difference: difference,
        notes: notes || ''
      }
    });
  } catch (error) {
    console.error('Erro ao fechar caixa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Histórico de caixas
router.get('/history', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [cashRegisters, total] = await Promise.all([
      prisma.cashRegister.findMany({
        orderBy: { openedAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      }),
      prisma.cashRegister.count()
    ]);

    res.json({
      cashRegisters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de caixas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Detalhes de um caixa específico
router.get('/:id', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { id } = req.params;

    const cashRegister = await prisma.cashRegister.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true }
        },
        cashMovements: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          },
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!cashRegister) {
      return res.status(404).json({ error: 'Caixa não encontrado' });
    }

    // Buscar vendas do período
    const startOfDay = new Date(cashRegister.openedAt);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = cashRegister.closedAt || new Date();
    if (!cashRegister.closedAt) {
      endOfDay.setHours(23, 59, 59, 999);
    }

    const sales = await prisma.sale.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
        status: 'COMPLETED'
      },
      include: {
        customer: {
          select: { id: true, name: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json({
      cashRegister,
      sales
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes do caixa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Sangria (Retirada de dinheiro)
router.post('/withdrawal', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const userId = req.user.id;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ 
        error: 'Valor de sangria deve ser maior que zero' 
      });
    }

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ 
        error: 'Motivo da sangria é obrigatório' 
      });
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Buscar caixa aberto
    const cashRegister = await prisma.cashRegister.findFirst({
      where: {
        openedAt: { gte: startOfDay, lt: endOfDay },
        closedAt: null
      }
    });

    if (!cashRegister) {
      return res.status(400).json({ 
        error: 'Não há caixa aberto para realizar sangria' 
      });
    }

    // Registrar movimentação
    const cashMovement = await prisma.cashMovement.create({
      data: {
        cashRegisterId: cashRegister.id,
        userId: userId,
        type: 'WITHDRAWAL',
        amount: parseFloat(amount),
        reason: reason
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json({
      message: 'Sangria registrada com sucesso',
      cashMovement
    });
  } catch (error) {
    console.error('Erro ao registrar sangria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Suprimento (Adicionar dinheiro)
router.post('/supply', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const userId = req.user.id;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ 
        error: 'Valor de suprimento deve ser maior que zero' 
      });
    }

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ 
        error: 'Motivo do suprimento é obrigatório' 
      });
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Buscar caixa aberto
    const cashRegister = await prisma.cashRegister.findFirst({
      where: {
        openedAt: { gte: startOfDay, lt: endOfDay },
        closedAt: null
      }
    });

    if (!cashRegister) {
      return res.status(400).json({ 
        error: 'Não há caixa aberto para realizar suprimento' 
      });
    }

    // Registrar movimentação
    const cashMovement = await prisma.cashMovement.create({
      data: {
        cashRegisterId: cashRegister.id,
        userId: userId,
        type: 'SUPPLY',
        amount: parseFloat(amount),
        reason: reason
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json({
      message: 'Suprimento registrado com sucesso',
      cashMovement
    });
  } catch (error) {
    console.error('Erro ao registrar suprimento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;