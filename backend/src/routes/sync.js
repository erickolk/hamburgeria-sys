const express = require('express');
const router = express.Router();
const syncService = require('../services/syncService');
const conflictResolution = require('../services/conflictResolution');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();

/**
 * @swagger
 * /sync/status:
 *   get:
 *     summary: Obter status da sincronização
 *     tags: [Sincronização]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status da sincronização
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const stats = await syncService.getStats();
    
    if (!stats) {
      return res.status(500).json({ 
        error: 'Erro ao obter estatísticas' 
      });
    }

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar status',
      message: error.message 
    });
  }
});

/**
 * @swagger
 * /sync/trigger:
 *   post:
 *     summary: Forçar sincronização manual
 *     tags: [Sincronização]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sincronização iniciada
 */
router.post('/trigger', authenticateToken, async (req, res) => {
  try {
    // Não esperar o resultado, rodar em background
    syncService.syncAll().catch(err => {
      console.error('Erro na sincronização manual:', err);
    });
    
    res.json({ 
      success: true,
      message: 'Sincronização iniciada em background' 
    });
  } catch (error) {
    console.error('Erro ao iniciar sincronização:', error);
    res.status(500).json({ 
      error: 'Erro ao iniciar sincronização',
      message: error.message 
    });
  }
});

/**
 * @swagger
 * /sync/logs:
 *   get:
 *     summary: Obter histórico de sincronização
 *     tags: [Sincronização]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Número de logs a retornar
 *       - in: query
 *         name: entity
 *         schema:
 *           type: string
 *         description: Filtrar por entidade (sale, product, etc)
 *       - in: query
 *         name: direction
 *         schema:
 *           type: string
 *           enum: [upload, download]
 *         description: Filtrar por direção
 *     responses:
 *       200:
 *         description: Logs de sincronização
 */
router.get('/logs', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, entity, direction } = req.query;
    
    const where = {};
    if (entity) where.entity = entity;
    if (direction) where.direction = direction;

    const logs = await prisma.syncLog.findMany({
      where,
      take: parseInt(limit),
      orderBy: { timestamp: 'desc' }
    });

    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar logs',
      message: error.message 
    });
  }
});

/**
 * @swagger
 * /sync/queue:
 *   get:
 *     summary: Obter fila de sincronização
 *     tags: [Sincronização]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, syncing, success, error, failed]
 *         description: Filtrar por status
 *     responses:
 *       200:
 *         description: Fila de sincronização
 */
router.get('/queue', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    
    const where = status ? { status } : {};

    const queue = await prisma.syncQueue.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Contar por status
    const counts = await prisma.syncQueue.groupBy({
      by: ['status'],
      _count: true
    });

    res.json({
      success: true,
      total: queue.length,
      counts: counts.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {}),
      queue
    });
  } catch (error) {
    console.error('Erro ao buscar fila:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar fila',
      message: error.message 
    });
  }
});

/**
 * @swagger
 * /sync/queue/{id}/retry:
 *   post:
 *     summary: Reprocessar item da fila
 *     tags: [Sincronização]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do item na fila
 *     responses:
 *       200:
 *         description: Item reprocessado
 */
router.post('/queue/:id/retry', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Resetar status para pending
    const item = await prisma.syncQueue.update({
      where: { id },
      data: {
        status: 'pending',
        attempts: 0,
        error: null,
        lastAttempt: null
      }
    });

    res.json({
      success: true,
      message: 'Item resetado para reprocessamento',
      item
    });
  } catch (error) {
    console.error('Erro ao reprocessar item:', error);
    res.status(500).json({ 
      error: 'Erro ao reprocessar item',
      message: error.message 
    });
  }
});

/**
 * @swagger
 * /sync/queue/{id}:
 *   delete:
 *     summary: Remover item da fila
 *     tags: [Sincronização]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do item na fila
 *     responses:
 *       200:
 *         description: Item removido
 */
router.delete('/queue/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.syncQueue.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Item removido da fila'
    });
  } catch (error) {
    console.error('Erro ao remover item:', error);
    res.status(500).json({ 
      error: 'Erro ao remover item',
      message: error.message 
    });
  }
});

/**
 * @swagger
 * /sync/config:
 *   get:
 *     summary: Obter configuração de sincronização
 *     tags: [Sincronização]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuração atual
 */
router.get('/config', authenticateToken, async (req, res) => {
  try {
    const config = await prisma.syncConfig.findFirst();

    if (!config) {
      return res.status(404).json({
        error: 'Configuração não encontrada'
      });
    }

    // Não expor token completo por segurança
    const safeConfig = {
      ...config,
      syncToken: config.syncToken ? '***' + config.syncToken.slice(-8) : null
    };

    res.json({
      success: true,
      config: safeConfig
    });
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar configuração',
      message: error.message 
    });
  }
});

/**
 * @swagger
 * /sync/config:
 *   put:
 *     summary: Atualizar configuração de sincronização
 *     tags: [Sincronização]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vpsApiUrl:
 *                 type: string
 *               syncToken:
 *                 type: string
 *               syncInterval:
 *                 type: integer
 *               isEnabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Configuração atualizada
 */
