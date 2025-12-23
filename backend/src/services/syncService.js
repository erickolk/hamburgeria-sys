const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

class SyncService {
  constructor() {
    this.isOnline = false;
    this.isSyncing = false;
    this.syncInterval = 60000; // 1 minuto (padrão)
    this.vpsApiUrl = null;
    this.syncToken = null;
    this.maxRetries = 3;
    this.syncIntervalId = null;
    this.isEnabled = false;
  }

  /**
   * Inicializar serviço de sincronização
   */
  async initialize() {
    try {
      // Carregar configuração do banco
      const config = await prisma.syncConfig.findFirst();
      
      if (config) {
        this.vpsApiUrl = config.vpsApiUrl;
        this.syncToken = config.syncToken;
        this.syncInterval = config.syncInterval;
        this.isEnabled = config.isEnabled;
        
        console.log('✅ Configuração de sincronização carregada');
        console.log(`   VPS URL: ${this.vpsApiUrl}`);
        console.log(`   Intervalo: ${this.syncInterval}ms`);
        console.log(`   Habilitado: ${this.isEnabled}`);
      } else {
        console.log('⚠️  Nenhuma configuração de sincronização encontrada');
        this.isEnabled = false;
      }
    } catch (error) {
      console.error('❌ Erro ao carregar configuração de sincronização:', error.message);
      this.isEnabled = false;
    }
  }

  /**
   * Verificar status da conexão com a VPS
   */
  async checkConnection() {
    if (!this.vpsApiUrl || !this.isEnabled) {
      this.isOnline = false;
      return false;
    }

    try {
      const response = await axios.get(`${this.vpsApiUrl}/health`, {
        timeout: 5000,
        headers: {
          'Authorization': `Bearer ${this.syncToken}`
        }
      });
      
      this.isOnline = response.status === 200;
      return this.isOnline;
    } catch (error) {
      this.isOnline = false;
      return false;
    }
  }

  /**
   * Adicionar item à fila de sincronização
   */
  async queueForSync(entity, entityId, operation, payload) {
    try {
      await prisma.syncQueue.create({
        data: {
          entity,
          entityId,
          operation,
          payload,
          status: 'pending'
        }
      });
      console.log(`✅ Item adicionado à fila: ${entity} ${operation} ${entityId}`);
    } catch (error) {
      console.error('❌ Erro ao adicionar à fila:', error.message);
    }
  }

