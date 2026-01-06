const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const thermalPrinterService = require('../services/thermalPrinterService');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @swagger
 * /hardware/printer:
 *   get:
 *     summary: Obter configuração da impressora
 *     tags: [Hardware]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuração atual da impressora
 */
router.get('/printer', async (req, res) => {
  try {
    const config = thermalPrinterService.getConfig();
    res.json(config);
  } catch (error) {
    console.error('Erro ao obter configuração da impressora:', error);
    res.status(500).json({ error: 'Erro ao obter configuração' });
  }
});

/**
 * @swagger
 * /hardware/printer:
 *   put:
 *     summary: Atualizar configuração da impressora
 *     tags: [Hardware]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 description: Se a impressão direta está habilitada
 *               shareName:
 *                 type: string
 *                 description: Nome do compartilhamento de rede da impressora
 *               host:
 *                 type: string
 *                 description: Host onde a impressora está (padrão localhost)
 *     responses:
 *       200:
 *         description: Configuração atualizada com sucesso
 */
router.put('/printer', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { enabled, shareName, host } = req.body;
    
    thermalPrinterService.setConfig({
      enabled: enabled ?? false,
      shareName: shareName || '',
      host: host || 'localhost'
    });

    res.json({ 
      success: true, 
      message: 'Configuração atualizada com sucesso',
      config: thermalPrinterService.getConfig()
    });
  } catch (error) {
    console.error('Erro ao atualizar configuração da impressora:', error);
    res.status(500).json({ error: 'Erro ao atualizar configuração' });
  }
});

/**
 * @swagger
 * /hardware/printer/test:
 *   post:
 *     summary: Testar impressora (envia página de teste)
 *     tags: [Hardware]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resultado do teste
 */
router.post('/printer/test', async (req, res) => {
  try {
    const result = await thermalPrinterService.testConnection();
    
    res.json({
      success: result.success,
      message: result.message,
      config: thermalPrinterService.getConfig()
    });
  } catch (error) {
    console.error('Erro ao testar impressora:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao testar impressora: ' + error.message 
    });
  }
});

/**
 * @swagger
 * /hardware/printer/print-file:
 *   post:
 *     summary: Imprimir arquivo específico
 *     tags: [Hardware]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - filepath
 *             properties:
 *               filepath:
 *                 type: string
 *                 description: Caminho do arquivo a ser impresso
 *     responses:
 *       200:
 *         description: Resultado da impressão
 */
router.post('/printer/print-file', async (req, res) => {
  try {
    const { filepath } = req.body;
    
    if (!filepath) {
      return res.status(400).json({ error: 'Caminho do arquivo é obrigatório' });
    }

    const result = await thermalPrinterService.printDirect(filepath);
    
    res.json({
      success: result.success,
      message: result.message
    });
  } catch (error) {
    console.error('Erro ao imprimir arquivo:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao imprimir: ' + error.message 
    });
  }
});

module.exports = router;

