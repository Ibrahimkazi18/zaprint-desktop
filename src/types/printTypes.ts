export type PrintQueueItem = {
  orderId: string;
  itemId: string;
  filePath: string;
  fileUrl: string;
  storagePath?: string;
  copies: number;
  colorMode: "bw" | "color";
  pagesPerSheet: number;
  orderItemCount?: number;
};
