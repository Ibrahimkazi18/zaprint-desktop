// electron/printer/PrinterService.ts
import { execSync } from 'child_process';
import os from 'os';

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

export class PrinterService {
  private detectionInterval: NodeJS.Timeout | null = null;
  private statusChangeCallback: ((printers: AppPrinter[]) => void) | null = null;
  private lastKnownPrinters: Map<string, SystemPrinter> = new Map();

  constructor() {
    console.log('[PrinterService] Initialized');
  }

  /**
   * Detect all system printers using OS-specific commands
   */
  async detectSystemPrinters(): Promise<SystemPrinter[]> {
    const platform = os.platform();
    
    try {
      if (platform === 'win32') {
        return this.detectWindowsPrinters();
      } else if (platform === 'darwin') {
        return this.detectMacPrinters();
      } else if (platform === 'linux') {
        return this.detectLinuxPrinters();
      }
      
      console.warn('[PrinterService] Unsupported platform:', platform);
      return [];
    } catch (error) {
      console.error('[PrinterService] Error detecting printers:', error);
      return [];
    }
  }

  /**
   * Windows printer detection using PowerShell
   */
  private detectWindowsPrinters(): SystemPrinter[] {
    try {
      // Use PowerShell to get printer information
      const command = `powershell -Command "Get-Printer | Select-Object Name, PrinterStatus, DriverName, PortName | ConvertTo-Json"`;
      const output = execSync(command, { 
        encoding: 'utf-8',
        windowsHide: true 
      });

      let printers = JSON.parse(output);
      
      // Handle single printer case (PowerShell returns object instead of array)
      if (!Array.isArray(printers)) {
        printers = [printers];
      }

      // Get default printer
      const defaultPrinterCommand = `powershell -Command "Get-CimInstance -ClassName Win32_Printer | Where-Object {$_.Default -eq $true} | Select-Object -ExpandProperty Name"`;
      let defaultPrinter = '';
      
      try {
        defaultPrinter = execSync(defaultPrinterCommand, { 
          encoding: 'utf-8',
          windowsHide: true 
        }).trim();
      } catch (e) {
        console.warn('[PrinterService] Could not detect default printer');
      }

      return printers.map((printer: any) => ({
        name: printer.Name,
        isDefault: printer.Name === defaultPrinter,
        status: this.mapWindowsStatus(printer.PrinterStatus),
        driver: printer.DriverName,
        port: printer.PortName
      }));
    } catch (error) {
      console.error('[PrinterService] Windows printer detection failed:', error);
      return [];
    }
  }

  /**
   * macOS printer detection using lpstat
   */
  private detectMacPrinters(): SystemPrinter[] {
    try {
      // Get all printers
      const printersOutput = execSync('lpstat -p', { encoding: 'utf-8' });
      const printerLines = printersOutput.split('\n').filter(line => line.trim());
      
      // Get default printer
      let defaultPrinter = '';
      try {
        defaultPrinter = execSync('lpstat -d', { encoding: 'utf-8' })
          .replace('system default destination:', '')
          .trim();
      } catch (e) {
        console.warn('[PrinterService] No default printer set');
      }

      const printers: SystemPrinter[] = [];

      for (const line of printerLines) {
        // Parse: "printer PrinterName is idle. enabled since..."
        const match = line.match(/printer\s+(\S+)\s+is\s+(\w+)/);
        if (match) {
          const name = match[1];
          const state = match[2];

          printers.push({
            name,
            isDefault: name === defaultPrinter,
            status: state === 'idle' ? 'online' : state === 'disabled' ? 'offline' : 'error'
          });
        }
      }

      return printers;
    } catch (error) {
      console.error('[PrinterService] macOS printer detection failed:', error);
      return [];
    }
  }

  /**
   * Linux printer detection using lpstat
   */
  private detectLinuxPrinters(): SystemPrinter[] {
    try {
      const printersOutput = execSync('lpstat -p', { encoding: 'utf-8' });
      const printerLines = printersOutput.split('\n').filter(line => line.trim());
      
      let defaultPrinter = '';
      try {
        defaultPrinter = execSync('lpstat -d', { encoding: 'utf-8' })
          .replace('system default destination:', '')
          .trim();
      } catch (e) {
        console.warn('[PrinterService] No default printer set');
      }

      const printers: SystemPrinter[] = [];

      for (const line of printerLines) {
        const match = line.match(/printer\s+(\S+)\s+is\s+(\w+)/);
        if (match) {
          const name = match[1];
          const state = match[2];

          printers.push({
            name,
            isDefault: name === defaultPrinter,
            status: state === 'idle' ? 'online' : 'offline'
          });
        }
      }

      return printers;
    } catch (error) {
      console.error('[PrinterService] Linux printer detection failed:', error);
      return [];
    }
  }

