#!/usr/bin/env node

/**
 * Script simples para fazer baseline do banco de dados
 * Use este script se o migrate-with-baseline.js não funcionar
 * 
 * Uso: node scripts/baseline-only.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function getMigrationNames() {
  try {
    const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      return [];
    }
    
    const entries = fs.readdirSync(migrationsDir, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => entry.name)
      .sort();
  } catch (error) {
    console.error('Erro ao ler migrações:', error.message);
    return [];
  }
}

async function main() {
  try {
    console.log('🔍 Verificando migrações...');
    
    const migrationNames = await getMigrationNames();
    
    if (migrationNames.length === 0) {
      console.log('⚠️  Nenhuma migração encontrada');
      process.exit(0);
    }
    
    console.log(`📦 Encontradas ${migrationNames.length} migrações:`);
    migrationNames.forEach(name => console.log(`   - ${name}`));
    
    // Criar tabela _prisma_migrations se não existir
    console.log('\n📊 Criando/verificando tabela _prisma_migrations...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id" VARCHAR(36) PRIMARY KEY,
        "checksum" VARCHAR(64) NOT NULL,
        "finished_at" TIMESTAMP,
        "migration_name" VARCHAR(255) NOT NULL,
        "logs" TEXT,
        "rolled_back_at" TIMESTAMP,
        "started_at" TIMESTAMP NOT NULL DEFAULT now(),
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0
      )
    `);
    
    // Marcar todas as migrações como aplicadas
    console.log('\n📋 Fazendo baseline das migrações...');
    let successCount = 0;
    
    for (const migrationName of migrationNames) {
      const migrationId = `baseline_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const checksum = require('crypto')
        .createHash('sha256')
        .update(migrationName)
        .digest('hex')
        .substring(0, 64);
      
      try {
        // Verificar se já existe
        const existing = await prisma.$queryRawUnsafe(`
          SELECT id FROM "_prisma_migrations" WHERE migration_name = '${migrationName.replace(/'/g, "''")}'
        `);
        
        if (Array.isArray(existing) && existing.length > 0) {
          console.log(`   ℹ️  ${migrationName} - já existe`);
          successCount++;
          continue;
        }
        
        await prisma.$executeRawUnsafe(`
          INSERT INTO "_prisma_migrations" 
            ("id", "checksum", "migration_name", "started_at", "finished_at", "applied_steps_count")
          VALUES 
            ('${migrationId}', '${checksum}', '${migrationName.replace(/'/g, "''")}', now(), now(), 1)
        `);
        console.log(`   ✅ ${migrationName} - baseline aplicado`);
        successCount++;
      } catch (error) {
        if (error.message && (error.message.includes('duplicate') || error.message.includes('unique'))) {
          console.log(`   ℹ️  ${migrationName} - já existe`);
          successCount++;
        } else {
          console.error(`   ❌ ${migrationName} - erro:`, error.message);
        }
      }
    }
    
    console.log(`\n✅ Baseline concluído! ${successCount}/${migrationNames.length} migrações processadas.`);
    console.log('\n💡 Agora você pode executar: npm run start:prod');
    
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

