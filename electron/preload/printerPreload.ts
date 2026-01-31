// electron/preload/printerPreload.ts
import { contextBridge, ipcRenderer } from 'electron';

export interface SystemPrinter {
  name: string;
  isDefault: boolean;
  status: 'online' | 'offline' | 'error';
  driver?: string;
  port?: string;
}

export interface AppPrinter {
  id: string;
  shop_id: string;
  printer_name: string;
  printer_type: string;
  supported_services: string[];
  supported_sizes: string[];
  status: 'online' | 'offline' | 'error';
  last_heartbeat: string;
}

export interface PrinterAPI {
  // Detect all system printers
  detectSystemPrinters: () => Promise<{
    success: boolean;
    printers?: SystemPrinter[];
    error?: string;
  }>;

  // Get status of specific printer
  getPrinterStatus: (printerName: string) => Promise<{
    success: boolean;
    status?: SystemPrinter | null;
    error?: string;
  }>;

  // Start monitoring (auto-sync with database)
  startMonitoring: (data: {
    shopId: string;
    accessToken: string;
    supabaseUrl: string;
    supabaseKey: string;
  }) => Promise<{
    success: boolean;
    message?: string;
    printers?: AppPrinter[];
    error?: string;
  }>;

  // Stop monitoring
  stopMonitoring: () => Promise<{
    success: boolean;
    error?: string;
  }>;

  // Manual sync with database
  syncPrinterStatus: (data: {
    shopId: string;
    accessToken: string;
    supabaseUrl: string;
    supabaseKey: string;
  }) => Promise<{
    success: boolean;
    printers?: AppPrinter[];
    error?: string;
  }>;

  // Listen to printer status changes
  onStatusChanged: (callback: (printers: AppPrinter[]) => void) => void;

  // Remove status change listener
  removeStatusListener: () => void;
}

/**
 * Expose printer API to renderer
 */
export function exposePrinterAPI() {
  const printerAPI: PrinterAPI = {
    detectSystemPrinters: () => 
      ipcRenderer.invoke('printer:detect-system'),

    getPrinterStatus: (printerName: string) =>
      ipcRenderer.invoke('printer:get-status', printerName),

    startMonitoring: (data) =>
      ipcRenderer.invoke('printer:start-monitoring', data),

    stopMonitoring: () =>
      ipcRenderer.invoke('printer:stop-monitoring'),

    syncPrinterStatus: (data) =>
      ipcRenderer.invoke('printer:sync-status', data),

    onStatusChanged: (callback) => {
      ipcRenderer.on('printer:status-changed', (_, printers) => {
        callback(printers);
      });
    },

    removeStatusListener: () => {
      ipcRenderer.removeAllListeners('printer:status-changed');
    }
  };

  contextBridge.exposeInMainWorld('printerAPI', printerAPI);
}

// Add to your main preload file:
// import { exposePrinterAPI } from './printerPreload';
// exposePrinterAPI();