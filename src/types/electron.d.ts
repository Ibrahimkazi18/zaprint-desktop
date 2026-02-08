export {};

declare global {
  interface Window {
    electron: {
      saveFile: (fileName: string, buffer: ArrayBuffer) => Promise<string>;
      deleteFile: (filePath: string) => Promise<void>;
      printFile: (job: any) => Promise<void>;
      setAvailablePrinters: (printers: any[]) => void;
    };
  }
}
