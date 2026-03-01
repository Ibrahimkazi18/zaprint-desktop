import { supabase } from "@/auth/supabase"

export interface MonthlyRevenue {
  shop_id: string
  month: string
  month_label: string
  order_count: number
  total_revenue: number
  avg_order_value: number
}

export default async function fetchMonthlyRevenue(
  shopId: string,
  limit: number = 12
): Promise<MonthlyRevenue[]> {
  const { data, error } = await supabase
    .from("shop_monthly_revenue")
    .select("*")
    .eq("shop_id", shopId)
    .order("month", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching monthly revenue:", error)
    return []
  }

  // Reverse to show oldest first
  return (data || []).reverse()
}
