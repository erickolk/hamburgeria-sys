const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const companySettingsService = require('../services/companySettingsService');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @swagger
 * /settings/company:
 *   get:
 *     summary: Obter configurações da empresa
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
router.get('/company', requireRole(['ADMIN']), async (req, res) => {
  try {
    const settings = await companySettingsService.getSettings();

    if (!settings) {
      return res.status(404).json({ 
        error: 'Configurações não encontradas',
        message: 'Configure os dados da empresa primeiro' 
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Erro ao buscar configurações da empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /settings/company:
 *   put:
 *     summary: Atualizar configurações da empresa
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
router.put('/company', requireRole(['ADMIN']), async (req, res) => {
  try {
    const {
      name,
      cnpj,
      phone,
      website,
      zipCode,
      street,
      number,
      complement,
      neighborhood,
      city,
      state
    } = req.body;

    const settings = await companySettingsService.upsertSettings({
      name,
      cnpj,
      phone,
      website,
      zipCode,
      street,
      number,
      complement,
      neighborhood,
      city,
      state
    });

    res.json(settings);
  } catch (error) {
    console.error('Erro ao salvar configurações da empresa:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /settings/company/status:
 *   get:
 *     summary: Verifica se a empresa já foi configurada
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
router.get('/company/status', requireRole(['ADMIN']), async (req, res) => {
  try {
    const isConfigured = await companySettingsService.isConfigured();
    res.json({ configured: isConfigured });
  } catch (error) {
    console.error('Erro ao verificar status de configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;



