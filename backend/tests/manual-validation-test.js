const { schemas } = require('../src/utils/validation');

console.log('🧪 Testando Validações de Cliente...\n');

// Teste 1: Cliente válido completo
console.log('✅ Teste 1: Cliente com dados completos');
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

const result1 = schemas.customer.validate(validCustomer);
console.log('Resultado:', result1.error ? '❌ ERRO' : '✅ VÁLIDO');
if (result1.error) {
  console.log('Detalhes:', result1.error.details.map(d => d.message));
}

// Teste 2: CPF válido
console.log('\n✅ Teste 2: CPF válido');
const validCPF = {
  name: 'João Silva',
  document: '123.456.789-09',
  documentType: 'CPF'
};

const result2 = schemas.customer.validate(validCPF);
console.log('Resultado:', result2.error ? '❌ ERRO' : '✅ VÁLIDO');

// Teste 3: CPF inválido
console.log('\n❌ Teste 3: CPF inválido');
const invalidCPF = {
  name: 'João Silva',
  document: '123.456.789-00',
  documentType: 'CPF'
};

const result3 = schemas.customer.validate(invalidCPF);
console.log('Resultado:', result3.error ? '❌ ERRO (esperado)' : '✅ VÁLIDO');
if (result3.error) {
  console.log('Mensagem de erro:', result3.error.details[0].message);
}

// Teste 4: CNPJ válido
console.log('\n✅ Teste 4: CNPJ válido');
const validCNPJ = {
  name: 'Empresa XYZ',
  document: '12.345.678/0001-90',
  documentType: 'CNPJ'
};

const result4 = schemas.customer.validate(validCNPJ);
console.log('Resultado:', result4.error ? '❌ ERRO' : '✅ VÁLIDO');

// Teste 5: Telefone válido
console.log('\n✅ Teste 5: Telefone válido');
const validPhone = {
  name: 'João Silva',
  phone: '(11) 98765-4321'
};

const result5 = schemas.customer.validate(validPhone);
console.log('Resultado:', result5.error ? '❌ ERRO' : '✅ VÁLIDO');

// Teste 6: CEP válido
console.log('\n✅ Teste 6: CEP válido');
const validCEP = {
  name: 'João Silva',
  addressZipCode: '01234-567'
};

const result6 = schemas.customer.validate(validCEP);
console.log('Resultado:', result6.error ? '❌ ERRO' : '✅ VÁLIDO');

// Teste 7: Valores padrão
console.log('\n✅ Teste 7: Valores padrão');
const minimalCustomer = {
  name: 'João Silva'
};

const result7 = schemas.customer.validate(minimalCustomer);
console.log('Resultado:', result7.error ? '❌ ERRO' : '✅ VÁLIDO');
if (!result7.error) {
  console.log('documentType padrão:', result7.value.documentType);
  console.log('isActive padrão:', result7.value.isActive);
  console.log('addressCountry padrão:', result7.value.addressCountry);
}

console.log('\n🧪 Testando Validações de Fornecedor...\n');

// Teste 8: Fornecedor válido
console.log('✅ Teste 8: Fornecedor válido');
const validSupplier = {
  name: 'Fornecedor ABC',
  legalName: 'ABC Comércio de Produtos Ltda',
  contact: 'Maria Souza',
  phone: '(11) 8888-7777',
  email: 'contato@abc.com.br',
  cnpj: '12.345.678/0001-90',
  stateRegistration: '123.456.789.012',
  paymentTerms: '30 dias',
  isActive: true
};

const result8 = schemas.supplier.validate(validSupplier);
console.log('Resultado:', result8.error ? '❌ ERRO' : '✅ VÁLIDO');

console.log('\n✅ Todos os testes de validação foram executados!');