import { BrowserWindow } from "electron";

export async function printFile(job: any, printers: any[]) {
  console.log("Available printers for printing:", printers);
  
  const targetPrinter = printers.find(
    (p) =>
      p.status === "online" &&
      p.printer_type === job.colorMode
  );

  if (!targetPrinter) {
    throw new Error(
      `No online ${job.colorMode} printer available`
    );
  }

  const win = new BrowserWindow({
    show: false,
  });

  await win.loadURL(`file://${job.filePath}`);

  await win.webContents.print({
    silent: true,
    deviceName: targetPrinter.printer_name,
    copies: job.copies,
  });

  win.close();
}
