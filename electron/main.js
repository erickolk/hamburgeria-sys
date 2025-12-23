const { app, BrowserWindow, ipcMain, globalShortcut, Menu, dialog } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const http = require('http');
const fs = require('fs');
const os = require('os');
const Store = require('electron-store');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const store = new Store();

// Importar serviço de atualização
const updater = require('./updater');

// Servidor HTTP para frontend em produção
let frontendServer = null;
const FRONTEND_PORT = 3000;

// ============================================
// SISTEMA DE LOGS EM ARQUIVO
// ============================================
const LOG_DIR = path.join(os.homedir(), 'Mercadinho', 'logs');
const LOG_FILE = path.join(LOG_DIR, `app-${new Date().toISOString().split('T')[0]}.log`);

// Criar diretório de logs se não existir
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Função para escrever logs em arquivo
function writeLog(level, ...args) {
  const timestamp = new Date().toISOString();
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');
  
  const logLine = `[${timestamp}] [${level}] ${message}\n`;
  
  // Escrever no arquivo
  fs.appendFileSync(LOG_FILE, logLine, 'utf8');
  
  // Também mostrar no console original
  if (level === 'ERROR') {
    originalConsoleError(message);
  } else {
    originalConsoleLog(message);
  }
}

// Salvar console original
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Sobrescrever console para capturar logs
console.log = (...args) => writeLog('INFO', ...args);
console.error = (...args) => writeLog('ERROR', ...args);
console.warn = (...args) => writeLog('WARN', ...args);

console.log('═══════════════════════════════════════════════════════');
console.log('📝 Sistema de logs iniciado');
console.log('📁 Arquivo de log:', LOG_FILE);
console.log('═══════════════════════════════════════════════════════');

let mainWindow;
let backendProcess;
const BACKEND_PORT = 3001;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;

// Flag para controlar se o backend foi iniciado pelo Electron
let backendStartedByElectron = false;

// Intervalo de renovação de licença
let licenseRenewalInterval = null;

// Configuração do banco de dados
const DATABASE_MODE = process.env.DATABASE_MODE || 'local';
const APP_DATA_PATH = path.join(os.homedir(), 'Mercadinho');
const SETUP_COMPLETE_FLAG = path.join(APP_DATA_PATH, 'setup-complete.flag');

/**
 * Detecta o caminho do Node.js embutido ou do sistema
 */
function getNodeExecutablePath() {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    // Em desenvolvimento, usar Node.js do sistema
    return 'node';
  }
  
  // Em produção, procurar Node.js embutido
  const exeDir = path.dirname(process.execPath);
  
  const possiblePaths = [
    // Node.js na pasta node-portable ao lado do executável
    path.join(exeDir, 'node-portable', 'node.exe'),
    // Node.js na pasta resources
    path.join(process.resourcesPath || exeDir, 'node-portable', 'node.exe'),
    // Node.js diretamente na pasta do app
    path.join(exeDir, 'node.exe'),
  ];
  
  for (const nodePath of possiblePaths) {
    if (fs.existsSync(nodePath)) {
      console.log('✅ Node.js embutido encontrado:', nodePath);
      return nodePath;
    }
  }
  
  // Fallback: tentar usar Node.js do sistema
  console.log('⚠️  Node.js embutido não encontrado, tentando usar do sistema...');
  return 'node';
}

/**
 * Verifica se é a primeira execução do aplicativo
 */
function isFirstRun() {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    return false;
  }
  
  const installFlag = path.join(path.dirname(process.execPath), 'first-run.flag');
  const setupComplete = fs.existsSync(SETUP_COMPLETE_FLAG);
  
  return fs.existsSync(installFlag) && !setupComplete;
}

/**
 * Marca setup como completo
 */
function markSetupComplete() {
  if (!fs.existsSync(APP_DATA_PATH)) {
    fs.mkdirSync(APP_DATA_PATH, { recursive: true });
  }
  
  const setupInfo = {
    completedAt: new Date().toISOString(),
    version: app.getVersion(),
    databaseMode: DATABASE_MODE
  };
  
  fs.writeFileSync(SETUP_COMPLETE_FLAG, JSON.stringify(setupInfo, null, 2), 'utf8');
  console.log('✅ Setup marcado como completo');
}

/**
 * Configurar banco de dados local
 * Tenta ler do .env do backend primeiro, depois usa valores padrão
 * IMPORTANTE: Porta padrão 5432, banco mercadinho_local
 */
