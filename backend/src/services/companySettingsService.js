const { PrismaClient } = require('@prisma/client');
const { validateCNPJ, formatCNPJ, validateCEP, formatCEP, formatPhone, validateState } = require('../utils/validators');

const prisma = new PrismaClient();

/**
 * Serviço de gerenciamento das configurações da empresa
 */
class CompanySettingsService {
  /**
   * Obtém as configurações da empresa
   * Se não existir, retorna null
   */
  async getSettings() {
    try {
      const settings = await prisma.companySettings.findFirst({
        orderBy: { createdAt: 'desc' }
      });

      return settings;
    } catch (error) {
      console.error('Erro ao buscar configurações da empresa:', error);
      throw error;
    }
  }

  /**
   * Cria ou atualiza as configurações da empresa
   * Como só deve existir um registro, sempre atualiza o primeiro ou cria se não existir
   */
  async upsertSettings(data) {
    try {
      // Validações
      this.validateSettingsData(data);

      // Formatar dados
      const formattedData = {
        name: data.name.trim(),
        cnpj: formatCNPJ(data.cnpj),
        phone: formatPhone(data.phone),
        website: data.website?.trim() || null,
        zipCode: formatCEP(data.zipCode),
        street: data.street.trim(),
        number: data.number.trim(),
        complement: data.complement?.trim() || null,
        neighborhood: data.neighborhood.trim(),
        city: data.city.trim(),
        state: data.state.toUpperCase()
      };

      // Verificar se já existe configuração
      const existingSettings = await this.getSettings();

      let settings;
      if (existingSettings) {
        // Atualizar existente
        settings = await prisma.companySettings.update({
          where: { id: existingSettings.id },
          data: formattedData
        });
      } else {
        // Criar novo
        settings = await prisma.companySettings.create({
          data: formattedData
        });
      }

      return settings;
    } catch (error) {
      console.error('Erro ao salvar configurações da empresa:', error);
      throw error;
    }
  }

  /**
   * Valida os dados de configuração
   */
  validateSettingsData(data) {
    const errors = [];

    // Nome
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Nome da empresa é obrigatório');
    }

    // CNPJ
    if (!data.cnpj) {
      errors.push('CNPJ é obrigatório');
    } else if (!validateCNPJ(data.cnpj)) {
      errors.push('CNPJ inválido');
    }

    // Telefone
    if (!data.phone) {
      errors.push('Telefone é obrigatório');
    }

    // CEP
    if (!data.zipCode) {
      errors.push('CEP é obrigatório');
    } else if (!validateCEP(data.zipCode)) {
      errors.push('CEP inválido');
    }

    // Endereço
    if (!data.street || data.street.trim().length === 0) {
      errors.push('Rua é obrigatória');
    }

    if (!data.number || data.number.trim().length === 0) {
      errors.push('Número é obrigatório');
    }

    if (!data.neighborhood || data.neighborhood.trim().length === 0) {
      errors.push('Bairro é obrigatório');
    }

    if (!data.city || data.city.trim().length === 0) {
      errors.push('Cidade é obrigatória');
    }

    // Estado
    if (!data.state) {
      errors.push('Estado é obrigatório');
    } else if (!validateState(data.state)) {
      errors.push('Estado inválido (use sigla UF)');
    }

    if (errors.length > 0) {
      const error = new Error('Dados inválidos');
      error.name = 'ValidationError';
      error.details = errors;
      throw error;
    }
  }

  /**
   * Obtém dados formatados para impressão em tickets
   */
  async getFormattedForTicket() {
    try {
      const settings = await this.getSettings();

      if (!settings) {
        return {
          name: 'MERCADINHO',
          document: '',
          address: '',
          phone: '',
          website: ''
        };
      }

      // Formatar endereço em uma linha
      const addressParts = [
        settings.street,
        settings.number,
        settings.complement,
        settings.neighborhood
      ].filter(Boolean);

      const address = `${addressParts.join(', ')} - ${settings.city}/${settings.state}`;

      return {
        name: settings.name,
        document: settings.cnpj,
        address: address,
        phone: settings.phone,
        website: settings.website || ''
      };
    } catch (error) {
      console.error('Erro ao formatar configurações para ticket:', error);
      // Retornar dados padrão em caso de erro
      return {
        name: 'MERCADINHO',
        document: '',
        address: '',
        phone: '',
        website: ''
      };
    }
  }

  /**
   * Verifica se as configurações já foram definidas
   */
  async isConfigured() {
    try {
      const settings = await this.getSettings();
      return settings !== null;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new CompanySettingsService();



