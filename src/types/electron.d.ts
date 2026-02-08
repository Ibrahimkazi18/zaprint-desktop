export {};

declare global {
  interface Window {
    electron: {
      saveFile: (fileName: string, buffer: ArrayBuffer) => Promise<string>;
    };
  }
}