function setupLocalDatabase(backendCwd) {
  if (!fs.existsSync(APP_DATA_PATH)) {
    fs.mkdirSync(APP_DATA_PATH, { recursive: true });
    console.log('📁 Diretório de dados criado:', APP_DATA_PATH);
  }

  // URL padrão CORRETA (porta 5432, banco mercadinho_local)
  const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres123@localhost:5432/mercadinho_local';
  
  let DATABASE_URL;

  // Tentar ler do .env do backend primeiro
  if (backendCwd) {
    const envPath = path.join(backendCwd, '.env');
    
    // Se .env não existe, criar com valores padrão
    if (!fs.existsSync(envPath)) {
      console.log('📝 Criando .env com configuração padrão...');
      try {
        const defaultEnvContent = `# Configuracao automatica - Mercadinho PDV
DATABASE_URL=${DEFAULT_DATABASE_URL}
DATABASE_MODE=local
PORT=3001
NODE_ENV=production
SYNC_ENABLED=false
JWT_SECRET=mercadinho_jwt_secret_key_2024_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
`;
        fs.writeFileSync(envPath, defaultEnvContent, 'utf8');
        console.log('✅ .env criado com sucesso');
        return DEFAULT_DATABASE_URL;
      } catch (err) {
        console.log('⚠️  Erro ao criar .env:', err.message);
      }
    } else {
      // .env existe, ler dele
      try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
        if (match) {
          DATABASE_URL = match[1].trim();
          
          // Verificar se a URL está correta (porta 5432)
          if (DATABASE_URL.includes(':5433/')) {
            console.log('⚠️  Corrigindo porta no .env (5433 -> 5432)...');
            const correctedUrl = DATABASE_URL.replace(':5433/', ':5432/');
            const correctedContent = envContent.replace(DATABASE_URL, correctedUrl);
            try {
              fs.writeFileSync(envPath, correctedContent, 'utf8');
              DATABASE_URL = correctedUrl;
              console.log('✅ Porta corrigida no .env');
            } catch (e) {
              console.log('⚠️  Não foi possível atualizar .env');
            }
          }
          
          console.log('📄 DATABASE_URL lido do .env do backend');
          return DATABASE_URL;
        }
      } catch (err) {
        console.log('⚠️  Erro ao ler .env:', err.message);
      }
    }
  }

  // Fallback para variáveis de ambiente ou padrão
  if (DATABASE_MODE === 'sqlite') {
    const dbPath = path.join(APP_DATA_PATH, 'mercadinho.db');
    DATABASE_URL = `file:${dbPath}`;
    console.log('💾 Usando SQLite:', dbPath);
  } else if (DATABASE_MODE === 'local') {
    DATABASE_URL = process.env.DATABASE_URL_LOCAL || 
                   process.env.DATABASE_URL ||
                   DEFAULT_DATABASE_URL;
    console.log('🐘 Usando PostgreSQL local');
  } else {
    DATABASE_URL = process.env.DATABASE_URL_VPS || process.env.DATABASE_URL;
    console.log('☁️  Usando PostgreSQL VPS');
  }

  return DATABASE_URL;
}

/**
 * Verifica se o Node.js embutido está disponível
 */
function checkEmbeddedNode() {
  const nodePath = getNodeExecutablePath();
  
  return new Promise((resolve) => {
    if (nodePath === 'node') {
      // Verificar Node.js do sistema
      const nodeCheck = spawn('node', ['--version'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 5000
      });

      let output = '';
      nodeCheck.stdout.on('data', (data) => { output += data.toString(); });
      
      nodeCheck.on('close', (code) => {
        if (code === 0 && output.trim()) {
          resolve({ available: true, version: output.trim(), path: 'node', embedded: false });
        } else {
          resolve({ available: false, error: 'Node.js do sistema não encontrado' });
        }
      });

      nodeCheck.on('error', (error) => {
        resolve({ available: false, error: error.message });
      });
    } else {
      // Verificar Node.js embutido
      if (fs.existsSync(nodePath)) {
        const nodeCheck = spawn(nodePath, ['--version'], {
          stdio: ['ignore', 'pipe', 'pipe'],
          timeout: 5000
        });

        let output = '';
        nodeCheck.stdout.on('data', (data) => { output += data.toString(); });
        
        nodeCheck.on('close', (code) => {
          if (code === 0 && output.trim()) {
            resolve({ available: true, version: output.trim(), path: nodePath, embedded: true });
          } else {
            resolve({ available: false, error: 'Node.js embutido não funciona' });
          }
        });

        nodeCheck.on('error', (error) => {
          resolve({ available: false, error: error.message });
        });
      } else {
        resolve({ available: false, error: `Arquivo não encontrado: ${nodePath}` });
      }
    }
  });
}

/**
 * Inicia o backend Express como processo filho
 */
