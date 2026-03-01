// electron/main/printer/TestPrintService.ts
import { BrowserWindow } from 'electron';

export interface TestPrintOptions {
  printerName: string;
  shopName?: string;
  printerType?: string;
}

export class TestPrintService {
  /**
   * Generate test print HTML content
   */
  private generateTestPageHTML(options: TestPrintOptions): string {
    const { printerName, shopName = 'Print Shop', printerType = 'Standard' } = options;
    const timestamp = new Date().toLocaleString();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Test Print</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          
          body {
            font-family: 'Courier New', monospace;
            margin: 0;
            padding: 20px;
            background: white;
          }
          
          .header {
            text-align: center;
            border-bottom: 3px double #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
            font-weight: bold;
          }
          
          .header h2 {
            margin: 0;
            font-size: 18px;
            font-weight: normal;
          }
          
          .info-section {
            margin: 20px 0;
            padding: 15px;
            border: 2px solid #000;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            font-size: 14px;
          }
          
          .info-label {
            font-weight: bold;
          }
          
          .test-patterns {
            margin: 30px 0;
          }
          
          .pattern-title {
            font-weight: bold;
            margin: 15px 0 10px 0;
            font-size: 16px;
          }
          
          .text-samples {
            line-height: 1.8;
          }
          
          .line-pattern {
            margin: 10px 0;
          }
          
          .line {
            height: 1px;
            background: #000;
            margin: 5px 0;
          }
          
          .line.thick {
            height: 3px;
          }
          
          .line.dashed {
            border-top: 2px dashed #000;
            background: none;
          }
          
          .grid {
            display: grid;
            grid-template-columns: repeat(10, 1fr);
            gap: 5px;
            margin: 10px 0;
          }
          
          .grid-cell {
            aspect-ratio: 1;
            border: 1px solid #000;
          }
          
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            border-top: 1px solid #000;
            padding-top: 15px;
          }
          
          .success-message {
            margin-top: 30px;
            padding: 20px;
            border: 3px solid #000;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🖨️ PRINTER TEST PAGE</h1>
          <h2>${shopName}</h2>
        </div>

        <div class="info-section">
          <div class="info-row">
            <span class="info-label">Printer Name:</span>
            <span>${printerName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Printer Type:</span>
            <span>${printerType}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Test Date:</span>
            <span>${timestamp}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span>✓ ONLINE</span>
          </div>
        </div>

        <div class="test-patterns">
          <div class="pattern-title">Text Quality Test:</div>
          <div class="text-samples">
            <p>ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
            <p>abcdefghijklmnopqrstuvwxyz</p>
            <p>0123456789 !@#$%^&*()_+-=[]{}|;:',.<>?/</p>
            <p style="font-size: 8px;">Small text: The quick brown fox jumps over the lazy dog</p>
            <p style="font-size: 12px;">Medium text: The quick brown fox jumps over the lazy dog</p>
            <p style="font-size: 16px;">Large text: The quick brown fox jumps over the lazy dog</p>
          </div>

          <div class="pattern-title">Line Quality Test:</div>
          <div class="line-pattern">
            <div class="line"></div>
            <div class="line thick"></div>
            <div class="line dashed"></div>
          </div>

          <div class="pattern-title">Grid Pattern Test:</div>
          <div class="grid">
            ${Array(50).fill(0).map(() => '<div class="grid-cell"></div>').join('')}
          </div>
        </div>

        <div class="success-message">
          ✓ TEST PRINT SUCCESSFUL
        </div>

        <div class="footer">
          <p>If all patterns above are clearly visible, your printer is working correctly.</p>
          <p>Generated by ${shopName} Print Management System</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Print test page to specified printer
   */
  async printTestPage(options: TestPrintOptions): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[TestPrintService] Generating test page for:', options.printerName);

      // Create a hidden window for printing
      const printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });

      // Generate HTML content
      const htmlContent = this.generateTestPageHTML(options);

      // Load HTML content
      await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 500));

      // Print silently to the specified printer
      await printWindow.webContents.print({
        silent: true,
        printBackground: true,
        deviceName: options.printerName,
        margins: {
          marginType: 'printableArea'
        }
      });

      // Close the window
      printWindow.close();

      console.log('[TestPrintService] ✓ Test page sent to printer successfully');
      return { success: true };
    } catch (error: any) {
      console.error('[TestPrintService] ✗ Error printing test page:', error);
      return { success: false, error: error.message };
    }
  }
}

export const testPrintService = new TestPrintService();
