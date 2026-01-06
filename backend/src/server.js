const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const saleRoutes = require('./routes/sales');
const customerRoutes = require('./routes/customers');
const supplierRoutes = require('./routes/suppliers');
const purchaseRoutes = require('./routes/purchases');
const stockMovementRoutes = require('./routes/stock-movements');
const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/reports');
const cashRoutes = require('./routes/cash');
const categoryRoutes = require('./routes/categories');
const productPhotoRoutes = require('./routes/product-photos');
const settingsRoutes = require('./routes/settings');
const syncRoutes = require('./routes/sync');
const licenseRoutes = require('./routes/licenses');
const licenseLocalRoutes = require('./routes/license-local');
const updatesRoutes = require('./routes/updates');
const hardwareRoutes = require('./routes/hardware');
const swaggerSetup = require('./config/swagger');
const syncService = require('./services/syncService');

const app = express();

// Configurar trust proxy para rate limiting funcionar corretamente atrás de proxy
app.set('trust proxy', true);

// Verificar se Prisma Client está disponível
let prisma;
try {
  prisma = new PrismaClient();
  console.log('✅ Prisma Client inicializado com sucesso');
} catch (error) {
  console.error('❌ Erro ao inicializar Prisma Client:', error);
  console.error('💡 Execute: npx prisma generate');
  process.exit(1);
}
// Tratar requisições OPTIONS (preflight) PRIMEIRO - antes de qualquer coisa
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  console.log(`[CORS] Preflight OPTIONS request de: ${origin || 'sem origin'}`);
  
  // Permitir a origem que fez a requisição
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  return res.status(204).end();
});

// Configurar CORS ANTES de qualquer outro middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://evomercearia-frontend.d3vbpv.easypanel.host',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requisições sem origin (mobile apps, Postman, etc)
    if (!origin) {
      return callback(null, true);
    }
    
    // Em desenvolvimento, permitir qualquer origem
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // Em produção, verificar se a origem está na lista
    if (allowedOrigins.some(allowed => origin.includes(allowed.replace('https://', '').replace('http://', '')))) {
      callback(null, true);
    } else if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`[CORS] Permitindo origem: ${origin}`);
      callback(null, true); // Permitir por enquanto para debug
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 horas
};

// Aplicar CORS - PRIMEIRO middleware (depois do OPTIONS handler)
app.use(cors(corsOptions));

// Log de CORS para debug
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    console.log(`[CORS] OPTIONS request de: ${req.headers.origin}`);
  }
  next();
});

// Middleware de segurança (configurar helmet para não interferir com CORS)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false // Desabilitar CSP temporariamente para debug
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela
  // Desabilitar validação de trust proxy para evitar erro em produção local
  validate: { trustProxy: false }
});
app.use(limiter);

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Swagger documentation
swaggerSetup(app);

// Health check
app.get('/health', async (req, res) => {
  const syncStats = await syncService.getStats();
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    sync: syncStats ? {
      online: syncStats.online,
      enabled: syncStats.enabled
    } : null
  });
});

// Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/sales', saleRoutes);
app.use('/customers', customerRoutes);
app.use('/suppliers', supplierRoutes);
app.use('/purchases', purchaseRoutes);
app.use('/stock-movements', stockMovementRoutes);
app.use('/users', userRoutes);
app.use('/reports', reportRoutes);
app.use('/cash', cashRoutes);
app.use('/categories', categoryRoutes);
app.use('/settings', settingsRoutes);
app.use('/sync', syncRoutes);
app.use('/licenses', licenseRoutes);
app.use('/license', licenseLocalRoutes);
app.use('/updates', updatesRoutes);
app.use('/hardware', hardwareRoutes);
app.use('/', productPhotoRoutes); // Rotas de fotos de produtos incluem o prefixo /products

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.details
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Token inválido ou expirado'
    });
  }
  
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado'
  });
});

const PORT = process.env.PORT || 3001;

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM recebido, fechando servidor...');
  syncService.stopSyncWorker();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT recebido, fechando servidor...');
  syncService.stopSyncWorker();
  await prisma.$disconnect();
  process.exit(0);
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📚 Documentação disponível em http://localhost:${PORT}/api-docs`);
    
    // Inicializar serviço de sincronização
    if (process.env.SYNC_ENABLED === 'true') {
      console.log('🔄 Inicializando serviço de sincronização...');
      await syncService.initialize();
      
      if (syncService.isEnabled) {
        syncService.startSyncWorker();
        console.log('✅ Worker de sincronização iniciado');
      } else {
        console.log('⚠️  Sincronização desabilitada na configuração');
      }
    } else {
      console.log('ℹ️  Sincronização não habilitada (use SYNC_ENABLED=true)');
    }
  });
}

module.exports = app;