const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');
const Joi = require('joi');

const router = express.Router();
const prisma = new PrismaClient();

// Schema de validação
const ingredientSchema = Joi.object({
  name: Joi.string().max(255).required(),
  unit: Joi.string().valid('G', 'KG', 'ML', 'L', 'UN').required(),
  currentStock: Joi.number().min(0).default(0),
  averageCost: Joi.number().min(0).default(0),
  reorderPoint: Joi.number().min(0).default(0),
  supplierId: Joi.string().optional().allow(null, ''),
  isActive: Joi.boolean().default(true)
});

const ingredientUpdateSchema = ingredientSchema.fork(
  ['name', 'unit'],
  (field) => field.optional()
);

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// GET /ingredients — listar com paginação e filtros
router.get('/', async (req, res) => {
  try {
    const { search, isActive, lowStock, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [ingredients, total] = await Promise.all([
      prisma.ingredient.findMany({
        where,
        include: {
          supplier: { select: { id: true, name: true } }
        },
        orderBy: { name: 'asc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.ingredient.count({ where })
    ]);

    // Filtro de estoque baixo (currentStock <= reorderPoint)
    const result = lowStock === 'true'
      ? ingredients.filter(i => parseFloat(i.currentStock) <= parseFloat(i.reorderPoint))
      : ingredients;

    res.json({
      ingredients: result,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar ingredientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /ingredients/:id — detalhe com movimentações recentes
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
      include: {
        supplier: { select: { id: true, name: true } },
        ingredientMovements: {
          take: 10,
          orderBy: { date: 'desc' },
          include: {
            user: { select: { name: true } }
          }
        }
      }
    });

    if (!ingredient) {
      return res.status(404).json({ error: 'Ingrediente não encontrado' });
    }

    res.json(ingredient);
  } catch (error) {
    console.error('Erro ao buscar ingrediente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /ingredients — criar
router.post('/', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { error, value } = ingredientSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const ingredient = await prisma.ingredient.create({
      data: {
        ...value,
        currentStock: parseFloat(value.currentStock),
        averageCost: parseFloat(value.averageCost),
        reorderPoint: parseFloat(value.reorderPoint)
      },
      include: {
        supplier: { select: { id: true, name: true } }
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE',
        entity: 'INGREDIENT',
        entityId: ingredient.id,
        details: { value }
      }
    });

    res.status(201).json(ingredient);
  } catch (error) {
    console.error('Erro ao criar ingrediente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /ingredients/:id — atualizar
router.put('/:id', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = ingredientUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const existing = await prisma.ingredient.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Ingrediente não encontrado' });
    }

    const data = { ...value };
    if (value.currentStock !== undefined) data.currentStock = parseFloat(value.currentStock);
    if (value.averageCost !== undefined) data.averageCost = parseFloat(value.averageCost);
    if (value.reorderPoint !== undefined) data.reorderPoint = parseFloat(value.reorderPoint);

    const ingredient = await prisma.ingredient.update({
      where: { id },
      data,
      include: {
        supplier: { select: { id: true, name: true } }
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE',
        entity: 'INGREDIENT',
        entityId: id,
        details: { before: existing, after: value }
      }
    });

    res.json(ingredient);
  } catch (error) {
    console.error('Erro ao atualizar ingrediente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /ingredients/:id — soft delete
router.delete('/:id', requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.ingredient.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Ingrediente não encontrado' });
    }

    // Verifica se está em uso em alguma ficha técnica ativa
    const inUse = await prisma.recipeIngredient.count({
      where: {
        ingredientId: id,
        recipe: { isActive: true }
      }
    });

    if (inUse > 0) {
      return res.status(400).json({
        error: 'Ingrediente está em uso em fichas técnicas ativas. Desative as fichas antes de remover o ingrediente.'
      });
    }

    await prisma.ingredient.update({
      where: { id },
      data: { isActive: false }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE',
        entity: 'INGREDIENT',
        entityId: id,
        details: { softDelete: true }
      }
    });

    res.json({ success: true, message: 'Ingrediente desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar ingrediente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /ingredients/:id/adjust-stock — ajuste manual de estoque
router.post('/:id/adjust-stock', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, reason } = req.body;

    if (quantity === undefined || !reason) {
      return res.status(400).json({ error: 'Quantidade e motivo são obrigatórios' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const ingredient = await tx.ingredient.findUnique({ where: { id } });
      if (!ingredient) throw new Error('Ingrediente não encontrado');

      const qty = parseFloat(quantity);
      const newStock = parseFloat(ingredient.currentStock) + qty;

      if (newStock < 0) {
        throw new Error('Estoque não pode ficar negativo');
      }

      const updated = await tx.ingredient.update({
        where: { id },
        data: { currentStock: newStock }
      });

      await tx.ingredientMovement.create({
        data: {
          ingredientId: id,
          quantity: Math.abs(qty),
          type: 'ADJUST',
          reason,
          userId: req.user.id
        }
      });

      return updated;
    });

    res.json({ message: 'Estoque ajustado com sucesso', ingredient: result });
  } catch (error) {
    console.error('Erro ao ajustar estoque:', error);
    if (error.message === 'Ingrediente não encontrado') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Estoque não pode ficar negativo') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;