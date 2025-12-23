const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });
    if (error) {
      console.error('[validation] Erro de validação:', error.details);
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    req.body = value;
    next();
  };
};

// Schemas de validação
const schemas = {
  // Auth
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'any.required': 'Senha é obrigatória'
    })
  }),

  register: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'any.required': 'Senha é obrigatória'
    }),
    role: Joi.string().valid('ADMIN', 'MANAGER', 'CASHIER').default('CASHIER')
  }),

  // Product
  product: Joi.object({
    sku: Joi.string().required().messages({
      'any.required': 'SKU é obrigatório'
    }),
    name: Joi.string().min(2).max(200).required().messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 200 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
    barcode: Joi.string().optional().allow(''),
    costPrice: Joi.number().positive().required().messages({
      'number.positive': 'Preço de custo deve ser positivo',
      'any.required': 'Preço de custo é obrigatório'
    }),
    salePrice: Joi.number().positive().required().messages({
      'number.positive': 'Preço de venda deve ser positivo',
      'any.required': 'Preço de venda é obrigatório'
    }),
    stockQuantity: Joi.number().min(0).default(0),
    reorderPoint: Joi.number().min(0).default(0),
    saleUnit: Joi.string().valid('UN', 'PC', 'CX', 'DZ', 'KG', 'LT', 'MT', 'OUTRA', 'UNIT', 'L').default('UN'),
    batchTracking: Joi.boolean().default(false),
    category: Joi.string().optional().allow(''),
    categoryId: Joi.string().optional().allow('', null),
    observations: Joi.string().optional().allow('', null),
    supplierId: Joi.string().optional().allow('', null)
  }),

  // Sale
  sale: Joi.object({
    customerId: Joi.string().optional().allow('', null),
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().positive().required(),
        unitPrice: Joi.number().positive().required(),
        discount: Joi.number().min(0).default(0),
        batchNumber: Joi.string().optional().allow('', null)
      })
    ).min(1).required().messages({
      'array.min': 'Pelo menos um item é obrigatório'
    }),
    payments: Joi.array().items(
      Joi.object({
        method: Joi.string().valid('CASH', 'CARD', 'PIX', 'CREDIT').required(),
        amount: Joi.number().positive().required()
      })
    ).min(1).required().messages({
      'array.min': 'Pelo menos uma forma de pagamento é obrigatória'
    }),
    discount: Joi.number().min(0).default(0)
  }),

  // Customer - Validações aprimoradas
  customer: Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 255 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
    phone: Joi.string().pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/).optional().allow('').messages({
      'string.pattern.base': 'Telefone deve estar no formato (XX) XXXXX-XXXX'
    }),
    email: Joi.string().email().optional().allow('').messages({
      'string.email': 'Email deve ter um formato válido'
    }),
    document: Joi.string().when('documentType', {
      is: 'CPF',
      then: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).messages({
        'string.pattern.base': 'CPF deve estar no formato XXX.XXX.XXX-XX'
      }),
      otherwise: Joi.string().pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).messages({
        'string.pattern.base': 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX'
      })
    }),
    documentType: Joi.string().valid('CPF', 'CNPJ').default('CPF'),
    isActive: Joi.boolean().default(true),
    note: Joi.string().max(1000).optional().allow(''),
    
    // Endereço
    addressStreet: Joi.string().max(255).optional().allow(''),
    addressNumber: Joi.string().max(20).optional().allow(''),
    addressComplement: Joi.string().max(100).optional().allow(''),
    addressNeighborhood: Joi.string().max(100).optional().allow(''),
    addressCity: Joi.string().max(100).optional().allow(''),
    addressState: Joi.string().length(2).optional().allow(''),
    addressZipCode: Joi.string().pattern(/^\d{5}-\d{3}$/).optional().allow('').messages({
      'string.pattern.base': 'CEP deve estar no formato XXXXX-XXX'
    }),
    addressCountry: Joi.string().max(50).default('Brasil')
  }),

  // Supplier - Validações aprimoradas
  supplier: Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 255 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
    legalName: Joi.string().max(255).optional().allow(''),
    contact: Joi.string().max(255).optional().allow(''),
    phone: Joi.string().pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/).optional().allow('').messages({
      'string.pattern.base': 'Telefone deve estar no formato (XX) XXXXX-XXXX'
    }),
    email: Joi.string().email().optional().allow('').messages({
      'string.email': 'Email deve ter um formato válido'
    }),
    cnpj: Joi.string().pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).optional().allow('').messages({
      'string.pattern.base': 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX'
    }),
    stateRegistration: Joi.string().max(50).optional().allow(''),
    paymentTerms: Joi.string().max(100).optional().allow(''),
    isActive: Joi.boolean().default(true),
    
    // Endereço
    addressStreet: Joi.string().max(255).optional().allow(''),
    addressNumber: Joi.string().max(20).optional().allow(''),
    addressComplement: Joi.string().max(100).optional().allow(''),
    addressNeighborhood: Joi.string().max(100).optional().allow(''),
    addressCity: Joi.string().max(100).optional().allow(''),
    addressState: Joi.string().length(2).optional().allow(''),
    addressZipCode: Joi.string().pattern(/^\d{5}-\d{3}$/).optional().allow('').messages({
      'string.pattern.base': 'CEP deve estar no formato XXXXX-XXX'
    }),
    addressCountry: Joi.string().max(50).default('Brasil')
  }),

  // Purchase
  purchase: Joi.object({
    supplierId: Joi.string().required().messages({
      'any.required': 'Fornecedor é obrigatório'
    }),
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().positive().required(),
        unitCost: Joi.number().positive().required(),
        batchNumber: Joi.string().optional().allow(''),
        expiryDate: Joi.date().iso().optional().allow('')
      })
    ).min(1).required().messages({
      'array.min': 'Pelo menos um item é obrigatório'
    }),
    status: Joi.string().valid('PENDING', 'COMPLETED', 'CANCELLED').default('COMPLETED')
  })
};

module.exports = {
  validate,
  schemas
};