async function startBackend() {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  let backendPath;
  let backendCwd;
  
  if (isDev) {
    backendPath = path.join(__dirname, '..', 'backend', 'src', 'server.js');
    backendCwd = path.join(__dirname, '..', 'backend');
  } else {
    const exeDir = path.dirname(process.execPath);
    backendPath = path.join(exeDir, 'backend', 'src', 'server.js');
    backendCwd = path.join(exeDir, 'backend');
    
    // Fallback: tentar resources
    if (!fs.existsSync(backendPath)) {
      const altPath = path.join(process.resourcesPath || exeDir, 'backend', 'src', 'server.js');
      if (fs.existsSync(altPath)) {
        backendPath = altPath;
        backendCwd = path.dirname(path.dirname(altPath));
        console.log('⚠️  Usando caminho alternativo do backend');
      }
    }
  }

  // Verificar se backend existe
  if (!fs.existsSync(backendPath)) {
    console.error('❌ Backend não encontrado em:', backendPath);
    showError('Erro ao iniciar backend', `Backend não encontrado em: ${backendPath}\n\nVerifique se o build incluiu o backend.`);
    return;
  }

  // Verificar Node.js
  console.log('🔍 Verificando Node.js...');
  const nodeCheck = await checkEmbeddedNode();
  
  if (!nodeCheck.available) {
    console.error('❌ Node.js não está disponível:', nodeCheck.error);
    showError(
      'Node.js não encontrado',
      `Node.js não foi encontrado.\n\nErro: ${nodeCheck.error}\n\nO instalador deveria ter incluído o Node.js. Por favor, reinstale o aplicativo.`
    );
    return;
  }

  const nodeExecutable = nodeCheck.path;
  console.log(`✅ Node.js encontrado: ${nodeCheck.version} (${nodeCheck.embedded ? 'embutido' : 'sistema'})`);
  console.log('   Caminho:', nodeExecutable);
  
  // Verificar Prisma Client
  console.log('🔍 Verificando Prisma Client...');
  const prismaClientPath = path.join(backendCwd, 'node_modules', '.prisma', 'client', 'index.js');
  
  if (!fs.existsSync(prismaClientPath)) {
    console.error('❌ Prisma Client não encontrado!');
    console.error('   Caminho esperado:', prismaClientPath);
    
    // Tentar gerar Prisma Client automaticamente
    console.log('🔧 Tentando gerar Prisma Client...');
    
    try {
      const npxPath = path.join(path.dirname(nodeExecutable), 'npx.cmd');
      const generateProcess = spawn(
        fs.existsSync(npxPath) ? npxPath : 'npx',
        ['prisma', 'generate'],
        { cwd: backendCwd, stdio: 'inherit' }
      );
      
      await new Promise((resolve, reject) => {
        generateProcess.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(`Prisma generate falhou com código ${code}`));
        });
        generateProcess.on('error', reject);
      });
      
      console.log('✅ Prisma Client gerado com sucesso!');
    } catch (err) {
      console.error('❌ Falha ao gerar Prisma Client:', err.message);
      showError(
        'Erro de Configuração - Prisma Client',
        `Prisma Client não foi gerado!\n\nExecute manualmente:\ncd "${backendCwd}"\nnpx prisma generate`
      );
      return;
    }
  } else {
    console.log('✅ Prisma Client encontrado');
  }
  
  console.log('🚀 Iniciando backend Express...');
  console.log('📁 Backend path:', backendPath);
  console.log('📁 Backend CWD:', backendCwd);
  console.log('🗄️  Modo de banco:', DATABASE_MODE);

  // Configurar banco de dados (passa backendCwd para ler .env)
  const DATABASE_URL = setupLocalDatabase(backendCwd);
  
  // ============================================
  // APLICAR MIGRATIONS AUTOMATICAMENTE
  // ============================================
  // SEMPRE verifica se as tabelas existem no banco
  const migrationFlagPath = path.join(APP_DATA_PATH, '.migrations-applied');
  const schemaPath = path.join(backendCwd, 'prisma', 'schema.prisma');
  
  // Verificar se precisamos aplicar migrations
  // SEMPRE aplicar na primeira execução ou se o arquivo de flag não existe
  let needsMigration = !fs.existsSync(migrationFlagPath);
  
  if (needsMigration) {
    console.log('🔄 Primeira execução ou migrations pendentes...');
  } else {
    // Verificar se o schema foi atualizado comparando datas
    try {
      const flagStat = fs.statSync(migrationFlagPath);
      if (fs.existsSync(schemaPath)) {
        const schemaStat = fs.statSync(schemaPath);
        if (schemaStat.mtime > flagStat.mtime) {
          needsMigration = true;
          console.log('🔄 Schema atualizado - reaplicando migrations...');
        }
      }
    } catch (err) {
      needsMigration = true;
      console.log('🔄 Erro ao verificar migrations, reaplicando...');
    }
  }
  
  if (needsMigration && fs.existsSync(schemaPath)) {
    console.log('📦 Aplicando migrations do banco de dados...');
    console.log('   Isso pode levar alguns segundos na primeira execução...');
    console.log('   DATABASE_URL:', DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
    
    try {
      // Definir DATABASE_URL para o Prisma
      const migrationEnv = {
        ...process.env,
        DATABASE_URL,
        // Forçar não interativo
        CI: 'true'
      };
      
      // ===========================================
      // WINDOWS: Usar execSync com caminhos escapados
      // ===========================================
      const { execSync } = require('child_process');
      
      // Encontrar prisma no node_modules do backend
      const prismaCliPath = path.join(backendCwd, 'node_modules', '.bin', 'prisma.cmd');
      const prismaCliAlt = path.join(backendCwd, 'node_modules', 'prisma', 'build', 'index.js');
      
      let prismaCmd;
      
      // Primeiro tentar migrate deploy (preserva dados existentes)
      // Se falhar (primeira instalação), usar db push sem --accept-data-loss
      let prismaMigrateCmd;
      let prismaPushCmd;
      
      if (fs.existsSync(prismaCliPath)) {
        // Usar prisma.cmd diretamente (Windows)
        prismaMigrateCmd = `"${prismaCliPath}" migrate deploy`;
        prismaPushCmd = `"${prismaCliPath}" db push --skip-generate`;
        console.log('   Usando prisma.cmd local');
      } else if (fs.existsSync(prismaCliAlt)) {
        // Usar Node para executar prisma diretamente
        prismaMigrateCmd = `"${nodeExecutable}" "${prismaCliAlt}" migrate deploy`;
        prismaPushCmd = `"${nodeExecutable}" "${prismaCliAlt}" db push --skip-generate`;
        console.log('   Usando prisma via Node');
      } else {
        // Fallback: tentar npx do sistema
        prismaMigrateCmd = 'npx prisma migrate deploy';
        prismaPushCmd = 'npx prisma db push --skip-generate';
        console.log('   Usando npx do sistema');
      }
      
      console.log('   Executando: prisma migrate deploy (preserva dados)');
      console.log('   CWD:', backendCwd);
      
      try {
        // Tentar migrate deploy primeiro (atualização segura)
        let result;
        try {
          result = execSync(prismaMigrateCmd, {
            cwd: backendCwd,
            env: migrationEnv,
            timeout: 90000,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
            shell: true,
            windowsHide: true
          });
          console.log('✅ Migrations aplicadas com sucesso!');
        } catch (migrateErr) {
          // Se migrate deploy falhar (primeira instalação ou sem migrations)
          console.log('⚠️ migrate deploy falhou, tentando db push (primeira instalação)...');
          
          result = execSync(prismaPushCmd, {
            cwd: backendCwd,
            env: migrationEnv,
            timeout: 90000,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
            shell: true,
            windowsHide: true
          });
          console.log('✅ Schema criado com sucesso (primeira instalação)!');
        }
        
        if (result) console.log('   [prisma]', result.substring(0, 300));
        
        // Criar flag de migrations aplicadas
        try {
          fs.writeFileSync(migrationFlagPath, new Date().toISOString(), 'utf8');
        } catch (e) {
          console.log('⚠️ Não foi possível salvar flag de migrations');
        }
      } catch (execErr) {
        // execSync throws on non-zero exit
        const output = execErr.stdout ? execErr.stdout.toString() : '';
        const errOutput = execErr.stderr ? execErr.stderr.toString() : '';
        
        console.error('⚠️ Prisma retornou erro');
        if (output) console.log('   Saída:', output.substring(0, 500));
        if (errOutput) console.error('   Erro:', errOutput.substring(0, 500));
        
        // Verificar se é erro de conexão com banco
        if (errOutput.includes('connect ECONNREFUSED') || errOutput.includes("Can't reach database")) {
          console.error('❌ PostgreSQL não está rodando ou não está acessível');
          console.error('   Verifique se o PostgreSQL está instalado e rodando na porta 5432');
        }
      }
    } catch (err) {
      console.error('⚠️ Exceção ao aplicar migrations:', err.message);
    }
  } else if (!fs.existsSync(schemaPath)) {
    console.log('⚠️ Schema do Prisma não encontrado em:', schemaPath);
  } else {
    console.log('✅ Migrations já aplicadas anteriormente');
  }
  console.log('🗄️  DATABASE_URL:', DATABASE_URL.replace(/:[^:@]+@/, ':****@'));

  // Variáveis de ambiente para o backend
  const env = {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: BACKEND_PORT.toString(),
    HOST: '0.0.0.0',
    DATABASE_URL,
    DATABASE_MODE,
    SYNC_ENABLED: DATABASE_MODE === 'local' ? 'true' : 'false',
    VPS_API_URL: process.env.VPS_API_URL || ''
  };

  let backendErrorLogged = false;
  let backendStartupError = null;

  backendProcess = spawn(nodeExecutable, [backendPath], {
    env,
    cwd: backendCwd,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  backendStartedByElectron = true;

  // Logs do backend
  backendProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output && !output.includes('DeprecationWarning') && !output.includes('ExperimentalWarning')) {
      console.log(`[Backend] ${output}`);
    }
  });

  // Capturar erros
  backendProcess.stderr.on('data', (data) => {
    const errorOutput = data.toString().trim();
    
    const isNodeWarning = errorOutput.includes('DeprecationWarning') || 
                         errorOutput.includes('ExperimentalWarning') ||
                         errorOutput.includes('Warning:');
    
    if (!isNodeWarning && errorOutput) {
      const isPrismaError = errorOutput.includes('@prisma/client') || 
                           errorOutput.includes('prisma generate') ||
                           errorOutput.includes('PrismaClient');
      
      if (isPrismaError && !backendErrorLogged) {
        backendErrorLogged = true;
        backendStartupError = errorOutput;
        console.error('❌ ERRO DO PRISMA:', errorOutput);
        showError('Erro do Prisma', errorOutput);
        return;
      }
      
      if (!backendErrorLogged) {
        backendErrorLogged = true;
        backendStartupError = errorOutput;
        console.error('❌ Erro do backend:', errorOutput);
        
        if (errorOutput.includes('Error:') || errorOutput.includes('Cannot') || errorOutput.includes('Failed')) {
          showError('Erro ao iniciar backend', errorOutput);
        }
      }
    }
  });

  backendProcess.on('error', (error) => {
    console.error('❌ Erro ao iniciar processo backend:', error.message);
    showError('Erro ao iniciar backend', error.message);
  });

  backendProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`❌ Backend encerrou com código de erro: ${code}`);
      
      if (!app.isQuitting && !backendStartupError?.includes('Cannot')) {
        setTimeout(() => {
          if (!app.isQuitting) {
            console.log('🔄 Tentando reiniciar backend...');
            startBackend().catch(console.error);
          }
        }, 3000);
      }
    }
  });
}

