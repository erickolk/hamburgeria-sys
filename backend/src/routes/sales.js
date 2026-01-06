const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { validate, schemas } = require('../utils/validation');
const { authenticateToken, requireRole } = require('../middleware/auth');
const thermalPrinterService = require('../services/thermalPrinterService');

const router = express.Router();
const prisma = new PrismaClient();

// Função auxiliar para converter Decimal do Prisma para número
const decimalToNumber = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  if (typeof value.toNumber === 'function') return value.toNumber();
  return Number(value) || 0;
};

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @swagger
 * /sales/printer/test:
 *   post:
 *     summary: Gerar ticket de teste para verificar impressora
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               printerName:
 *                 type: string
 *                 description: Nome da impressora (opcional)
 *               printerModel:
 *                 type: string
 *                 description: Modelo da impressora (opcional)
 *     responses:
 *       200:
 *         description: Ticket de teste gerado com sucesso
 */
router.post('/printer/test', async (req, res) => {
  try {
    const { printerName, printerModel } = req.body;
    
    const printerInfo = {
      name: printerName || 'Impressora Termica',
      model: printerModel || 'ESC/POS'
    };

    const ticketInfo = await thermalPrinterService.generateTestTicket(printerInfo);

    res.json({
      success: true,
      message: 'Ticket de teste gerado com sucesso!',
      ticket: {
        filename: ticketInfo.filename,
        filepath: ticketInfo.filepath
      },
      instructions: 'Use o arquivo gerado para testar a impressora. No Windows: copy /b "' + ticketInfo.filepath + '" "\\\\localhost\\NomeDaImpressora"'
    });
  } catch (error) {
    console.error('Erro ao gerar ticket de teste:', error);
    res.status(500).json({ error: 'Erro ao gerar ticket de teste' });
  }
});

/**
 * @swagger
 * /sales:
 *   get:
 *     summary: Listar vendas
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, COMPLETED, CANCELLED, REFUNDED]
 *         description: Status da venda
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de vendas
 */
