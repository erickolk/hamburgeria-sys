const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @swagger
 * /products/{productId}/photos:
 *   get:
 *     summary: Listar fotos de um produto
 *     tags: [Product Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de fotos do produto
 *       404:
 *         description: Produto não encontrado
 */
router.get('/products/:productId/photos', async (req, res) => {
  try {
    const { productId } = req.params;

    // Verificar se produto existe
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const photos = await prisma.productPhoto.findMany({
      where: { productId },
      orderBy: [
        { isMain: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    res.json({ photos });
  } catch (error) {
    console.error('Erro ao buscar fotos do produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /products/{productId}/photos:
 *   post:
 *     summary: Adicionar foto ao produto
 *     tags: [Product Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
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
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *               isMain:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Foto adicionada com sucesso
 *       404:
 *         description: Produto não encontrado
 */
router.post('/products/:productId/photos',
  requireRole(['ADMIN', 'MANAGER']),
  async (req, res) => {
    try {
      const { productId } = req.params;
      const { url, isMain = false } = req.body;

      if (!url || !url.trim()) {
        return res.status(400).json({ error: 'URL da foto é obrigatória' });
      }

      // Verificar se produto existe
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      // Se esta foto será a principal, remover a flag de outras fotos
      if (isMain) {
        await prisma.productPhoto.updateMany({
          where: {
            productId,
            isMain: true
          },
          data: { isMain: false }
        });
      }

      const photo = await prisma.productPhoto.create({
        data: {
          productId,
          url: url.trim(),
          isMain
        }
      });

      // Log de auditoria
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'CREATE',
          entity: 'PRODUCT_PHOTO',
          entityId: photo.id,
          details: {
            productId,
            url: photo.url,
            isMain: photo.isMain
          }
        }
      });

      res.status(201).json(photo);
    } catch (error) {
      console.error('Erro ao adicionar foto:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

/**
 * @swagger
 * /products/{productId}/photos/{photoId}:
 *   put:
 *     summary: Atualizar foto do produto
 *     tags: [Product Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: photoId
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
 *               isMain:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Foto atualizada com sucesso
 *       404:
 *         description: Foto não encontrada
 */
router.put('/products/:productId/photos/:photoId',
  requireRole(['ADMIN', 'MANAGER']),
  async (req, res) => {
    try {
      const { productId, photoId } = req.params;
      const { isMain } = req.body;

      // Verificar se foto existe
      const photo = await prisma.productPhoto.findUnique({
        where: { id: photoId }
      });

      if (!photo || photo.productId !== productId) {
        return res.status(404).json({ error: 'Foto não encontrada' });
      }

      // Se esta foto será a principal, remover a flag de outras fotos
      if (isMain) {
        await prisma.productPhoto.updateMany({
          where: {
            productId,
            isMain: true,
            id: { not: photoId }
          },
          data: { isMain: false }
        });
      }

      const updatedPhoto = await prisma.productPhoto.update({
        where: { id: photoId },
        data: { isMain: !!isMain }
      });

      // Log de auditoria
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE',
          entity: 'PRODUCT_PHOTO',
          entityId: photoId,
          details: {
            before: { isMain: photo.isMain },
            after: { isMain: updatedPhoto.isMain }
          }
        }
      });

      res.json(updatedPhoto);
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

/**
 * @swagger
 * /products/{productId}/photos/{photoId}:
 *   delete:
 *     summary: Remover foto do produto
 *     tags: [Product Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Foto removida com sucesso
 *       404:
 *         description: Foto não encontrada
 */
router.delete('/products/:productId/photos/:photoId',
  requireRole(['ADMIN', 'MANAGER']),
  async (req, res) => {
    try {
      const { productId, photoId } = req.params;

      // Verificar se foto existe
      const photo = await prisma.productPhoto.findUnique({
        where: { id: photoId }
      });

      if (!photo || photo.productId !== productId) {
        return res.status(404).json({ error: 'Foto não encontrada' });
      }

      await prisma.productPhoto.delete({
        where: { id: photoId }
      });

      // Log de auditoria
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'DELETE',
          entity: 'PRODUCT_PHOTO',
          entityId: photoId,
          details: { deletedPhoto: photo }
        }
      });

      res.json({ success: true, message: 'Foto removida com sucesso' });
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

module.exports = router;

