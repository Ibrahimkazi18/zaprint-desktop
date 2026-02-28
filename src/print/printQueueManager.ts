import { supabase } from "@/auth/supabase";
import { updateOrderStatus } from "@/backend/orders/updateOrderStatus";
import { PrintQueueItem } from "@/types/printTypes";

type AppPrinter = {
  id?: string;
  printer_name: string;
  printer_type: string;
  status: string;
};

type SystemPrinter = {
  name: string;
  status: string;
  isDefault?: boolean;
};

export type PrintQueueJob = PrintQueueItem & {
  storagePath?: string;
  orderItemCount?: number;
};

type QueueListener = (snapshot: PrintQueueJob[]) => void;

const queue: PrintQueueJob[] = [];
const orderProgress = new Map<string, { total?: number; completed: number }>();
let isProcessing = false;
let availablePrinters: AppPrinter[] = [];
let systemPrinters: SystemPrinter[] = [];
let retryTimer: number | null = null;
const retryDelayMs = 15000;
const queueListeners = new Set<QueueListener>();

export const printQueueManager = {
  addJob,
  processQueue,
  setAvailablePrinters,
  getQueueSnapshot,
  getSystemPrinters,
  subscribeQueue,
};

function addJob(job: PrintQueueJob) {
  queue.push(job);
  registerOrder(job);
  notifyQueueChange();

  console.log("[PrintQueue] Job queued", {
    orderId: job.orderId,
    itemId: job.itemId,
    filePath: job.filePath,
    colorMode: job.colorMode,
  });

  void processQueue();
}

function setAvailablePrinters(printers: AppPrinter[]) {
  availablePrinters = Array.isArray(printers) ? printers : [];

  if (window?.electron?.setAvailablePrinters) {
    window.electron.setAvailablePrinters(availablePrinters);
  }
}

function getQueueSnapshot() {
  return [...queue];
}

function getSystemPrinters() {
  return [...systemPrinters];
}

function subscribeQueue(listener: QueueListener) {
  queueListeners.add(listener);
  listener(getQueueSnapshot());

  return () => {
    queueListeners.delete(listener);
  };
}

function notifyQueueChange() {
  if (queueListeners.size === 0) return;

  const snapshot = getQueueSnapshot();
  queueListeners.forEach(listener => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error("[PrintQueue] Queue listener error", error);
    }
  });
}

async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    while (queue.length > 0) {
      const job = queue[0];

      if (!window?.electron?.printFile) {
        console.error("[PrintQueue] Electron print API not available");
        scheduleRetry("print API not available");
        break;
      }

      console.log("[PrintQueue] Starting print job", {
        orderId: job.orderId,
        itemId: job.itemId,
        filePath: job.filePath,
      });

      await ensureSystemPrinters();

      try {
        await window.electron.printFile({
          ...job,
          availablePrinters,
        });

        console.log("[PrintQueue] Print finished", {
          orderId: job.orderId,
          itemId: job.itemId,
        });

        await cleanupAfterPrint(job);

        queue.shift();
        notifyQueueChange();
      } catch (error: any) {
        console.error("[PrintQueue] Print failed", error);
        scheduleRetry(error?.message || "print failed");
        break;
      }
    }
  } finally {
    isProcessing = false;
  }
}

async function ensureSystemPrinters() {
  if (!window?.printerAPI?.detectSystemPrinters) return;

  try {
    const result = await window.printerAPI.detectSystemPrinters();

    if (result.success && result.printers) {
      systemPrinters = result.printers;
      console.log(
        `[PrintQueue] Detected ${systemPrinters.length} system printers`
      );
    } else {
      console.warn(
        `[PrintQueue] Printer detection failed: ${result.error || "unknown"}`
      );
    }
  } catch (error) {
    console.error("[PrintQueue] Printer detection error", error);
  }
}

async function cleanupAfterPrint(job: PrintQueueJob) {
  await deleteLocalFile(job.filePath);
  await deleteFromStorage(job);
  await maybeCompleteOrder(job);
}

async function deleteLocalFile(filePath: string) {
  if (!filePath) return;
  if (!window?.electron?.deleteFile) {
    console.warn("[PrintQueue] deleteFile API not available");
    return;
  }

  try {
    await window.electron.deleteFile(filePath);
    console.log("[PrintQueue] Deleted local file", filePath);
  } catch (error) {
    console.error("[PrintQueue] Failed to delete local file", error);
  }
}

async function deleteFromStorage(job: PrintQueueJob) {
  const storagePath = resolveStoragePath(job);
  if (!storagePath) {
    console.warn("[PrintQueue] Missing storage path for cleanup");
    return;
  }

  try {
    const { error } = await supabase.storage
      .from("documents")
      .remove([storagePath]);

    if (error) {
      console.error("[PrintQueue] Storage delete failed", error);
      return;
    }

    console.log("[PrintQueue] Deleted storage file", storagePath);
  } catch (error) {
    console.error("[PrintQueue] Storage delete error", error);
  }
}

async function maybeCompleteOrder(job: PrintQueueJob) {
  const shouldComplete = markOrderItemComplete(job);
  if (!shouldComplete) return;

  try {
    await updateOrderStatus(job.orderId, "completed");
    console.log("[PrintQueue] Order marked completed", job.orderId);
  } catch (error) {
    console.error("[PrintQueue] Failed to update order status", error);
  }
}

function resolveStoragePath(job: PrintQueueJob): string | null {
  if (job.storagePath) return job.storagePath;
  if (!job.fileUrl) return null;

  const marker = "/documents/";
  const index = job.fileUrl.indexOf(marker);
  if (index >= 0) {
    return job.fileUrl.slice(index + marker.length);
  }

  return job.fileUrl;
}

function registerOrder(job: PrintQueueJob) {
  const existing = orderProgress.get(job.orderId);

  if (existing) {
    if (job.orderItemCount && !existing.total) {
      existing.total = job.orderItemCount;
    }
    return;
  }

  orderProgress.set(job.orderId, {
    total: job.orderItemCount,
    completed: 0,
  });
}

function markOrderItemComplete(job: PrintQueueJob) {
  const entry = orderProgress.get(job.orderId);
  if (!entry) return true;

  entry.completed += 1;

  if (typeof entry.total === "number" && entry.completed < entry.total) {
    orderProgress.set(job.orderId, entry);
    return false;
  }

  orderProgress.delete(job.orderId);
  return true;
}

function scheduleRetry(reason: string) {
  console.warn(
    `[PrintQueue] Keeping job in queue. Retry placeholder. Reason: ${reason}`
  );

  if (retryTimer) return;

  retryTimer = window.setTimeout(() => {
    retryTimer = null;
    void processQueue();
  }, retryDelayMs);
}
