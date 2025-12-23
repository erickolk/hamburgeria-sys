/**
 * Rotas de Atualização - VPS
 * API para servir informações de versão e atualizações
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Diretório onde ficam os arquivos de atualização
const UPDATES_DIR = process.env.UPDATES_DIR || path.join(__dirname, '..', '..', 'updates');

// Informações da versão atual (pode ser lido de um arquivo ou banco)
let currentReleaseInfo = {
  version: '1.0.0',
  downloadUrl: '',
  changelog: 'Versão inicial do Mercadinho PDV',
  releaseDate: new Date().toISOString(),
  size: '~150 MB',
  mandatory: false,
  minVersion: '0.0.0' // Versão mínima que pode atualizar
};

// Carregar info de release do arquivo se existir
const releaseInfoPath = path.join(UPDATES_DIR, 'release-info.json');
if (fs.existsSync(releaseInfoPath)) {
  try {
    currentReleaseInfo = JSON.parse(fs.readFileSync(releaseInfoPath, 'utf8'));
  } catch (e) {
    console.error('[Updates] Erro ao carregar release-info.json:', e.message);
  }
}

/**
 * @swagger
 * /updates/latest.json:
 *   get:
 *     summary: Obter informações da versão mais recente
 *     tags: [Updates]
 *     responses:
 *       200:
 *         description: Informações da versão
 */
router.get('/latest.json', (req, res) => {
  // Recarregar info do arquivo (caso tenha sido atualizado)
  if (fs.existsSync(releaseInfoPath)) {
    try {
      currentReleaseInfo = JSON.parse(fs.readFileSync(releaseInfoPath, 'utf8'));
    } catch (e) {
      // Usar cache
    }
  }
  
  res.json(currentReleaseInfo);
});

/**
 * @swagger
 * /updates/check:
 *   get:
 *     summary: Verificar se há atualização disponível
 *     tags: [Updates]
 *     parameters:
 *       - in: query
 *         name: version
 *         schema:
 *           type: string
 *         description: Versão atual do cliente
 *     responses:
 *       200:
 *         description: Status da atualização
 */
router.get('/check', (req, res) => {
  const clientVersion = req.query.version || '0.0.0';
  
  // Comparar versões
  const compareVersions = (v1, v2) => {
    const parts1 = v1.replace(/^v/, '').split('.').map(Number);
    const parts2 = v2.replace(/^v/, '').split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    
    return 0;
  };
  
  const hasUpdate = compareVersions(currentReleaseInfo.version, clientVersion) > 0;
  
  res.json({
    hasUpdate,
    currentVersion: clientVersion,
    latestVersion: currentReleaseInfo.version,
    ...(hasUpdate ? {
      downloadUrl: currentReleaseInfo.downloadUrl,
      changelog: currentReleaseInfo.changelog,
      releaseDate: currentReleaseInfo.releaseDate,
      size: currentReleaseInfo.size,
      mandatory: currentReleaseInfo.mandatory
    } : {})
  });
});

/**
 * @swagger
 * /updates/changelog:
 *   get:
 *     summary: Obter changelog completo
 *     tags: [Updates]
 */
router.get('/changelog', (req, res) => {
  const changelogPath = path.join(UPDATES_DIR, 'CHANGELOG.md');
  
  if (fs.existsSync(changelogPath)) {
    const changelog = fs.readFileSync(changelogPath, 'utf8');
    res.type('text/markdown').send(changelog);
  } else {
    res.json({ changelog: currentReleaseInfo.changelog });
  }
});

// ============================================
// ROTAS ADMINISTRATIVAS (requerem autenticação)
// ============================================

/**
 * @swagger
 * /updates/release:
 *   post:
 *     summary: Publicar nova versão (admin)
 *     tags: [Updates]
 *     security:
 *       - bearerAuth: []
 */
router.post('/release', authenticateToken, requireRole(['ADMIN']), (req, res) => {
  try {
    const { version, downloadUrl, changelog, size, mandatory, minVersion } = req.body;
    
    if (!version || !downloadUrl) {
      return res.status(400).json({ error: 'Versão e URL de download são obrigatórios' });
    }
    
    const newRelease = {
      version,
      downloadUrl,
      changelog: changelog || '',
      releaseDate: new Date().toISOString(),
      size: size || 'Desconhecido',
      mandatory: mandatory || false,
      minVersion: minVersion || '0.0.0'
    };
    
    // Criar diretório se não existir
    if (!fs.existsSync(UPDATES_DIR)) {
      fs.mkdirSync(UPDATES_DIR, { recursive: true });
    }
    
    // Salvar info de release
    fs.writeFileSync(releaseInfoPath, JSON.stringify(newRelease, null, 2), 'utf8');
    
    // Atualizar cache
    currentReleaseInfo = newRelease;
    
    console.log(`[Updates] Nova versão publicada: ${version}`);
    
    res.json({
      message: 'Versão publicada com sucesso',
      release: newRelease
    });
  } catch (error) {
    console.error('[Updates] Erro ao publicar versão:', error);
    res.status(500).json({ error: 'Erro ao publicar versão' });
  }
});

/**
 * @swagger
 * /updates/release:
 *   get:
 *     summary: Obter info da release atual (admin)
 *     tags: [Updates]
 *     security:
 *       - bearerAuth: []
 */
router.get('/release', authenticateToken, requireRole(['ADMIN']), (req, res) => {
  res.json(currentReleaseInfo);
});

module.exports = router;

