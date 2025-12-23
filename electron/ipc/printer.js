/**
 * IPC Handlers para impressora térmica
 * 
 * Este módulo gerencia a comunicação entre o renderer process (Nuxt)
 * e o main process (Electron) para impressão térmica.
 */

const path = require('path');

/**
 * Handler para impressão térmica via IPC
 * 
 * @param {Object} ticketData - Dados do ticket
 * @param {string} ticketData.saleId - ID da venda (opcional, se fornecido busca dados)
 * @param {Object} ticketData.sale - Dados completos da venda (opcional)
 * @returns {Promise<{success: boolean, filename?: string, error?: string}>}
 */
async function handlePrintThermal(ticketData) {
  try {
    // Importar serviço de impressão térmica do backend
    const thermalPrinterService = require(path.join(
      __dirname,
      '..',
      '..',
      'backend',
      'src',
      'services',
      'thermalPrinterService'
    ));

    let result;

    // Se fornecido saleId, buscar dados da venda
    if (ticketData.saleId) {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      try {
        const sale = await prisma.sale.findUnique({
          where: { id: ticketData.saleId },
          include: {
            saleItems: {
              include: {
                product: true
              }
            },
            user: true,
            customer: true
          }
        });

        if (!sale) {
          return { success: false, error: 'Venda não encontrada' };
        }

        result = await thermalPrinterService.generateTicket(sale);
      } finally {
        await prisma.$disconnect();
      }
    } else if (ticketData.sale) {
      // Se dados completos fornecidos, usar diretamente
      result = await thermalPrinterService.generateTicket(ticketData.sale);
    } else {
      return { success: false, error: 'Dados do ticket não fornecidos' };
    }

    return {
      success: true,
      filename: result.filename,
      path: result.path
    };
  } catch (error) {
    console.error('Erro ao imprimir ticket térmico:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido ao imprimir'
    };
  }
}

/**
 * Handler para impressão direta via ESC/POS (futuro)
 * 
 * @param {string} printerPath - Caminho da impressora (USB, Serial, etc.)
 * @param {string} ticketContent - Conteúdo do ticket em formato ESC/POS
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function handlePrintDirect(printerPath, ticketContent) {
  try {
    // Implementação futura com node-escpos ou similar
    // Por enquanto, apenas salva arquivo
    const fs = require('fs').promises;
    const path = require('path');
    
    const ticketsDir = path.join(__dirname, '..', '..', 'backend', 'tickets');
    const filename = `ticket_${Date.now()}.txt`;
    const filepath = path.join(ticketsDir, filename);

    await fs.mkdir(ticketsDir, { recursive: true });
    await fs.writeFile(filepath, ticketContent, 'utf8');

    return {
      success: true,
      filename,
      path: filepath
    };
  } catch (error) {
    console.error('Erro ao imprimir diretamente:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido'
    };
  }
}

module.exports = {
  handlePrintThermal,
  handlePrintDirect
};

