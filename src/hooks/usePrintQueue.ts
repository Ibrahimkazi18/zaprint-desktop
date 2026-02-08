import { useCallback, useEffect, useState } from "react";
import { printQueueManager } from "@/print/printQueueManager";
import { PrintQueueItem } from "@/types/printTypes";

type AppPrinter = {
  printer_name: string;
  printer_type: string;
  status: string;
};

type SystemPrinter = {
  name: string;
  status: string;
  isDefault?: boolean;
};

export function usePrintQueue(printers: AppPrinter[] = []) {
  const [systemPrinters, setSystemPrinters] = useState<SystemPrinter[]>([]);

  useEffect(() => {
    if (!window?.printerAPI?.detectSystemPrinters) return;

    const detect = async () => {
      try {
        const result = await window.printerAPI.detectSystemPrinters();
        if (result.success && result.printers) {
          setSystemPrinters(result.printers);
        }
      } catch (error) {
        console.error("[PrintQueue] Failed to detect system printers", error);
      }
    };

    void detect();
  }, []);

  useEffect(() => {
    printQueueManager.setAvailablePrinters(printers);
  }, [printers]);

  const addJob = useCallback((job: PrintQueueItem) => {
    printQueueManager.addJob(job);
  }, []);

  return { addJob, systemPrinters };
}
