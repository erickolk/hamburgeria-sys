const { schemas } = require('../src/utils/validation');

describe('Customer Validation', () => {
  test('deve validar cliente com dados completos corretamente', () => {
    const validCustomer = {
      name: 'João Silva Santos',
      phone: '(11) 98765-4321',
      email: 'joao.silva@email.com',
      document: '123.456.789-09',
      documentType: 'CPF',
      isActive: true,
      note: 'Cliente VIP',
      addressStreet: 'Rua das Flores',
      addressNumber: '123',
      addressComplement: 'Apto 45',
      addressNeighborhood: 'Centro',
      addressCity: 'São Paulo',
      addressState: 'SP',
      addressZipCode: '01234-567',
      addressCountry: 'Brasil'
    };
    
    const { error } = schemas.customer.validate(validCustomer);
    expect(error).toBeUndefined();
  });

  test('deve validar CPF corretamente', () => {
    const validCPF = {
      name: 'João Silva',
      document: '123.456.789-09',
      documentType: 'CPF'
    };
    
    const { error } = schemas.customer.validate(validCPF);
    expect(error).toBeUndefined();
  });
  
  test('deve rejeitar CPF inválido', () => {
    const invalidCPF = {
      name: 'João Silva',
      document: '123.456.789-00',
      documentType: 'CPF'
    };
    
    const { error } = schemas.customer.validate(invalidCPF);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('CPF deve estar no formato');
  });

  test('deve validar CNPJ corretamente', () => {
    const validCNPJ = {
      name: 'Empresa XYZ',
      document: '12.345.678/0001-90',
      documentType: 'CNPJ'
    };
    
    const { error } = schemas.customer.validate(validCNPJ);
    expect(error).toBeUndefined();
  });
  
  test('deve rejeitar CNPJ inválido', () => {
    const invalidCNPJ = {
      name: 'Empresa XYZ',
      document: '12.345.678/0001-9',
      documentType: 'CNPJ'
    };
    
    const { error } = schemas.customer.validate(invalidCNPJ);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('CNPJ deve estar no formato');
  });

  test('deve validar telefone corretamente', () => {
    const validPhone = {
      name: 'João Silva',
      phone: '(11) 98765-4321'
    };
    
    const { error } = schemas.customer.validate(validPhone);
    expect(error).toBeUndefined();
  });
  
  test('deve rejeitar telefone inválido', () => {
    const invalidPhone = {
      name: 'João Silva',
      phone: '11987654321'
    };
    
    const { error } = schemas.customer.validate(invalidPhone);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('Telefone deve estar no formato');
  });

  test('deve validar CEP corretamente', () => {
    const validCEP = {
      name: 'João Silva',
      addressZipCode: '01234-567'
    };
    
    const { error } = schemas.customer.validate(validCEP);
    expect(error).toBeUndefined();
  });
  
  test('deve rejeitar CEP inválido', () => {
    const invalidCEP = {
      name: 'João Silva',
      addressZipCode: '01234567'
    };
    
    const { error } = schemas.customer.validate(invalidCEP);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('CEP deve estar no formato');
  });

  test('deve rejeitar email inválido', () => {
    const invalidEmail = {
      name: 'João Silva',
      email: 'email_invalido'
    };
    
    const { error } = schemas.customer.validate(invalidEmail);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('Email deve ter um formato válido');
  });

  test('deve aplicar valores padrão corretamente', () => {
    const minimalCustomer = {
      name: 'João Silva'
    };
    
    const { error, value } = schemas.customer.validate(minimalCustomer);
    expect(error).toBeUndefined();
    expect(value.documentType).toBe('CPF');
    expect(value.isActive).toBe(true);
    expect(value.addressCountry).toBe('Brasil');
  });
});

describe('Supplier Validation', () => {
  test('deve validar fornecedor com dados completos corretamente', () => {
    const validSupplier = {
      name: 'Fornecedor ABC',
      legalName: 'ABC Comércio de Produtos Ltda',
      contact: 'Maria Souza',
      phone: '(11) 8888-7777',
      email: 'contato@abc.com.br',
      cnpj: '12.345.678/0001-90',
      stateRegistration: '123.456.789.012',
      paymentTerms: '30 dias',
      isActive: true,
      addressStreet: 'Rua Comercial',
      addressNumber: '1000',
      addressComplement: 'Sala 200',
      addressNeighborhood: 'Centro Empresarial',
      addressCity: 'São Paulo',
      addressState: 'SP',
      addressZipCode: '04567-890',
      addressCountry: 'Brasil'
    };
    
    const { error } = schemas.supplier.validate(validSupplier);
    expect(error).toBeUndefined();
  });

  test('deve validar CNPJ corretamente', () => {
    const validCNPJ = {
      name: 'Fornecedor ABC',
      cnpj: '12.345.678/0001-90'
    };
    
    const { error } = schemas.supplier.validate(validCNPJ);
    expect(error).toBeUndefined();
  });
  
  test('deve rejeitar CNPJ inválido', () => {
    const invalidCNPJ = {
      name: 'Fornecedor ABC',
      cnpj: '12.345.678/0001-9'
    };
    
    const { error } = schemas.supplier.validate(invalidCNPJ);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('CNPJ deve estar no formato');
  });

  test('deve aplicar valores padrão corretamente', () => {
    const minimalSupplier = {
      name: 'Fornecedor ABC'
    };
    
    const { error, value } = schemas.supplier.validate(minimalSupplier);
    expect(error).toBeUndefined();
    expect(value.isActive).toBe(true);
    expect(value.addressCountry).toBe('Brasil');
  });
});