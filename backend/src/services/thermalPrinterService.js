const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const companySettingsService = require('./companySettingsService');

const execAsync = promisify(exec);

/**
 * Serviço para geração de tickets para impressora térmica
 * Gera arquivos de texto formatados para impressão em 58mm ou 80mm
 * Suporta impressão direta via compartilhamento Windows
 */

class ThermalPrinterService {
  constructor() {
    // Diretório para armazenar os tickets gerados
    this.ticketsDir = path.join(__dirname, '../../tickets');
    this.ensureTicketsDirectory();
    
    // Largura padrão do papel (58mm = 32 caracteres, 80mm = 48 caracteres)
    this.paperWidth = 48;
    
    // Configuração da impressora
    this.printerConfig = {
      enabled: false,
      shareName: '',
      host: 'localhost'
    };
  }

  ensureTicketsDirectory() {
    if (!fs.existsSync(this.ticketsDir)) {
      fs.mkdirSync(this.ticketsDir, { recursive: true });
    }
  }

  /**
   * Configura a impressora térmica
   */
  setConfig(config) {
    this.printerConfig = {
      enabled: config.enabled ?? false,
      shareName: config.shareName || '',
      host: config.host || 'localhost'
    };
    console.log('[ThermalPrinter] Config atualizada:', this.printerConfig);
  }

  /**
   * Obtém configuração atual
   */
  getConfig() {
    return { ...this.printerConfig };
  }

  /**
   * Envia arquivo para impressora via compartilhamento Windows
   */
  async printDirect(filepath) {
    if (!this.printerConfig.enabled) {
      return { success: false, message: 'Impressão direta não habilitada. Ative nas configurações.' };
    }

    if (!this.printerConfig.shareName) {
      return { success: false, message: 'Nome do compartilhamento não configurado.' };
    }

    if (!fs.existsSync(filepath)) {
      return { success: false, message: 'Arquivo não encontrado: ' + filepath };
    }

    try {
      const printerPath = `\\\\${this.printerConfig.host}\\${this.printerConfig.shareName}`;
      const command = `copy /b "${filepath}" "${printerPath}"`;
      
      console.log('[ThermalPrinter] Enviando:', command);
      
      await execAsync(command, { shell: 'cmd.exe', windowsHide: true });
      
      console.log('[ThermalPrinter] Enviado com sucesso!');
      return { success: true, message: 'Documento enviado para impressora!' };
    } catch (error) {
      console.error('[ThermalPrinter] Erro:', error.message);
      
      let msg = 'Erro ao enviar para impressora.';
      if (error.message.includes('não foi encontrado')) {
        msg = `Impressora "${this.printerConfig.shareName}" não encontrada. Verifique o compartilhamento.`;
      } else if (error.message.includes('acesso negado')) {
        msg = 'Acesso negado à impressora.';
      }
      
      return { success: false, message: msg, error: error.message };
    }
  }

  /**
   * Gera ticket e imprime diretamente
   */
  async generateAndPrint(sale, storeInfo = null) {
    const ticketInfo = await this.generateSaleTicket(sale, storeInfo);
    const printResult = await this.printDirect(ticketInfo.filepath);
    
    return {
      ticket: ticketInfo,
      printed: printResult.success,
      printMessage: printResult.message
    };
  }

  /**
   * Testa conexão com a impressora
   */
  async testConnection() {
    if (!this.printerConfig.enabled) {
      return { success: false, message: 'Impressão direta não habilitada.' };
    }

    if (!this.printerConfig.shareName) {
      return { success: false, message: 'Configure o nome do compartilhamento.' };
    }

    try {
      const testTicket = await this.generateTestTicket({ name: 'Teste', model: 'Conexão' });
      return await this.printDirect(testTicket.filepath);
    } catch (error) {
      return { success: false, message: 'Erro: ' + error.message };
    }
  }

  /**
   * Centraliza texto
   */
  center(text) {
    const spaces = Math.max(0, Math.floor((this.paperWidth - text.length) / 2));
    return ' '.repeat(spaces) + text;
  }

