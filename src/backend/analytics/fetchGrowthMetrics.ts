import { supabase } from "@/auth/supabase"

export interface GrowthMetrics {
  shop_id: string
  current_month_orders: number
  last_month_orders: number
  mom_orders_growth: number
  current_month_revenue: number
  last_month_revenue: number
  mom_revenue_growth: number
  current_week_orders: number
  last_week_orders: number
  wow_orders_growth: number
  current_week_revenue: number
  last_week_revenue: number
  wow_revenue_growth: number
}

export default async function fetchGrowthMetrics(
  shopId: string
): Promise<GrowthMetrics | null> {
  const { data, error } = await supabase
    .from("shop_growth_metrics")
    .select("*")
    .eq("shop_id", shopId)
    .single()

  if (error) {
    console.error("Error fetching growth metrics:", error)
    return null
  }

  return data
}
