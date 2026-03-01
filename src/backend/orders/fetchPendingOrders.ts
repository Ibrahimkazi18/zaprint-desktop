import { supabase } from "@/auth/supabase"

export interface PendingOrder {
  id: string
  user_id: string
  customer_name?: string
  customer_phone?: string
  total_amount: number
  pickup_otp: string
  otp_generated_at: string
  created_at: string
  updated_at: string
  items_count?: number
}

export default async function fetchPendingOrders(shopId: string) {
  // First, fetch orders with status 'ready'
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, user_id, total_amount, pickup_otp, otp_generated_at, created_at, updated_at")
    .eq("shop_id", shopId)
    .eq("status", "ready")
    .order("updated_at", { ascending: false })

  if (ordersError) {
    console.error("Error fetching orders:", ordersError)
    throw ordersError
  }

  if (!orders || orders.length === 0) {
    return []
  }

  // Get unique user IDs
  const userIds = [...new Set(orders.map(o => o.user_id))]

  // Fetch profiles for these users
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, name, phone_number")
    .in("id", userIds)

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError)
    // Continue without profile data rather than failing
  }

  // Create a map of profiles for quick lookup
  const profileMap = new Map(
    profiles?.map(p => [p.id, p]) || []
  )

  // Combine orders with profile data
  const transformedData = orders.map(order => ({
    id: order.id,
    user_id: order.user_id,
    customer_name: profileMap.get(order.user_id)?.name || "Unknown Customer",
    customer_phone: profileMap.get(order.user_id)?.phone_number || "",
    total_amount: order.total_amount,
    pickup_otp: order.pickup_otp,
    otp_generated_at: order.otp_generated_at,
    created_at: order.created_at,
    updated_at: order.updated_at,
  }))

  return transformedData
}
