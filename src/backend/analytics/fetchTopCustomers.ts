import { supabase } from "@/auth/supabase"

export interface TopCustomer {
  shop_id: string
  user_id: string
  customer_name: string
  customer_phone: string
  total_orders: number
  total_revenue: number
  avg_order_value: number
  last_order_date: string
  first_order_date: string
}

export default async function fetchTopCustomers(
  shopId: string,
  limit: number = 10
): Promise<TopCustomer[]> {
  const { data, error } = await supabase
    .from("shop_top_customers")
    .select("*")
    .eq("shop_id", shopId)
    .order("total_revenue", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching top customers:", error)
    return []
  }

  return data || []
}
