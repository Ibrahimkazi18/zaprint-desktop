import { supabase } from "@/auth/supabase"

export interface DailyPerformance {
  shop_id: string
  day_of_week: number
  day_name: string
  total_orders: number
  total_revenue: number
  avg_order_value: number
}

export default async function fetchDailyPerformance(
  shopId: string
): Promise<DailyPerformance[]> {
  const { data, error } = await supabase
    .from("shop_daily_performance")
    .select("*")
    .eq("shop_id", shopId)
    .order("day_of_week", { ascending: true })

  if (error) {
    console.error("Error fetching daily performance:", error)
    return []
  }

  return data || []
}
