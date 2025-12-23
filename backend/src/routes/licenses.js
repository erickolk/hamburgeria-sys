/**
 * Rotas de Licenciamento - VPS
 * API para gerenciamento de licenças no servidor central
 */

const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const licenseService = require('../services/licenseService');

const router = express.Router();

/**
 * @swagger
 * /licenses/verify:
 *   post:
 *     summary: Verificar e validar uma licença
 *     tags: [Licenses]
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
 *         description: Licença válida
 *       403:
 *         description: Licença inválida ou expirada
 */
router.post('/verify', async (req, res) => {
  try {
    const { licenseKey } = req.body;

    if (!licenseKey) {
      return res.status(400).json({ error: 'Chave de licença é obrigatória' });
    }

    const result = await licenseService.verifyLicense(licenseKey);

    if (!result.valid) {
      return res.status(403).json({
        error: result.error,
        status: result.status || 'invalid',
        graceDays: result.graceDays || 0
      });
    }

    res.json({
      valid: true,
      token: result.token,
      license: result.license,
      status: result.status,
      daysRemaining: result.daysRemaining,
      graceDays: result.graceDays,
      daysUntilBlock: result.daysUntilBlock
    });
  } catch (error) {
    console.error('Erro ao verificar licença:', error);
    res.status(500).json({ error: 'Erro ao verificar licença' });
  }
});

/**
 * @swagger
 * /licenses/{key}/status:
 *   get:
 *     summary: Consultar status de uma licença
 *     tags: [Licenses]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status da licença
 *       404:
 *         description: Licença não encontrada
 */
router.get('/:key/status', async (req, res) => {
  try {
    const { key } = req.params;

    const license = await licenseService.findByKey(key);

    if (!license) {
      return res.status(404).json({ error: 'Licença não encontrada' });
    }

    const statusInfo = licenseService.calculateLicenseStatus(license.validUntil);

    res.json({
      licenseKey: license.licenseKey,
      companyName: license.companyName,
      cnpj: license.cnpj,
      plan: license.plan,
      status: license.status,
      validUntil: license.validUntil,
      lastCheckIn: license.lastCheckIn,
      statusInfo
    });
  } catch (error) {
    console.error('Erro ao consultar status:', error);
    res.status(500).json({ error: 'Erro ao consultar status da licença' });
  }
});

// ============================================
// ROTAS ADMINISTRATIVAS (requerem autenticação)
// ============================================

/**
 * @swagger
 * /licenses:
 *   get:
 *     summary: Listar todas as licenças (admin)
 *     tags: [Licenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, SUSPENDED, CANCELLED, TRIAL]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de licenças
 */
router.get('/', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { status, search } = req.query;
    const licenses = await licenseService.listLicenses({ status, search });
    res.json(licenses);
  } catch (error) {
    console.error('Erro ao listar licenças:', error);
    res.status(500).json({ error: 'Erro ao listar licenças' });
  }
});

/**
 * @swagger
 * /licenses:
 *   post:
 *     summary: Criar nova licença (admin)
 *     tags: [Licenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cnpj
 *               - companyName
 *             properties:
 *               cnpj:
 *                 type: string
 *               companyName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               plan:
 *                 type: string
 *                 default: basic
 *               validMonths:
 *                 type: integer
 *                 default: 1
 *               maxUsers:
 *                 type: integer
 *                 default: 5
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Licença criada
 */
router.post('/', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { cnpj, companyName, email, phone, plan, validMonths, maxUsers, notes } = req.body;

    if (!cnpj || !companyName) {
      return res.status(400).json({ error: 'CNPJ e nome da empresa são obrigatórios' });
    }

    // Verificar se CNPJ já existe
    const existing = await licenseService.findByCnpj(cnpj);
    if (existing) {
      return res.status(400).json({ error: 'CNPJ já possui uma licença cadastrada' });
    }

    const license = await licenseService.createLicense({
      cnpj,
      companyName,
      email,
      phone,
      plan,
      validMonths,
      maxUsers,
      notes
    });

    res.status(201).json({
      message: 'Licença criada com sucesso',
      license
    });
  } catch (error) {
    console.error('Erro ao criar licença:', error);
    res.status(500).json({ error: 'Erro ao criar licença' });
  }
});

/**
 * @swagger
 * /licenses/{id}:
 *   put:
 *     summary: Atualizar licença (admin)
 *     tags: [Licenses]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remover campos que não devem ser atualizados diretamente
    delete updateData.id;
    delete updateData.licenseKey;
    delete updateData.createdAt;

    const license = await licenseService.updateLicense(id, updateData);
    res.json({ message: 'Licença atualizada', license });
  } catch (error) {
    console.error('Erro ao atualizar licença:', error);
    res.status(500).json({ error: 'Erro ao atualizar licença' });
  }
});

/**
 * @swagger
 * /licenses/{key}/renew:
 *   post:
 *     summary: Renovar licença (adicionar tempo)
 *     tags: [Licenses]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:key/renew', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { key } = req.params;
    const { months = 1 } = req.body;

    const result = await licenseService.renewLicense(key, months);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      message: `Licença renovada por ${months} mês(es)`,
      license: result.license,
      newValidUntil: result.newValidUntil
    });
  } catch (error) {
    console.error('Erro ao renovar licença:', error);
    res.status(500).json({ error: 'Erro ao renovar licença' });
  }
});

/**
 * @swagger
 * /licenses/{key}/suspend:
 *   post:
 *     summary: Suspender licença
 *     tags: [Licenses]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:key/suspend', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { key } = req.params;
    const { reason = 'Inadimplência' } = req.body;

    const result = await licenseService.suspendLicense(key, reason);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ message: 'Licença suspensa', license: result.license });
  } catch (error) {
    console.error('Erro ao suspender licença:', error);
    res.status(500).json({ error: 'Erro ao suspender licença' });
  }
});

/**
 * @swagger
 * /licenses/{key}/reactivate:
 *   post:
 *     summary: Reativar licença suspensa
 *     tags: [Licenses]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:key/reactivate', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { key } = req.params;

    const result = await licenseService.reactivateLicense(key);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ message: 'Licença reativada', license: result.license });
  } catch (error) {
    console.error('Erro ao reativar licença:', error);
    res.status(500).json({ error: 'Erro ao reativar licença' });
  }
});

module.exports = router;

