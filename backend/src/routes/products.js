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
 * /products:
 *   get:
 *     summary: Listar produtos
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome, SKU ou código de barras
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoria
 *       - in: query
 *         name: lowStock
 *         schema:
 *           type: boolean
 *         description: Mostrar apenas produtos com estoque baixo
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
 *         description: Lista de produtos
 */
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      category, 
      lowStock, 
      page = 1, 
      limit = 20 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let where = {};

    // Filtro de busca
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filtro por categoria
    if (category) {
      where.category = category;
    }

    // Filtro de estoque baixo
    if (lowStock === 'true') {
      where.stockQuantity = { lte: prisma.raw('reorder_point') };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          supplier: {
            select: { id: true, name: true }
          },
          categoryRel: {
            select: { id: true, name: true }
          },
          recipe: true,
          photos: {
            orderBy: [
              { isMain: 'desc' },
              { createdAt: 'asc' }
            ]
          }
        },
        orderBy: { name: 'asc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obter produto por ID
 *     tags: [Products]
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
 *         description: Dados do produto
 *       404:
 *         description: Produto não encontrado
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        supplier: {
          select: { id: true, name: true }
        },
        recipe: true,
        categoryRel: {
          select: { id: true, name: true }
        },
        photos: {
          orderBy: [
            { isMain: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        stockMovements: {
          take: 10,
          orderBy: { date: 'desc' },
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Criar novo produto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sku
 *               - name
 *               - costPrice
 *               - salePrice
 *             properties:
 *               sku:
 *                 type: string
 *               name:
 *                 type: string
 *               barcode:
 *                 type: string
 *               costPrice:
 *                 type: number
 *               salePrice:
 *                 type: number
 *               stockQuantity:
 *                 type: number
 *                 format: float
 *               reorderPoint:
 *                 type: number
 *                 format: float
 *               saleUnit:
 *                 type: string
 *                 enum: [UNIT, KG, L]
 *               batchTracking:
 *                 type: boolean
 *               category:
 *                 type: string
 *               supplierId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *       400:
 *         description: Dados inválidos ou SKU já existe
 */
router.post('/', 
  requireRole(['ADMIN', 'MANAGER']), 
  validate(schemas.product), 
  async (req, res) => {
    try {
      const productData = req.body;

      // Verificar se SKU já existe
      const existingSku = await prisma.product.findUnique({
        where: { sku: productData.sku }
      });

      if (existingSku) {
        return res.status(400).json({ error: 'SKU já existe' });
      }

      // Verificar se código de barras já existe (se fornecido)
      if (productData.barcode) {
        const existingBarcode = await prisma.product.findUnique({
          where: { barcode: productData.barcode }
        });

        if (existingBarcode) {
          return res.status(400).json({ error: 'Código de barras já existe' });
        }
      }

      const product = await prisma.product.create({
        data: {
          ...productData,
          costPrice: parseFloat(productData.costPrice),
          salePrice: parseFloat(productData.salePrice),
          stockQuantity: productData.stockQuantity !== undefined ? parseFloat(productData.stockQuantity) : undefined,
          reorderPoint: productData.reorderPoint !== undefined ? parseFloat(productData.reorderPoint) : undefined,
          recipeId: productData.recipeId || null
        },
        include: {
          supplier: {
            select: { id: true, name: true }
          },
          categoryRel: {
            select: { id: true, name: true }
          },
          photos: true
        }
      });

      // Log de auditoria
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'CREATE',
          entity: 'PRODUCT',
          entityId: product.id,
          details: { productData }
        }
      });

      res.status(201).json(product);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Atualizar produto
 *     tags: [Products]
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
 *             properties:
 *               sku:
 *                 type: string
 *               name:
 *                 type: string
 *               barcode:
 *                 type: string
 *               costPrice:
 *                 type: number
 *               salePrice:
 *                 type: number
 *               stockQuantity:
 *                 type: number
 *                 format: float
 *               reorderPoint:
 *                 type: number
 *                 format: float
 *               saleUnit:
 *                 type: string
 *                 enum: [UNIT, KG, L]
 *               batchTracking:
 *                 type: boolean
 *               category:
 *                 type: string
 *               supplierId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *       404:
 *         description: Produto não encontrado
 */
router.put('/:id', 
  requireRole(['ADMIN', 'MANAGER']), 
  validate(schemas.product), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Verificar se produto existe
      const existingProduct = await prisma.product.findUnique({
        where: { id }
      });

      if (!existingProduct) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      // Verificar se SKU já existe em outro produto
      if (updateData.sku && updateData.sku !== existingProduct.sku) {
        const existingSku = await prisma.product.findUnique({
          where: { sku: updateData.sku }
        });

        if (existingSku) {
          return res.status(400).json({ error: 'SKU já existe' });
        }
      }

      // Verificar se código de barras já existe em outro produto
      if (updateData.barcode && updateData.barcode !== existingProduct.barcode) {
        const existingBarcode = await prisma.product.findUnique({
          where: { barcode: updateData.barcode }
        });

        if (existingBarcode) {
          return res.status(400).json({ error: 'Código de barras já existe' });
        }
      }

      const product = await prisma.product.update({
        where: { id },
        data: {
          ...updateData,
          costPrice: updateData.costPrice ? parseFloat(updateData.costPrice) : undefined,
          salePrice: updateData.salePrice ? parseFloat(updateData.salePrice) : undefined,
          stockQuantity: updateData.stockQuantity !== undefined ? parseFloat(updateData.stockQuantity) : undefined,
          reorderPoint: updateData.reorderPoint !== undefined ? parseFloat(updateData.reorderPoint) : undefined,
          recipeId: updateData.recipeId !== undefined ? updateData.recipeId : undefined
        },
        include: {
          supplier: {
            select: { id: true, name: true }
          },
          categoryRel: {
            select: { id: true, name: true }
          },
          photos: true
        }
      });

      // Log de auditoria
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE',
          entity: 'PRODUCT',
          entityId: product.id,
          details: { 
            before: existingProduct, 
            after: updateData 
          }
        }
      });

      res.json(product);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

/**
 * @swagger
 * /products/{id}/adjust-stock:
 *   post:
 *     summary: Ajustar estoque do produto
 *     tags: [Products]
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
 *               - quantity
 *               - reason
 *             properties:
 *               quantity:
 *                 type: number
 *                 format: float
 *                 description: Quantidade a ajustar (positiva ou negativa)
 *               reason:
 *                 type: string
 *                 description: Motivo do ajuste
 *               batchId:
 *                 type: string
 *               batchNumber:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 description: Validade do lote (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Estoque ajustado com sucesso
 *       404:
 *         description: Produto não encontrado
 */
router.post('/:id/adjust-stock', 
  requireRole(['ADMIN', 'MANAGER']), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity, reason, batchId, batchNumber, expiryDate } = req.body;

      if (!quantity || !reason) {
        return res.status(400).json({ 
          error: 'Quantidade e motivo são obrigatórios' 
        });
      }

      const product = await prisma.$transaction(async (tx) => {
        // Buscar produto atual
        const currentProduct = await tx.product.findUnique({
          where: { id }
        });

        if (!currentProduct) {
          throw new Error('Produto não encontrado');
        }

        const qty = parseFloat(quantity);

        let movementBatchId = null;
        if (batchId || batchNumber) {
          // Encontrar ou criar lote
          let batch;
          if (batchId) {
            batch = await tx.productBatch.findUnique({ where: { id: batchId } });
            if (!batch || batch.productId !== id) {
              throw new Error('Lote inválido para este produto');
            }
          } else if (batchNumber) {
            batch = await tx.productBatch.findFirst({
              where: { productId: id, lotNumber: batchNumber }
            });
            if (!batch) {
              batch = await tx.productBatch.create({
                data: { 
                  productId: id, 
                  lotNumber: batchNumber, 
                  quantity: 0,
                  expiryDate: expiryDate ? new Date(expiryDate) : null
                }
              });
            }
          }

          movementBatchId = batch.id;

          // Ajustar quantidade do lote
          await tx.productBatch.update({
            where: { id: batch.id },
            data: {
              ...(expiryDate ? { expiryDate: new Date(expiryDate) } : {}),
              ...(qty >= 0 
                ? { quantity: { increment: qty } } 
                : { quantity: { decrement: Math.abs(qty) } }
              )
            }
          });
        }

        // Atualizar estoque total do produto
        const updatedProduct = await tx.product.update({
          where: { id },
          data: qty >= 0 ? { stockQuantity: { increment: qty } } : { stockQuantity: { decrement: Math.abs(qty) } }
        });

        // Registrar movimentação de estoque
        await tx.stockMovement.create({
          data: {
            productId: id,
            quantity: qty,
            type: 'ADJUST',
            reason,
            userId: req.user.id,
            batchId: movementBatchId
          }
        });

        // Log de auditoria
        await tx.auditLog.create({
          data: {
            userId: req.user.id,
            action: 'STOCK_ADJUST',
            entity: 'PRODUCT',
            entityId: id,
            details: {
              previousStock: currentProduct.stockQuantity,
              adjustment: parseInt(quantity),
              newStock: updatedProduct.stockQuantity,
              reason
            }
          }
        });

        return updatedProduct;
      });

      res.json({
        message: 'Estoque ajustado com sucesso',
        product
      });
    } catch (error) {
      console.error('Erro ao ajustar estoque:', error);
      if (error.message === 'Produto não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Excluir produto
 *     tags: [Products]
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
 *         description: Produto excluído com sucesso
 *       404:
 *         description: Produto não encontrado
 *       400:
 *         description: Produto não pode ser excluído (tem vendas associadas)
 */
router.delete('/:id', 
  requireRole(['ADMIN']), 
  async (req, res) => {
    try {
      const { id } = req.params;

      // Verificar se produto existe
      const product = await prisma.product.findUnique({
        where: { id }
      });

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      // Verificar se produto tem vendas associadas
      const salesCount = await prisma.saleItem.count({
        where: { productId: id }
      });

      if (salesCount > 0) {
        return res.status(400).json({ 
          error: 'Produto não pode ser excluído pois possui vendas associadas' 
        });
      }

      await prisma.product.delete({
        where: { id }
      });

      // Log de auditoria
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'DELETE',
          entity: 'PRODUCT',
          entityId: id,
          details: { deletedProduct: product }
        }
      });

      res.json({ success: true, message: 'Produto excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

module.exports = router;