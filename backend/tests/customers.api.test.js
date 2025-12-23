const request = require('supertest');
const app = require('../src/server');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Customers API', () => {
  let authToken;
  let testCustomerId;

  beforeAll(async () => {
    // Criar usuário de teste e obter token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123'
      });
    
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Limpar dados de teste
    if (testCustomerId) {
      await prisma.customer.deleteMany({
        where: { id: testCustomerId }
      });
    }
    await prisma.$disconnect();
  });

  test('POST /api/customers deve criar cliente com endereço completo', async () => {
    const customerData = {
      name: 'Maria Souza',
      document: '987.654.321-00',
      documentType: 'CPF',
      phone: '(11) 98765-4321',
      email: 'maria@email.com',
      addressZipCode: '01234-567',
      addressStreet: 'Rua Teste',
      addressNumber: '123',
      addressNeighborhood: 'Centro',
      addressCity: 'São Paulo',
      addressState: 'SP',
      isActive: true,
      note: 'Cliente VIP'
    };
    
    const response = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${authToken}`)
      .send(customerData)
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(customerData.name);
    expect(response.body.document).toBe(customerData.document);
    expect(response.body.addressCity).toBe(customerData.addressCity);
    expect(response.body.isActive).toBe(true);
    
    testCustomerId = response.body.id;
  });

  test('GET /api/customers deve listar clientes com paginação', async () => {
    const response = await request(app)
      .get('/api/customers')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(response.body).toHaveProperty('customers');
    expect(response.body).toHaveProperty('pagination');
    expect(Array.isArray(response.body.customers)).toBe(true);
    expect(response.body.pagination).toHaveProperty('page');
    expect(response.body.pagination).toHaveProperty('limit');
    expect(response.body.pagination).toHaveProperty('total');
    expect(response.body.pagination).toHaveProperty('pages');
  });

  test('GET /api/customers deve filtrar por tipo de documento', async () => {
    const response = await request(app)
      .get('/api/customers?documentType=CPF')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(response.body.customers.length).toBeGreaterThan(0);
    response.body.customers.forEach(customer => {
      expect(customer.documentType).toBe('CPF');
    });
  });

  test('GET /api/customers deve filtrar por status', async () => {
    const response = await request(app)
      .get('/api/customers?isActive=true')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(response.body.customers.length).toBeGreaterThan(0);
    response.body.customers.forEach(customer => {
      expect(customer.isActive).toBe(true);
    });
  });

  test('GET /api/customers deve buscar por texto', async () => {
    const response = await request(app)
      .get('/api/customers?search=Maria')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(response.body.customers.length).toBeGreaterThan(0);
    const found = response.body.customers.some(customer => 
      customer.name.includes('Maria') || 
      customer.email?.includes('Maria') ||
      customer.phone?.includes('Maria')
    );
    expect(found).toBe(true);
  });

  test('GET /api/customers/:id deve obter cliente por ID', async () => {
    const response = await request(app)
      .get(`/api/customers/${testCustomerId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(response.body).toHaveProperty('id', testCustomerId);
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('sales');
  });

  test('PUT /api/customers/:id deve atualizar cliente', async () => {
    const updateData = {
      name: 'Maria Souza Silva',
      phone: '(11) 99999-8888',
      email: 'maria.silva@email.com'
    };
    
    const response = await request(app)
      .put(`/api/customers/${testCustomerId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData)
      .expect(200);
    
    expect(response.body.name).toBe(updateData.name);
    expect(response.body.phone).toBe(updateData.phone);
    expect(response.body.email).toBe(updateData.email);
  });

  test('PUT /api/customers/:id/toggle-status deve alternar status', async () => {
    // Obter status atual
    const getResponse = await request(app)
      .get(`/api/customers/${testCustomerId}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    const currentStatus = getResponse.body.isActive;
    
    // Alternar status
    const response = await request(app)
      .put(`/api/customers/${testCustomerId}/toggle-status`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(response.body.isActive).toBe(!currentStatus);
  });

  test('GET /api/customers/cep/:cep deve buscar endereço por CEP', async () => {
    const response = await request(app)
      .get('/api/customers/cep/01310-100')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(response.body).toHaveProperty('street');
    expect(response.body).toHaveProperty('neighborhood');
    expect(response.body).toHaveProperty('city');
    expect(response.body).toHaveProperty('state');
    expect(response.body).toHaveProperty('zipCode');
    expect(response.body).toHaveProperty('country');
  });

  test('DELETE /api/customers/:id deve excluir cliente', async () => {
    await request(app)
      .delete(`/api/customers/${testCustomerId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    // Verificar que foi excluído
    await request(app)
      .get(`/api/customers/${testCustomerId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });

  test('POST /api/customers deve rejeitar dados inválidos', async () => {
    const invalidCustomer = {
      name: 'A', // Nome muito curto
      phone: '12345', // Telefone inválido
      email: 'email_invalido', // Email inválido
      document: '123.456.789-00', // CPF inválido
      documentType: 'CPF',
      addressZipCode: '12345678' // CEP inválido
    };
    
    const response = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidCustomer)
      .expect(400);
    
    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('details');
    expect(Array.isArray(response.body.details)).toBe(true);
  });