router.put('/config', authenticateToken, async (req, res) => {
  try {
    // Apenas ADMIN pode alterar configuração
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Acesso negado. Apenas administradores podem alterar a configuração.'
      });
    }

    const { vpsApiUrl, syncToken, syncInterval, isEnabled } = req.body;

    const updateData = {};
    if (vpsApiUrl !== undefined) updateData.vpsApiUrl = vpsApiUrl;
    if (syncToken !== undefined) updateData.syncToken = syncToken;
    if (syncInterval !== undefined) updateData.syncInterval = parseInt(syncInterval);
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled;
    updateData.updatedAt = new Date();

    // Atualizar ou criar configuração
    let config = await prisma.syncConfig.findFirst();
    
    if (config) {
      config = await prisma.syncConfig.update({
        where: { id: config.id },
        data: updateData
      });
    } else {
      config = await prisma.syncConfig.create({
        data: {
          vpsApiUrl: vpsApiUrl || 'https://seu-servidor.com/api',
          syncToken: syncToken || '',
          syncInterval: syncInterval || 60000,
          isEnabled: isEnabled !== undefined ? isEnabled : false
        }
      });
    }

    // Reinicializar serviço de sincronização
    await syncService.initialize();
    
    // Se habilitado, iniciar worker
    if (config.isEnabled && !syncService.syncIntervalId) {
      syncService.startSyncWorker();
    } else if (!config.isEnabled && syncService.syncIntervalId) {
      syncService.stopSyncWorker();
    }

    res.json({
      success: true,
      message: 'Configuração atualizada',
      config: {
        ...config,
        syncToken: config.syncToken ? '***' + config.syncToken.slice(-8) : null
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar configuração',
      message: error.message 
    });
  }
});

/**
 * @swagger
 * /sync/alerts:
 *   get:
 *     summary: Obter alertas pendentes
 *     tags: [Sincronização]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de alertas
 */
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const result = await conflictResolution.getPendingAlerts();
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar alertas',
      message: error.message 
    });
  }
});

/**
 * @swagger
 * /sync/alerts/{id}/review:
 *   post:
 *     summary: Marcar alerta como revisado
 *     tags: [Sincronização]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Alerta revisado
 */
router.post('/alerts/:id/review', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const result = await conflictResolution.markAlertAsReviewed(
      id, 
      req.user.id,
      notes
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Alerta marcado como revisado'
      });
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Erro ao revisar alerta:', error);
    res.status(500).json({ 
      error: 'Erro ao revisar alerta',
      message: error.message 
    });
  }
});

/**
 * @swagger
 * /sync/stats:
 *   get:
 *     summary: Estatísticas detalhadas de sincronização
 *     tags: [Sincronização]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas detalhadas
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [
      totalSales,
      syncedSales,
      pendingSales,
      totalProducts,
      recentSyncs,
      failedQueue
    ] = await Promise.all([
      prisma.sale.count(),
      prisma.sale.count({ where: { synced: true } }),
      prisma.sale.count({ where: { synced: false } }),
      prisma.product.count(),
      prisma.syncLog.count({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24h
          }
        }
      }),
      prisma.syncQueue.count({ where: { status: 'failed' } })
    ]);

    // Últimas sincronizações por entidade
    const lastSyncs = await prisma.syncLog.groupBy({
      by: ['entity'],
      _max: {
        timestamp: true
      },
      where: {
        status: 'success',
        direction: 'upload'
      }
    });

    res.json({
      success: true,
      stats: {
        sales: {
          total: totalSales,
          synced: syncedSales,
          pending: pendingSales,
          syncRate: totalSales > 0 ? ((syncedSales / totalSales) * 100).toFixed(2) + '%' : '0%'
        },
        products: {
          total: totalProducts
        },
        sync: {
          recentSyncs24h: recentSyncs,
          failedItems: failedQueue,
          isOnline: syncService.isOnline,
          isSyncing: syncService.isSyncing,
          isEnabled: syncService.isEnabled
        },
        lastSyncs: lastSyncs.reduce((acc, item) => {
          acc[item.entity] = item._max.timestamp;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar estatísticas',
      message: error.message 
    });
  }
});

/**
 * Endpoint para receber dados da VPS (quando VPS faz push de atualizações)
 */
router.post('/receive/products', authenticateToken, async (req, res) => {
  try {
    const products = req.body.products || [];

    let updated = 0;
    for (const product of products) {
      try {
        await prisma.product.upsert({
          where: { id: product.id },
          update: {
            ...product,
            lastSyncAt: new Date(),
            vpsUpdatedAt: new Date()
          },
          create: {
            ...product,
            lastSyncAt: new Date(),
            vpsUpdatedAt: new Date()
          }
        });
        updated++;
      } catch (error) {
        console.error(`Erro ao processar produto ${product.id}:`, error.message);
      }
    }

    res.json({
      success: true,
      updated,
      total: products.length
    });
  } catch (error) {
    console.error('Erro ao receber produtos:', error);
    res.status(500).json({ 
      error: 'Erro ao receber produtos',
      message: error.message 
    });
  }
});

module.exports = router;

