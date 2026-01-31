// electron/main/printerHandlers.ts
import { ipcMain, BrowserWindow } from 'electron';
import { printerService, AppPrinter } from './printer/PrinterService';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase client cache
const supabaseClients = new Map<string, SupabaseClient>();

// Initialize Supabase client with provided credentials
function getSupabaseClient(url: string, key: string): SupabaseClient {
  const cacheKey = `${url}:${key}`;
  
  if (!supabaseClients.has(cacheKey)) {
    const client = createClient(url, key);
    supabaseClients.set(cacheKey, client);
  }
  
  return supabaseClients.get(cacheKey)!;
}

let monitoringActive = false;

/**
 * Setup all printer-related IPC handlers
 */
export function setupPrinterHandlers(mainWindow: BrowserWindow) {
  
  // Detect system printers
  ipcMain.handle('printer:detect-system', async () => {
    try {
      console.log('[IPC] Detecting system printers...');
      const printers = await printerService.detectSystemPrinters();
      console.log(`[IPC] Found ${printers.length} system printers`);
      return { success: true, printers };
    } catch (error: any) {
      console.error('[IPC] Error detecting printers:', error);
      return { success: false, error: error.message };
    }
  });

  // Get printer status for specific printer
  ipcMain.handle('printer:get-status', async (_, printerName: string) => {
    try {
      const status = await printerService.getPrinterStatus(printerName);
      return { success: true, status };
    } catch (error: any) {
      console.error('[IPC] Error getting printer status:', error);
      return { success: false, error: error.message };
    }
  });

  // Start monitoring printers
  ipcMain.handle('printer:start-monitoring', async (_, { shopId, accessToken, supabaseUrl, supabaseKey }) => {
    try {
      if (monitoringActive) {
        console.log('[IPC] Monitoring already active');
        return { success: true, message: 'Already monitoring' };
      }

      console.log('[IPC] Starting printer monitoring for shop:', shopId);

      // Initialize Supabase client with provided credentials
      const client = getSupabaseClient(supabaseUrl, supabaseKey);

      // Set auth token for Supabase
      if (accessToken) {
        await client.auth.setSession({
          access_token: accessToken,
          refresh_token: '' // Will be handled by client
        });
      }

      // Fetch registered printers from database
      const { data: registeredPrinters, error } = await client
        .from('shop_printers')
        .select('*')
        .eq('shop_id', shopId);

      if (error) {
        throw new Error(`Failed to fetch printers: ${error.message}`);
      }

      if (!registeredPrinters || registeredPrinters.length === 0) {
        console.log('[IPC] No registered printers found');
        return { 
          success: true, 
          message: 'No printers registered yet',
          printers: [] 
        };
      }

      // Start monitoring
      printerService.startMonitoring(
        registeredPrinters as AppPrinter[],
        async (updatedPrinters) => {
          console.log('[IPC] Printer status changed, updating database...');
          
          // Update database
          await updatePrintersInDatabase(client, updatedPrinters);
          
          // Notify renderer process
          mainWindow.webContents.send('printer:status-changed', updatedPrinters);
        },
        10000 // Check every 10 seconds
      );

      monitoringActive = true;

      return { 
        success: true, 
        message: 'Monitoring started',
        printers: registeredPrinters 
      };
    } catch (error: any) {
      console.error('[IPC] Error starting monitoring:', error);
      return { success: false, error: error.message };
    }
  });

  // Stop monitoring printers
  ipcMain.handle('printer:stop-monitoring', async () => {
    try {
      console.log('[IPC] Stopping printer monitoring...');
      printerService.stopMonitoring();
      monitoringActive = false;
      return { success: true };
    } catch (error: any) {
      console.error('[IPC] Error stopping monitoring:', error);
      return { success: false, error: error.message };
    }
  });

  // Manual printer status sync
  ipcMain.handle('printer:sync-status', async (_, { shopId, accessToken, supabaseUrl, supabaseKey }) => {
    try {
      console.log('[IPC] Manual sync requested for shop:', shopId);

      // Initialize Supabase client
      const client = getSupabaseClient(supabaseUrl, supabaseKey);

      if (accessToken) {
        await client.auth.setSession({
          access_token: accessToken,
          refresh_token: ''
        });
      }

      // Fetch registered printers
      const { data: registeredPrinters, error: fetchError } = await client
        .from('shop_printers')
        .select('*')
        .eq('shop_id', shopId);

      if (fetchError) throw fetchError;

      if (!registeredPrinters || registeredPrinters.length === 0) {
        return { success: true, printers: [] };
      }

      // Detect system printers
      const systemPrinters = await printerService.detectSystemPrinters();

      // Map to app printers
      const updatedPrinters = printerService.mapToAppPrinters(
        systemPrinters,
        registeredPrinters as AppPrinter[]
      );

      // Update database
      await updatePrintersInDatabase(client, updatedPrinters);

      return { success: true, printers: updatedPrinters };
    } catch (error: any) {
      console.error('[IPC] Error syncing printer status:', error);
      return { success: false, error: error.message };
    }
  });
}

/**
 * Update multiple printers in database
 */
async function updatePrintersInDatabase(client: SupabaseClient, printers: AppPrinter[]) {
  try {
    const updates = printers.map(printer => ({
      id: printer.id,
      status: printer.status,
      last_heartbeat: printer.last_heartbeat
    }));

    for (const update of updates) {
      const { error } = await client
        .from('shop_printers')
        .update({
          status: update.status,
          last_heartbeat: update.last_heartbeat
        })
        .eq('id', update.id);

      if (error) {
        console.error(`[DB] Error updating printer ${update.id}:`, error);
      }
    }

    console.log(`[DB] Updated ${updates.length} printers`);
  } catch (error) {
    console.error('[DB] Error updating printers:', error);
  }
}

/**
 * Cleanup on app quit
 */
export function cleanupPrinterHandlers() {
  printerService.stopMonitoring();
  monitoringActive = false;
}