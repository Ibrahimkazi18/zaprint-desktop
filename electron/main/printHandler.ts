import { BrowserWindow } from "electron";
import { pathToFileURL } from "url";
import { printerService, AppPrinter } from "./printer/PrinterService";
import * as path from "path";
const pdfPrinter = require("pdf-to-printer");

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

  // Check if file is PDF
  const fileExtension = path.extname(job.filePath).toLowerCase();
  const isPDF = fileExtension === ".pdf";

  if (isPDF) {
    // Use pdf-to-printer for PDF files
    console.log("[Print] Using pdf-to-printer for PDF file");
    await printPDF(job.filePath, targetPrinter.printer_name, job.copies ?? 1);
    console.log("[Print] Job finished:", job.filePath);
  } else {
    // Use BrowserWindow for images and other files
    console.log("[Print] Using BrowserWindow for non-PDF file");
    const win = new BrowserWindow({
      show: false,
    });

    try {
      const fileUrl = pathToFileURL(job.filePath).toString();
      await win.loadURL(fileUrl);
      await printWebContents(win, targetPrinter.printer_name, job.copies ?? 1);
      console.log("[Print] Job finished:", job.filePath);
    } finally {
      win.close();
    }
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

async function printPDF(
  filePath: string,
  printerName: string,
  copies: number
) {
  try {
    const options: any = {
      printer: printerName,
    };

    // Add copies if more than 1
    if (copies > 1) {
      options.copies = copies;
    }

    console.log("[Print] PDF print options:", options);
    
    await pdfPrinter.print(filePath, options);
    
    console.log("[Print] PDF printed successfully");
  } catch (error: any) {
    console.error("[Print] PDF print error:", error);
    throw new Error(`PDF print failed: ${error.message || "unknown error"}`);
  }
}
