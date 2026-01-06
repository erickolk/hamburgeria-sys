const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function createLicense() {
  // Gerar chave de licença
  const segments = [];
  for (let i = 0; i < 4; i++) {
    segments.push(crypto.randomBytes(2).toString('hex').toUpperCase());
  }
  const licenseKey = segments.join('-');
  
  // Validade: 1 ano a partir de agora
  const validUntil = new Date();
  validUntil.setFullYear(validUntil.getFullYear() + 1);
  
  try {
    // Verificar se já existe licença
    const existing = await prisma.license.findFirst();
    
    if (existing) {
      console.log('');
      console.log('========================================');
      console.log('LICENCA EXISTENTE ENCONTRADA');
      console.log('========================================');
      console.log('');
      console.log('CHAVE:', existing.licenseKey);
      console.log('');
      console.log('Empresa:', existing.companyName);
      console.log('Valida ate:', existing.validUntil);
      console.log('Status:', existing.status);
      console.log('========================================');
      
      // Atualizar validade se estiver expirada
      const updated = await prisma.license.update({
        where: { id: existing.id },
        data: { 
          validUntil: validUntil,
          status: 'ACTIVE'
        }
      });
      console.log('');
      console.log('Licenca renovada ate:', validUntil.toLocaleDateString('pt-BR'));
      console.log('');
    } else {
      const license = await prisma.license.create({
        data: {
          licenseKey: licenseKey,
          cnpj: '00.000.000/0001-00',
          companyName: 'Mercadinho Teste',
          email: 'teste@mercadinho.com',
          phone: '(11) 99999-9999',
          plan: 'premium',
          validUntil: validUntil,
          maxUsers: 10,
          status: 'ACTIVE',
          notes: 'Licenca de desenvolvimento/teste'
        }
      });
      
      console.log('');
      console.log('========================================');
      console.log('LICENCA CRIADA COM SUCESSO!');
      console.log('========================================');
      console.log('');
      console.log('CHAVE DE LICENCA:', license.licenseKey);
      console.log('');
      console.log('Empresa:', license.companyName);
      console.log('Valida ate:', license.validUntil.toLocaleDateString('pt-BR'));
      console.log('Plano:', license.plan);
      console.log('Max usuarios:', license.maxUsers);
      console.log('========================================');
      console.log('');
    }
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createLicense();