  /**
   * Alinha texto à direita
   */
  right(text) {
    const spaces = Math.max(0, this.paperWidth - text.length);
    return ' '.repeat(spaces) + text;
  }

  /**
   * Cria linha separadora
   */
  separator(char = '-') {
    return char.repeat(this.paperWidth);
  }

  /**
   * Formata valor monetário
   */
  formatMoney(value) {
    return parseFloat(value).toFixed(2).replace('.', ',');
  }

  /**
   * Formata data e hora
   */
  formatDateTime(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * Formata linha de produto com alinhamento
   */
  formatProductLine(name, qty, unitPrice, total) {
    // Primeira linha: Nome do produto
    const lines = [];
    const maxNameLength = this.paperWidth;
    
    // Quebra nome longo em múltiplas linhas
    if (name.length > maxNameLength) {
      let currentLine = '';
      const words = name.split(' ');
      
      for (const word of words) {
        if ((currentLine + word).length <= maxNameLength) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);
    } else {
      lines.push(name);
    }

    // Segunda linha: Qtd x Preço unitário = Total
    const qtyStr = `${qty}`;
    const priceStr = `R$ ${this.formatMoney(unitPrice)}`;
    const totalStr = `R$ ${this.formatMoney(total)}`;
    
    const detailLine = `${qtyStr} x ${priceStr}`;
    const spacing = this.paperWidth - detailLine.length - totalStr.length;
    lines.push(`${detailLine}${' '.repeat(Math.max(1, spacing))}${totalStr}`);
    
    return lines.join('\n');
  }

  /**
   * Gera ticket de venda
   */
  async generateSaleTicket(sale, storeInfo = null) {
    const lines = [];

    // Buscar dados da empresa do banco se não foram fornecidos
    if (!storeInfo) {
      storeInfo = await companySettingsService.getFormattedForTicket();
    }

    // Comandos ESC/POS para inicialização
    lines.push('\x1B\x40'); // Inicializar impressora
    lines.push('\x1B\x61\x01'); // Centralizar

    // Cabeçalho da loja
    if (storeInfo.name) {
      lines.push('\x1B\x21\x30'); // Fonte grande e negrito
      lines.push(this.center(storeInfo.name.toUpperCase()));
      lines.push('\x1B\x21\x00'); // Fonte normal
    }

    if (storeInfo.document) {
      lines.push(this.center(`CNPJ: ${storeInfo.document}`));
    }

    if (storeInfo.address) {
      lines.push(this.center(storeInfo.address));
    }

    if (storeInfo.phone) {
      lines.push(this.center(`Tel: ${storeInfo.phone}`));
    }

    lines.push('');
    lines.push(this.separator('='));
    lines.push(this.center('CUPOM NÃO FISCAL'));
    lines.push(this.separator('='));
    lines.push('');

    // Informações da venda
    lines.push('\x1B\x61\x00'); // Alinhar à esquerda
    lines.push(`Venda: #${sale.id.substring(0, 8).toUpperCase()}`);
    lines.push(`Data: ${this.formatDateTime(sale.date)}`);
    
    if (sale.user && sale.user.name) {
      lines.push(`Vendedor: ${sale.user.name}`);
    }

    if (sale.customer && sale.customer.name) {
      lines.push(`Cliente: ${sale.customer.name}`);
    }

    lines.push('');
    lines.push(this.separator('-'));
    lines.push('');

    // Itens da venda
    if (sale.saleItems && sale.saleItems.length > 0) {
      for (const item of sale.saleItems) {
        const productName = item.product ? item.product.name : 'Produto';
        const qty = parseFloat(item.quantity);
        const unitPrice = parseFloat(item.unitPrice);
        const discount = parseFloat(item.discount || 0);
        const total = (qty * unitPrice) - discount;

        lines.push(this.formatProductLine(productName, qty, unitPrice, total));
        
        if (discount > 0) {
          lines.push(`  Desconto: -R$ ${this.formatMoney(discount)}`);
        }
        
        lines.push('');
      }
    }

    lines.push(this.separator('-'));
    lines.push('');

    // Totais
    const subtotal = sale.saleItems.reduce((sum, item) => {
      const qty = parseFloat(item.quantity);
      const price = parseFloat(item.unitPrice);
      return sum + (qty * price);
    }, 0);

    lines.push(`Subtotal:${' '.repeat(this.paperWidth - 9 - this.formatMoney(subtotal).length - 3)}R$ ${this.formatMoney(subtotal)}`);

    if (sale.discount && parseFloat(sale.discount) > 0) {
      const discountValue = parseFloat(sale.discount);
      lines.push(`Desconto:${' '.repeat(this.paperWidth - 9 - this.formatMoney(discountValue).length - 3)}-R$ ${this.formatMoney(discountValue)}`);
    }

    lines.push('');
    lines.push('\x1B\x21\x20'); // Fonte larga
    const totalValue = parseFloat(sale.total);
    const totalLine = `TOTAL: R$ ${this.formatMoney(totalValue)}`;
    lines.push(this.center(totalLine));
    lines.push('\x1B\x21\x00'); // Fonte normal
    lines.push('');

    // Formas de pagamento
    if (sale.payments && sale.payments.length > 0) {
      lines.push(this.separator('-'));
      lines.push('PAGAMENTO:');
      lines.push('');

      for (const payment of sale.payments) {
        const methodName = this.getPaymentMethodName(payment.method);
        const amount = parseFloat(payment.amount);
        lines.push(`${methodName}:${' '.repeat(this.paperWidth - methodName.length - this.formatMoney(amount).length - 4)}R$ ${this.formatMoney(amount)}`);
      }

      lines.push('');
    }

    // Rodapé
    lines.push(this.separator('='));
    lines.push('\x1B\x61\x01'); // Centralizar
    lines.push('');
    lines.push(this.center('OBRIGADO PELA PREFERÊNCIA!'));
    lines.push(this.center('VOLTE SEMPRE!'));
    lines.push('');
    
    if (storeInfo.website) {
      lines.push(this.center(storeInfo.website));
    }
    
    lines.push('');
    lines.push(this.separator('-'));
    lines.push('');

    // Comandos de corte do papel
    lines.push('\x1D\x56\x41\x10'); // Cortar papel
    lines.push('\x1B\x40'); // Inicializar impressora

    const ticketContent = lines.join('\n');

    // Salvar ticket em arquivo
    const filename = `venda_${sale.id}_${Date.now()}.txt`;
    const filepath = path.join(this.ticketsDir, filename);
    
    await fs.promises.writeFile(filepath, ticketContent, 'utf-8');

    return {
      filename,
      filepath,
      content: ticketContent
    };
  }

  /**
   * Traduz método de pagamento
   */
  getPaymentMethodName(method) {
    const methods = {
      CASH: 'Dinheiro',
      CARD: 'Cartão',
      DEBIT: 'Débito',
      CREDIT: 'Crédito',
      PIX: 'PIX',
      CHECK: 'Cheque',
      OTHER: 'Outro'
    };

    return methods[method] || method;
  }

  /**
   * Lista todos os tickets gerados
   */
  async listTickets() {
    const files = await fs.promises.readdir(this.ticketsDir);
    return files.filter(f => f.endsWith('.txt'));
  }

  /**
   * Obtém conteúdo de um ticket
   */
  async getTicket(filename) {
    const filepath = path.join(this.ticketsDir, filename);
    
    if (!fs.existsSync(filepath)) {
      throw new Error('Ticket não encontrado');
    }

    const content = await fs.promises.readFile(filepath, 'utf-8');
    const stats = await fs.promises.stat(filepath);

    return {
      filename,
      filepath,
      content,
      createdAt: stats.birthtime
    };
  }

  /**
   * Gera ticket de teste para verificar impressora
   */
  async generateTestTicket(printerInfo = {}) {
    const lines = [];
    const now = new Date();

    // Comandos ESC/POS para inicialização
    lines.push('\x1B\x40'); // Inicializar impressora
    lines.push('\x1B\x61\x01'); // Centralizar

    lines.push(this.separator('='));
    lines.push('\x1B\x21\x30'); // Fonte grande e negrito
    lines.push(this.center('TESTE DE IMPRESSAO'));
    lines.push('\x1B\x21\x00'); // Fonte normal
    lines.push(this.center('MERCADINHO PDV'));
    lines.push(this.separator('='));
    lines.push('');
    
    lines.push('\x1B\x61\x00'); // Alinhar à esquerda
    lines.push(`Data: ${this.formatDateTime(now)}`);
    lines.push(`Impressora: ${printerInfo.name || 'Epson TM-T20X'}`);
    lines.push(`Modelo: ${printerInfo.model || 'M352A'}`);
    lines.push('');
    
    lines.push(this.separator('-'));
    lines.push('');
    lines.push(this.center('Se voce esta lendo isso,'));
    lines.push(this.center('a impressora esta OK!'));
    lines.push('');
    lines.push(this.separator('-'));
    lines.push('');

    // Teste de formatação de produtos
    lines.push('TESTE DE FORMATACAO:');
    lines.push('');
    lines.push(this.formatProductLine('Arroz Tipo 1 5kg', 2, 25.00, 50.00));
    lines.push('');
    lines.push(this.formatProductLine('Feijao Preto 1kg', 1, 8.50, 8.50));
    lines.push('');
    lines.push(this.separator('-'));
    lines.push('');

    // Totais de teste
    lines.push(`Subtotal:${' '.repeat(this.paperWidth - 9 - 8)}R$ 58,50`);
    lines.push(`Desconto:${' '.repeat(this.paperWidth - 9 - 8)}-R$ 3,50`);
    lines.push('');
    
    lines.push('\x1B\x21\x20'); // Fonte larga
    lines.push(this.center('TOTAL: R$ 55,00'));
    lines.push('\x1B\x21\x00'); // Fonte normal
    lines.push('');

    lines.push(this.separator('-'));
    lines.push('PAGAMENTO:');
    lines.push(`Dinheiro:${' '.repeat(this.paperWidth - 9 - 8)}R$ 60,00`);
    lines.push(`Troco:${' '.repeat(this.paperWidth - 6 - 7)}R$ 5,00`);
    lines.push('');

    lines.push(this.separator('='));
    lines.push('\x1B\x61\x01'); // Centralizar
    lines.push('');
    lines.push(this.center('IMPRESSAO OK!'));
    lines.push(this.center('Sistema funcionando'));
    lines.push('');
    lines.push(this.separator('='));
    lines.push('');
    lines.push('');

    // Comandos de corte do papel
    lines.push('\x1D\x56\x41\x10'); // Cortar papel
    lines.push('\x1B\x40'); // Inicializar impressora

    const ticketContent = lines.join('\n');

    // Salvar ticket de teste
    const filename = `teste_impressora_${Date.now()}.txt`;
    const filepath = path.join(this.ticketsDir, filename);
    
    await fs.promises.writeFile(filepath, ticketContent, 'utf-8');

    return {
      filename,
      filepath,
      content: ticketContent
    };
  }

  /**
   * Remove tickets antigos (mais de 30 dias)
   */
  async cleanOldTickets(daysOld = 30) {
    const files = await fs.promises.readdir(this.ticketsDir);
    const now = Date.now();
    const maxAge = daysOld * 24 * 60 * 60 * 1000; // dias em milissegundos

    let removed = 0;

    for (const file of files) {
      if (!file.endsWith('.txt')) continue;

      const filepath = path.join(this.ticketsDir, file);
      const stats = await fs.promises.stat(filepath);
      const age = now - stats.birthtime.getTime();

      if (age > maxAge) {
        await fs.promises.unlink(filepath);
        removed++;
      }
    }

    return { removed, total: files.length };
  }
}

module.exports = new ThermalPrinterService();



