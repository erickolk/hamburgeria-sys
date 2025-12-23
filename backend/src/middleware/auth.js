const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// TEMPORÁRIO: Autenticação desabilitada para testes sem Docker
// TODO: Reabilitar autenticação quando necessário
const AUTH_DISABLED = true;

const authenticateToken = async (req, res, next) => {
  // Se autenticação está desabilitada, tentar obter ou criar usuário padrão
  if (AUTH_DISABLED) {
    try {
      // Tentar buscar usuário padrão
      let user = await prisma.user.findFirst({
        where: { email: 'teste@mercadinho.com' },
        select: { id: true, name: true, email: true, role: true }
      });

      // Se não existir, criar um usuário padrão (sem senha válida)
      if (!user) {
        const bcrypt = require('bcryptjs');
        user = await prisma.user.create({
          data: {
            name: 'Usuário Teste',
            email: 'teste@mercadinho.com',
            passwordHash: await bcrypt.hash('temp', 10),
            role: 'ADMIN'
          },
          select: { id: true, name: true, email: true, role: true }
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      // Se falhar (banco não disponível), usar mock
      console.warn('Não foi possível obter usuário do banco, usando mock:', error.message);
      req.user = {
        id: 'temp-user-id',
        name: 'Usuário Teste',
        email: 'teste@mercadinho.com',
        role: 'ADMIN'
      };
      return next();
    }
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário no banco para verificar se ainda existe
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(403).json({ error: 'Token inválido' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    // Se autenticação está desabilitada, sempre permitir
    if (AUTH_DISABLED) {
      return next();
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permissão insuficiente' });
    }

    next();
  };
};

// Helper para criar logs de auditoria (ignora erros quando auth está desabilitada)
const createAuditLog = async (prisma, userId, action, entity, entityId, details) => {
  if (AUTH_DISABLED) {
    // Quando auth está desabilitada, não criar logs (evita erro de foreign key)
    return;
  }
  
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details
      }
    });
  } catch (error) {
    // Ignorar erros de log de auditoria em modo de desenvolvimento
    console.warn('Erro ao criar log de auditoria:', error.message);
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  createAuditLog
};