const fs = require('fs');
const path = require('path');

/**
 * Serviço para geração de relatórios em arquivos
 * Gera arquivos mesmo quando não há dados (para controle)
 */

class ReportFileService {
  constructor() {
    // Diretório para armazenar os relatórios gerados
    this.reportsDir = path.join(__dirname, '../../reports');
    this.ensureReportsDirectory();
  }

  ensureReportsDirectory() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  /**
   * Formata data para nome de arquivo
   */
  formatDateForFilename(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }

  /**
   * Formata data para exibição
   */
  formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
  }

  /**
   * Formata valor monetário
   */
  formatMoney(value) {
    return parseFloat(value || 0).toFixed(2).replace('.', ',');
  }

  /**
   * Cria linha separadora
   */
  separator(char = '-', length = 80) {
    return char.repeat(length);
  }

  /**
   * Centraliza texto
   */
  center(text, width = 80) {
    const spaces = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(spaces) + text;
  }

  /**
   * Gera relatório de vendas
   */
  async generateSalesReport(data, filters = {}) {
    const lines = [];
    const timestamp = this.formatDateForFilename(new Date());
    const filename = `relatorio_vendas_${timestamp}.txt`;
    const filepath = path.join(this.reportsDir, filename);

    // Cabeçalho
    lines.push(this.separator('='));
    lines.push(this.center('RELATÓRIO DE VENDAS'));
    lines.push(this.separator('='));
    lines.push('');
    
    // Informações do relatório
    lines.push(`Data de geração: ${this.formatDate(new Date())}`);
    
    if (filters.startDate && filters.endDate) {
      lines.push(`Período: ${this.formatDate(filters.startDate)} a ${this.formatDate(filters.endDate)}`);
    }
    
    lines.push(`Total de registros: ${data.length}`);
    lines.push('');
    lines.push(this.separator('-'));
    lines.push('');

    if (data.length === 0) {
      // Mesmo sem dados, gera o arquivo para controle
      lines.push(this.center('*** NENHUM DADO ENCONTRADO PARA O PERÍODO ***'));
      lines.push('');
      lines.push('Este relatório foi gerado para fins de controle.');
      lines.push('Não foram encontradas vendas no período especificado.');
    } else {
      // Cabeçalho da tabela
      lines.push(sprintf('%-12s %-12s %-15s %-15s', 'Data', 'Vendas', 'Itens', 'Total (R$)'));
      lines.push(this.separator('-'));

      let totalSales = 0;
      let totalItems = 0;
      let totalAmount = 0;

      // Dados
      for (const row of data) {
        const date = row.date || '-';
        const sales = row.totalSales || 0;
        const items = row.itemsSold || 0;
        const amount = parseFloat(row.totalAmount || 0);

        totalSales += sales;
        totalItems += items;
        totalAmount += amount;

        lines.push(sprintf('%-12s %12d %15d %15s', 
          date, sales, items, this.formatMoney(amount)));
      }

      // Totais
      lines.push(this.separator('-'));
      lines.push(sprintf('%-12s %12d %15d %15s', 
        'TOTAL:', totalSales, totalItems, this.formatMoney(totalAmount)));
    }

    lines.push('');
    lines.push(this.separator('='));
    lines.push(this.center('Fim do Relatório'));
    lines.push(this.separator('='));

    const content = lines.join('\n');
    await fs.promises.writeFile(filepath, content, 'utf-8');

    return {
      filename,
      filepath,
      recordCount: data.length,
      generated: true
    };
  }

  /**
   * Gera relatório de produtos mais vendidos
   */
  async generateTopProductsReport(data, filters = {}) {
    const lines = [];
    const timestamp = this.formatDateForFilename(new Date());
    const filename = `relatorio_produtos_mais_vendidos_${timestamp}.txt`;
    const filepath = path.join(this.reportsDir, filename);

    // Cabeçalho
    lines.push(this.separator('='));
    lines.push(this.center('RELATÓRIO - PRODUTOS MAIS VENDIDOS'));
    lines.push(this.separator('='));
    lines.push('');
    
    lines.push(`Data de geração: ${this.formatDate(new Date())}`);
    
    if (filters.startDate && filters.endDate) {
      lines.push(`Período: ${this.formatDate(filters.startDate)} a ${this.formatDate(filters.endDate)}`);
    }
    
    lines.push(`Total de produtos: ${data.length}`);
    lines.push('');
    lines.push(this.separator('-'));
    lines.push('');

    if (data.length === 0) {
      lines.push(this.center('*** NENHUM DADO ENCONTRADO PARA O PERÍODO ***'));
      lines.push('');
      lines.push('Este relatório foi gerado para fins de controle.');
    } else {
      // Cabeçalho da tabela
      lines.push(sprintf('%-5s %-30s %-15s %-15s', 'Pos', 'Produto', 'Quantidade', 'Vendas'));
      lines.push(this.separator('-'));

      // Dados
      data.forEach((item, index) => {
        const pos = index + 1;
        const name = (item.product?.name || 'Sem nome').substring(0, 30);
        const qty = item.totalQuantity || 0;
        const sales = item.totalSales || 0;

        lines.push(sprintf('%-5d %-30s %15.2f %15d', pos, name, parseFloat(qty), sales));
      });
    }

    lines.push('');
    lines.push(this.separator('='));
    lines.push(this.center('Fim do Relatório'));
    lines.push(this.separator('='));

    const content = lines.join('\n');
    await fs.promises.writeFile(filepath, content, 'utf-8');

    return {
      filename,
      filepath,
      recordCount: data.length,
      generated: true
    };
  }

  /**
   * Gera relatório de estoque baixo
   */
  async generateLowStockReport(data) {
    const lines = [];
    const timestamp = this.formatDateForFilename(new Date());
    const filename = `relatorio_estoque_baixo_${timestamp}.txt`;
    const filepath = path.join(this.reportsDir, filename);

    // Cabeçalho
    lines.push(this.separator('='));
    lines.push(this.center('RELATÓRIO - ESTOQUE BAIXO'));
    lines.push(this.separator('='));
    lines.push('');
    
    lines.push(`Data de geração: ${this.formatDate(new Date())}`);
    lines.push(`Total de produtos: ${data.length}`);
    lines.push('');
    lines.push(this.separator('-'));
    lines.push('');

    if (data.length === 0) {
      lines.push(this.center('*** NENHUM PRODUTO COM ESTOQUE BAIXO ***'));
      lines.push('');
      lines.push('Este relatório foi gerado para fins de controle.');
      lines.push('Todos os produtos estão com estoque adequado.');
    } else {
      // Cabeçalho da tabela
      lines.push(sprintf('%-30s %-15s %-15s %-15s %-20s', 
        'Produto', 'Estoque', 'Ponto Pedido', 'Custo (R$)', 'Fornecedor'));
      lines.push(this.separator('-'));

      // Dados
      for (const product of data) {
        const name = (product.name || 'Sem nome').substring(0, 30);
        const stock = parseFloat(product.stockQuantity || 0);
        const reorder = parseFloat(product.reorderPoint || 0);
        const cost = parseFloat(product.costPrice || 0);
        const supplier = (product.supplier?.name || 'N/A').substring(0, 20);

        lines.push(sprintf('%-30s %15.2f %15.2f %15s %-20s', 
          name, stock, reorder, this.formatMoney(cost), supplier));
      }
    }

    lines.push('');
    lines.push(this.separator('='));
    lines.push(this.center('Fim do Relatório'));
    lines.push(this.separator('='));

    const content = lines.join('\n');
    await fs.promises.writeFile(filepath, content, 'utf-8');

    return {
      filename,
      filepath,
      recordCount: data.length,
      generated: true
    };
  }

  /**
   * Gera relatório de fluxo de caixa
   */
  async generateCashFlowReport(data, filters = {}) {
    const lines = [];
    const timestamp = this.formatDateForFilename(new Date());
    const filename = `relatorio_fluxo_caixa_${timestamp}.txt`;
    const filepath = path.join(this.reportsDir, filename);

    // Cabeçalho
    lines.push(this.separator('='));
    lines.push(this.center('RELATÓRIO - FLUXO DE CAIXA'));
    lines.push(this.separator('='));
    lines.push('');
    
    lines.push(`Data de geração: ${this.formatDate(new Date())}`);
    
    if (filters.startDate && filters.endDate) {
      lines.push(`Período: ${this.formatDate(filters.startDate)} a ${this.formatDate(filters.endDate)}`);
    }
    
    lines.push('');
    lines.push(this.separator('-'));
    lines.push('');

    const hasData = data && data.income && (data.income.totalSales > 0 || data.income.totalAmount > 0);

    if (!hasData) {
      lines.push(this.center('*** NENHUMA MOVIMENTAÇÃO NO PERÍODO ***'));
      lines.push('');
      lines.push('Este relatório foi gerado para fins de controle.');
    } else {
      // Entradas
      lines.push('ENTRADAS:');
      lines.push('');
      lines.push(`  Total de vendas: ${data.income.totalSales || 0}`);
      lines.push(`  Valor total: R$ ${this.formatMoney(data.income.totalAmount)}`);
      lines.push('');
      
      // Formas de pagamento
      if (data.income.byPaymentMethod && Object.keys(data.income.byPaymentMethod).length > 0) {
        lines.push('  Por forma de pagamento:');
        for (const [method, amount] of Object.entries(data.income.byPaymentMethod)) {
          lines.push(`    ${method}: R$ ${this.formatMoney(amount)}`);
        }
        lines.push('');
      }
      
      lines.push(this.separator('-'));
      lines.push('');
      
      // Resumo
      lines.push('RESUMO:');
      lines.push('');
      lines.push(`  Total de Entradas: R$ ${this.formatMoney(data.summary.totalIncome)}`);
      lines.push(`  Total de Saídas:   R$ ${this.formatMoney(data.summary.totalOutcome)}`);
      lines.push(this.separator('-'));
      lines.push(`  Saldo Líquido:     R$ ${this.formatMoney(data.summary.netFlow)}`);
    }

    lines.push('');
    lines.push(this.separator('='));
    lines.push(this.center('Fim do Relatório'));
    lines.push(this.separator('='));

    const content = lines.join('\n');
    await fs.promises.writeFile(filepath, content, 'utf-8');

    return {
      filename,
      filepath,
      hasData,
      generated: true
    };
  }

  /**
   * Lista todos os relatórios gerados
   */
  async listReports(type = null) {
    const files = await fs.promises.readdir(this.reportsDir);
    let reports = files.filter(f => f.endsWith('.txt'));

    if (type) {
      reports = reports.filter(f => f.includes(type));
    }

    const reportsWithInfo = await Promise.all(
      reports.map(async (filename) => {
        const filepath = path.join(this.reportsDir, filename);
        const stats = await fs.promises.stat(filepath);
        
        return {
          filename,
          filepath,
          size: stats.size,
          createdAt: stats.birthtime
        };
      })
    );

    return reportsWithInfo.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Obtém conteúdo de um relatório
   */
  async getReport(filename) {
    const filepath = path.join(this.reportsDir, filename);
    
    if (!fs.existsSync(filepath)) {
      throw new Error('Relatório não encontrado');
    }

    const content = await fs.promises.readFile(filepath, 'utf-8');
    const stats = await fs.promises.stat(filepath);

    return {
      filename,
      filepath,
      content,
      size: stats.size,
      createdAt: stats.birthtime
    };
  }

  /**
   * Remove relatórios antigos (mais de 90 dias)
   */
  async cleanOldReports(daysOld = 90) {
    const files = await fs.promises.readdir(this.reportsDir);
    const now = Date.now();
    const maxAge = daysOld * 24 * 60 * 60 * 1000;

    let removed = 0;

    for (const file of files) {
      if (!file.endsWith('.txt')) continue;

      const filepath = path.join(this.reportsDir, file);
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

/**
 * Função auxiliar para formatação tipo sprintf
 */
function sprintf(format, ...args) {
  let i = 0;
  return format.replace(/%(-?)(\d+)?(?:\.(\d+))?([sdif])/g, (match, leftAlign, width, precision, type) => {
    const value = args[i++];
    let result = '';

    switch (type) {
      case 's':
        result = String(value);
        break;
      case 'd':
      case 'i':
        result = String(Math.floor(value));
        break;
      case 'f':
        result = precision ? parseFloat(value).toFixed(parseInt(precision)) : String(parseFloat(value));
        break;
    }

    if (width) {
      const w = parseInt(width);
      if (leftAlign === '-') {
        result = result.padEnd(w, ' ');
      } else {
        result = result.padStart(w, ' ');
      }
    }

    return result;
  });
}

module.exports = new ReportFileService();



