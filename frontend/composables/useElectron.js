/**
 * Composable para usar APIs do Electron no frontend
 * 
 * Fornece acesso seguro às funcionalidades do Electron
 * via window.electronAPI (exposto pelo preload.js)
 */

export const useElectron = () => {
  const isElectron = computed(() => {
    return typeof window !== 'undefined' && window.electronAPI !== undefined;
  });

  /**
   * Imprimir ticket térmico
   * @param {string|Object} saleIdOrData - ID da venda ou dados completos
   * @returns {Promise<{success: boolean, filename?: string, error?: string}>}
   */
  const printThermal = async (saleIdOrData) => {
    if (!isElectron.value) {
      console.warn('Electron API não disponível. Usando fallback web.');
      // Fallback para web: usar API REST
      try {
        const saleId = typeof saleIdOrData === 'string' ? saleIdOrData : saleIdOrData.saleId;
        const { useApi } = await import('./useApi');
        const api = useApi();
        const result = await api.post(`/sales/${saleId}/ticket`);
        return { success: true, ...result.data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }

    try {
      const ticketData = typeof saleIdOrData === 'string' 
        ? { saleId: saleIdOrData }
        : saleIdOrData;

      const result = await window.electronAPI.printThermal(ticketData);
      return result;
    } catch (error) {
      console.error('Erro ao imprimir ticket:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Verificar status do backend
   * @returns {Promise<{online: boolean}>}
   */
  const checkBackendStatus = async () => {
    if (!isElectron.value) {
      // Em web, sempre assumir online (backend externo)
      return { online: true };
    }

    try {
      return await window.electronAPI.checkBackendStatus();
    } catch (error) {
      console.error('Erro ao verificar status do backend:', error);
      return { online: false };
    }
  };

  /**
   * Reiniciar backend
   * @returns {Promise<{success: boolean}>}
   */
  const restartBackend = async () => {
    if (!isElectron.value) {
      return { success: false, error: 'Apenas disponível no Electron' };
    }

    try {
      return await window.electronAPI.restartBackend();
    } catch (error) {
      console.error('Erro ao reiniciar backend:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Ler código de barras (preparação futura)
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  const readBarcode = async () => {
    if (!isElectron.value) {
      return { success: false, error: 'Apenas disponível no Electron' };
    }

    try {
      return await window.electronAPI.readBarcode();
    } catch (error) {
      console.error('Erro ao ler código de barras:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Informações da plataforma
   */
  const platform = computed(() => {
    if (!isElectron.value) {
      return 'web';
    }
    return window.electronAPI.platform;
  });

  /**
   * Versões do Electron
   */
  const versions = computed(() => {
    if (!isElectron.value) {
      return null;
    }
    return window.electronAPI.versions;
  });

  return {
    isElectron,
    printThermal,
    checkBackendStatus,
    restartBackend,
    readBarcode,
    getSerialPorts: async () => {
      if (!isElectron.value) return { success: false, error: 'Apenas Desktop' }
      return await window.electronAPI.getSerialPorts()
    },
    readScaleWeight: async () => {
      if (!isElectron.value) return { success: false, error: 'Apenas Desktop' }
      return await window.electronAPI.readScaleWeight()
    },
    saveHardwareConfig: async (config) => {
      if (!isElectron.value) return { success: false, error: 'Apenas Desktop' }
      return await window.electronAPI.saveHardwareConfig(config)
    },
    getHardwareConfig: async () => {
      if (!isElectron.value) return {}
      return await window.electronAPI.getHardwareConfig()
    },
    platform,
    versions
  };
};

