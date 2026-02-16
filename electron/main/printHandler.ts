import { BrowserWindow } from "electron";
import { pathToFileURL } from "url";
import { printerService, AppPrinter } from "./printer/PrinterService";

type PrintJob = {
  filePath: string;
  copies?: number;
  colorMode?: string;
  availablePrinters?: AppPrinter[];
  orderId?: string;
  itemId?: string;
};

export async function printFile(
  job: PrintJob,
  fallbackPrinters: AppPrinter[] = []
) {
  if (!job?.filePath) {
    throw new Error("Missing filePath for print job");
  }

  const appPrinters =
    job.availablePrinters && job.availablePrinters.length > 0
      ? job.availablePrinters
      : fallbackPrinters;

  console.log("[Print] Job started", {
    orderId: job.orderId,
    itemId: job.itemId,
    filePath: job.filePath,
    colorMode: job.colorMode,
  });

  logAvailablePrinters(appPrinters);

  const requestedMode = normalizeMode(job.colorMode);
  const targetPrinter = selectPrinter(appPrinters, requestedMode);

  if (!targetPrinter) {
    const label = requestedMode ? requestedMode : "any";
    throw new Error(`No online ${label} printer available`);
  }

  const systemPrinters = await printerService.detectSystemPrinters();
  logSystemPrinters(systemPrinters);

  const systemMatch = systemPrinters.find(
    (printer) =>
      printer.name.toLowerCase() === targetPrinter.printer_name.toLowerCase()
  );

  if (!systemMatch || systemMatch.status !== "online") {
    throw new Error(
      `Printer not available on system: ${targetPrinter.printer_name}`
    );
  }

  console.log("[Print] Selected printer:", targetPrinter.printer_name);

  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      plugins: true,
      sandbox: false,
    },
  });

  try {
    const fileUrl = pathToFileURL(job.filePath).toString();
    await win.loadURL(fileUrl);
    await waitForPrintReady(win, job.filePath);
    await printWebContents(win, targetPrinter.printer_name, job.copies ?? 1);
    console.log("[Print] Job finished:", job.filePath);
  } finally {
    win.close();
  }
}

function normalizeMode(value?: string) {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("bw") || normalized.includes("b&w")) return "bw";
  if (normalized.includes("black")) return "bw";
  if (normalized.includes("color")) return "color";
  return "";
}

function selectPrinter(printers: AppPrinter[], requestedMode: string) {
  return printers.find((printer) => {
    const isOnline = String(printer.status).toLowerCase() === "online";
    if (!isOnline) return false;

    if (!requestedMode) return true;
    const printerMode = normalizeMode(printer.printer_type);
    return printerMode === requestedMode;
  });
}

function logAvailablePrinters(printers: AppPrinter[]) {
  console.log("[Print] Available app printers:", printers.length);
  printers.forEach((printer) => {
    console.log(
      `[Print] - ${printer.printer_name} (${printer.printer_type}, ${printer.status})`
    );
  });
}

function logSystemPrinters(printers: any[]) {
  console.log("[Print] System printers detected:", printers.length);
  printers.forEach((printer) => {
    console.log(`[Print] - ${printer.name} (${printer.status})`);
  });
}

function printWebContents(
  win: BrowserWindow,
  deviceName: string,
  copies: number
) {
  return new Promise<void>((resolve, reject) => {
    win.webContents.print(
      {
        silent: true,
        deviceName,
        copies,
        printBackground: true,
      },
      (success, failureReason) => {
        if (!success) {
          reject(new Error(failureReason || "Print failed"));
          return;
        }

        resolve();
      }
    );
  });
}

function isPdfPath(filePath: string) {
  return /\.pdf$/i.test(filePath || "");
}

async function waitForPrintReady(win: BrowserWindow, filePath: string) {
  if (!isPdfPath(filePath)) return;

  // PDF rendering in the built-in viewer can lag behind did-finish-load.
  // Wait for the viewer to fully render before printing to avoid blank pages.
  const timeoutMs = 15000;
  const pollMs = 250;
  const start = Date.now();

  while (win.webContents.isLoading()) {
    await new Promise<void>((resolve) =>
      win.webContents.once("did-stop-loading", () => resolve())
    );
  }

  while (Date.now() - start < timeoutMs) {
    try {
      const readyState = await win.webContents.executeJavaScript(
        "document.readyState",
        true
      );
      if (readyState === "complete") {
        await delay(500);
        return;
      }
    } catch {
      // Ignore transient errors while the PDF viewer is still initializing.
    }

    await delay(pollMs);
  }
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
