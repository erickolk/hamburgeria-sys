const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');
const Joi = require('joi');

const router = express.Router();
const prisma = new PrismaClient();

// Schemas de validação
const recipeIngredientSchema = Joi.object({
  ingredientId: Joi.string().required(),
  quantity: Joi.number().positive().required(),
  unit: Joi.string().valid('G', 'KG', 'ML', 'L', 'UN').required(),
  lossPercentage: Joi.number().min(0).max(100).default(0)
});

const recipeSchema = Joi.object({
  name: Joi.string().max(255).required(),
  yieldQuantity: Joi.number().positive().required(),
  yieldUnit: Joi.string().valid('G', 'KG', 'ML', 'L', 'UN').required(),
  observations: Joi.string().optional().allow(null, ''),
  isActive: Joi.boolean().default(true),
  ingredients: Joi.array().items(recipeIngredientSchema).min(1).required()
});

const recipeUpdateSchema = recipeSchema.fork(
  ['name', 'yieldQuantity', 'yieldUnit', 'ingredients'],
  (field) => field.optional()
);

router.use(authenticateToken);

// Função auxiliar: calcula custo total da ficha técnica
async function calculateRecipeCost(prismaClient, recipeId) {
  const recipeIngredients = await prismaClient.recipeIngredient.findMany({
    where: { recipeId },
    include: { ingredient: { select: { averageCost: true, unit: true } } }
  });

  return recipeIngredients.reduce((total, ri) => {
    const qty = parseFloat(ri.quantity);
    const loss = parseFloat(ri.lossPercentage) / 100;
    const cost = parseFloat(ri.ingredient.averageCost);
    return total + (qty * (1 + loss) * cost);
  }, 0);
}

// GET /recipes — listar
router.get('/', async (req, res) => {
  try {
    const { search, isActive, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: {
          recipeIngredients: {
            include: {
              ingredient: { select: { id: true, name: true, unit: true, averageCost: true } }
            }
          },
          _count: { select: { products: true } }
        },
        orderBy: { name: 'asc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.recipe.count({ where })
    ]);

    // Adiciona custo calculado em cada receita
    const recipesWithCost = recipes.map(recipe => {
      const totalCost = recipe.recipeIngredients.reduce((acc, ri) => {
        const qty = parseFloat(ri.quantity);
        const loss = parseFloat(ri.lossPercentage) / 100;
        const cost = parseFloat(ri.ingredient.averageCost);
        return acc + (qty * (1 + loss) * cost);
      }, 0);
      return { ...recipe, totalCost: totalCost.toFixed(2) };
    });

    res.json({
      recipes: recipesWithCost,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /recipes/:id — detalhe com custo calculado
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        recipeIngredients: {
          include: {
            ingredient: {
              select: { id: true, name: true, unit: true, averageCost: true, currentStock: true }
            }
          }
        },
        products: { select: { id: true, name: true, salePrice: true } }
      }
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Receita não encontrada' });
    }

    const totalCost = await calculateRecipeCost(prisma, id);

    // Calcula custo por ingrediente com perda
    const ingredientsWithCost = recipe.recipeIngredients.map(ri => ({
      ...ri,
      effectiveQuantity: parseFloat(ri.quantity) * (1 + parseFloat(ri.lossPercentage) / 100),
      lineCost: (parseFloat(ri.quantity) * (1 + parseFloat(ri.lossPercentage) / 100) * parseFloat(ri.ingredient.averageCost)).toFixed(2)
    }));

    res.json({
      ...recipe,
      recipeIngredients: ingredientsWithCost,
      totalCost: totalCost.toFixed(2)
    });
  } catch (error) {
    console.error('Erro ao buscar receita:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /recipes — criar com ingredientes
router.post('/', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { error, value } = recipeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { ingredients, ...recipeData } = value;

    const recipe = await prisma.$transaction(async (tx) => {
      const created = await tx.recipe.create({
        data: {
          ...recipeData,
          yieldQuantity: parseFloat(recipeData.yieldQuantity),
          recipeIngredients: {
            create: ingredients.map(i => ({
              ingredientId: i.ingredientId,
              quantity: parseFloat(i.quantity),
              unit: i.unit,
              lossPercentage: parseFloat(i.lossPercentage || 0)
            }))
          }
        },
        include: {
          recipeIngredients: {
            include: {
              ingredient: { select: { id: true, name: true, unit: true, averageCost: true } }
            }
          }
        }
      });
      return created;
    });

    const totalCost = await calculateRecipeCost(prisma, recipe.id);

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE',
        entity: 'RECIPE',
        entityId: recipe.id,
        details: { recipeData, ingredientsCount: ingredients.length }
      }
    });

    res.status(201).json({ ...recipe, totalCost: totalCost.toFixed(2) });
  } catch (error) {
    console.error('Erro ao criar receita:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /recipes/:id — atualizar (recria ingredientes)
router.put('/:id', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = recipeUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const existing = await prisma.recipe.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Receita não encontrada' });
    }

    const { ingredients, ...recipeData } = value;

    const recipe = await prisma.$transaction(async (tx) => {
      // Se enviou ingredientes, recria todos
      if (ingredients) {
        await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
      }

      return tx.recipe.update({
        where: { id },
        data: {
          ...recipeData,
          ...(recipeData.yieldQuantity && { yieldQuantity: parseFloat(recipeData.yieldQuantity) }),
          ...(ingredients && {
            recipeIngredients: {
              create: ingredients.map(i => ({
                ingredientId: i.ingredientId,
                quantity: parseFloat(i.quantity),
                unit: i.unit,
                lossPercentage: parseFloat(i.lossPercentage || 0)
              }))
            }
          })
        },
        include: {
          recipeIngredients: {
            include: {
              ingredient: { select: { id: true, name: true, unit: true, averageCost: true } }
            }
          }
        }
      });
    });

    const totalCost = await calculateRecipeCost(prisma, id);

    res.json({ ...recipe, totalCost: totalCost.toFixed(2) });
  } catch (error) {
    console.error('Erro ao atualizar receita:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /recipes/:id — soft delete
router.delete('/:id', requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.recipe.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Receita não encontrada' });
    }

    // Verifica se tem produtos ativos vinculados
    const productsCount = await prisma.product.count({
      where: { recipeId: id }
    });

    if (productsCount > 0) {
      return res.status(400).json({
        error: 'Receita está vinculada a produtos do cardápio. Desvincule os produtos antes de remover.'
      });
    }

    await prisma.recipe.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({ success: true, message: 'Receita desativada com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar receita:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;