/**
 * Auto-Updater Service - Mercadinho PDV
 * Verifica atualizações no servidor VPS semanalmente
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { app, dialog, shell, BrowserWindow } = require('electron');

// Configurações
const UPDATE_CHECK_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 dias em ms
const UPDATE_SERVER_URL = process.env.UPDATE_SERVER_URL || 'https://evomercearia-backend.d3vbpv.easypanel.host';
const UPDATE_ENDPOINT = '/updates/latest.json';

// Armazenamento local
const DATA_DIR = path.join(require('os').homedir(), 'Mercadinho');
const UPDATE_STATE_FILE = path.join(DATA_DIR, 'update-state.json');
const DOWNLOAD_DIR = path.join(DATA_DIR, 'downloads');

/**
 * Obtém a versão atual do aplicativo
 */
function getCurrentVersion() {
  try {
    return app.getVersion();
  } catch (e) {
    return '1.0.0';
  }
}

/**
 * Compara versões semânticas
 * Retorna: 1 se v1 > v2, -1 se v1 < v2, 0 se iguais
 */
function compareVersions(v1, v2) {
  const parts1 = v1.replace(/^v/, '').split('.').map(Number);
  const parts2 = v2.replace(/^v/, '').split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  
  return 0;
}

/**
 * Carrega estado de atualização salvo
 */
