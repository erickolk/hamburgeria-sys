const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expõe APIs seguras para o renderer process (Nuxt)
 */
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Imprimir ticket térmico
   * @param {Object} ticketData - Dados do ticket (saleId ou dados completos)
   * @returns {Promise<{success: boolean, result?: any, error?: string}>}
   */
  printThermal: async (ticketData) => {
    return await ipcRenderer.invoke('print-thermal', ticketData);
  },

  /**
   * Verificar status do backend
   * @returns {Promise<{online: boolean}>}
   */
  checkBackendStatus: async () => {
    return await ipcRenderer.invoke('backend-status');
  },

  /**
   * Reiniciar backend
   * @returns {Promise<{success: boolean}>}
   */
  restartBackend: async () => {
    return await ipcRenderer.invoke('restart-backend');
  },

  /**
   * Ler código de barras (preparação futura)
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  readBarcode: async () => {
    return await ipcRenderer.invoke('barcode-read');
  },

  // ============================================
  // APIs DE HARDWARE (Impressora/Balança)
  // ============================================

  /**
   * Listar portas seriais disponíveis
   * @returns {Promise<{success: boolean, ports: Array}>}
   */
  getSerialPorts: async () => {
    return await ipcRenderer.invoke('get-serial-ports');
  },

  /**
   * Ler peso da balança
   * @returns {Promise<{success: boolean, weight?: number, error?: string}>}
   */
  readScaleWeight: async () => {
    return await ipcRenderer.invoke('read-scale-weight');
  },

  /**
   * Salvar configurações de hardware
   * @param {Object} config - Configurações { printerName: string, scalePort: string }
   * @returns {Promise<{success: boolean}>}
   */
  saveHardwareConfig: async (config) => {
    return await ipcRenderer.invoke('save-hardware-config', config);
  },

  /**
   * Obter configurações de hardware
   * @returns {Promise<{printerName?: string, scalePort?: string}>}
   */
  getHardwareConfig: async () => {
    return await ipcRenderer.invoke('get-hardware-config');
  },

  // ============================================
  // APIs DE LICENÇA
  // ============================================

  /**
   * Obter status da licença
   * @returns {Promise<{activated: boolean, status: string, ...}>}
   */
  getLicenseStatus: async () => {
    return await ipcRenderer.invoke('get-license-status');
  },

  /**
   * Tentar renovar licença
   * @returns {Promise<{success: boolean, ...}>}
   */
  renewLicense: async () => {
    return await ipcRenderer.invoke('renew-license');
  },

  // ============================================
  // APIs DE ATUALIZAÇÃO
  // ============================================

  /**
   * Verificar atualizações disponíveis
   * @param {boolean} force - Forçar verificação ignorando intervalo
   * @returns {Promise<{available: boolean, ...}>}
   */
  checkForUpdates: async (force = false) => {
    return await ipcRenderer.invoke('check-for-updates', force);
  },

  /**
   * Baixar atualização
   * @param {string} downloadUrl - URL do instalador
   * @returns {Promise<{success: boolean, filePath?: string}>}
   */
  downloadUpdate: async (downloadUrl) => {
    return await ipcRenderer.invoke('download-update', downloadUrl);
  },

  /**
   * Instalar atualização baixada
   * @param {string} installerPath - Caminho do instalador
   * @returns {Promise<boolean>}
   */
  installUpdate: async (installerPath) => {
    return await ipcRenderer.invoke('install-update', installerPath);
  },

  /**
   * Pular versão (não notificar novamente)
   * @param {string} version - Versão a pular
   */
  skipVersion: async (version) => {
    return await ipcRenderer.invoke('skip-version', version);
  },

  /**
   * Listener de progresso de download
   * @param {function} callback - (percent) => void
   */
  onDownloadProgress: (callback) => {
    ipcRenderer.on('update-download-progress', (event, percent) => {
      callback(percent);
    });
  },

  // ============================================
  // APIs DE DEBUG
  // ============================================

  /**
   * Abrir pasta de logs
   * @returns {Promise<{success: boolean, path?: string}>}
   */
  openLogsFolder: async () => {
    return await ipcRenderer.invoke('open-logs-folder');
  },

  /**
   * Obter logs recentes
   * @param {number} lines - Número de linhas (default: 100)
   * @returns {Promise<{success: boolean, logs?: string, path?: string, error?: string}>}
   */
  getRecentLogs: async (lines = 100) => {
    return await ipcRenderer.invoke('get-recent-logs', lines);
  },

  /**
   * Obter informações do sistema
   * @returns {Promise<Object>}
   */
  getSystemInfo: async () => {
    return await ipcRenderer.invoke('get-system-info');
  },

  /**
   * Abrir/fechar DevTools
   * @returns {Promise<{success: boolean}>}
   */
  toggleDevTools: async () => {
    return await ipcRenderer.invoke('toggle-devtools');
  },

  /**
   * Abrir pasta de dados do aplicativo
   * @returns {Promise<{success: boolean}>}
   */
  openDataFolder: async () => {
    return await ipcRenderer.invoke('open-data-folder');
  },

  /**
   * Informações da plataforma
   */
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },

  /**
   * Flag indicando se está em modo debug
   */
  isDebugEnabled: true
});

// Log para debug
console.log('✅ Preload script carregado');
console.log('🔌 Electron API exposta');
console.log('💡 Atalhos disponíveis: F12 (DevTools), Ctrl+Shift+L (Logs)');

