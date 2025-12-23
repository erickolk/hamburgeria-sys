/**
 * License Service - VPS
 * Gerencia licenças no servidor central
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Constantes
const LICENSE_TOKEN_EXPIRY_DAYS = 30;
const GRACE_PERIOD_DAYS = 15;
const JWT_LICENSE_SECRET = process.env.JWT_LICENSE_SECRET || process.env.JWT_SECRET || 'license-secret-key';

/**
 * Gera uma chave de licença única
 */
const generateLicenseKey = () => {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    segments.push(crypto.randomBytes(2).toString('hex').toUpperCase());
  }
  return segments.join('-'); // Formato: XXXX-XXXX-XXXX-XXXX
};

/**
 * Gera um token JWT de licença
 */
const generateLicenseToken = (license) => {
  const payload = {
    licenseKey: license.licenseKey,
    cnpj: license.cnpj,
    companyName: license.companyName,
    plan: license.plan,
    maxUsers: license.maxUsers,
    validUntil: license.validUntil.toISOString(),
    issuedAt: new Date().toISOString()
  };

  return jwt.sign(payload, JWT_LICENSE_SECRET, {
    expiresIn: `${LICENSE_TOKEN_EXPIRY_DAYS}d`
  });
};

/**
 * Verifica um token de licença
 */
const verifyLicenseToken = (token) => {
  try {
    return jwt.verify(token, JWT_LICENSE_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Calcula o status da licença baseado na data de validade
 */
const calculateLicenseStatus = (validUntil) => {
  const now = new Date();
  const expiryDate = new Date(validUntil);
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 5) {
    return { status: 'active', daysRemaining: diffDays, graceDays: 0 };
  } else if (diffDays > 0) {
    return { status: 'warning', daysRemaining: diffDays, graceDays: 0 };
  } else if (diffDays > -GRACE_PERIOD_DAYS) {
    const graceDays = Math.abs(diffDays);
    const daysUntilBlock = GRACE_PERIOD_DAYS - graceDays;
    if (graceDays <= 5) {
      return { status: 'warning', daysRemaining: 0, graceDays, daysUntilBlock };
    } else {
      return { status: 'critical', daysRemaining: 0, graceDays, daysUntilBlock };
    }
  } else {
    return { status: 'blocked', daysRemaining: 0, graceDays: Math.abs(diffDays) };
  }
};

/**
 * Cria uma nova licença
 */
const createLicense = async (data) => {
  const { cnpj, companyName, email, phone, plan = 'basic', validMonths = 1, maxUsers = 5, notes } = data;

  // Calcular data de validade
  const validUntil = new Date();
  validUntil.setMonth(validUntil.getMonth() + validMonths);

  const license = await prisma.license.create({
    data: {
      licenseKey: generateLicenseKey(),
      cnpj,
      companyName,
      email,
      phone,
      plan,
      validUntil,
      maxUsers,
      notes,
      status: 'ACTIVE'
    }
  });

  return license;
};

/**
 * Busca uma licença pela chave
 */
const findByKey = async (licenseKey) => {
  return prisma.license.findUnique({
    where: { licenseKey }
  });
};

/**
 * Busca uma licença pelo CNPJ
 */
const findByCnpj = async (cnpj) => {
  return prisma.license.findUnique({
    where: { cnpj }
  });
};

/**
 * Valida uma licença e retorna token se válida
 */
const verifyLicense = async (licenseKey) => {
  const license = await findByKey(licenseKey);

  if (!license) {
    return { valid: false, error: 'Licença não encontrada' };
  }

  if (license.status === 'CANCELLED') {
    return { valid: false, error: 'Licença cancelada' };
  }

  // Atualizar último check-in
  await prisma.license.update({
    where: { id: license.id },
    data: { lastCheckIn: new Date() }
  });

  // Calcular status
  const statusInfo = calculateLicenseStatus(license.validUntil);

  // Se bloqueado permanentemente (além do grace period)
  if (statusInfo.status === 'blocked' && license.status !== 'TRIAL') {
    return {
      valid: false,
      error: 'Licença expirada - período de tolerância excedido',
      status: 'blocked',
      graceDays: statusInfo.graceDays
    };
  }

  // Gerar token
  const token = generateLicenseToken(license);

  return {
    valid: true,
    token,
    license: {
      companyName: license.companyName,
      cnpj: license.cnpj,
      plan: license.plan,
      maxUsers: license.maxUsers,
      validUntil: license.validUntil
    },
    status: statusInfo.status,
    daysRemaining: statusInfo.daysRemaining,
    graceDays: statusInfo.graceDays,
    daysUntilBlock: statusInfo.daysUntilBlock || 0
  };
};

/**
 * Renova uma licença (adiciona tempo)
 */
const renewLicense = async (licenseKey, months = 1) => {
  const license = await findByKey(licenseKey);

  if (!license) {
    return { success: false, error: 'Licença não encontrada' };
  }

  // Calcular nova data de validade
  const currentExpiry = new Date(license.validUntil);
  const now = new Date();
  const baseDate = currentExpiry > now ? currentExpiry : now;
  const newValidUntil = new Date(baseDate);
  newValidUntil.setMonth(newValidUntil.getMonth() + months);

  const updated = await prisma.license.update({
    where: { id: license.id },
    data: {
      validUntil: newValidUntil,
      status: 'ACTIVE'
    }
  });

  return {
    success: true,
    license: updated,
    newValidUntil
  };
};

/**
 * Suspende uma licença
 */
const suspendLicense = async (licenseKey, reason) => {
  const license = await findByKey(licenseKey);

  if (!license) {
    return { success: false, error: 'Licença não encontrada' };
  }

  const updated = await prisma.license.update({
    where: { id: license.id },
    data: {
      status: 'SUSPENDED',
      notes: license.notes ? `${license.notes}\n[SUSPENSO] ${reason}` : `[SUSPENSO] ${reason}`
    }
  });

  return { success: true, license: updated };
};

/**
 * Reativa uma licença suspensa
 */
const reactivateLicense = async (licenseKey) => {
  const license = await findByKey(licenseKey);

  if (!license) {
    return { success: false, error: 'Licença não encontrada' };
  }

  if (license.status === 'CANCELLED') {
    return { success: false, error: 'Licença cancelada não pode ser reativada' };
  }

  const updated = await prisma.license.update({
    where: { id: license.id },
    data: { status: 'ACTIVE' }
  });

  return { success: true, license: updated };
};

/**
 * Lista todas as licenças
 */
const listLicenses = async (filters = {}) => {
  const where = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where.OR = [
      { companyName: { contains: filters.search, mode: 'insensitive' } },
      { cnpj: { contains: filters.search } },
      { licenseKey: { contains: filters.search, mode: 'insensitive' } }
    ];
  }

  return prisma.license.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
};

/**
 * Atualiza uma licença
 */
const updateLicense = async (id, data) => {
  return prisma.license.update({
    where: { id },
    data
  });
};

module.exports = {
  generateLicenseKey,
  generateLicenseToken,
  verifyLicenseToken,
  calculateLicenseStatus,
  createLicense,
  findByKey,
  findByCnpj,
  verifyLicense,
  renewLicense,
  suspendLicense,
  reactivateLicense,
  listLicenses,
  updateLicense,
  GRACE_PERIOD_DAYS,
  LICENSE_TOKEN_EXPIRY_DAYS
};

