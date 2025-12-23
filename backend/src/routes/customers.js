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

// Listar clientes com filtros avançados
router.get('/', async (req, res) => {
  try {
    console.log('[GET /customers] Query params:', req.query);
    
    const { 
      search, 
      page = 1, 
      limit = 20, 
      isActive,
      documentType,
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
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { document: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Filtros específicos
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    if (documentType) {
      where.documentType = documentType;
    }
    
    if (city) {
      where.addressCity = { contains: city, mode: 'insensitive' };
    }
    
    if (state) {
      where.addressState = state.toUpperCase();
    }

    // Validar campo de ordenação para evitar erros
    const validSortFields = ['name', 'email', 'phone', 'document', 'createdAt', 'updatedAt', 'isActive'];
    const sortField = validSortFields.includes(sort) ? sort : 'name';
    
    const orderBy = {};
    orderBy[sortField] = orderingDirection;
    
    console.log('[GET /customers] Where clause:', JSON.stringify(where, null, 2));
    console.log('[GET /customers] OrderBy:', JSON.stringify(orderBy, null, 2));

    // Tentar usar cache (opcional)
    let cachedResponse = null;
    try {
      const cacheKey = cacheService.generateKey('customers:list', {
        search,
        page: pageNumber,
        limit: limitNumber,
        isActive,
        documentType,
        city,
        state,
        sort,
        direction: orderingDirection
      });
      cachedResponse = cacheService.get(cacheKey, 'listing');
      if (cachedResponse) {
        return res.json(cachedResponse);
      }
    } catch (cacheError) {
      console.warn('Erro ao acessar cache (ignorado):', cacheError.message);
    }

    console.log('[GET /customers] Executando query Prisma...');
    
    let customers, total;
    try {
      [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where,
          orderBy: [orderBy, { name: 'asc' }], // Ordenação secundária por nome
          skip,
          take: limitNumber
        }),
        prisma.customer.count({ where })
      ]);
      console.log(`[GET /customers] Query executada com sucesso. Encontrados ${customers.length} clientes de ${total} total`);
    } catch (prismaError) {
      console.error('[GET /customers] Erro no Prisma:', prismaError);
      console.error('[GET /customers] Stack:', prismaError.stack);
      throw prismaError; // Re-throw para ser capturado pelo catch externo
    }

    const responsePayload = {
      customers,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber)
      }
    };

    // Tentar salvar no cache (opcional)
    try {
      const cacheKey = cacheService.generateKey('customers:list', {
        search,
        page: pageNumber,
        limit: limitNumber,
        isActive,
        documentType,
        city,
        state,
        sort,
        direction: orderingDirection
      });
      cacheService.set(cacheKey, responsePayload, 'listing');
    } catch (cacheError) {
      console.warn('Erro ao salvar no cache (ignorado):', cacheError.message);
    }

    res.json(responsePayload);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Obter cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const cacheKey = `customer:${id}`;
    const cachedCustomer = cacheService.get(cacheKey);
    if (cachedCustomer) {
      return res.json(cachedCustomer);
    }

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        sales: {
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

    if (!customer) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    cacheService.set(cacheKey, customer);
    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar cliente
router.post('/', validate(schemas.customer), async (req, res) => {
  try {
    console.log('[POST /customers] Dados recebidos:', JSON.stringify(req.body, null, 2));
    
    const customer = await prisma.customer.create({
      data: req.body
    });

    try {
      cacheService.flush('listing');
    } catch (cacheError) {
      console.warn('Erro ao limpar cache (ignorado):', cacheError.message);
    }

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    console.error('Stack:', error.stack);
    
    // Retornar mensagem de erro mais detalhada em desenvolvimento
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : error.message;
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

// Atualizar cliente
router.put('/:id', validate(schemas.customer), async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.update({
      where: { id },
      data: req.body
    });

    cacheService.del(`customer:${id}`);
    cacheService.flush('listing');
    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir cliente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se cliente tem vendas
    const salesCount = await prisma.sale.count({
      where: { customerId: id }
    });

    if (salesCount > 0) {
      return res.status(400).json({ 
        error: 'Cliente não pode ser excluído pois possui vendas associadas' 
      });
    }

    await prisma.customer.delete({
      where: { id }
    });

    cacheService.del(`customer:${id}`);
    cacheService.flush('listing');
    res.json({ success: true, message: 'Cliente excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Toggle status do cliente
router.put('/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      select: { isActive: true }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: { isActive: !customer.isActive }
    });

    cacheService.del(`customer:${id}`);
    cacheService.flush('listing');
    res.json({ success: true, data: updatedCustomer });
  } catch (error) {
    console.error('Erro ao alterar status do cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar endereço por CEP
router.get('/cep/:cep', async (req, res) => {
  try {
    const { cep } = req.params;
    
    // Remover caracteres não numéricos do CEP
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      return res.status(400).json({ error: 'CEP deve ter 8 dígitos' });
    }

    // Buscar CEP na API ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();

    if (data.erro) {
      return res.status(404).json({ error: 'CEP não encontrado' });
    }

    // Formatar resposta
    const address = {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      zipCode: `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`,
      country: 'Brasil'
    };

    res.json({ success: true, data: address });
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    res.status(500).json({ error: 'Erro ao buscar CEP' });
  }
});

// Validar CPF via webservice
router.post('/validate-cpf', async (req, res) => {
  try {
    const { cpf } = req.body;
    
    if (!cpf) {
      return res.status(400).json({ error: 'CPF é obrigatório' });
    }

    const documentService = require('../services/documentValidation');
    const result = await documentService.validateCPF(cpf);
    
    res.json(result);
  } catch (error) {
    console.error('Erro ao validar CPF:', error);
    res.status(500).json({ error: 'Erro ao validar CPF' });
  }
});

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

module.exports = router;