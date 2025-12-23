/**
 * Middleware de Verificação de Licença
 * Verifica se o sistema está licenciado antes de processar requests
 */

const licenseLocalService = require('../services/licenseLocalService');

// Rotas que NÃO precisam de verificação de licença
const EXEMPT_ROUTES = [
  '/health',
  '/license',
  '/auth/login',
  '/api-docs'
];

// Rotas que funcionam em modo leitura (quando bloqueado)
const READ_ONLY_ROUTES = [
  '/reports',
  '/products',
  '/customers',
  '/suppliers',
  '/settings'
];

/**
 * Middleware principal de verificação de licença
 */
const checkLicense = async (req, res, next) => {
  // Verificar se a rota está isenta
  const path = req.path.toLowerCase();
  
  if (EXEMPT_ROUTES.some(route => path.startsWith(route))) {
    return next();
  }

  try {
    const operationResult = await licenseLocalService.canOperate();

    if (operationResult.allowed) {
      // Adicionar info de licença ao request para uso posterior
      req.licenseStatus = operationResult.status;
      req.licenseGraceDays = operationResult.graceDays || 0;
      req.licenseDaysUntilBlock = operationResult.daysUntilBlock || null;
      
      // Adicionar header com status da licença
      res.setHeader('X-License-Status', operationResult.status);
      if (operationResult.daysUntilBlock) {
        res.setHeader('X-License-Days-Until-Block', operationResult.daysUntilBlock);
      }
      
      return next();
    }

    // Sistema não ativado
    if (operationResult.reason === 'not_activated') {
      return res.status(403).json({
        error: 'Sistema não ativado',
        code: 'LICENSE_NOT_ACTIVATED',
        message: 'Ative sua licença para usar o sistema'
      });
    }

    // Sistema bloqueado - verificar se é rota de leitura
    if (operationResult.reason === 'blocked') {
      // Permitir rotas de leitura em modo bloqueado
      if (READ_ONLY_ROUTES.some(route => path.startsWith(route)) && req.method === 'GET') {
        req.licenseStatus = 'blocked';
        req.readOnlyMode = true;
        res.setHeader('X-License-Status', 'blocked');
        res.setHeader('X-Read-Only-Mode', 'true');
        return next();
      }

      return res.status(403).json({
        error: 'Sistema bloqueado',
        code: 'LICENSE_BLOCKED',
        message: 'Licença expirada - entre em contato com o suporte para regularizar',
        graceDays: operationResult.graceDays,
        readOnlyRoutes: READ_ONLY_ROUTES
      });
    }

    // Qualquer outro caso
    return res.status(403).json({
      error: 'Erro de licença',
      code: 'LICENSE_ERROR',
      message: 'Erro ao verificar licença'
    });

  } catch (error) {
    console.error('Erro no middleware de licença:', error);
    // Em caso de erro, permitir operação (fail-open para não travar o sistema)
    req.licenseStatus = 'error';
    return next();
  }
};

/**
 * Middleware que bloqueia operações de escrita em modo leitura
 */
const blockWriteInReadOnly = (req, res, next) => {
  if (req.readOnlyMode && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    return res.status(403).json({
      error: 'Operação não permitida',
      code: 'READ_ONLY_MODE',
      message: 'Sistema em modo leitura - apenas consultas são permitidas'
    });
  }
  next();
};

/**
 * Middleware opcional - só avisa mas não bloqueia
 */
const warnLicense = async (req, res, next) => {
  try {
    const status = await licenseLocalService.getStatus();
    
    if (status.status === 'warning' || status.status === 'critical') {
      res.setHeader('X-License-Warning', status.message);
    }
  } catch (error) {
    // Ignorar erros
  }
  next();
};

module.exports = {
  checkLicense,
  blockWriteInReadOnly,
  warnLicense,
  EXEMPT_ROUTES,
  READ_ONLY_ROUTES
};