/**
 * Verifica status da licença via API local
 */
async function checkLicenseStatus() {
  return new Promise((resolve) => {
    const req = http.get(`${BACKEND_URL}/license/status`, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const status = JSON.parse(data);
          resolve(status);
        } catch (e) {
          resolve({ activated: false, status: 'error' });
        }
      });
    });
    req.on('error', () => resolve({ activated: false, status: 'offline' }));
    req.on('timeout', () => { req.destroy(); resolve({ activated: false, status: 'timeout' }); });
  });
}

/**
 * Tenta renovar a licença silenciosamente
 */
async function renewLicenseSilently() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({});
    const options = {
      hostname: 'localhost',
      port: BACKEND_PORT,
      path: '/license/retry',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.message || result.status === 'active') {
            console.log('✅ [Licença] Renovação silenciosa bem-sucedida');
          }
          resolve(result);
        } catch (e) {
          resolve({ success: false });
        }
      });
    });

    req.on('error', (e) => {
      // Silencioso - não logar erros de rede
      resolve({ success: false, offline: true });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, timeout: true });
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Inicia o job de renovação silenciosa de licença
 */
function startLicenseRenewalJob() {
  // Renovar a cada 1 hora
  const RENEWAL_INTERVAL = 60 * 60 * 1000; // 1 hora

  // Limpar intervalo existente se houver
  if (licenseRenewalInterval) {
    clearInterval(licenseRenewalInterval);
  }

  // Primeira verificação após 30 segundos
  setTimeout(async () => {
    const status = await checkLicenseStatus();
    if (status.activated) {
      console.log('🔑 [Licença] Status:', status.status);
      await renewLicenseSilently();
    }
  }, 30000);

  // Renovação periódica
  licenseRenewalInterval = setInterval(async () => {
    const status = await checkLicenseStatus();
    if (status.activated && (status.status === 'warning' || status.status === 'critical' || status.status === 'active')) {
      console.log('🔄 [Licença] Verificação periódica...');
      await renewLicenseSilently();
    }
  }, RENEWAL_INTERVAL);

  console.log('⏰ [Licença] Job de renovação iniciado (intervalo: 1 hora)');
}

