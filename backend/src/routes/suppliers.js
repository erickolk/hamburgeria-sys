const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { validate, schemas } = require('../utils/validation');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Importar cacheService de forma segura (opcional)
let cacheService;
try {
  cacheService = require('../services/cacheService');
} catch (error) {
  console.warn('Cache service não disponível, continuando sem cache:', error.message);
  // Criar um mock do cacheService que não faz nada
  cacheService = {
    get: () => null,
    set: () => true,
    del: () => 0,
    flush: () => true,
    generateKey: (prefix, params) => `${prefix}:${JSON.stringify(params)}`
  };
}

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

// Listar fornecedores com filtros avançados
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      page = 1, 
      limit = 20, 
      isActive,
      city,
      state,
      sort = 'name',
      direction = 'asc'
    } = req.query;
    const pageNumber = Math.max(parseInt(page), 1);
    const limitNumber = Math.max(parseInt(limit), 1);
    const skip = (pageNumber - 1) * limitNumber;
    const orderingDirection = ['asc', 'desc'].includes(String(direction).toLowerCase())
      ? String(direction).toLowerCase()
      : 'asc';
    
    let where = {};
    
    // Busca textual
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { legalName: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { cnpj: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Filtros específicos
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    if (city) {
      where.addressCity = { contains: city, mode: 'insensitive' };
    }
    
    if (state) {
      where.addressState = state.toUpperCase();
    }

    const orderBy = {};
    orderBy[sort] = orderingDirection;

    const cacheKey = cacheService.generateKey('suppliers:list', {
      search,
      page: pageNumber,
      limit: limitNumber,
      isActive,
      city,
      state,
      sort,
      direction: orderingDirection
    });

    // Tentar usar cache (opcional)
    let cachedResponse = null;
    try {
      cachedResponse = cacheService.get(cacheKey, 'listing');
      if (cachedResponse) {
        return res.json(cachedResponse);
      }
    } catch (cacheError) {
      console.warn('Erro ao acessar cache (ignorado):', cacheError.message);
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        orderBy: [orderBy, { name: 'asc' }], // Ordenação secundária por nome
        skip,
        take: limitNumber
      }),
      prisma.supplier.count({ where })
    ]);

    const responsePayload = {
      suppliers,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber)
      }
    };

    // Tentar salvar no cache (opcional)
    try {
      cacheService.set(cacheKey, responsePayload, 'listing');
    } catch (cacheError) {
      console.warn('Erro ao salvar no cache (ignorado):', cacheError.message);
    }

    res.json(responsePayload);
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Exportar fornecedores em CSV
router.get('/export', async (req, res) => {
  try {
    const { search, isActive, city, state } = req.query;
    
    let where = {};
    
    // Busca textual
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { legalName: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { cnpj: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Filtros específicos
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    if (city) {
      where.addressCity = { contains: city, mode: 'insensitive' };
    }
    
    if (state) {
      where.addressState = state.toUpperCase();
    }

    const cacheKey = cacheService.generateKey('suppliers:export', {
      search,
      isActive,
      city,
      state
    });

    const cachedCsv = cacheService.get(cacheKey, 'listing');
    if (cachedCsv) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="fornecedores_${new Date().toISOString().split('T')[0]}.csv"`);
      return res.send(cachedCsv);
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    // Gerar CSV
    const csv = convertSuppliersToCSV(suppliers);
    cacheService.set(cacheKey, csv, 'listing');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="fornecedores_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Erro ao exportar fornecedores:', error);
    res.status(500).json({ error: 'Erro ao exportar fornecedores' });
  }
});

// Obter fornecedor por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const cacheKey = `supplier:${id}`;
    const cachedSupplier = cacheService.get(cacheKey);
    if (cachedSupplier) {
      return res.json(cachedSupplier);
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            stockQuantity: true
          }
        },
        purchases: {
          take: 10,
          orderBy: { date: 'desc' },
          select: {
            id: true,
            total: true,
            date: true,
            status: true
          }
        }
      }
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    cacheService.set(cacheKey, supplier);
    res.json(supplier);
  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar fornecedor
router.post('/', 
  requireRole(['ADMIN', 'MANAGER']), 
  validate(schemas.supplier), 
  async (req, res) => {
    try {
      console.log('[POST /suppliers] Dados recebidos:', JSON.stringify(req.body, null, 2));
      
      const supplier = await prisma.supplier.create({
        data: req.body
      });

      try {
        cacheService.flush('listing');
      } catch (cacheError) {
        console.warn('Erro ao limpar cache (ignorado):', cacheError.message);
      }

      res.status(201).json(supplier);
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
      console.error('Stack:', error.stack);
      
      const errorMessage = process.env.NODE_ENV === 'production' 
        ? 'Erro interno do servidor' 
        : error.message;
      
      res.status(500).json({ 
        error: errorMessage,
        details: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      });
    }
  }
);

// Atualizar fornecedor
router.put('/:id', 
  requireRole(['ADMIN', 'MANAGER']), 
  validate(schemas.supplier), 
  async (req, res) => {
    try {
      const { id } = req.params;

      const supplier = await prisma.supplier.update({
        where: { id },
        data: req.body
      });

      cacheService.del(`supplier:${id}`);
      cacheService.flush('listing');
      res.json(supplier);
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Fornecedor não encontrado' });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

// Excluir fornecedor
router.delete('/:id', requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se fornecedor tem produtos
    const productsCount = await prisma.product.count({
      where: { supplierId: id }
    });

    if (productsCount > 0) {
      return res.status(400).json({ 
        error: 'Fornecedor não pode ser excluído pois possui produtos associados' 
      });
    }

    await prisma.supplier.delete({
      where: { id }
    });

    cacheService.del(`supplier:${id}`);
    cacheService.flush('listing');
    res.json({ success: true, message: 'Fornecedor excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir fornecedor:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Toggle status do fornecedor
router.put('/:id/toggle-status', 
  requireRole(['ADMIN', 'MANAGER']), 
  async (req, res) => {
    try {
      const { id } = req.params;

      const supplier = await prisma.supplier.findUnique({
        where: { id },
        select: { isActive: true }
      });

      if (!supplier) {
        return res.status(404).json({ error: 'Fornecedor não encontrado' });
      }

      const updatedSupplier = await prisma.supplier.update({
        where: { id },
        data: { isActive: !supplier.isActive }
      });

      cacheService.del(`supplier:${id}`);
      cacheService.flush('listing');
      res.json(updatedSupplier);
    } catch (error) {
      console.error('Erro ao alterar status do fornecedor:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

// Validar CNPJ via webservice
router.post('/validate-cnpj', async (req, res) => {
  try {
    const { cnpj } = req.body;
    
    if (!cnpj) {
      return res.status(400).json({ error: 'CNPJ é obrigatório' });
    }

    const documentService = require('../services/documentValidation');
    const result = await documentService.validateCNPJ(cnpj);
    
    res.json(result);
  } catch (error) {
    console.error('Erro ao validar CNPJ:', error);
    res.status(500).json({ error: 'Erro ao validar CNPJ' });
  }
});

// Estatísticas do cache de validação
router.get('/validation-cache-stats', requireRole(['ADMIN']), async (req, res) => {
  try {
    const documentService = require('../services/documentValidation');
    const stats = documentService.getCacheStats();
    
    res.json(stats);
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
});

// Função auxiliar para converter fornecedores para CSV
function convertSuppliersToCSV(suppliers) {
  const headers = [
    'Nome Fantasia', 'Razão Social', 'CNPJ', 'Inscrição Estadual',
    'Pessoa de Contato', 'Telefone', 'Email', 'Endereço',
    'Número', 'Complemento', 'Bairro', 'Cidade', 'Estado', 'CEP',
    'Condições de Pagamento', 'Status'
  ];
  
  const rows = suppliers.map(supplier => [
    supplier.name || '',
    supplier.legalName || '',
    supplier.cnpj || '',
    supplier.stateRegistration || '',
    supplier.contact || '',
    supplier.phone || '',
    supplier.email || '',
    supplier.addressStreet || '',
    supplier.addressNumber || '',
    supplier.addressComplement || '',
    supplier.addressNeighborhood || '',
    supplier.addressCity || '',
    supplier.addressState || '',
    supplier.addressZipCode || '',
    supplier.paymentTerms || '',
    supplier.isActive ? 'Ativo' : 'Inativo'
  ]);
  
  return [headers, ...rows].map(row => 
    row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
}

module.exports = router;