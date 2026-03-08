import { supabase } from "@/auth/supabase";
import { checkPendingOrders } from "./checkPendingOrders";

export async function deleteAccount(shopId: string, userId: string): Promise<void> {
  // First, verify no pending orders
  const orderCheck = await checkPendingOrders(shopId);
  
  if (orderCheck.hasPendingOrders) {
    throw new Error(
      `Cannot delete account. You have ${orderCheck.pendingCount} pending order(s) with status: ${orderCheck.statuses.join(", ")}`
    );
  }

  // Delete in order (respecting foreign key constraints)
  // 1. Delete shop printers
  const { error: printersError } = await supabase
    .from("shop_printers")
    .delete()
    .eq("shop_id", shopId);

  if (printersError) {
    console.error("Error deleting printers:", printersError);
    throw new Error("Failed to delete shop printers");
  }

  // 2. Delete shop services
  const { error: servicesError } = await supabase
    .from("shop_services")
    .delete()
    .eq("shop_id", shopId);

  if (servicesError) {
    console.error("Error deleting services:", servicesError);
    throw new Error("Failed to delete shop services");
  }

  // 3. Delete shop resources
  const { error: resourcesError } = await supabase
    .from("shop_resources")
    .delete()
    .eq("shop_id", shopId);

  if (resourcesError) {
    console.error("Error deleting resources:", resourcesError);
    throw new Error("Failed to delete shop resources");
  }

  // 4. Delete order items for completed orders
  const { data: completedOrders } = await supabase
    .from("orders")
    .select("id")
    .eq("shop_id", shopId)
    .eq("status", "completed");

  if (completedOrders && completedOrders.length > 0) {
    const orderIds = completedOrders.map(o => o.id);
    
    const { error: orderItemsError } = await supabase
      .from("order_items")
      .delete()
      .in("order_id", orderIds);

    if (orderItemsError) {
      console.error("Error deleting order items:", orderItemsError);
      throw new Error("Failed to delete order items");
    }
  }

  // 5. Delete completed orders
  const { error: ordersError } = await supabase
    .from("orders")
    .delete()
    .eq("shop_id", shopId)
    .eq("status", "completed");

  if (ordersError) {
    console.error("Error deleting orders:", ordersError);
    throw new Error("Failed to delete orders");
  }

  // 6. Delete the shop
  const { error: shopError } = await supabase
    .from("shops")
    .delete()
    .eq("id", shopId);

  if (shopError) {
    console.error("Error deleting shop:", shopError);
    throw new Error("Failed to delete shop");
  }

  // 7. Delete the user profile
  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (profileError) {
    console.error("Error deleting profile:", profileError);
    throw new Error("Failed to delete user profile");
  }

  // Note: Deleting auth user requires service role key
  // For now, we'll just sign them out
  // The auth user can be cleaned up via Supabase dashboard or a backend function
}
