#!/usr/bin/env node

/**
 * Script para aplicar migrações Prisma com suporte a baseline automático
 * Resolve o erro P3005 quando o banco já tem schema mas não tem histórico de migrações
 */

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkIfDatabaseHasSchema() {
  try {
    // Tentar listar tabelas do banco
    const result = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name != '_prisma_migrations'
      LIMIT 1
    `);
    return Array.isArray(result) && result.length > 0;
  } catch (error) {
    console.error('Erro ao verificar schema do banco:', error.message);
    return false;
  }
}

async function checkIfMigrationsTableExists() {
  try {
    const result = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = '_prisma_migrations'
    `);
    return Array.isArray(result) && result.length > 0;
  } catch (error) {
    return false;
  }
}

async function getMigrationNames() {
  try {
    const fs = require('fs');
    const path = require('path');
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

async function baselineMigrations() {
  try {
    console.log('📋 Fazendo baseline das migrações...');
    
    const migrationNames = await getMigrationNames();
    
    if (migrationNames.length === 0) {
      console.log('⚠️  Nenhuma migração encontrada');
      return false;
    }
    
    console.log(`📦 Encontradas ${migrationNames.length} migrações para fazer baseline`);
    
    // Criar tabela _prisma_migrations se não existir
    const migrationsTableExists = await checkIfMigrationsTableExists();
    
    if (!migrationsTableExists) {
      console.log('📊 Criando tabela _prisma_migrations...');
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
    }
    
    // Marcar todas as migrações como aplicadas
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
          SELECT id FROM "_prisma_migrations" WHERE migration_name = '${migrationName}'
        `);
        
        if (Array.isArray(existing) && existing.length > 0) {
          console.log(`ℹ️  Migração já existe: ${migrationName}`);
          continue;
        }
        
        await prisma.$executeRawUnsafe(`
          INSERT INTO "_prisma_migrations" 
            ("id", "checksum", "migration_name", "started_at", "finished_at", "applied_steps_count")
          VALUES 
            ('${migrationId}', '${checksum}', '${migrationName}', now(), now(), 1)
        `);
        console.log(`✅ Baseline aplicado para: ${migrationName}`);
      } catch (error) {
        // Se der erro de duplicata, ignorar
        if (error.message && error.message.includes('duplicate') || error.message.includes('unique')) {
          console.log(`ℹ️  Migração já existe: ${migrationName}`);
        } else {
          console.error(`❌ Erro ao fazer baseline de ${migrationName}:`, error.message);
        }
      }
    }
    
    console.log('✅ Baseline concluído!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao fazer baseline:', error);
    return false;
  }
}

async function runMigrations() {
  try {
    console.log('🚀 Tentando aplicar migrações...');
    
    // Tentar aplicar migrações normalmente
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      cwd: require('path').join(__dirname, '..')
    });
    
    console.log('✅ Migrações aplicadas com sucesso!');
    return true;
  } catch (error) {
    // Verificar se é o erro P3005
    const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message || '';
    
    if (errorOutput.includes('P3005') || errorOutput.includes('database schema is not empty')) {
      console.log('⚠️  Erro P3005 detectado - banco já tem schema');
      return false;
    }
    
    // Outro erro
    console.error('❌ Erro ao aplicar migrações:', error.message);
    throw error;
  }
}

async function checkIfMigrationsHistoryExists() {
  try {
    const result = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM "_prisma_migrations"
    `);
    return Array.isArray(result) && result.length > 0 && parseInt(result[0].count) > 0;
  } catch (error) {
    // Se a tabela não existe, retornar false
    return false;
  }
}

async function main() {
  try {
    console.log('🔍 Verificando estado do banco de dados...');
    
    // Verificar se banco tem schema
    const hasSchema = await checkIfDatabaseHasSchema();
    const hasMigrationsHistory = await checkIfMigrationsHistoryExists();
    
    if (hasSchema && !hasMigrationsHistory) {
      // Banco tem schema mas não tem histórico - fazer baseline PRIMEIRO
      console.log('📊 Banco tem schema mas sem histórico de migrações');
      console.log('🔄 Fazendo baseline automático ANTES de aplicar migrações...');
      
      const baselineSuccess = await baselineMigrations();
      
      if (!baselineSuccess) {
        console.log('⚠️  Baseline falhou, tentando continuar mesmo assim...');
      }
    }
    
    // Agora tentar aplicar migrações (pode falhar se baseline não funcionou, mas não vai crashar)
    try {
      await runMigrations();
    } catch (error) {
      const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message || '';
      
      if (errorOutput.includes('P3005') || errorOutput.includes('database schema is not empty')) {
        console.log('⚠️  Ainda há erro P3005 - baseline pode não ter funcionado completamente');
        console.log('💡 Execute o baseline manualmente no PostgreSQL (veja SOLUCAO_RAPIDA_P3005.md)');
        // Continuar mesmo assim para gerar Prisma Client
      } else {
        throw error;
      }
    }
    
    // Gerar Prisma Client (sempre, mesmo se houver erro)
    console.log('🔨 Gerando Prisma Client...');
    try {
      execSync('npx prisma generate', { 
        stdio: 'inherit',
        cwd: require('path').join(__dirname, '..')
      });
      console.log('✅ Prisma Client gerado com sucesso!');
    } catch (generateError) {
      console.error('❌ Erro ao gerar Prisma Client:', generateError.message);
      console.log('⚠️  Tentando continuar mesmo assim...');
    }
    
    console.log('✅ Script de migração concluído!');
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    // Não fazer exit(1) para não crashar o container - deixar o servidor tentar iniciar
    console.log('⚠️  Continuando mesmo com erro de migração...');
    
    // Tentar gerar Prisma Client mesmo com erro
    console.log('🔨 Tentando gerar Prisma Client mesmo com erro...');
    try {
      execSync('npx prisma generate', { 
        stdio: 'inherit',
        cwd: require('path').join(__dirname, '..')
      });
      console.log('✅ Prisma Client gerado com sucesso!');
    } catch (generateError) {
      console.error('❌ Erro ao gerar Prisma Client:', generateError.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();

