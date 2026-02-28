import { useState, useEffect } from "react";
import { printQueueManager } from "@/print/printQueueManager";

export type QueueJob = {
  orderId: string;
  itemId: string;
  filePath: string;
  copies: number;
  colorMode: "bw" | "color";
  pagesPerSheet: number;
  status: "queued" | "printing";
};

export function useLiveQueue() {
  const [queue, setQueue] = useState<QueueJob[]>([]);

  useEffect(() => {
    const unsubscribe = printQueueManager.subscribeQueue(snapshot => {
      const formattedQueue = snapshot.map((job, index) => ({
        orderId: job.orderId,
        itemId: job.itemId,
        filePath: job.filePath,
        copies: job.copies,
        colorMode: job.colorMode,
        pagesPerSheet: job.pagesPerSheet,
        status: index === 0 ? ("printing" as const) : ("queued" as const),
      }));

      setQueue(formattedQueue);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return queue;
}
