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

export function usePrintQueue(
  printers: AppPrinter[] = [],
  options?: { detectSystemPrinters?: boolean; deferMs?: number }
) {
  const [systemPrinters, setSystemPrinters] = useState<SystemPrinter[]>([]);
  const shouldDetectSystemPrinters = options?.detectSystemPrinters !== false;
  const deferMs = options?.deferMs ?? 0;

  useEffect(() => {
    if (!shouldDetectSystemPrinters) return;
    if (!window?.printerAPI?.detectSystemPrinters) return;

    let timeoutId: number | null = null;

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

    if (deferMs > 0) {
      timeoutId = window.setTimeout(() => {
        void detect();
      }, deferMs);
    } else {
      void detect();
    }

    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [shouldDetectSystemPrinters, deferMs]);

  useEffect(() => {
    printQueueManager.setAvailablePrinters(printers);
  }, [printers]);

  const addJob = useCallback((job: PrintQueueItem) => {
    printQueueManager.addJob(job);
  }, []);

  return { addJob, systemPrinters };
}