/**
 * Verifica se o backend já está rodando
 */
function checkBackendRunning() {
  return new Promise((resolve) => {
    const req = http.get(`${BACKEND_URL}/health`, { timeout: 2000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

/**
 * Aguarda backend e frontend estarem prontos
 */
function waitForBackendAndFrontend() {
  const maxAttempts = 120;
  let backendReady = false;
  let attempts = 0;

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  // Usar IPv4 explicitamente para evitar problemas com resolução de localhost
  const healthUrl = `http://127.0.0.1:${BACKEND_PORT}/health`;

  const checkServices = () => {
    attempts++;

    if (attempts % 15 === 0 && !backendReady) {
      console.log(`⏳ Aguardando backend... (${attempts}s/${maxAttempts}s)`);
    }

    if (!backendReady) {
      const backendReq = http.get(healthUrl, { timeout: 3000 }, (res) => {
        if (res.statusCode === 200) {
          backendReady = true;
          console.log('✅ Backend está online!');
          
          // Iniciar job de renovação de licença
          startLicenseRenewalJob();
          
          loadFrontend();
        } else {
          console.log(`⚠️ Backend respondeu com status: ${res.statusCode}`);
        }
      });

      backendReq.on('error', (err) => {
        if (attempts === 1 || attempts % 15 === 0) {
          console.log(`🔄 Aguardando backend iniciar... (${err.code || err.message})`);
        }
      });
      backendReq.on('timeout', () => backendReq.destroy());
    }

    if (attempts < maxAttempts && !backendReady) {
      setTimeout(checkServices, 1000);
    } else if (!backendReady) {
      showTimeoutError();
    }
  };

  const loadFrontend = () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;

    if (isDev) {
      console.log('🔄 Carregando frontend em http://localhost:3000');
      mainWindow.loadURL('http://localhost:3000').catch(console.error);
    } else {
      // Em produção, servir frontend via HTTP local (necessário para Vue Router)
      const exeDir = path.dirname(process.execPath);
      
      const possiblePaths = [
        path.join(exeDir, 'frontend', '.output', 'public'),
        path.join(process.resourcesPath || exeDir, 'app', 'frontend', '.output', 'public'),
        path.join(__dirname, '..', 'frontend', '.output', 'public'),
        path.join(app.getAppPath(), 'frontend', '.output', 'public')
      ];
      
      const publicDir = possiblePaths.find(p => fs.existsSync(path.join(p, 'index.html')));
      
      if (publicDir) {
        // Iniciar servidor HTTP local para o frontend
        startFrontendServer(publicDir, () => {
          console.log(`🔄 Carregando frontend de http://localhost:${FRONTEND_PORT}`);
          mainWindow.loadURL(`http://localhost:${FRONTEND_PORT}`).catch(console.error);
        });
      } else {
        console.error('❌ Frontend não encontrado');
        showFrontendNotFoundError(possiblePaths);
      }
    }
  };
  
  // Função para iniciar servidor HTTP local para o frontend
  const startFrontendServer = (publicDir, callback) => {
    if (frontendServer) {
      callback();
      return;
    }
    
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject'
    };
    
    frontendServer = http.createServer((req, res) => {
      let filePath = req.url.split('?')[0]; // Remove query strings
      
      // Redirecionar para index.html para rotas SPA
      if (filePath === '/' || !path.extname(filePath)) {
        filePath = '/index.html';
      }
      
      const fullPath = path.join(publicDir, filePath);
      const ext = path.extname(fullPath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      fs.readFile(fullPath, (err, content) => {
        if (err) {
          // Se arquivo não encontrado, servir index.html (para rotas SPA)
          if (err.code === 'ENOENT') {
            fs.readFile(path.join(publicDir, 'index.html'), (err2, indexContent) => {
              if (err2) {
                res.writeHead(404);
                res.end('Not Found');
              } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(indexContent);
              }
            });
          } else {
            res.writeHead(500);
            res.end('Server Error');
          }
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        }
      });
    });
    
    frontendServer.listen(FRONTEND_PORT, '127.0.0.1', () => {
      console.log(`✅ Servidor frontend iniciado em http://localhost:${FRONTEND_PORT}`);
      callback();
    });
    
    frontendServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️ Porta ${FRONTEND_PORT} em uso, usando servidor existente`);
        callback();
      } else {
        console.error('❌ Erro ao iniciar servidor frontend:', err);
      }
    });
  };

  const showTimeoutError = () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    
    if (!mainWindow.isVisible()) mainWindow.show();
    
    const errorHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Erro - Backend não respondeu</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; margin: 0; }
          .container { background: white; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
          h1 { color: #e74c3c; margin-top: 0; }
          ul { text-align: left; color: #555; }
          button { margin-top: 20px; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; transition: transform 0.2s; }
          button:hover { transform: scale(1.05); }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Erro ao conectar ao backend</h1>
          <p>O backend não respondeu após 2 minutos.</p>
          <p><strong>Possíveis causas:</strong></p>
          <ul>
            <li>PostgreSQL não está rodando</li>
            <li>Erro ao iniciar o backend (verifique os logs)</li>
            <li>Porta 3001 já está em uso</li>
          </ul>
          <button onclick="location.reload()">🔄 Tentar Novamente</button>
        </div>
      </body>
      </html>
    `;
    mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHTML)}`);
  };

  const showFrontendNotFoundError = (paths) => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    
    if (!mainWindow.isVisible()) mainWindow.show();
    
    const errorHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Erro - Frontend não encontrado</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; margin: 0; }
          .container { background: white; padding: 40px; border-radius: 16px; max-width: 700px; margin: 0 auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
          h1 { color: #e74c3c; margin-top: 0; }
          pre { background: #f8f9fa; padding: 15px; border-radius: 8px; overflow-x: auto; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Frontend não encontrado</h1>
          <p>O aplicativo não conseguiu encontrar os arquivos do frontend.</p>
          <p><strong>Caminhos testados:</strong></p>
          <pre>${paths.map(p => `• ${p}`).join('\n')}</pre>
          <p>Reinstale o aplicativo ou verifique o build.</p>
        </div>
      </body>
      </html>
    `;
    mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHTML)}`);
  };

  setTimeout(checkServices, 2000);
}

/**
 * Cria menu de debug para produção
 */
function createDebugMenu() {
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        { role: 'quit', label: 'Sair' }
      ]
    },
    {
      label: 'Debug',
      submenu: [
        {
          label: '🔧 Abrir DevTools',
          accelerator: 'F12',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        },
        {
          label: '🔄 Recarregar',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.reload();
            }
          }
        },
        { type: 'separator' },
        {
          label: '📁 Abrir Pasta de Logs',
          click: async () => {
            const { shell } = require('electron');
            await shell.openPath(LOG_DIR);
          }
        },
        {
          label: '📋 Copiar Caminho do Log',
          click: () => {
            const { clipboard } = require('electron');
            clipboard.writeText(LOG_FILE);
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Caminho Copiado',
              message: `Caminho do arquivo de log copiado para a área de transferência:\n\n${LOG_FILE}`
            });
          }
        },
        { type: 'separator' },
        {
          label: '🔄 Reiniciar Backend',
          click: async () => {
            console.log('🔄 Reiniciando backend manualmente...');
            if (backendProcess) {
              backendProcess.kill();
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
            startBackend().catch(console.error);
          }
        },
        {
          label: '📊 Info do Sistema',
          click: () => {
            const info = `
🖥️ Sistema: ${os.platform()} ${os.release()}
💾 Memória: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB total
📁 App Path: ${app.getAppPath()}
📁 Exe Path: ${process.execPath}
📁 Resources: ${process.resourcesPath || 'N/A'}
📁 Logs: ${LOG_DIR}
🔧 Node: ${process.versions.node}
⚡ Electron: ${process.versions.electron}
🌐 Chrome: ${process.versions.chrome}
            `.trim();
            
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Informações do Sistema',
              message: info,
              buttons: ['OK', 'Copiar']
            }).then(result => {
              if (result.response === 1) {
                const { clipboard } = require('electron');
                clipboard.writeText(info);
              }
            });
          }
        }
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: '❓ Atalhos de Teclado',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Atalhos de Teclado',
              message: `
🔧 F12 - Abrir/Fechar DevTools
🔄 Ctrl+R - Recarregar página
🔍 Ctrl+Shift+I - DevTools (alternativo)
              `.trim()
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/**
 * Registra atalhos de teclado globais
 */
function registerShortcuts() {
  // F12 para DevTools
  globalShortcut.register('F12', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.toggleDevTools();
      console.log('🔧 DevTools toggled via F12');
    }
  });

  // Ctrl+Shift+I como alternativa
  globalShortcut.register('CmdOrCtrl+Shift+I', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.toggleDevTools();
      console.log('🔧 DevTools toggled via Ctrl+Shift+I');
    }
  });

  // Ctrl+Shift+L para abrir pasta de logs
  globalShortcut.register('CmdOrCtrl+Shift+L', async () => {
    const { shell } = require('electron');
    await shell.openPath(LOG_DIR);
    console.log('📁 Pasta de logs aberta via Ctrl+Shift+L');
  });

  console.log('⌨️ Atalhos de teclado registrados: F12, Ctrl+Shift+I, Ctrl+Shift+L');
}

/**
 * Cria a janela principal do Electron
 */
function createWindow() {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  // Criar menu de debug (sempre disponível)
  createDebugMenu();

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false,
    titleBarStyle: 'default',
    autoHideMenuBar: false  // Sempre mostrar menu para acesso ao debug
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
    console.log('🖼️ Janela principal exibida');
  });

  // Timeout de segurança
  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
      console.log('⏰ Timeout: mostrando janela');
      mainWindow.show();
      showLoadingPage();
    }
  }, 5000);

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000').catch(() => {
      console.log('⏳ Aguardando serviços...');
      waitForBackendAndFrontend();
    });
  } else {
    waitForBackendAndFrontend();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
      event.preventDefault();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
}

/**
 * Mostra página de carregamento
 */
function showLoadingPage() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  
  const loadingHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Mercadinho PDV - Iniciando...</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { background: white; padding: 60px; border-radius: 20px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        h1 { color: #333; margin-bottom: 30px; }
        .spinner { border: 5px solid #f3f3f3; border-top: 5px solid #667eea; border-radius: 50%; width: 60px; height: 60px; animation: spin 1s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        p { color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🏪 Mercadinho PDV</h1>
        <div class="spinner"></div>
        <p>Iniciando aplicativo...</p>
        <p style="font-size: 12px; color: #999;">Aguarde enquanto o backend está sendo iniciado.</p>
      </div>
      <script>
        setTimeout(() => {
          fetch('http://localhost:3001/health')
            .then(() => window.location.reload())
            .catch(() => {});
        }, 3000);
      </script>
    </body>
    </html>
  `;
  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(loadingHTML)}`);
}

/**
 * Mostra mensagem de erro
 */
function showError(title, message) {
  console.error(`[ERRO] ${title}: ${message}`);
  
  if (mainWindow && !mainWindow.isDestroyed()) {
    const safeMessage = message.replace(/'/g, "\\'").replace(/\n/g, '\\n');
    mainWindow.webContents.executeJavaScript(`
      alert('${title}\\n\\n${safeMessage}');
    `).catch(() => {});
  }
}

/**
 * Registra handlers IPC
 */
function setupIpcHandlers() {
  // ============================================
  // HARDWARE HANDLERS
  // ============================================

  // Salvar configurações de hardware
  ipcMain.handle('save-hardware-config', async (event, config) => {
    try {
      store.set('hardware', config);
      console.log('💾 Configuração de hardware salva:', config);
      return { success: true };
    } catch (err) {
      console.error('Erro ao salvar config hardware:', err);
      return { success: false, error: err.message };
    }
  });

  // Obter configurações de hardware
  ipcMain.handle('get-hardware-config', async () => {
    try {
      const config = store.get('hardware', {});
      return config;
    } catch (err) {
      return {};
    }
  });

  // Listar portas seriais
  ipcMain.handle('get-serial-ports', async () => {
    try {
      const ports = await SerialPort.list();
      return { success: true, ports };
    } catch (err) {
      console.error('Erro ao listar portas seriais:', err);
      return { success: false, error: err.message };
    }
  });

  // Ler peso da balança (Toledo)
  ipcMain.handle('read-scale-weight', async () => {
    const config = store.get('hardware', {});
    const portName = config.scalePort;

    if (!portName) {
      return { success: false, error: 'Porta da balança não configurada' };
    }

    return new Promise((resolve) => {
      const port = new SerialPort({
        path: portName,
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        autoOpen: false
      });

      let timeout;
      let buffer = '';

      port.open((err) => {
        if (err) {
          return resolve({ success: false, error: 'Erro ao abrir porta: ' + err.message });
        }

        // Timeout de 3 segundos
        timeout = setTimeout(() => {
          if (port.isOpen) port.close();
          resolve({ success: false, error: 'Timeout: Balança não respondeu' });
        }, 3000);
      });

      port.on('data', (data) => {
        buffer += data.toString('ascii');
        
        // Toledo P03/P05/P06 costumam enviar STX(02) ... ETX(03) ou CR(13)
        // Buffer example: \x0200500\x03
        if (buffer.includes('\x02') && (buffer.includes('\x03') || buffer.includes('\r'))) {
           if (timeout) clearTimeout(timeout);
           port.close();

           // Extrair números
           const clean = buffer.replace(/[^\d]/g, ''); 
           // Pega os últimos digitos significativos (assumindo 5 ou 6 dígitos de peso)
           // Ex: 001500 -> 1.500
           
           if (clean.length >= 3) {
             const weight = parseFloat(clean) / 1000;
             resolve({ success: true, weight });
           } else {
             resolve({ success: false, error: 'Dados inválidos: ' + buffer });
           }
        }
      });
      
      port.on('error', (err) => {
        if (timeout) clearTimeout(timeout);
        if (port.isOpen) port.close();
        resolve({ success: false, error: err.message });
      });
    });
  });

  // Imprimir Ticket Térmico
  ipcMain.handle('print-thermal', async (event, ticketData) => {
    const config = store.get('hardware', {});
    const printerName = config.printerName;

    if (!printerName) {
      return { success: false, error: 'Impressora não configurada' };
    }

    let filePath;
    if (typeof ticketData === 'string') {
        filePath = ticketData;
    } else if (ticketData && ticketData.filepath) {
        filePath = ticketData.filepath;
    } else {
        return { success: false, error: 'Caminho do ticket inválido' };
    }
    
    if (!fs.existsSync(filePath)) {
        return { success: false, error: 'Arquivo não encontrado: ' + filePath };
    }

    return new Promise((resolve) => {
      const cmd = `copy /b "${filePath}" "\\\\localhost\\${printerName}"`;
      console.log('🖨️ Imprimindo:', cmd);
      
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Erro impressão:', error);
          resolve({ success: false, error: error.message });
        } else {
          resolve({ success: true });
        }
      });
    });
  });

  ipcMain.handle('backend-status', async () => {
    return new Promise((resolve) => {
      const req = http.get(`${BACKEND_URL}/health`, (res) => {
        resolve({ online: res.statusCode === 200 });
      });
      req.on('error', () => resolve({ online: false }));
      req.setTimeout(2000, () => { req.destroy(); resolve({ online: false }); });
    });
  });

  ipcMain.handle('restart-backend', async () => {
    if (backendProcess) {
      backendProcess.kill();
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    await startBackend().catch(console.error);
    return { success: true };
  });

  ipcMain.handle('get-database-info', async () => {
    return {
      mode: DATABASE_MODE,
      dataPath: APP_DATA_PATH
    };
  });

  ipcMain.handle('open-data-folder', async () => {
    const { shell } = require('electron');
    await shell.openPath(APP_DATA_PATH);
    return { success: true };
  });

  // Handler para abrir pasta de logs
  ipcMain.handle('open-logs-folder', async () => {
    const { shell } = require('electron');
    await shell.openPath(LOG_DIR);
    return { success: true, path: LOG_DIR };
  });

  // Handler para obter últimas linhas do log
  ipcMain.handle('get-recent-logs', async (event, lines = 100) => {
    try {
      if (fs.existsSync(LOG_FILE)) {
        const content = fs.readFileSync(LOG_FILE, 'utf8');
        const allLines = content.split('\n');
        const recentLines = allLines.slice(-lines);
        return { success: true, logs: recentLines.join('\n'), path: LOG_FILE };
      }
      return { success: false, error: 'Arquivo de log não encontrado' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Handler para obter informações do sistema
  ipcMain.handle('get-system-info', async () => {
    return {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      appPath: app.getAppPath(),
      exePath: process.execPath,
      resourcesPath: process.resourcesPath,
      logPath: LOG_FILE,
      logDir: LOG_DIR,
      dataPath: APP_DATA_PATH,
      versions: {
        node: process.versions.node,
        electron: process.versions.electron,
        chrome: process.versions.chrome
      },
      isPackaged: app.isPackaged
    };
  });

  // Handler para toggle DevTools
  ipcMain.handle('toggle-devtools', async () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.toggleDevTools();
      return { success: true };
    }
    return { success: false };
  });

  // ============================================
  // LICENSE HANDLERS
  // ============================================

  // Obter status da licença
  ipcMain.handle('get-license-status', async () => {
    return await checkLicenseStatus();
  });

  // Tentar renovar licença
  ipcMain.handle('renew-license', async () => {
    return await renewLicenseSilently();
  });

  // ============================================
  // UPDATE HANDLERS
  // ============================================

  // Verificar atualizações
  ipcMain.handle('check-for-updates', async (event, force = false) => {
    return await updater.checkForUpdates(force);
  });

  // Baixar atualização
  ipcMain.handle('download-update', async (event, downloadUrl) => {
    try {
      const filePath = await updater.downloadUpdate(downloadUrl, (percent) => {
        // Enviar progresso para o renderer
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('update-download-progress', percent);
        }
      });
      return { success: true, filePath };
    } catch (error) {
      console.error('[Updater] Erro no download:', error);
      return { success: false, error: error.message };
    }
  });

  // Instalar atualização
  ipcMain.handle('install-update', async (event, installerPath) => {
    try {
      // Fazer backup antes de instalar
      console.log('🔄 Fazendo backup antes de atualizar...');
      
      // Executar script de backup se existir
      const backupScript = path.join(__dirname, '..', 'installer', 'backup-database.ps1');
      if (fs.existsSync(backupScript)) {
        try {
          const { execSync } = require('child_process');
          execSync(`powershell.exe -ExecutionPolicy Bypass -File "${backupScript}" -Silent`, {
            timeout: 120000
          });
          console.log('✅ Backup concluído');
        } catch (backupErr) {
          console.error('⚠️ Aviso: Backup falhou, mas continuando...', backupErr.message);
        }
      }
      
      await updater.installUpdate(installerPath);
      return true;
    } catch (error) {
      console.error('[Updater] Erro na instalação:', error);
      return false;
    }
  });

  // Pular versão
  ipcMain.handle('skip-version', async (event, version) => {
    updater.skipVersion(version);
    return true;
  });
}

// Quando Electron estiver pronto
app.whenReady().then(async () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('⚡ Mercadinho PDV - Electron iniciado');
  console.log('═══════════════════════════════════════════════════════');
  
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  console.log('📊 Modo:', isDev ? 'DESENVOLVIMENTO' : 'PRODUÇÃO');
  console.log('📁 Executável:', process.execPath);
  console.log('📁 Resources:', process.resourcesPath || '(N/A)');
  console.log('📁 App Path:', app.getAppPath());
  console.log('📁 Logs:', LOG_FILE);
  console.log('═══════════════════════════════════════════════════════');
  
  // Registrar atalhos de teclado para debug
  registerShortcuts();
  
  setupIpcHandlers();
  
  if (isFirstRun()) {
    console.log('🎯 Primeira execução detectada');
    await new Promise(resolve => setTimeout(resolve, 2000));
    markSetupComplete();
  }
  
  const backendAlreadyRunning = await checkBackendRunning();
  
  if (backendAlreadyRunning) {
    console.log('✅ Backend já está rodando externamente');
    backendStartedByElectron = false;
  } else {
    console.log('⚠️  Backend não está rodando');
    
    if (!isDev || process.env.START_BACKEND === 'true') {
      console.log('🚀 Iniciando backend...');
      startBackend().catch(console.error);
    } else {
      console.log('💡 Modo dev: aguardando backend externo (use START_BACKEND=true para iniciar)');
    }
  }
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Limpar atalhos globais
  globalShortcut.unregisterAll();
  console.log('⌨️ Atalhos de teclado desregistrados');
  
  // Parar job de renovação de licença
  if (licenseRenewalInterval) {
    clearInterval(licenseRenewalInterval);
    console.log('🛑 Job de renovação de licença encerrado');
  }
  
  // Fechar servidor frontend
  if (frontendServer) {
    frontendServer.close();
    console.log('🛑 Servidor frontend encerrado');
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
  
  if (backendProcess && backendStartedByElectron) {
    console.log('🛑 Encerrando backend...');
    backendProcess.kill('SIGTERM');
    
    const timeout = setTimeout(() => {
      if (backendProcess) backendProcess.kill('SIGKILL');
    }, 5000);

    backendProcess.on('exit', () => clearTimeout(timeout));
  }
});

process.on('uncaughtException', (error) => {
  console.error('Erro não capturado:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Promise rejeitada:', reason);
});