router.get('/', async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      status, 
      page = 1, 
      limit = 20 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let where = {};

    // Filtro por data
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate + 'T23:59:59.999Z');
    }

    // Filtro por status
    if (status) {
      where.status = status;
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true }
          },
          customer: {
            select: { id: true, name: true }
          },
          saleItems: {
            include: {
              product: {
                select: { id: true, name: true, sku: true }
              }
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.sale.count({ where })
    ]);

    // Converter valores Decimal para número
    const salesWithNumbers = sales.map(sale => ({
      ...sale,
      total: decimalToNumber(sale.total),
      discount: decimalToNumber(sale.discount),
      saleItems: sale.saleItems.map(item => ({
        ...item,
        quantity: decimalToNumber(item.quantity),
        unitPrice: decimalToNumber(item.unitPrice),
        discount: decimalToNumber(item.discount)
      }))
    }));

    res.json({
      sales: salesWithNumbers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /sales/{id}:
 *   get:
 *     summary: Obter venda por ID
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados da venda
 *       404:
 *         description: Venda não encontrada
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true }
        },
        customer: {
          select: { id: true, name: true, phone: true }
        },
        saleItems: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, barcode: true }
            }
          }
        }
      }
    });

    if (!sale) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    // Converter valores Decimal para número
    const saleWithNumbers = {
      ...sale,
      total: decimalToNumber(sale.total),
      discount: decimalToNumber(sale.discount),
      saleItems: sale.saleItems.map(item => ({
        ...item,
        quantity: decimalToNumber(item.quantity),
        unitPrice: decimalToNumber(item.unitPrice),
        discount: decimalToNumber(item.discount)
      }))
    };

    res.json(saleWithNumbers);
  } catch (error) {
    console.error('Erro ao buscar venda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /sales:
 *   post:
 *     summary: Criar nova venda
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - payments
 *             properties:
 *               customerId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                       format: float
 *                     unitPrice:
 *                       type: number
 *                     discount:
 *                       type: number
 *                     batchNumber:
 *                       type: string
 *               payments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     method:
 *                       type: string
 *                       enum: [CASH, CARD, PIX, CREDIT]
 *                     amount:
 *                       type: number
 *               discount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Venda criada com sucesso
 *       400:
 *         description: Dados inválidos ou estoque insuficiente
 */
router.post('/', validate(schemas.sale), async (req, res) => {
  try {
    const { customerId, items, payments, discount = 0 } = req.body;

    if (process.env.NODE_ENV !== 'production') {
      console.log('[sales] payload recebido:', JSON.stringify(req.body, null, 2));
    }

    // Validar se o total dos pagamentos confere
    const totalPayments = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const totalItems = items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity);
      const itemTotal = (parseFloat(item.unitPrice) * qty) - parseFloat(item.discount || 0);
      return sum + itemTotal;
    }, 0);
    const totalSale = totalItems - parseFloat(discount);

    if (Math.abs(totalPayments - totalSale) > 0.01) {
      return res.status(400).json({ 
        error: 'Total dos pagamentos não confere com o total da venda' 
      });
    }

    const sale = await prisma.$transaction(async (tx) => {
      // Verificar estoque de todos os produtos
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          throw new Error(`Produto ${item.productId} não encontrado`);
        }

        const requested = parseFloat(item.quantity);
        if (parseFloat(product.stockQuantity) < requested) {
          throw new Error(`Estoque insuficiente para o produto ${product.name}. Disponível: ${product.stockQuantity}, Solicitado: ${item.quantity}`);
        }
      }

      // Criar a venda
      const newSale = await tx.sale.create({
        data: {
          userId: req.user.id,
          customerId: customerId || null,
          total: totalSale,
          discount: parseFloat(discount),
          payments: payments,
          status: 'COMPLETED'
        }
      });

      // Criar itens da venda e atualizar estoque (suporta decimais e lotes)
      for (const rawItem of items) {
        const requested = parseFloat(rawItem.quantity);
        const product = await tx.product.findUnique({ where: { id: rawItem.productId } });

        if (product && product.batchTracking) {
          // Alocar por lotes (FIFO por validade)
          const batches = await tx.productBatch.findMany({
            where: { productId: rawItem.productId, quantity: { gt: 0 } },
            orderBy: [
              { expiryDate: 'asc' },
              { createdAt: 'asc' }
            ]
          });

          let remaining = requested;
          for (const batch of batches) {
            if (remaining <= 0) break;
            const available = parseFloat(batch.quantity);
            const take = Math.min(available, remaining);

            await tx.saleItem.create({
              data: {
                saleId: newSale.id,
                productId: rawItem.productId,
                quantity: take,
                unitPrice: parseFloat(rawItem.unitPrice),
                discount: parseFloat(rawItem.discount || 0),
                batchId: batch.id
              }
            });

            await tx.productBatch.update({
              where: { id: batch.id },
              data: { quantity: { decrement: take } }
            });

            await tx.stockMovement.create({
              data: {
                productId: rawItem.productId,
                quantity: -take,
                type: 'SALE',
                reason: `Venda #${newSale.id}`,
                referenceId: newSale.id,
                userId: req.user.id,
                batchId: batch.id
              }
            });

            remaining -= take;
          }

          if (remaining > 0.0001) {
            throw new Error(`Estoque por lote insuficiente para o produto ${product.name}. Falta ${remaining.toFixed(3)}`);
          }

          await tx.product.update({
            where: { id: rawItem.productId },
            data: { stockQuantity: { decrement: requested } }
          });
        } else {
          // Produto sem controle por lote
          await tx.saleItem.create({
            data: {
              saleId: newSale.id,
              productId: rawItem.productId,
              quantity: requested,
              unitPrice: parseFloat(rawItem.unitPrice),
              discount: parseFloat(rawItem.discount || 0)
            }
          });

          await tx.product.update({
            where: { id: rawItem.productId },
            data: { stockQuantity: { decrement: requested } }
          });

          await tx.stockMovement.create({
            data: {
              productId: rawItem.productId,
              quantity: -requested,
              type: 'SALE',
              reason: `Venda #${newSale.id}`,
              referenceId: newSale.id,
              userId: req.user.id
            }
          });
        }
      }

      // Log de auditoria
      await tx.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'CREATE',
          entity: 'SALE',
          entityId: newSale.id,
          details: {
            items,
            payments,
            total: totalSale,
            discount
          }
        }
      });

      return newSale;
    });

    // Buscar venda completa para retornar
    const completeSale = await prisma.sale.findUnique({
      where: { id: sale.id },
      include: {
        user: {
          select: { id: true, name: true }
        },
        customer: {
          select: { id: true, name: true }
        },
        saleItems: {
          include: {
            product: {
              select: { id: true, name: true, sku: true }
            }
          }
        }
      }
    });

    // Gerar ticket para impressora térmica
    let ticketInfo = null;
    try {
      // Informações da loja (podem vir de configurações do sistema)
      const storeInfo = {
        name: process.env.STORE_NAME || 'MERCADINHO',
        document: process.env.STORE_CNPJ || '',
        address: process.env.STORE_ADDRESS || '',
        phone: process.env.STORE_PHONE || '',
        website: process.env.STORE_WEBSITE || ''
      };

      ticketInfo = await thermalPrinterService.generateSaleTicket(completeSale, storeInfo);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('[sales] Ticket gerado:', ticketInfo.filename);
      }
    } catch (ticketError) {
      console.error('Erro ao gerar ticket:', ticketError);
      // Não falha a venda se o ticket não for gerado
    }

    res.status(201).json({
      ...completeSale,
      ticket: ticketInfo ? {
        filename: ticketInfo.filename,
        generated: true
      } : null
    });
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    if (error.message.includes('Estoque insuficiente') || error.message.includes('não encontrado')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /sales/{id}/refund:
 *   post:
 *     summary: Estornar venda
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Motivo do estorno
 *     responses:
 *       200:
 *         description: Venda estornada com sucesso
 *       404:
 *         description: Venda não encontrada
 *       400:
 *         description: Venda não pode ser estornada
 */
router.post('/:id/refund', 
  requireRole(['ADMIN', 'MANAGER']), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ error: 'Motivo do estorno é obrigatório' });
      }

      const sale = await prisma.$transaction(async (tx) => {
        // Buscar venda
        const currentSale = await tx.sale.findUnique({
          where: { id },
          include: {
            saleItems: {
              include: {
                product: true
              }
            }
          }
        });

        if (!currentSale) {
          throw new Error('Venda não encontrada');
        }

        if (currentSale.status === 'REFUNDED') {
          throw new Error('Venda já foi estornada');
        }

        if (currentSale.status === 'CANCELLED') {
          throw new Error('Venda cancelada não pode ser estornada');
        }

        // Atualizar status da venda
        const updatedSale = await tx.sale.update({
          where: { id },
          data: { status: 'REFUNDED' }
        });

        // Devolver estoque dos produtos
        for (const item of currentSale.saleItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                increment: item.quantity
              }
            }
          });

          // Registrar movimentação de estoque
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: 'RETURN',
              reason: `Estorno da venda #${id} - ${reason}`,
              referenceId: id,
              userId: req.user.id
            }
          });
        }

        // Log de auditoria
        await tx.auditLog.create({
          data: {
            userId: req.user.id,
            action: 'REFUND',
            entity: 'SALE',
            entityId: id,
            details: {
              reason,
              originalSale: currentSale
            }
          }
        });

        return updatedSale;
      });

      res.json({
        message: 'Venda estornada com sucesso',
        sale
      });
    } catch (error) {
      console.error('Erro ao estornar venda:', error);
      if (error.message.includes('não encontrada') || 
          error.message.includes('já foi estornada') || 
          error.message.includes('não pode ser estornada')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

/**
 * @swagger
 * /sales/{id}/cancel:
 *   post:
 *     summary: Cancelar venda (antes de finalizar ou recém finalizada)
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Motivo do cancelamento
 *     responses:
 *       200:
 *         description: Venda cancelada com sucesso
 *       404:
 *         description: Venda não encontrada
 *       400:
 *         description: Venda não pode ser cancelada
 */
router.post('/:id/cancel', 
  requireRole(['ADMIN', 'MANAGER']), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ error: 'Motivo do cancelamento é obrigatório' });
      }

      const sale = await prisma.$transaction(async (tx) => {
        // Buscar venda
        const currentSale = await tx.sale.findUnique({
          where: { id },
          include: {
            saleItems: {
              include: {
                product: true,
                batch: true
              }
            }
          }
        });

        if (!currentSale) {
          throw new Error('Venda não encontrada');
        }

        if (currentSale.status === 'CANCELLED') {
          throw new Error('Venda já foi cancelada');
        }

        if (currentSale.status === 'REFUNDED') {
          throw new Error('Venda estornada não pode ser cancelada');
        }

        // Atualizar status da venda
        const updatedSale = await tx.sale.update({
          where: { id },
          data: { status: 'CANCELLED' }
        });

        // Devolver estoque dos produtos
        for (const item of currentSale.saleItems) {
          // Se tem lote, devolver ao lote
          if (item.batchId && item.batch) {
            await tx.productBatch.update({
              where: { id: item.batchId },
              data: {
                quantity: { increment: parseFloat(item.quantity) }
              }
            });
          }

          // Devolver ao estoque geral
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: { increment: parseFloat(item.quantity) }
            }
          });

          // Registrar movimentação de estoque
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: parseFloat(item.quantity),
              type: 'RETURN',
              reason: `Cancelamento da venda #${id} - ${reason}`,
              referenceId: id,
              userId: req.user.id,
              batchId: item.batchId || null
            }
          });
        }

        // Log de auditoria
        await tx.auditLog.create({
          data: {
            userId: req.user.id,
            action: 'CANCEL',
            entity: 'SALE',
            entityId: id,
            details: {
              reason,
              originalSale: currentSale
            }
          }
        });

        return updatedSale;
      });

      res.json({
        message: 'Venda cancelada com sucesso',
        sale
      });
    } catch (error) {
      console.error('Erro ao cancelar venda:', error);
      if (error.message.includes('não encontrada') || 
          error.message.includes('já foi cancelada') || 
          error.message.includes('não pode ser cancelada')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

/**
 * @swagger
 * /sales/today:
 *   get:
 *     summary: Obter vendas do dia atual
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vendas do dia
 */
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const [sales, summary] = await Promise.all([
      prisma.sale.findMany({
        where: {
          date: {
            gte: startOfDay,
            lt: endOfDay
          }
        },
        include: {
          user: {
            select: { id: true, name: true }
          },
          customer: {
            select: { id: true, name: true }
          }
        },
        orderBy: { date: 'desc' }
      }),
      prisma.sale.aggregate({
        where: {
          date: {
            gte: startOfDay,
            lt: endOfDay
          },
          status: 'COMPLETED'
        },
        _sum: {
          total: true
        },
        _count: {
          id: true
        }
      })
    ]);

    // Converter valores Decimal para número
    const salesWithNumbers = sales.map(sale => ({
      ...sale,
      total: decimalToNumber(sale.total),
      discount: decimalToNumber(sale.discount)
    }));

    res.json({
      sales: salesWithNumbers,
      summary: {
        totalSales: summary._count.id || 0,
        totalAmount: decimalToNumber(summary._sum.total) || 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar vendas do dia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /sales/{id}/ticket:
 *   post:
 *     summary: Gerar/reimprimir ticket de venda
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket gerado com sucesso
 *       404:
 *         description: Venda não encontrada
 */
router.post('/:id/ticket', async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true }
        },
        customer: {
          select: { id: true, name: true }
        },
        saleItems: {
          include: {
            product: {
              select: { id: true, name: true, sku: true }
            }
          }
        }
      }
    });

    if (!sale) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    // Informações da loja
    const storeInfo = {
      name: process.env.STORE_NAME || 'MERCADINHO',
      document: process.env.STORE_CNPJ || '',
      address: process.env.STORE_ADDRESS || '',
      phone: process.env.STORE_PHONE || '',
      website: process.env.STORE_WEBSITE || ''
    };

    const ticketInfo = await thermalPrinterService.generateSaleTicket(sale, storeInfo);

    res.json({
      message: 'Ticket gerado com sucesso',
      ticket: {
        filename: ticketInfo.filename,
        filepath: ticketInfo.filepath
      }
    });
  } catch (error) {
    console.error('Erro ao gerar ticket:', error);
    res.status(500).json({ error: 'Erro ao gerar ticket' });
  }
});

/**
 * @swagger
 * /sales/{id}/ticket/download:
 *   get:
 *     summary: Download do ticket de venda
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Arquivo do ticket
 *       404:
 *         description: Ticket não encontrado
 */
router.get('/:id/ticket/download', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar ticket mais recente para esta venda
    const tickets = await thermalPrinterService.listTickets();
    const saleTickets = tickets.filter(t => t.includes(id));

    if (saleTickets.length === 0) {
      return res.status(404).json({ error: 'Ticket não encontrado para esta venda' });
    }

    // Pegar o ticket mais recente
    const latestTicket = saleTickets[saleTickets.length - 1];
    const ticketData = await thermalPrinterService.getTicket(latestTicket);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${latestTicket}"`);
    res.send(ticketData.content);
  } catch (error) {
    console.error('Erro ao baixar ticket:', error);
    res.status(500).json({ error: 'Erro ao baixar ticket' });
  }
});

module.exports = router;