// src/types/window.d.ts
import { PrinterAPI } from '../../electron/preload/printerPreload';

export {};

declare global {
  interface Window {
    printerAPI: PrinterAPI;
    auth: {
      saveSession: (session: any) => Promise<void>
      getSession: () => Promise<any | null>
      clearSession: () => Promise<void>
    }
  }
}
