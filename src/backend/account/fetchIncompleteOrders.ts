import { supabase } from "@/auth/supabase"

export interface IncompleteOrdersResult {
  count: number
  breakdown: {
    status: string
    count: number
  }[]
}

/**
 * Fetches incomplete orders for a given shop.
 * An order is considered incomplete if its status is NOT 'completed' or 'picked_up'.
 * Returns the total count and a breakdown by status.
 */
export default async function fetchIncompleteOrders(shopId: string): Promise<IncompleteOrdersResult> {
  // Fetch all orders for the shop, then filter client-side for reliability
  const { data, error } = await supabase
    .from("orders")
    .select("id, status")
    .eq("shop_id", shopId)

  if (error) {
    console.error("Error fetching orders:", error)
    throw error
  }

  const allOrders = data || []
  
  // Filter out completed/picked_up orders
  const incompleteOrders = allOrders.filter(
    (o) => o.status !== "completed" && o.status !== "picked_up"
  )

  // Build a breakdown by status
  const statusMap = new Map<string, number>()
  for (const order of incompleteOrders) {
    const status = order.status || "unknown"
    statusMap.set(status, (statusMap.get(status) || 0) + 1)
  }

  const breakdown = Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
  }))

  return {
    count: incompleteOrders.length,
    breakdown,
  }
}
