// electron/preload/index.ts
const { contextBridge, ipcRenderer } = require('electron');

console.log('🔧 Preload script loading...');

// ================== AUTH API ==================
const authAPI = {
  saveSession: async (session: any) => {
    console.log('💾 Saving session to Electron store');
    return ipcRenderer.invoke('auth:save-session', session);
  },

  getSession: async () => {
    console.log('📥 Getting session from Electron store');
    return ipcRenderer.invoke('auth:get-session');
  },

  clearSession: async () => {
    console.log('🗑️ Clearing session from Electron store');
    return ipcRenderer.invoke('auth:clear-session');
  }
};

// ================== PRINTER API ==================
const printerAPI = {
  // Detect all system printers
  detectSystemPrinters: () => {
    console.log('🖨️ Detecting system printers...');
    return ipcRenderer.invoke('printer:detect-system');
  },

  // Get status of specific printer
  getPrinterStatus: (printerName: any) => {
    console.log('📊 Getting printer status:', printerName);
    return ipcRenderer.invoke('printer:get-status', printerName);
  },

  // Start monitoring (auto-sync with database)
  startMonitoring: (data: any) => {
    console.log('▶️ Starting printer monitoring...');
    return ipcRenderer.invoke('printer:start-monitoring', data);
  },

  // Stop monitoring
  stopMonitoring: () => {
    console.log('⏹️ Stopping printer monitoring...');
    return ipcRenderer.invoke('printer:stop-monitoring');
  },

  // Manual sync with database
  syncPrinterStatus: (data: any) => {
    console.log('🔄 Syncing printer status...');
    return ipcRenderer.invoke('printer:sync-status', data);
  },

  // Listen to printer status changes
  onStatusChanged: (callback: any) => {
    console.log('👂 Listening for printer status changes...');
    ipcRenderer.on('printer:status-changed', (_: any, printers: any) => {
      callback(printers);
    });
  },

  // Remove status change listener
  removeStatusListener: () => {
    console.log('🔇 Removing printer status listener...');
    ipcRenderer.removeAllListeners('printer:status-changed');
  }
};

// ================== ELECTRON API ==================
const electronAPI = {
  platform: process.platform,
  
  // App version
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  
  // Quit app
  quit: () => ipcRenderer.invoke('app:quit'),
};

// ================== EXPOSE TO RENDERER ==================
try {
  contextBridge.exposeInMainWorld('auth', authAPI);
  console.log('✅ Auth API exposed to window.auth');
  
  contextBridge.exposeInMainWorld('printerAPI', printerAPI);
  console.log('✅ Printer API exposed to window.printerAPI');
  
  contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  console.log('✅ Electron API exposed to window.electronAPI');
  
  console.log('🎉 Preload script loaded successfully!');
} catch (error) {
  console.error('❌ Error in preload script:', error);
}