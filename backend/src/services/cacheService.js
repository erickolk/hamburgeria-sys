const NodeCache = require('node-cache');

/**
 * Serviço de cache para otimizar consultas frequentes
 */
class CacheService {
  constructor() {
    // Cache para consultas gerais (5 minutos)
    this.generalCache = new NodeCache({ 
      stdTTL: 300, // 5 minutos
      checkperiod: 60 // Verificar a cada minuto
    });
    
    // Cache para listagens (2 minutos)
    this.listingCache = new NodeCache({ 
      stdTTL: 120, // 2 minutos
      checkperiod: 30 // Verificar a cada 30 segundos
    });
    
    // Cache para dados de referência (30 minutos)
    this.referenceCache = new NodeCache({ 
      stdTTL: 1800, // 30 minutos
      checkperiod: 300 // Verificar a cada 5 minutos
    });

    // Estatísticas
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * Obter dados do cache
   */
  get(key, cacheType = 'general') {
    const cache = this.getCache(cacheType);
    const value = cache.get(key);
    
    if (value !== undefined) {
      this.stats.hits++;
      console.log(`[Cache] Hit para chave: ${key}`);
      return value;
    } else {
      this.stats.misses++;
      console.log(`[Cache] Miss para chave: ${key}`);
      return null;
    }
  }

  /**
   * Armazenar dados no cache
   */
  set(key, value, cacheType = 'general', ttl = null) {
    const cache = this.getCache(cacheType);
    const success = cache.set(key, value, ttl);
    
    if (success) {
      this.stats.sets++;
      console.log(`[Cache] Set para chave: ${key}`);
    }
    
    return success;
  }

  /**
   * Deletar dados do cache
   */
  del(key, cacheType = 'general') {
    const cache = this.getCache(cacheType);
    const deleted = cache.del(key);
    
    if (deleted > 0) {
      this.stats.deletes++;
      console.log(`[Cache] Delete para chave: ${key}`);
    }
    
    return deleted;
  }

  /**
   * Limpar cache por tipo
   */
  flush(cacheType = 'general') {
    const cache = this.getCache(cacheType);
    return cache.flushAll();
  }

  /**
   * Limpar todo o cache
   */
  flushAll() {
    this.generalCache.flushAll();
    this.listingCache.flushAll();
    this.referenceCache.flushAll();
    console.log('[Cache] Todo o cache foi limpo');
  }

  /**
   * Obter estatísticas do cache
   */
  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests * 100).toFixed(2) : 0;
    
    return {
      general: {
        keys: this.generalCache.keys().length,
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: `${hitRate}%`,
        sets: this.stats.sets,
        deletes: this.stats.deletes
      },
      listing: {
        keys: this.listingCache.keys().length
      },
      reference: {
        keys: this.referenceCache.keys().length
      }
    };
  }

  /**
   * Obter cache pelo tipo
   */
  getCache(cacheType) {
    switch (cacheType) {
      case 'listing':
        return this.listingCache;
      case 'reference':
        return this.referenceCache;
      case 'general':
      default:
        return this.generalCache;
    }
  }

  /**
   * Gerar chave de cache baseada em parâmetros
   */
  generateKey(prefix, params) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          acc[key] = params[key];
        }
        return acc;
      }, {});
    
    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Cache com TTL customizado para queries específicas
   */
  cacheQuery(key, queryFunction, cacheType = 'general', ttl = null) {
    return new Promise(async (resolve, reject) => {
      try {
        // Tentar obter do cache
        const cached = this.get(key, cacheType);
        if (cached !== null) {
          return resolve(cached);
        }

        // Executar query
        const result = await queryFunction();
        
        // Armazenar no cache
        this.set(key, result, cacheType, ttl);
        
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }
}

// Exportar instância singleton
module.exports = new CacheService();