function loadUpdateState() {
  try {
    if (fs.existsSync(UPDATE_STATE_FILE)) {
      const data = fs.readFileSync(UPDATE_STATE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[Updater] Erro ao carregar estado:', e.message);
  }
  
  return {
    lastCheck: null,
    skippedVersion: null,
    downloadedFile: null
  };
}

/**
 * Salva estado de atualização
 */
function saveUpdateState(state) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(UPDATE_STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {
    console.error('[Updater] Erro ao salvar estado:', e.message);
  }
}

/**
 * Verifica se deve checar atualizações
 */
function shouldCheckForUpdates() {
  const state = loadUpdateState();
  
  if (!state.lastCheck) {
    return true;
  }
  
  const lastCheck = new Date(state.lastCheck).getTime();
  const now = Date.now();
  
  return (now - lastCheck) >= UPDATE_CHECK_INTERVAL;
}

/**
 * Faz requisição HTTP/HTTPS
 */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, { timeout: 30000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Seguir redirect
        return fetchJson(res.headers.location).then(resolve).catch(reject);
      }
      
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('JSON inválido'));
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

/**
 * Verifica atualizações no servidor
 */
async function checkForUpdates(force = false) {
  // Verificar se é hora de checar (ou se forçado)
  if (!force && !shouldCheckForUpdates()) {
    console.log('[Updater] Verificação não necessária ainda');
    return { available: false, reason: 'not_due' };
  }
  
  console.log('[Updater] Verificando atualizações...');
  
  try {
    const url = `${UPDATE_SERVER_URL}${UPDATE_ENDPOINT}`;
    const latestInfo = await fetchJson(url);
    
    // Atualizar timestamp da última verificação
    const state = loadUpdateState();
    state.lastCheck = new Date().toISOString();
    saveUpdateState(state);
    
    const currentVersion = getCurrentVersion();
    const latestVersion = latestInfo.version;
    
    console.log(`[Updater] Versão atual: ${currentVersion}`);
    console.log(`[Updater] Versão disponível: ${latestVersion}`);
    
    // Verificar se há versão mais nova
    if (compareVersions(latestVersion, currentVersion) > 0) {
      // Verificar se usuário pulou esta versão
      if (state.skippedVersion === latestVersion) {
        console.log('[Updater] Usuário pulou esta versão');
        return { available: false, reason: 'skipped' };
      }
      
      console.log('[Updater] Nova versão disponível!');
      return {
        available: true,
        currentVersion,
        latestVersion,
        downloadUrl: latestInfo.downloadUrl,
        changelog: latestInfo.changelog || '',
        releaseDate: latestInfo.releaseDate,
        size: latestInfo.size || 'Desconhecido',
        mandatory: latestInfo.mandatory || false
      };
    }
    
    console.log('[Updater] Aplicativo está atualizado');
    return { available: false, reason: 'up_to_date' };
    
  } catch (error) {
    console.error('[Updater] Erro ao verificar atualizações:', error.message);
    return { available: false, reason: 'error', error: error.message };
  }
}

/**
 * Baixa o instalador
 */
function downloadUpdate(downloadUrl, onProgress) {
  return new Promise((resolve, reject) => {
    // Criar diretório de downloads
    if (!fs.existsSync(DOWNLOAD_DIR)) {
      fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
    }
    
    const fileName = path.basename(downloadUrl.split('?')[0]) || 'MercadinhoPDV-Setup.exe';
    const filePath = path.join(DOWNLOAD_DIR, fileName);
    
    console.log(`[Updater] Baixando: ${downloadUrl}`);
    console.log(`[Updater] Destino: ${filePath}`);
    
    const protocol = downloadUrl.startsWith('https') ? https : http;
    
    const req = protocol.get(downloadUrl, { timeout: 300000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Seguir redirect
        return downloadUpdate(res.headers.location, onProgress).then(resolve).catch(reject);
      }
      
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      
      const totalSize = parseInt(res.headers['content-length'], 10) || 0;
      let downloadedSize = 0;
      
      const file = fs.createWriteStream(filePath);
      
      res.on('data', (chunk) => {
        downloadedSize += chunk.length;
        if (totalSize > 0 && onProgress) {
          const percent = Math.round((downloadedSize / totalSize) * 100);
          onProgress(percent, downloadedSize, totalSize);
        }
      });
      
      res.pipe(file);
      
      file.on('finish', () => {
        file.close();
        
        // Salvar caminho do arquivo baixado
        const state = loadUpdateState();
        state.downloadedFile = filePath;
        saveUpdateState(state);
        
        console.log('[Updater] Download concluído!');
        resolve(filePath);
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout no download'));
    });
  });
}

/**
 * Instala a atualização
 */
async function installUpdate(installerPath) {
  if (!fs.existsSync(installerPath)) {
    throw new Error('Instalador não encontrado');
  }
  
  console.log('[Updater] Iniciando instalação:', installerPath);
  
  // Executar instalador silenciosamente e fechar app
  const { spawn } = require('child_process');
  
  // Spawn detached para o instalador continuar após o app fechar
  const installer = spawn(installerPath, ['/S'], {
    detached: true,
    stdio: 'ignore'
  });
  
  installer.unref();
  
  // Fechar o aplicativo
  setTimeout(() => {
    app.quit();
  }, 1000);
  
  return true;
}

/**
 * Pula uma versão (não notificar novamente)
 */
function skipVersion(version) {
  const state = loadUpdateState();
  state.skippedVersion = version;
  saveUpdateState(state);
  console.log(`[Updater] Versão ${version} será ignorada`);
}

/**
 * Reseta versão pulada
 */
function resetSkippedVersion() {
  const state = loadUpdateState();
  state.skippedVersion = null;
  saveUpdateState(state);
}

/**
 * Abre a pasta de downloads
 */
function openDownloadsFolder() {
  shell.openPath(DOWNLOAD_DIR);
}

/**
 * Mostra diálogo de atualização nativo
 */
async function showUpdateDialog(updateInfo, mainWindow) {
  const { response } = await dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Atualização Disponível',
    message: `Nova versão do Mercadinho PDV disponível!`,
    detail: `Versão atual: ${updateInfo.currentVersion}\nNova versão: ${updateInfo.latestVersion}\n\n${updateInfo.changelog || 'Melhorias e correções de bugs.'}\n\nTamanho: ${updateInfo.size}`,
    buttons: ['Baixar Agora', 'Lembrar Depois', 'Pular Esta Versão'],
    defaultId: 0,
    cancelId: 1
  });
  
  return response; // 0 = baixar, 1 = depois, 2 = pular
}

/**
 * Mostra diálogo de progresso de download
 */
async function showDownloadProgress(mainWindow, onCancel) {
  // Enviar evento para o renderer mostrar progresso
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-download-started');
  }
}

module.exports = {
  getCurrentVersion,
  compareVersions,
  checkForUpdates,
  downloadUpdate,
  installUpdate,
  skipVersion,
  resetSkippedVersion,
  openDownloadsFolder,
  showUpdateDialog,
  shouldCheckForUpdates,
  loadUpdateState,
  UPDATE_SERVER_URL,
  UPDATE_CHECK_INTERVAL
};

