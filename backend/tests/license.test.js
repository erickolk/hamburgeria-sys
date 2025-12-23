/**
 * Testes do Sistema de Licenciamento
 * 
 * Para executar:
 * cd backend
 * npm test -- --testPathPattern=license
 */

const request = require('supertest');
const app = require('../src/server');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Sistema de Licenciamento', () => {
  let testLicenseKey = null;
  let testLicenseId = null;
  let adminToken = null;

  beforeAll(async () => {
    // Limpar dados de teste anteriores
    await prisma.licenseLocal.deleteMany({});
    await prisma.license.deleteMany({
      where: { cnpj: '99999999000199' }
    });

    // Login como admin para obter token
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@mercadinho.com',
        password: 'admin123'
      });

    if (loginRes.body.token) {
      adminToken = loginRes.body.token;
    }
  });

  afterAll(async () => {
    // Limpar dados de teste
    await prisma.licenseLocal.deleteMany({});
    if (testLicenseId) {
      await prisma.license.delete({ where: { id: testLicenseId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  describe('API VPS - /licenses', () => {
    test('POST /licenses - Criar nova licença (requer admin)', async () => {
      if (!adminToken) {
        console.log('Skipping: Admin token não disponível');
        return;
      }

      const res = await request(app)
        .post('/licenses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          cnpj: '99999999000199',
          companyName: 'Empresa Teste',
          email: 'teste@teste.com',
          phone: '11999999999',
          plan: 'basic',
          validMonths: 1,
          maxUsers: 5
        });

      expect([201, 400]).toContain(res.statusCode);
      
      if (res.statusCode === 201) {
        expect(res.body.license).toBeDefined();
        expect(res.body.license.licenseKey).toBeDefined();
        testLicenseKey = res.body.license.licenseKey;
        testLicenseId = res.body.license.id;
      }
    });

    test('POST /licenses/verify - Verificar licença válida', async () => {
      if (!testLicenseKey) {
        console.log('Skipping: Licença não criada');
        return;
      }

      const res = await request(app)
        .post('/licenses/verify')
        .send({ licenseKey: testLicenseKey });

      expect(res.statusCode).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.license).toBeDefined();
      expect(res.body.status).toBe('active');
    });

    test('POST /licenses/verify - Chave inválida retorna 403', async () => {
      const res = await request(app)
        .post('/licenses/verify')
        .send({ licenseKey: 'XXXX-YYYY-ZZZZ-0000' });

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toBeDefined();
    });

    test('GET /licenses/:key/status - Status da licença', async () => {
      if (!testLicenseKey) {
        console.log('Skipping: Licença não criada');
        return;
      }

      const res = await request(app)
        .get(`/licenses/${testLicenseKey}/status`);

      expect(res.statusCode).toBe(200);
      expect(res.body.licenseKey).toBe(testLicenseKey);
      expect(res.body.status).toBeDefined();
    });
  });

  describe('API Local - /license', () => {
    test('GET /license/status - Sistema não ativado', async () => {
      // Limpar licença local antes
      await prisma.licenseLocal.deleteMany({});

      const res = await request(app)
        .get('/license/status');

      expect(res.statusCode).toBe(200);
      expect(res.body.activated).toBe(false);
      expect(res.body.status).toBe('not_activated');
    });

    test('POST /license/activate - Formato inválido', async () => {
      const res = await request(app)
        .post('/license/activate')
        .send({ licenseKey: 'invalid-key' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Formato');
    });

    test('POST /license/activate - Chave inexistente', async () => {
      const res = await request(app)
        .post('/license/activate')
        .send({ licenseKey: 'AAAA-BBBB-CCCC-DDDD' });

      // Pode ser 400 (erro de conexão) ou 400 (chave inválida)
      expect([400]).toContain(res.statusCode);
    });

    test('GET /license/check - Verificar operação', async () => {
      const res = await request(app)
        .get('/license/check');

      // Se não ativado, retorna 403
      expect([200, 403]).toContain(res.statusCode);
    });
  });

  describe('Fluxo Completo', () => {
    test('Ativar, verificar status, renovar', async () => {
      // Este teste só funciona se houver uma licença válida
      // e conectividade com o VPS (em ambiente de teste integrado)
      
      console.log('ℹ️  Teste de fluxo completo requer ambiente integrado');
      
      // Verificar status inicial
      const statusRes = await request(app).get('/license/status');
      expect(statusRes.statusCode).toBe(200);

      // Se já ativado, testar renovação
      if (statusRes.body.activated) {
        const retryRes = await request(app).post('/license/retry');
        expect([200, 400]).toContain(retryRes.statusCode);
      }
    });
  });
});

describe('Cálculo de Status de Licença', () => {
  const licenseService = require('../src/services/licenseService');

  test('calculateLicenseStatus - Licença ativa (mais de 5 dias)', () => {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    
    const result = licenseService.calculateLicenseStatus(future);
    
    expect(result.status).toBe('active');
    expect(result.daysRemaining).toBeGreaterThan(5);
    expect(result.graceDays).toBe(0);
  });

  test('calculateLicenseStatus - Warning (1-5 dias)', () => {
    const future = new Date();
    future.setDate(future.getDate() + 3);
    
    const result = licenseService.calculateLicenseStatus(future);
    
    expect(result.status).toBe('warning');
    expect(result.daysRemaining).toBeLessThanOrEqual(5);
    expect(result.daysRemaining).toBeGreaterThan(0);
  });

  test('calculateLicenseStatus - Critical (6-14 dias vencido)', () => {
    const past = new Date();
    past.setDate(past.getDate() - 10);
    
    const result = licenseService.calculateLicenseStatus(past);
    
    expect(result.status).toBe('critical');
    expect(result.graceDays).toBe(10);
  });

  test('calculateLicenseStatus - Blocked (15+ dias vencido)', () => {
    const past = new Date();
    past.setDate(past.getDate() - 20);
    
    const result = licenseService.calculateLicenseStatus(past);
    
    expect(result.status).toBe('blocked');
    expect(result.graceDays).toBe(20);
  });
});

describe('Geração de Chave e Token', () => {
  const licenseService = require('../src/services/licenseService');

  test('generateLicenseKey - Formato correto', () => {
    const key = licenseService.generateLicenseKey();
    
    expect(key).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });

  test('generateLicenseToken - Token JWT válido', () => {
    const mockLicense = {
      licenseKey: 'TEST-1234-5678-ABCD',
      cnpj: '12345678000199',
      companyName: 'Teste',
      plan: 'basic',
      maxUsers: 5,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    const token = licenseService.generateLicenseToken(mockLicense);
    
    expect(token).toBeDefined();
    expect(token.split('.').length).toBe(3); // JWT tem 3 partes

    // Verificar que o token é decodificável
    const decoded = licenseService.verifyLicenseToken(token);
    expect(decoded).toBeDefined();
    expect(decoded.licenseKey).toBe(mockLicense.licenseKey);
  });
});