  /**
   * Map Windows printer status to our standard status
   */
  private mapWindowsStatus(status: number): 'online' | 'offline' | 'error' {
    // Windows PrinterStatus enumeration
    // 1 = Other, 2 = Unknown, 3 = Idle, 4 = Printing, 5 = Warmup
    // 6 = Stopped, 7 = Offline
    
    if (status === 3 || status === 4 || status === 5) {
      return 'online';
    } else if (status === 6 || status === 7) {
      return 'offline';
    }
    return 'error';
  }

  /**
   * Map system printers to registered app printers
   */
  mapToAppPrinters(
    systemPrinters: SystemPrinter[],
    registeredPrinters: AppPrinter[]
  ): AppPrinter[] {
    const systemPrinterMap = new Map(
      systemPrinters.map(p => [p.name.toLowerCase(), p])
    );

    return registeredPrinters.map(appPrinter => {
      const systemPrinter = systemPrinterMap.get(
        appPrinter.printer_name.toLowerCase()
      );

      if (systemPrinter) {
        // Printer found in system - use system status
        return {
          ...appPrinter,
          status: systemPrinter.status,
          last_heartbeat: new Date().toISOString()
        };
      } else {
        // Printer not found - mark as offline
        return {
          ...appPrinter,
          status: 'offline',
          last_heartbeat: new Date().toISOString()
        };
      }
    });
  }

  /**
   * Start continuous printer monitoring
   */
  startMonitoring(
    registeredPrinters: AppPrinter[],
    onStatusChange: (printers: AppPrinter[]) => void,
    intervalMs: number = 10000 // Check every 10 seconds
  ) {
    console.log('[PrinterService] Starting printer monitoring...');
    
    this.statusChangeCallback = onStatusChange;
    
    // Initial check
    this.checkAndUpdatePrinters(registeredPrinters);

    // Periodic checks
    this.detectionInterval = setInterval(() => {
      this.checkAndUpdatePrinters(registeredPrinters);
    }, intervalMs);
  }

  /**
   * Check printers and notify of changes
   */
  private async checkAndUpdatePrinters(registeredPrinters: AppPrinter[]) {
    try {
      const systemPrinters = await this.detectSystemPrinters();
      
      // Check for changes
      const hasChanges = this.detectChanges(systemPrinters);
      
      if (hasChanges || this.lastKnownPrinters.size === 0) {
        console.log('[PrinterService] Printer status changed, updating...');
        
        // Update last known state
        this.lastKnownPrinters.clear();
        systemPrinters.forEach(p => {
          this.lastKnownPrinters.set(p.name, p);
        });

        // Map to app printers
        const updatedPrinters = this.mapToAppPrinters(
          systemPrinters,
          registeredPrinters
        );

        // Notify callback
        if (this.statusChangeCallback) {
          this.statusChangeCallback(updatedPrinters);
        }
      }
    } catch (error) {
      console.error('[PrinterService] Error in monitoring cycle:', error);
    }
  }

  /**
   * Detect if printer status has changed
   */
  private detectChanges(currentPrinters: SystemPrinter[]): boolean {
    if (currentPrinters.length !== this.lastKnownPrinters.size) {
      return true;
    }

    for (const printer of currentPrinters) {
      const lastKnown = this.lastKnownPrinters.get(printer.name);
      if (!lastKnown || lastKnown.status !== printer.status) {
        return true;
      }
    }

    return false;
  }

  /**
   * Stop printer monitoring
   */
  stopMonitoring() {
    console.log('[PrinterService] Stopping printer monitoring...');
    
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
    
    this.statusChangeCallback = null;
    this.lastKnownPrinters.clear();
  }

  /**
   * Get single printer status
   */
  async getPrinterStatus(printerName: string): Promise<SystemPrinter | null> {
    const printers = await this.detectSystemPrinters();
    return printers.find(
      p => p.name.toLowerCase() === printerName.toLowerCase()
    ) || null;
  }
}

// Singleton instance
export const printerService = new PrinterService();