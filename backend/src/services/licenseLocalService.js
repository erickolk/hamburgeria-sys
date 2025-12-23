/**
 * License Local Service
 * Gerencia a licença no sistema local do cliente
 */

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Constantes
const GRACE_PERIOD_DAYS = 15;
const JWT_LICENSE_SECRET = process.env.JWT_LICENSE_SECRET || process.env.JWT_SECRET || 'license-secret-key';
const VPS_API_URL = process.env.VPS_API_URL || 'https://evomercearia-backend.d3vbpv.easypanel.host';

/**
 * Calcula o status local baseado na data de expiração do token
 */
const calculateLocalStatus = (tokenExpiry, graceDays = 0) => {
  const now = new Date();
  const expiryDate = new Date(tokenExpiry);
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 5) {
    return { status: 'active', daysRemaining: diffDays, message: 'Licença ativa' };
  } else if (diffDays > 0) {
    return { status: 'warning', daysRemaining: diffDays, message: `Licença vence em ${diffDays} dia(s)` };
  } else if (graceDays < 5) {
    const daysUntilBlock = GRACE_PERIOD_DAYS - graceDays;
    return { status: 'warning', daysRemaining: 0, graceDays, daysUntilBlock, message: `Licença vencida - regularize em ${daysUntilBlock} dia(s)` };
  } else if (graceDays < GRACE_PERIOD_DAYS) {
    const daysUntilBlock = GRACE_PERIOD_DAYS - graceDays;
    return { status: 'critical', daysRemaining: 0, graceDays, daysUntilBlock, message: `ATENÇÃO: Sistema será bloqueado em ${daysUntilBlock} dia(s)` };
  } else {
    return { status: 'blocked', daysRemaining: 0, graceDays, message: 'Sistema bloqueado - entre em contato com o suporte' };
  }
};

/**
 * Verifica se há uma licença local ativada
 */
const hasLicense = async () => {
  try {
    const license = await prisma.licenseLocal.findUnique({
      where: { id: 'local' }
    });
    return !!license;
  } catch (error) {
    console.error('Erro ao verificar licença local:', error);
    return false;
  }
};

/**
 * Obtém a licença local
 */
const getLicense = async () => {
  try {
    return await prisma.licenseLocal.findUnique({
      where: { id: 'local' }
    });
  } catch (error) {
    console.error('Erro ao obter licença local:', error);
    return null;
  }
};

/**
 * Obtém o status atual da licença
 */
const getStatus = async () => {
  const license = await getLicense();

  if (!license) {
    return {
      activated: false,
      status: 'not_activated',
      message: 'Sistema não ativado - insira sua chave de licença'
    };
  }

  // Calcular status baseado na expiração do token
  const statusInfo = calculateLocalStatus(license.tokenExpiry, license.graceDays);

  return {
    activated: true,
    licenseKey: license.licenseKey,
    companyName: license.companyName,
    cnpj: license.cnpj,
    tokenExpiry: license.tokenExpiry,
    lastVerified: license.lastVerified,
    ...statusInfo
  };
};

/**
 * Ativa a licença no sistema local
 */
