import { BrowserWindow, ipcMain } from "electron";
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

  const isPdf = isPdfPath(job.filePath);

  if (isPdf) {
    await printPdfAsImages(
      job.filePath,
      targetPrinter.printer_name,
      job.copies ?? 1
    );
    console.log("[Print] Job finished:", job.filePath);
    return;
  }

  const win = new BrowserWindow({
    show: false,
    backgroundColor: "#FFFFFF",
    webPreferences: {
      plugins: true,
      sandbox: false,
    },
  });

  try {
    const fileUrl = pathToFileURL(job.filePath).toString();
    await win.loadURL(fileUrl);
    await waitForPrintReady(win, job.filePath);
    await printWebContents(
      win,
      targetPrinter.printer_name,
      job.copies ?? 1,
      true
    );
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
  copies: number,
  printBackground: boolean,
  timeoutMs = 60000
) {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Print timeout"));
    }, timeoutMs);

    win.webContents.print(
      {
        silent: true,
        deviceName,
        copies,
        printBackground,
      },
      (success, failureReason) => {
        clearTimeout(timeout);
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

async function printPdfAsImages(
  filePath: string,
  deviceName: string,
  copies: number
) {
  const jobId = `pdf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const readyChannel = `pdf-render-ready:${jobId}`;
  const errorChannel = `pdf-render-error:${jobId}`;

  const win = new BrowserWindow({
    show: false,
    backgroundColor: "#FFFFFF",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false,
    },
  });

  const renderPromise = new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      ipcMain.removeAllListeners(readyChannel);
      ipcMain.removeAllListeners(errorChannel);
    };

    ipcMain.once(readyChannel, () => {
      cleanup();
      resolve();
    });

    ipcMain.once(errorChannel, (_event, message: string) => {
      cleanup();
      reject(new Error(message || "PDF render failed"));
    });

    win.webContents.once("did-fail-load", (_event, _code, reason) => {
      cleanup();
      reject(new Error(reason || "PDF render load failed"));
    });
  });

  try {
    const html = buildPdfPrintHtml(filePath, jobId);
    await win.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
    );
    await withTimeout(renderPromise, 30000, "PDF render timeout");
    await delay(300);
    await printWebContents(win, deviceName, copies, false, 60000);
  } finally {
    win.close();
  }
}

function buildPdfPrintHtml(filePath: string, jobId: string) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      @page { margin: 0; }
      html, body { margin: 0; padding: 0; background: #ffffff; }
      #pages { display: block; }
      canvas { display: block; page-break-after: always; }
    </style>
  </head>
  <body>
    <div id="pages"></div>
    <script>
      const filePath = ${JSON.stringify(filePath)};
      const jobId = ${JSON.stringify(jobId)};
      const scale = 2;

      async function renderPdf() {
        let ipcRenderer;
        try {
          ({ ipcRenderer } = require('electron'));
          const fs = require('fs');
          const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

          const data = fs.readFileSync(filePath);
          const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(data),
            disableWorker: true
          });
          const pdf = await loadingTask.promise;
          const container = document.getElementById('pages');

          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d', { alpha: false });
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            context.fillStyle = '#FFFFFF';
            context.fillRect(0, 0, canvas.width, canvas.height);

            await page.render({ canvasContext: context, viewport, intent: 'print' }).promise;
            container.appendChild(canvas);
          }

          ipcRenderer.send('pdf-render-ready:' + jobId);
        } catch (error) {
          const message = error && error.message ? error.message : String(error);
          if (ipcRenderer) {
            ipcRenderer.send('pdf-render-error:' + jobId, message);
          } else {
            console.error('PDF render error:', message);
          }
        }
      }

      renderPdf();
    </script>
  </body>
</html>`;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(message)), timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timeout);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}
