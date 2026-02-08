import { supabase } from "@/auth/supabase";

export async function updateOrderStatus(
  orderId: string,
  status: string
) {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    console.error("Failed to update order status:", error);
    throw error;
  }
}
