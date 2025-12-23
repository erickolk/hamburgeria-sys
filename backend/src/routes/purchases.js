const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { validate, schemas } = require('../utils/validation');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @swagger
 * /purchases:
 *   get:
 *     summary: Listar compras
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: supplierId
 *         schema:
 *           type: string
 *         description: Filtrar por fornecedor
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, COMPLETED, CANCELLED]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista de compras
 */
router.get('/', async (req, res) => {
  try {
    const { 
      supplierId, 
      status, 
      startDate, 
      endDate,
      page = 1, 
      limit = 20 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let where = {};

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate + 'T23:59:59.999Z');
    }

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        include: {
          supplier: {
            select: { id: true, name: true }
          },
          user: {
            select: { id: true, name: true }
          },
          purchaseItems: {
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
      prisma.purchase.count({ where })
    ]);

    res.json({
      purchases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar compras:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /purchases/{id}:
 *   get:
 *     summary: Obter compra por ID
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        user: {
          select: { id: true, name: true }
        },
        purchaseItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!purchase) {
      return res.status(404).json({ error: 'Compra não encontrada' });
    }

    res.json(purchase);
  } catch (error) {
    console.error('Erro ao buscar compra:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /purchases:
 *   post:
 *     summary: Criar nova compra
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', 
  requireRole(['ADMIN', 'MANAGER']), 
  async (req, res) => {
    try {
      const { supplierId, items, status = 'COMPLETED' } = req.body;

      if (!supplierId || !items || items.length === 0) {
        return res.status(400).json({ 
          error: 'Fornecedor e itens são obrigatórios' 
        });
      }

      // Verificar se fornecedor existe
      const supplier = await prisma.supplier.findUnique({
        where: { id: supplierId }
      });

      if (!supplier) {
        return res.status(404).json({ error: 'Fornecedor não encontrado' });
      }

      // Calcular total
      const total = items.reduce((sum, item) => {
        const qty = parseFloat(item.quantity);
        return sum + (parseFloat(item.unitCost) * qty);
      }, 0);

      const purchase = await prisma.$transaction(async (tx) => {
        // Criar a compra
        const newPurchase = await tx.purchase.create({
          data: {
            supplierId,
            userId: req.user.id,
            total,
            status
          }
        });

        // Criar itens da compra e atualizar estoque e custo médio
        for (const item of items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId }
          });

          if (!product) {
            throw new Error(`Produto ${item.productId} não encontrado`);
          }

          // Criar item da compra
          let batchId = null;
          const newQty = parseFloat(item.quantity);

          // Criar/atualizar lote se houver batchNumber ou produto exigir rastreamento
          if (product.batchTracking || item.batchNumber) {
            const lotNumber = item.batchNumber || 'NOLOT';
            let batch = await tx.productBatch.findFirst({
              where: { productId: item.productId, lotNumber }
            });

            if (!batch) {
              batch = await tx.productBatch.create({
                data: {
                  productId: item.productId,
                  lotNumber,
                  expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
                  quantity: 0
                }
              });
            }

            // Incrementar quantidade do lote
            await tx.productBatch.update({
              where: { id: batch.id },
              data: { quantity: { increment: newQty } }
            });

            batchId = batch.id;
          }

          await tx.purchaseItem.create({
            data: {
              purchaseId: newPurchase.id,
              productId: item.productId,
              quantity: newQty,
              unitCost: parseFloat(item.unitCost),
              batchId
            }
          });

          // Calcular novo custo médio
          const currentStock = parseFloat(product.stockQuantity);
          const currentCost = parseFloat(product.costPrice);
          const newCost = parseFloat(item.unitCost);

          const newCostPrice = currentStock === 0 
            ? newCost 
            : ((currentStock * currentCost) + (newQty * newCost)) / (currentStock + newQty);

          // Atualizar produto (estoque e custo médio)
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: { increment: newQty },
              costPrice: newCostPrice
            }
          });

          // Registrar movimentação de estoque
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: newQty,
              type: 'PURCHASE',
              reason: `Compra #${newPurchase.id}`,
              referenceId: newPurchase.id,
              userId: req.user.id,
              batchId: batchId || null
            }
          });
        }

        // Log de auditoria
        try {
          await tx.auditLog.create({
            data: {
              userId: req.user.id,
              action: 'CREATE',
              entity: 'PURCHASE',
              entityId: newPurchase.id,
              details: {
                supplierId,
                items,
                total
              }
            }
          });
        } catch (auditError) {
          console.warn('Erro ao criar log de auditoria:', auditError.message);
        }

        return newPurchase;
      });

      // Buscar compra completa para retornar
      const completePurchase = await prisma.purchase.findUnique({
        where: { id: purchase.id },
        include: {
          supplier: {
            select: { id: true, name: true }
          },
          user: {
            select: { id: true, name: true }
          },
          purchaseItems: {
            include: {
              product: {
                select: { id: true, name: true, sku: true }
              }
            }
          }
        }
      });

      res.status(201).json(completePurchase);
    } catch (error) {
      console.error('Erro ao criar compra:', error);
      if (error.message.includes('não encontrado')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

/**
 * @swagger
 * /purchases/{id}:
 *   put:
 *     summary: Atualizar status da compra
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', 
  requireRole(['ADMIN', 'MANAGER']), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['PENDING', 'COMPLETED', 'CANCELLED'].includes(status)) {
        return res.status(400).json({ 
          error: 'Status inválido' 
        });
      }

      const purchase = await prisma.purchase.findUnique({
        where: { id },
        include: {
          purchaseItems: {
            include: {
              product: true
            }
          }
        }
      });

      if (!purchase) {
        return res.status(404).json({ error: 'Compra não encontrada' });
      }

      // Se estiver cancelando uma compra completa, reverter estoque
      if (purchase.status === 'COMPLETED' && status === 'CANCELLED') {
        await prisma.$transaction(async (tx) => {
          for (const item of purchase.purchaseItems) {
            // Reverter estoque
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stockQuantity: {
                  decrement: item.quantity
                }
              }
            });

            // Reverter quantidade do lote (se houver)
            if (item.batchId) {
              await tx.productBatch.update({
                where: { id: item.batchId },
                data: {
                  quantity: { decrement: item.quantity }
                }
              });
            }

            // Registrar movimentação
            await tx.stockMovement.create({
              data: {
                productId: item.productId,
                quantity: -item.quantity,
                type: 'OUT',
                reason: `Cancelamento da compra #${id}`,
                referenceId: id,
                userId: req.user.id,
                batchId: item.batchId || null
              }
            });
          }
        });
      }

      const updatedPurchase = await prisma.purchase.update({
        where: { id },
        data: { status },
        include: {
          supplier: {
            select: { id: true, name: true }
          },
          purchaseItems: {
            include: {
              product: {
                select: { id: true, name: true, sku: true }
              }
            }
          }
        }
      });

      res.json(updatedPurchase);
    } catch (error) {
      console.error('Erro ao atualizar compra:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

module.exports = router;



