import { supabase } from "@/auth/supabase";
import { updateOrderStatus } from "../orders/updateOrderStatus";

export function subscribeToOrders(
  shopId: string,
  addToQueue: (item: any) => void
) {
  console.log("Subscribing to orders for shop ID:", shopId);

  const channel = supabase
    .channel("shop-orders")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "orders",
        filter: `shop_id=eq.${shopId}`,
      },
      async (payload) => {
        const order = payload.new;

        if (order.status !== "pending") return;

        await processOrder(order.id, addToQueue);
      }
    )
    .subscribe((status) => {
      console.log("Realtime status:", status);
    });

  return channel;
}

async function processOrder(orderId: string, addToQueue: any) {
  const { data: items, error } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (error) {
    console.error("Failed to fetch order items:", error);
    return;
  }

  if (!items || items.length === 0) return;

  const totalItems = items.length;

  for (const item of items) {
    const pathForDownload = item.file_url.split("/documents/")[1];

    const { data, error: downloadError } = await supabase.storage
      .from("documents")
      .download(pathForDownload);

    if (downloadError || !data) {
      console.error("Download failed:", downloadError);
      continue;
    }

    const arrayBuffer = await data.arrayBuffer();

    const savedPath = await window.electron.saveFile(
      item.file_name,
      arrayBuffer
    );

    await updateOrderStatus(orderId, "in_queue");

    addToQueue({
      orderId,
      itemId: item.id,
      filePath: savedPath,
      fileUrl: pathForDownload,
      orderItemCount: totalItems,
      copies: item.copies,
      colorMode: item.color_mode,
      pagesPerSheet: item.pages_per_sheet,
    });
  }
}

export async function fetchMissedOrders(
  shopId: string,
  addToQueue: (item: any) => void
) {
  console.log("Checking for missed orders...");

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("shop_id", shopId)
    .in("status", ["pending"]) // only those not processed
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching missed orders:", error);
    return;
  }

  for (const order of orders) {
    console.log("Recovering missed order:", order.id);
    await processOrder(order.id, addToQueue);
  }
}
