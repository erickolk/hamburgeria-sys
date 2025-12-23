/**
 * Rotas de Licença Local
 * API para gerenciamento da licença no sistema do cliente
 */

const express = require('express');
const licenseLocalService = require('../services/licenseLocalService');

const router = express.Router();

/**
 * @swagger
 * /license/status:
 *   get:
 *     summary: Obter status atual da licença
 *     tags: [License Local]
 *     responses:
 *       200:
 *         description: Status da licença
 */
router.get('/status', async (req, res) => {
  try {
    const status = await licenseLocalService.getStatus();
    res.json(status);
  } catch (error) {
    console.error('Erro ao obter status da licença:', error);
    res.status(500).json({ error: 'Erro ao obter status da licença' });
  }
});

/**
 * @swagger
 * /license/activate:
 *   post:
 *     summary: Ativar licença no sistema
 *     tags: [License Local]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - licenseKey
 *             properties:
 *               licenseKey:
 *                 type: string
 *                 description: Chave de licença no formato XXXX-XXXX-XXXX-XXXX
 *     responses:
 *       200:
 *         description: Licença ativada com sucesso
 *       400:
 *         description: Chave inválida
 */
router.post('/activate', async (req, res) => {
  try {
    const { licenseKey } = req.body;

    if (!licenseKey) {
      return res.status(400).json({ error: 'Chave de licença é obrigatória' });
    }

    // Validar formato da chave (XXXX-XXXX-XXXX-XXXX)
    const keyPattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;
    if (!keyPattern.test(licenseKey)) {
      return res.status(400).json({ 
        error: 'Formato de chave inválido',
        message: 'A chave deve estar no formato XXXX-XXXX-XXXX-XXXX'
      });
    }

    const result = await licenseLocalService.activate(licenseKey.toUpperCase());

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      message: 'Licença ativada com sucesso!',
      license: result.license
    });
  } catch (error) {
    console.error('Erro ao ativar licença:', error);
    res.status(500).json({ error: 'Erro ao ativar licença' });
  }
});

/**
 * @swagger
 * /license/retry:
 *   post:
 *     summary: Tentar renovar token manualmente
 *     tags: [License Local]
 *     responses:
 *       200:
 *         description: Token renovado
 *       400:
 *         description: Não foi possível renovar
 */
router.post('/retry', async (req, res) => {
  try {
    const result = await licenseLocalService.renewToken();

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
        graceDays: result.graceDays,
        offline: result.offline
      });
    }

    res.json({
      message: 'Licença verificada com sucesso!',
      status: result.status,
      daysRemaining: result.daysRemaining
    });
  } catch (error) {
    console.error('Erro ao renovar licença:', error);
    res.status(500).json({ error: 'Erro ao renovar licença' });
  }
});

/**
 * @swagger
 * /license/check:
 *   get:
 *     summary: Verificar se pode operar (rápido, sem chamar VPS)
 *     tags: [License Local]
 *     responses:
 *       200:
 *         description: Pode operar
 *       403:
 *         description: Não pode operar
 */
router.get('/check', async (req, res) => {
  try {
    const result = await licenseLocalService.canOperate();

    if (result.allowed) {
      return res.json({
        canOperate: true,
        status: result.status,
        graceDays: result.graceDays,
        daysUntilBlock: result.daysUntilBlock
      });
    }

    res.status(403).json({
      canOperate: false,
      reason: result.reason,
      graceDays: result.graceDays
    });
  } catch (error) {
    console.error('Erro ao verificar operação:', error);
    res.status(500).json({ error: 'Erro ao verificar licença' });
  }
});

/**
 * @swagger
 * /license/deactivate:
 *   delete:
 *     summary: Remover licença local (para reativação)
 *     tags: [License Local]
 *     responses:
 *       200:
 *         description: Licença removida
 */
router.delete('/deactivate', async (req, res) => {
  try {
    const result = await licenseLocalService.deactivate();

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ message: 'Licença removida. O sistema precisará ser reativado.' });
  } catch (error) {
    console.error('Erro ao desativar licença:', error);
    res.status(500).json({ error: 'Erro ao desativar licença' });
  }
});

module.exports = router;

