/**
 * Script para criar diretórios necessários para tickets e relatórios
 * Execute: node scripts/setup-directories.js
 */

const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, '../tickets'),
  path.join(__dirname, '../reports')
];

console.log('🔧 Configurando diretórios...\n');

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Criado: ${dir}`);
  } else {
    console.log(`ℹ️  Já existe: ${dir}`);
  }
});

// Criar arquivo .gitkeep para manter os diretórios no git
directories.forEach(dir => {
  const gitkeepPath = path.join(dir, '.gitkeep');
  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, '');
    console.log(`✅ Criado .gitkeep em: ${dir}`);
  }
});

console.log('\n✨ Configuração concluída!\n');
console.log('📋 Próximos passos:');
console.log('1. Configure as variáveis de ambiente no .env:');
console.log('   STORE_NAME=MERCADINHO');
console.log('   STORE_CNPJ=XX.XXX.XXX/XXXX-XX');
console.log('   STORE_ADDRESS=Endereço da loja');
console.log('   STORE_PHONE=(XX) XXXXX-XXXX');
console.log('   STORE_WEBSITE=www.site.com.br\n');
console.log('2. Reinicie o servidor');
console.log('3. Faça uma venda de teste para gerar um ticket\n');