const activate = async (licenseKey) => {
  try {
    // Chamar API do VPS para validar
    const response = await fetch(`${VPS_API_URL}/licenses/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey })
    });

    const data = await response.json();

    if (!response.ok || !data.valid) {
      return {
        success: false,
        error: data.error || 'Chave de licença inválida'
      };
    }

    // Decodificar token para obter data de expiração
    let tokenExpiry;
    try {
      const decoded = jwt.decode(data.token);
      tokenExpiry = new Date(decoded.exp * 1000);
    } catch (e) {
      // Se não conseguir decodificar, usar 30 dias
      tokenExpiry = new Date();
      tokenExpiry.setDate(tokenExpiry.getDate() + 30);
    }

    // Salvar licença localmente
    const license = await prisma.licenseLocal.upsert({
      where: { id: 'local' },
      update: {
        licenseKey,
        companyName: data.license.companyName,
        cnpj: data.license.cnpj,
        token: data.token,
        tokenExpiry,
        lastVerified: new Date(),
        status: data.status || 'active',
        graceDays: data.graceDays || 0
      },
      create: {
        id: 'local',
        licenseKey,
        companyName: data.license.companyName,
        cnpj: data.license.cnpj,
        token: data.token,
        tokenExpiry,
        lastVerified: new Date(),
        status: data.status || 'active',
        graceDays: data.graceDays || 0
      }
    });

    return {
      success: true,
      license: {
        companyName: license.companyName,
        cnpj: license.cnpj,
        status: data.status,
        daysRemaining: data.daysRemaining
      }
    };
  } catch (error) {
    console.error('Erro ao ativar licença:', error);
    return {
      success: false,
      error: 'Erro de conexão - verifique sua internet e tente novamente'
    };
  }
};

/**
 * Tenta renovar o token com o VPS
 */
const renewToken = async () => {
  const license = await getLicense();

  if (!license) {
    return { success: false, error: 'Nenhuma licença ativada' };
  }

  try {
    const response = await fetch(`${VPS_API_URL}/licenses/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: license.licenseKey })
    });

    const data = await response.json();

    if (!response.ok || !data.valid) {
      // Atualizar status de grace period
      const currentGraceDays = license.graceDays + 1;
      await prisma.licenseLocal.update({
        where: { id: 'local' },
        data: {
          graceDays: currentGraceDays,
          status: currentGraceDays >= GRACE_PERIOD_DAYS ? 'blocked' : 
                  currentGraceDays >= 5 ? 'critical' : 'warning'
        }
      });

      return {
        success: false,
        error: data.error || 'Não foi possível renovar a licença',
        graceDays: currentGraceDays
      };
    }

    // Renovação bem sucedida
    let tokenExpiry;
    try {
      const decoded = jwt.decode(data.token);
      tokenExpiry = new Date(decoded.exp * 1000);
    } catch (e) {
      tokenExpiry = new Date();
      tokenExpiry.setDate(tokenExpiry.getDate() + 30);
    }

    await prisma.licenseLocal.update({
      where: { id: 'local' },
      data: {
        token: data.token,
        tokenExpiry,
        lastVerified: new Date(),
        status: data.status || 'active',
        graceDays: 0 // Reset grace days
      }
    });

    return {
      success: true,
      status: data.status,
      daysRemaining: data.daysRemaining
    };
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    // Não incrementar grace days em caso de erro de rede
    return {
      success: false,
      error: 'Erro de conexão - o sistema continuará funcionando offline',
      offline: true
    };
  }
};

/**
 * Verifica se a licença permite operação
 * Considera token local e grace period
 */
const canOperate = async () => {
  const license = await getLicense();

  if (!license) {
    return { allowed: false, reason: 'not_activated' };
  }

  const now = new Date();
  const tokenExpiry = new Date(license.tokenExpiry);

  // Token ainda válido
  if (tokenExpiry > now) {
    return { allowed: true, status: 'active' };
  }

  // Token expirado - verificar grace period
  if (license.graceDays < GRACE_PERIOD_DAYS) {
    return {
      allowed: true,
      status: license.graceDays >= 5 ? 'critical' : 'warning',
      graceDays: license.graceDays,
      daysUntilBlock: GRACE_PERIOD_DAYS - license.graceDays
    };
  }

  // Grace period excedido
  return {
    allowed: false,
    reason: 'blocked',
    graceDays: license.graceDays
  };
};

/**
 * Verifica o token localmente (sem chamar VPS)
 */
const verifyTokenLocally = async () => {
  const license = await getLicense();

  if (!license || !license.token) {
    return { valid: false };
  }

  try {
    const decoded = jwt.verify(license.token, JWT_LICENSE_SECRET);
    return {
      valid: true,
      decoded,
      license: {
        companyName: license.companyName,
        cnpj: license.cnpj
      }
    };
  } catch (error) {
    // Token expirado ou inválido - mas ainda pode funcionar no grace period
    return {
      valid: false,
      expired: error.name === 'TokenExpiredError'
    };
  }
};

/**
 * Remove a licença local (para reativação)
 */
const deactivate = async () => {
  try {
    await prisma.licenseLocal.delete({
      where: { id: 'local' }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  hasLicense,
  getLicense,
  getStatus,
  activate,
  renewToken,
  canOperate,
  verifyTokenLocally,
  deactivate,
  calculateLocalStatus,
  GRACE_PERIOD_DAYS
};

