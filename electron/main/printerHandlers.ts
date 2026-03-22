// electron/main/printerHandlers.ts
import { ipcMain, BrowserWindow } from 'electron';
import { printerService, AppPrinter } from './printer/PrinterService';
import { testPrintService } from './printer/TestPrintService';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase client cache
// SECURITY: VITE_SUPABASE_URL is public and safe for client-side via import.meta.env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL 
// SECURITY: Service role key uses process.env (NOT VITE_ prefix) to prevent
// client-side exposure. This key bypasses all RLS and must stay in main process only.
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
}

// Single Supabase client using service role
const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

let monitoringActive = false;

/**
 * Setup all printer-related IPC handlers
 */
export function setupPrinterHandlers(mainWindow: BrowserWindow) {
  
  // Detect system printers
  ipcMain.handle('printer:detect-system', async () => {
    try {
      console.log('[IPC] Detecting system printers...');
      const printers = await printerService.detectSystemPrinters({ force: true });
      console.log(`[IPC] Found ${printers.length} system printers`);
      
      // Log each printer found
      printers.forEach(p => {
        console.log(`  - ${p.name} (${p.status})`);
      });
      
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
  ipcMain.handle('printer:start-monitoring', async (_, { shopId }) => {
    try {
      if (monitoringActive) {
        console.log('[IPC] Monitoring already active');
        return { success: true, message: 'Already monitoring' };
      }

      console.log('[IPC] Starting printer monitoring for shop:', shopId);

      // Fetch registered printers from database
      console.log('[IPC] Fetching printers from database...');
      console.log('[IPC] Shop ID:', shopId);
      
      const { data: registeredPrinters, error } = await supabase
        .from('shop_printers')
        .select('*')
        .eq('shop_id', shopId);

      console.log('[IPC] Database query result:');
      console.log('[IPC]   - Error:', error);
      console.log('[IPC]   - Data:', registeredPrinters);
      console.log('[IPC]   - Count:', registeredPrinters?.length || 0);

      if (error) {
        console.error('[IPC] Database error details:', error);
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

      console.log(`[IPC] Found ${registeredPrinters.length} registered printers in database`);

      // IMMEDIATE SYNC - Do first detection right away
      console.log('[IPC] Performing immediate printer detection...');
      const systemPrinters = await printerService.detectSystemPrinters({ force: true });
      console.log(`[IPC] Immediate detection found ${systemPrinters.length} system printers`);
      
      const initialPrinters = printerService.mapToAppPrinters(
        systemPrinters,
        registeredPrinters as AppPrinter[]
      );

      // Update database in the background to avoid blocking UI
      void updatePrintersInDatabase(initialPrinters).catch((error) => {
        console.error('[DB] Background update failed:', error);
      });
      
      // Send initial status to renderer
      mainWindow.webContents.send('printer:status-changed', initialPrinters);
      console.log('[IPC] Initial printer status sent to renderer');

      // Start monitoring for future changes
      printerService.startMonitoring(
        registeredPrinters as AppPrinter[],
        async (updatedPrinters) => {
          console.log('[IPC] Printer status changed during monitoring, updating database...');
          
          // Update database in the background
          void updatePrintersInDatabase(updatedPrinters).catch((error) => {
            console.error('[DB] Background update failed:', error);
          });
          
          // Notify renderer process
          mainWindow.webContents.send('printer:status-changed', updatedPrinters);
        },
        10000 // Check every 10 seconds
      );

      monitoringActive = true;

      return { 
        success: true, 
        message: 'Monitoring started',
        printers: initialPrinters  // Return the synced printers
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
  ipcMain.handle('printer:sync-status', async (_, { shopId }) => {
    try {
      console.log('[IPC] Manual sync requested for shop:', shopId);

      // Fetch registered printers
      const { data: registeredPrinters, error: fetchError } = await supabase
        .from('shop_printers')
        .select('*')
        .eq('shop_id', shopId);

      if (fetchError) throw fetchError;

      if (!registeredPrinters || registeredPrinters.length === 0) {
        return { success: true, printers: [] };
      }

      console.log(`[IPC] Syncing ${registeredPrinters.length} printers...`);

      // Detect system printers
      const systemPrinters = await printerService.detectSystemPrinters({ force: true });
      console.log(`[IPC] Found ${systemPrinters.length} system printers`);

      // Map to app printers
      const updatedPrinters = printerService.mapToAppPrinters(
        systemPrinters,
        registeredPrinters as AppPrinter[]
      );

      // Log the status of each printer
      updatedPrinters.forEach(p => {
        console.log(`  - ${p.printer_name}: ${p.status}`);
      });

      // Update database
      await updatePrintersInDatabase(updatedPrinters);

      return { success: true, printers: updatedPrinters };
    } catch (error: any) {
      console.error('[IPC] Error syncing printer status:', error);
      return { success: false, error: error.message };
    }
  });

  // Test print
  ipcMain.handle('printer:test-print', async (_, { printerName, shopName, printerType }) => {
    try {
      console.log('[IPC] Test print requested for:', printerName);
      const result = await testPrintService.printTestPage({
        printerName,
        shopName,
        printerType
      });
      return result;
    } catch (error: any) {
      console.error('[IPC] Error printing test page:', error);
      return { success: false, error: error.message };
    }
  });
}

/**
 * Update multiple printers in database
 */
async function updatePrintersInDatabase(printers: AppPrinter[]) {
  try {
    if (!printers || printers.length === 0) {
      return;
    }

    const updates = printers.map(printer => ({
      id: printer.id,
      shop_id: printer.shop_id,
      printer_name: printer.printer_name,
      printer_type: printer.printer_type,
      supported_services: printer.supported_services,
      supported_sizes: printer.supported_sizes,
      status: printer.status,
      last_heartbeat: printer.last_heartbeat,
    }));

    const { error } = await supabase
      .from('shop_printers')
      .upsert(updates, { onConflict: 'id' });

    if (error) {
      console.error('[DB] Error updating printers:', error);
    }
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

