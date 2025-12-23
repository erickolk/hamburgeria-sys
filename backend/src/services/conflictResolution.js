const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ConflictResolution {
  /**
   * Tratar conflito de estoque negativo
   * Pode ocorrer quando múltiplos caixas vendem offline o mesmo produto
   */
  async handleNegativeStock(productId, newQuantity, context = {}) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, sku: true, stockQuantity: true }
      });

      if (!product) {
        return { 
          allow: false, 
          error: 'Produto não encontrado' 
        };
      }

      console.log(`⚠️  Conflito de estoque negativo detectado:`);
      console.log(`   Produto: ${product.name} (${product.sku})`);
      console.log(`   Estoque atual: ${product.stockQuantity}`);
      console.log(`   Nova quantidade: ${newQuantity}`);
      console.log(`   Contexto: ${JSON.stringify(context)}`);

      if (newQuantity < 0) {
        // Estratégia: Aceitar mas criar alerta para gerente
        await this.createAlert({
          type: 'negative_stock',
          severity: 'high',
          productId,
          productName: product.name,
          currentStock: product.stockQuantity.toString(),
          newStock: newQuantity.toString(),
          context,
          message: `Estoque negativo após sincronização: ${product.name}`,
          requiresAction: true,
          createdAt: new Date()
        });

        // Permitir estoque negativo mas marcar para revisão
        return { 
          allow: true, 
          requiresReview: true,
          alert: 'Estoque negativo detectado. Gerente será notificado.',
          strategy: 'allow_with_alert'
        };
      }

      return { allow: true, requiresReview: false };

    } catch (error) {
      console.error('Erro ao tratar conflito de estoque:', error);
      return { 
        allow: false, 
        error: error.message 
      };
    }
  }

  /**
   * Tratar conflito de preço
   * Ocorre quando preço do produto mudou na VPS durante período offline
   */
  async handlePriceConflict(productId, localPrice, vpsPrice, saleDate) {
    try {
      console.log(`⚠️  Conflito de preço detectado:`);
      console.log(`   Produto ID: ${productId}`);
      console.log(`   Preço local (no momento da venda): R$ ${localPrice}`);
      console.log(`   Preço VPS (atualizado): R$ ${vpsPrice}`);
      console.log(`   Data da venda: ${saleDate}`);

      // Estratégia: Usar preço do momento da venda (local)
      // A VPS deve aceitar e registrar para auditoria
      
      // Criar log de auditoria
      await prisma.auditLog.create({
        data: {
          userId: 'SYSTEM',
          action: 'PRICE_CONFLICT',
          entity: 'sale',
          entityId: productId,
          details: {
            type: 'price_conflict',
            localPrice: localPrice.toString(),
            vpsPrice: vpsPrice.toString(),
            saleDate,
            resolution: 'use_local_price',
            reason: 'Venda realizada offline com preço vigente no momento'
          }
        }
      });

      return { 
        useLocal: true, 
        audit: true,
        strategy: 'use_sale_time_price',
        message: 'Preço da venda mantido. Diferença registrada para auditoria.'
      };

    } catch (error) {
      console.error('Erro ao tratar conflito de preço:', error);
      return { 
        useLocal: true, 
        audit: false, 
        error: error.message 
      };
    }
  }

  /**
   * Tratar conflito de venda duplicada
   * Evitar sincronizar a mesma venda duas vezes
   */
  async handleDuplicateSale(localId, vpsId) {
    try {
      // Verificar se já existe venda com mesmo localId ou vpsId
      const existingSale = await prisma.sale.findFirst({
        where: {
          OR: [
            { localId },
            { vpsId }
          ]
        }
      });

      if (existingSale) {
        console.log(`⚠️  Venda duplicada detectada:`);
        console.log(`   Local ID: ${localId}`);
        console.log(`   VPS ID: ${vpsId}`);
        console.log(`   Venda existente: ${existingSale.id}`);

        return {
          isDuplicate: true,
          existingSaleId: existingSale.id,
          action: 'skip',
          message: 'Venda já sincronizada anteriormente'
        };
      }

      return {
        isDuplicate: false,
        action: 'proceed'
      };

    } catch (error) {
      console.error('Erro ao verificar venda duplicada:', error);
      return {
        isDuplicate: false,
        action: 'proceed',
        warning: 'Não foi possível verificar duplicidade'
      };
    }
  }

  /**
   * Tratar conflito temporal
   * Quando um registro foi alterado na VPS após ser editado localmente
   */
  async handleTemporalConflict(entityType, localUpdatedAt, vpsUpdatedAt) {
    try {
      const localTime = new Date(localUpdatedAt);
      const vpsTime = new Date(vpsUpdatedAt);

      console.log(`⚠️  Conflito temporal detectado em ${entityType}:`);
      console.log(`   Atualização local: ${localTime.toISOString()}`);
      console.log(`   Atualização VPS: ${vpsTime.toISOString()}`);

      // Estratégia: Mais recente ganha (Last-Write-Wins)
      if (localTime > vpsTime) {
        return {
          winner: 'local',
          strategy: 'last_write_wins',
          message: 'Versão local mais recente será usada'
        };
      } else if (vpsTime > localTime) {
        return {
          winner: 'vps',
          strategy: 'last_write_wins',
          message: 'Versão VPS mais recente será usada'
        };
      } else {
        return {
          winner: 'equal',
          strategy: 'no_conflict',
          message: 'Versões idênticas, sem conflito'
        };
      }

    } catch (error) {
      console.error('Erro ao resolver conflito temporal:', error);
      return {
        winner: 'local',
        strategy: 'default_local',
        error: error.message
      };
    }
  }

  /**
   * Criar alerta para gerente/admin
   */
  async createAlert(alertData) {
    try {
      // Criar registro de alerta (pode ser uma nova tabela ou usar AuditLog)
      await prisma.auditLog.create({
        data: {
          userId: 'SYSTEM',
          action: 'ALERT',
          entity: alertData.type,
          entityId: alertData.productId || 'N/A',
          details: {
            ...alertData,
            reviewed: false,
            reviewedAt: null,
            reviewedBy: null
          }
        }
      });

      console.log(`🚨 Alerta criado: ${alertData.type} - ${alertData.message}`);
      return { success: true };

    } catch (error) {
      console.error('Erro ao criar alerta:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obter alertas pendentes de revisão
   */
  async getPendingAlerts() {
    try {
      const alerts = await prisma.auditLog.findMany({
        where: {
          action: 'ALERT',
          details: {
            path: ['reviewed'],
            equals: false
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 50
      });

      return {
        success: true,
        alerts: alerts.map(alert => ({
          id: alert.id,
          type: alert.entity,
          message: alert.details.message,
          severity: alert.details.severity,
          requiresAction: alert.details.requiresAction,
          createdAt: alert.timestamp,
          details: alert.details
        }))
      };

    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      return {
        success: false,
        error: error.message,
        alerts: []
      };
    }
  }

  /**
   * Marcar alerta como revisado
   */
  async markAlertAsReviewed(alertId, userId, notes = null) {
    try {
      const alert = await prisma.auditLog.findUnique({
        where: { id: alertId }
      });

      if (!alert) {
        return { success: false, error: 'Alerta não encontrado' };
      }

      // Atualizar details do alerta
      const updatedDetails = {
        ...alert.details,
        reviewed: true,
        reviewedAt: new Date().toISOString(),
        reviewedBy: userId,
        reviewNotes: notes
      };

      await prisma.auditLog.update({
        where: { id: alertId },
        data: {
          details: updatedDetails
        }
      });

      console.log(`✅ Alerta ${alertId} marcado como revisado por ${userId}`);
      return { success: true };

    } catch (error) {
      console.error('Erro ao marcar alerta como revisado:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validar consistência de dados antes de sincronizar
   */
  async validateDataConsistency(entityType, data) {
    try {
      switch (entityType) {
        case 'sale':
          return this.validateSale(data);
        case 'product':
          return this.validateProduct(data);
        case 'customer':
          return this.validateCustomer(data);
        default:
          return { valid: true };
      }
    } catch (error) {
      console.error('Erro ao validar consistência:', error);
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Validar dados de venda
   */
  async validateSale(saleData) {
    const errors = [];

    // Validar total
    if (!saleData.total || saleData.total <= 0) {
      errors.push('Total da venda inválido');
    }

    // Validar itens
    if (!saleData.items || saleData.items.length === 0) {
      errors.push('Venda sem itens');
    }

    // Validar soma dos itens
    if (saleData.items) {
      const itemsTotal = saleData.items.reduce((sum, item) => {
        return sum + (parseFloat(item.unitPrice) * parseFloat(item.quantity));
      }, 0);

      const expectedTotal = itemsTotal - parseFloat(saleData.discount || 0);
      const actualTotal = parseFloat(saleData.total);

      if (Math.abs(expectedTotal - actualTotal) > 0.01) {
        errors.push(`Total inconsistente: esperado ${expectedTotal}, recebido ${actualTotal}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar dados de produto
   */
  async validateProduct(productData) {
    const errors = [];

    if (!productData.name || productData.name.trim() === '') {
      errors.push('Nome do produto é obrigatório');
    }

    if (!productData.sku || productData.sku.trim() === '') {
      errors.push('SKU é obrigatório');
    }

    if (productData.salePrice < 0 || productData.costPrice < 0) {
      errors.push('Preços não podem ser negativos');
    }

    if (productData.salePrice < productData.costPrice) {
      console.warn('⚠️  Preço de venda menor que custo');
      // Não é erro crítico, apenas aviso
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar dados de cliente
   */
  async validateCustomer(customerData) {
    const errors = [];

    if (!customerData.name || customerData.name.trim() === '') {
      errors.push('Nome do cliente é obrigatório');
    }

    // Validar documento se fornecido
    if (customerData.document) {
      const doc = customerData.document.replace(/\D/g, '');
      if (customerData.documentType === 'CPF' && doc.length !== 11) {
        errors.push('CPF inválido');
      }
      if (customerData.documentType === 'CNPJ' && doc.length !== 14) {
        errors.push('CNPJ inválido');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = new ConflictResolution();

