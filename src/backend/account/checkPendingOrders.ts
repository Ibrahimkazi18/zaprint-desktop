import { supabase } from "@/auth/supabase";

export interface PendingOrdersCheck {
  hasPendingOrders: boolean;
  pendingCount: number;
  statuses: string[];
}

export async function checkPendingOrders(shopId: string): Promise<PendingOrdersCheck> {
  // Check for any orders that are not completed
  const { data, error } = await supabase
    .from("orders")
    .select("id, status")
    .eq("shop_id", shopId)
    .neq("status", "completed");

  if (error) {
    console.error("Error checking pending orders:", error);
    throw new Error("Failed to check pending orders");
  }

  const pendingOrders = data || [];
  const statuses = [...new Set(pendingOrders.map(order => order.status))];

  return {
    hasPendingOrders: pendingOrders.length > 0,
    pendingCount: pendingOrders.length,
    statuses,
  };
}