  /**
   * Sincronizar vendas para VPS (upload)
   */
  async syncSalesToVPS() {
    try {
      const pendingSales = await prisma.sale.findMany({
        where: { synced: false },
        include: {
          items: {
            include: {
              product: true
            }
          },
          customer: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        take: 50, // Processar em lotes
        orderBy: { createdAt: 'asc' }
      });

      if (pendingSales.length === 0) {
        return { success: true, synced: 0 };
      }

      console.log(`📤 Sincronizando ${pendingSales.length} vendas para VPS...`);
      let successCount = 0;
      let errorCount = 0;

      for (const sale of pendingSales) {
        try {
          // Enviar para VPS
          const response = await axios.post(
            `${this.vpsApiUrl}/sync/sales`,
            {
              ...sale,
              syncSource: 'local',
              localId: sale.localId
            },
            {
              headers: {
                'Authorization': `Bearer ${this.syncToken}`,
                'Content-Type': 'application/json'
              },
              timeout: 15000
            }
          );

          // Marcar como sincronizado
          await prisma.sale.update({
            where: { id: sale.id },
            data: {
              synced: true,
              syncedAt: new Date(),
              vpsId: response.data.id // ID na VPS
            }
          });

          // Marcar itens como sincronizados
          await prisma.saleItem.updateMany({
            where: { saleId: sale.id },
            data: {
              synced: true,
              syncedAt: new Date()
            }
          });

          // Log de sucesso
          await this.logSync('sale', sale.id, 'create', 'upload', 'success', {
            vpsId: response.data.id,
            total: sale.total
          });

          successCount++;
          console.log(`   ✓ Venda ${sale.id} sincronizada`);

        } catch (error) {
          errorCount++;
          console.error(`   ✗ Erro ao sincronizar venda ${sale.id}:`, error.message);
          
          // Log de erro
          await this.logSync('sale', sale.id, 'create', 'upload', 'error', {
            error: error.message,
            statusCode: error.response?.status
          });
          
          // Adicionar à fila para retry
          await this.queueForSync('sale', sale.id, 'create', sale);
        }
      }

      console.log(`📤 Sincronização de vendas concluída: ${successCount} sucesso, ${errorCount} erros`);
      return { success: true, synced: successCount, errors: errorCount };

    } catch (error) {
      console.error('❌ Erro geral ao sincronizar vendas:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sincronizar produtos da VPS (download)
   */
  async syncProductsFromVPS() {
    try {
      // Pegar timestamp da última sincronização bem-sucedida
      const lastSync = await prisma.syncLog.findFirst({
        where: {
          entity: 'product',
          direction: 'download',
          status: 'success'
        },
        orderBy: { timestamp: 'desc' }
      });

      const lastSyncDate = lastSync?.timestamp || new Date(0);

      console.log(`📥 Baixando produtos atualizados desde ${lastSyncDate.toISOString()}...`);

      // Buscar produtos atualizados na VPS
      const response = await axios.get(
        `${this.vpsApiUrl}/sync/products`,
        {
          params: { 
            updatedAfter: lastSyncDate.toISOString(),
            limit: 100
          },
          headers: { 
            'Authorization': `Bearer ${this.syncToken}` 
          },
          timeout: 30000
        }
      );

      const updatedProducts = response.data.products || response.data || [];

      if (updatedProducts.length === 0) {
        console.log('   Nenhum produto para sincronizar');
        return { success: true, synced: 0 };
      }

      console.log(`   📦 ${updatedProducts.length} produtos para atualizar`);
      let successCount = 0;

      // Atualizar produtos locais
      for (const product of updatedProducts) {
        try {
          await prisma.product.upsert({
            where: { id: product.id },
            update: {
              name: product.name,
              sku: product.sku,
              barcode: product.barcode,
              costPrice: product.costPrice,
              salePrice: product.salePrice,
              stockQuantity: product.stockQuantity,
              reorderPoint: product.reorderPoint,
              saleUnit: product.saleUnit,
              category: product.category,
              observations: product.observations,
              lastSyncAt: new Date(),
              vpsUpdatedAt: new Date(product.updatedAt)
            },
            create: {
              id: product.id,
              name: product.name,
              sku: product.sku,
              barcode: product.barcode,
              costPrice: product.costPrice,
              salePrice: product.salePrice,
              stockQuantity: product.stockQuantity || 0,
              reorderPoint: product.reorderPoint || 0,
              saleUnit: product.saleUnit || 'UNIT',
              category: product.category,
              observations: product.observations,
              lastSyncAt: new Date(),
              vpsUpdatedAt: new Date(product.updatedAt)
            }
          });

          successCount++;
        } catch (error) {
          console.error(`   ✗ Erro ao atualizar produto ${product.id}:`, error.message);
        }
      }

      // Log de sucesso
      await this.logSync('product', 'bulk', 'update', 'download', 'success', {
        count: successCount,
        total: updatedProducts.length
      });

      console.log(`📥 Produtos sincronizados: ${successCount}/${updatedProducts.length}`);
      return { success: true, synced: successCount };

    } catch (error) {
      console.error('❌ Erro ao sincronizar produtos:', error.message);
      await this.logSync('product', 'bulk', 'update', 'download', 'error', {
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Sincronizar movimentações de estoque para VPS
   */
  async syncStockMovementsToVPS() {
    try {
      const pendingMovements = await prisma.stockMovement.findMany({
        where: { synced: false },
        include: {
          product: true,
          user: {
            select: { id: true, name: true }
          }
        },
        take: 100,
        orderBy: { date: 'asc' }
      });

      if (pendingMovements.length === 0) {
        return { success: true, synced: 0 };
      }

      console.log(`📤 Sincronizando ${pendingMovements.length} movimentações de estoque...`);
      let successCount = 0;

      for (const movement of pendingMovements) {
        try {
          await axios.post(
            `${this.vpsApiUrl}/sync/stock-movements`,
            movement,
            {
              headers: {
                'Authorization': `Bearer ${this.syncToken}`,
                'Content-Type': 'application/json'
              },
              timeout: 10000
            }
          );

          await prisma.stockMovement.update({
            where: { id: movement.id },
            data: {
              synced: true,
              syncedAt: new Date()
            }
          });

          successCount++;
        } catch (error) {
          console.error(`   ✗ Erro ao sincronizar movimento ${movement.id}:`, error.message);
          await this.queueForSync('stock-movement', movement.id, 'create', movement);
        }
      }

      console.log(`📤 Movimentações sincronizadas: ${successCount}/${pendingMovements.length}`);
      return { success: true, synced: successCount };

    } catch (error) {
      console.error('❌ Erro ao sincronizar movimentações:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sincronizar caixas para VPS
   */
  async syncCashRegistersToVPS() {
    try {
      const pendingRegisters = await prisma.cashRegister.findMany({
        where: { synced: false },
        include: {
          user: {
            select: { id: true, name: true }
          },
          cashMovements: true
        },
        take: 50,
        orderBy: { openedAt: 'asc' }
      });

      if (pendingRegisters.length === 0) {
        return { success: true, synced: 0 };
      }

      console.log(`📤 Sincronizando ${pendingRegisters.length} caixas...`);
      let successCount = 0;

      for (const register of pendingRegisters) {
        try {
          await axios.post(
            `${this.vpsApiUrl}/sync/cash-registers`,
            register,
            {
              headers: {
                'Authorization': `Bearer ${this.syncToken}`,
                'Content-Type': 'application/json'
              },
              timeout: 10000
            }
          );

          await prisma.cashRegister.update({
            where: { id: register.id },
            data: {
              synced: true,
              syncedAt: new Date()
            }
          });

          successCount++;
        } catch (error) {
          console.error(`   ✗ Erro ao sincronizar caixa ${register.id}:`, error.message);
          await this.queueForSync('cash-register', register.id, 'create', register);
        }
      }

      console.log(`📤 Caixas sincronizados: ${successCount}/${pendingRegisters.length}`);
      return { success: true, synced: successCount };

    } catch (error) {
      console.error('❌ Erro ao sincronizar caixas:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sincronizar clientes da VPS (download)
   */
  async syncCustomersFromVPS() {
    try {
      const lastSync = await prisma.syncLog.findFirst({
        where: {
          entity: 'customer',
          direction: 'download',
          status: 'success'
        },
        orderBy: { timestamp: 'desc' }
      });

      const lastSyncDate = lastSync?.timestamp || new Date(0);

      const response = await axios.get(
        `${this.vpsApiUrl}/sync/customers`,
        {
          params: { 
            updatedAfter: lastSyncDate.toISOString(),
            limit: 100
          },
          headers: { 
            'Authorization': `Bearer ${this.syncToken}` 
          },
          timeout: 30000
        }
      );

      const updatedCustomers = response.data.customers || response.data || [];

      if (updatedCustomers.length === 0) {
        return { success: true, synced: 0 };
      }

      console.log(`📥 Sincronizando ${updatedCustomers.length} clientes...`);
      let successCount = 0;

      for (const customer of updatedCustomers) {
        try {
          await prisma.customer.upsert({
            where: { id: customer.id },
            update: {
              ...customer,
              synced: true,
              syncedAt: new Date()
            },
            create: {
              ...customer,
              synced: true,
              syncedAt: new Date()
            }
          });

          successCount++;
        } catch (error) {
          console.error(`   ✗ Erro ao atualizar cliente ${customer.id}:`, error.message);
        }
      }

      await this.logSync('customer', 'bulk', 'update', 'download', 'success', {
        count: successCount
      });

      console.log(`📥 Clientes sincronizados: ${successCount}/${updatedCustomers.length}`);
      return { success: true, synced: successCount };

    } catch (error) {
      console.error('❌ Erro ao sincronizar clientes:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Processar fila de sincronização (retry de itens com erro)
   */
  async processSyncQueue() {
    try {
      const queueItems = await prisma.syncQueue.findMany({
        where: {
          status: 'pending',
          attempts: { lt: this.maxRetries }
        },
        take: 20,
        orderBy: { createdAt: 'asc' }
      });

      if (queueItems.length === 0) {
        return { success: true, processed: 0 };
      }

      console.log(`🔄 Processando ${queueItems.length} itens da fila...`);
      let successCount = 0;

      for (const item of queueItems) {
        try {
          // Atualizar status para "syncing"
          await prisma.syncQueue.update({
            where: { id: item.id },
            data: {
              status: 'syncing',
              attempts: item.attempts + 1,
              lastAttempt: new Date()
            }
          });

          // Enviar para VPS
          await axios.post(
            `${this.vpsApiUrl}/sync/${item.entity}`,
            item.payload,
            {
              headers: { 
                'Authorization': `Bearer ${this.syncToken}`,
                'Content-Type': 'application/json'
              },
              timeout: 10000
            }
          );

          // Marcar como sucesso e remover da fila
          await prisma.syncQueue.update({
            where: { id: item.id },
            data: { status: 'success' }
          });

          successCount++;

        } catch (error) {
          // Marcar como erro ou failed (se atingiu max retries)
          const newStatus = item.attempts + 1 >= this.maxRetries ? 'failed' : 'pending';
          
          await prisma.syncQueue.update({
            where: { id: item.id },
            data: {
              status: newStatus,
              error: error.message
            }
          });

          if (newStatus === 'failed') {
            console.error(`   ✗ Item ${item.id} falhou permanentemente após ${this.maxRetries} tentativas`);
          }
        }
      }

      console.log(`🔄 Fila processada: ${successCount}/${queueItems.length} sucessos`);
      return { success: true, processed: successCount };

    } catch (error) {
      console.error('❌ Erro ao processar fila:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Criar log de sincronização
   */
  async logSync(entity, entityId, operation, direction, status, details = null) {
    try {
      await prisma.syncLog.create({
        data: {
          entity,
          entityId,
          operation,
          direction,
          status,
          details: details || {}
        }
      });
    } catch (error) {
      console.error('Erro ao criar log de sincronização:', error.message);
    }
  }

  /**
   * Sincronização completa (ciclo completo)
   */
  async syncAll() {
    if (this.isSyncing) {
      console.log('⏳ Sincronização já em andamento, aguardando...');
      return { success: false, message: 'Sincronização já em andamento' };
    }

    if (!this.isEnabled) {
      console.log('⚠️  Sincronização desabilitada');
      return { success: false, message: 'Sincronização desabilitada' };
    }

    this.isSyncing = true;
    const startTime = Date.now();

    try {
      console.log('🔄 ====== INICIANDO SINCRONIZAÇÃO ======');

      // 1. Verificar conexão
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        console.log('❌ Sem conexão com VPS, sincronização cancelada');
        return { success: false, message: 'Sem conexão com VPS' };
      }

      console.log('✅ Conexão com VPS estabelecida');

      const results = {};

      // 2. UPLOAD: Enviar dados locais para VPS
      console.log('\n📤 === FASE 1: UPLOAD ===');
      results.sales = await this.syncSalesToVPS();
      results.stockMovements = await this.syncStockMovementsToVPS();
      results.cashRegisters = await this.syncCashRegistersToVPS();

      // 3. DOWNLOAD: Baixar atualizações da VPS
      console.log('\n📥 === FASE 2: DOWNLOAD ===');
      results.products = await this.syncProductsFromVPS();
      results.customers = await this.syncCustomersFromVPS();

      // 4. Processar fila de retry
      console.log('\n🔄 === FASE 3: FILA DE RETRY ===');
      results.queue = await this.processSyncQueue();

      // 5. Atualizar última sincronização
      await prisma.syncConfig.updateMany({
        data: { lastSync: new Date() }
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`\n✅ ====== SINCRONIZAÇÃO CONCLUÍDA em ${duration}s ======`);
      console.log(`   Vendas: ${results.sales.synced || 0}`);
      console.log(`   Produtos: ${results.products.synced || 0}`);
      console.log(`   Movimentações: ${results.stockMovements.synced || 0}`);
      console.log(`   Caixas: ${results.cashRegisters.synced || 0}`);
      console.log(`   Clientes: ${results.customers.synced || 0}`);
      console.log(`   Fila: ${results.queue.processed || 0}`);

      return { 
        success: true, 
        duration,
        results,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Erro crítico na sincronização:', error);
      return { success: false, error: error.message };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Iniciar worker de sincronização periódica
   */
  startSyncWorker() {
    if (!this.isEnabled) {
      console.log('⚠️  Sincronização desabilitada, worker não iniciado');
      return;
    }

    console.log('🚀 Worker de sincronização iniciado');
    console.log(`   Intervalo: ${this.syncInterval}ms (${this.syncInterval / 1000}s)`);

    // Sincronização inicial após 10 segundos
    setTimeout(() => {
      console.log('🔄 Executando sincronização inicial...');
      this.syncAll().catch(console.error);
    }, 10000);

    // Sincronização periódica
    this.syncIntervalId = setInterval(async () => {
      await this.syncAll();
    }, this.syncInterval);
  }

  /**
   * Parar worker de sincronização
   */
  stopSyncWorker() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
      console.log('🛑 Worker de sincronização parado');
    }
  }

  /**
   * Obter estatísticas de sincronização
   */
  async getStats() {
    try {
      const [pendingSales, pendingQueue, lastSync, failedQueue] = await Promise.all([
        prisma.sale.count({ where: { synced: false } }),
        prisma.syncQueue.count({ where: { status: 'pending' } }),
        prisma.syncLog.findFirst({ orderBy: { timestamp: 'desc' } }),
        prisma.syncQueue.count({ where: { status: 'failed' } })
      ]);

      return {
        online: this.isOnline,
        syncing: this.isSyncing,
        enabled: this.isEnabled,
        pending: {
          sales: pendingSales,
          queue: pendingQueue,
          failed: failedQueue
        },
        lastSync: lastSync?.timestamp || null
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error.message);
      return null;
    }
  }
}

// Exportar instância única (singleton)
module.exports = new SyncService();

