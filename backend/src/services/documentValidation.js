const axios = require('axios');

/**
 * Serviço de validação de documentos (CPF/CNPJ)
 * Integração com APIs de validação da Receita Federal e outros serviços
 */
class DocumentValidationService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Validar CPF usando múltiplas fontes
   */
  async validateCPF(cpf) {
    try {
      // Remover máscaras
      const cleanCPF = cpf.replace(/\D/g, '');
      
      // Verificar cache
      const cacheKey = `cpf_${cleanCPF}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
        this.cache.delete(cacheKey);
      }

      // Validar formato e dígitos verificadores
      if (!this.isValidCPFFormat(cleanCPF)) {
        return {
          valid: false,
          message: 'CPF inválido - dígitos verificadores incorretos',
          source: 'internal'
        };
      }

      // Tentar validação via API pública (exemplo com BrasilAPI)
      let apiResult = null;
      try {
        // BrasilAPI é gratuita e não requer chave
        const response = await axios.get(`https://brasilapi.com.br/api/cpf/v1/${cleanCPF}`, {
          timeout: 5000,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.data && response.data.valid) {
          apiResult = {
            valid: true,
            message: 'CPF válido',
            source: 'brasilapi',
            data: response.data
          };
        }
      } catch (apiError) {
        console.warn('BrasilAPI indisponível, usando validação interna:', apiError.message);
      }

      // Se API falhar, usar validação interna
      const result = apiResult || {
        valid: true,
        message: 'CPF válido (formato)',
        source: 'internal',
        data: {
          cpf: cleanCPF,
          formatted: this.formatCPF(cleanCPF)
        }
      };

      // Cachear resultado
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Erro na validação de CPF:', error);
      return {
        valid: false,
        message: 'Erro ao validar CPF',
        source: 'error',
        error: error.message
      };
    }
  }

  /**
   * Validar CNPJ usando múltiplas fontes
   */
  async validateCNPJ(cnpj) {
    try {
      // Remover máscaras
      const cleanCNPJ = cnpj.replace(/\D/g, '');
      
      // Verificar cache
      const cacheKey = `cnpj_${cleanCNPJ}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
        this.cache.delete(cacheKey);
      }

      // Validar formato e dígitos verificadores
      if (!this.isValidCNPJFormat(cleanCNPJ)) {
        return {
          valid: false,
          message: 'CNPJ inválido - dígitos verificadores incorretos',
          source: 'internal'
        };
      }

      // Tentar validação via API pública
      let apiResult = null;
      try {
        // BrasilAPI para CNPJ
        const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`, {
          timeout: 10000, // CNPJ pode demorar mais
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.data) {
          apiResult = {
            valid: true,
            message: 'CNPJ válido',
            source: 'brasilapi',
            data: response.data
          };
        }
      } catch (apiError) {
        console.warn('BrasilAPI indisponível para CNPJ, usando validação interna:', apiError.message);
      }

      // Se API falhar, usar validação interna
      const result = apiResult || {
        valid: true,
        message: 'CNPJ válido (formato)',
        source: 'internal',
        data: {
          cnpj: cleanCNPJ,
          formatted: this.formatCNPJ(cleanCNPJ)
        }
      };

      // Cachear resultado
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Erro na validação de CNPJ:', error);
      return {
        valid: false,
        message: 'Erro ao validar CNPJ',
        source: 'error',
        error: error.message
      };
    }
  }

  /**
   * Validar formato e dígitos verificadores do CPF
   */
  isValidCPFFormat(cpf) {
    if (cpf.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais (CPF inválido)
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Calcular dígitos verificadores
    let sum = 0;
    let remainder;
    
    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    // Segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
  }

  /**
   * Validar formato e dígitos verificadores do CNPJ
   */
  isValidCNPJFormat(cnpj) {
    if (cnpj.length !== 14) return false;
    
    // Verificar se todos os dígitos são iguais (CNPJ inválido)
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    // Pesos para cálculo dos dígitos verificadores
    const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    // Calcular primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj.charAt(i)) * pesos1[i];
    }
    let digito1 = sum % 11;
    digito1 = digito1 < 2 ? 0 : 11 - digito1;
    
    if (parseInt(cnpj.charAt(12)) !== digito1) return false;
    
    // Calcular segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj.charAt(i)) * pesos2[i];
    }
    let digito2 = sum % 11;
    digito2 = digito2 < 2 ? 0 : 11 - digito2;
    
    if (parseInt(cnpj.charAt(13)) !== digito2) return false;
    
    return true;
  }

  /**
   * Formatar CPF
   */
  formatCPF(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Formatar CNPJ
   */
  formatCNPJ(cnpj) {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  /**
   * Limpar cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Obter estatísticas do cache
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Exportar instância singleton
module.exports = new DocumentValidationService();