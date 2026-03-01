import { supabase } from "@/auth/supabase"

export interface AnalyticsOverview {
  shop_id: string
  today_orders: number
  today_revenue: number
  week_orders: number
  week_revenue: number
  month_orders: number
  month_revenue: number
  quarter_orders: number
  quarter_revenue: number
  yesterday_orders: number
  yesterday_revenue: number
  last_week_orders: number
  last_week_revenue: number
  last_month_orders: number
  last_month_revenue: number
  total_customers: number
  active_customers_week: number
  active_customers_month: number
  avg_order_value: number
  completion_rate: number
}

export default async function fetchAnalyticsOverview(
  shopId: string
): Promise<AnalyticsOverview | null> {
  const { data, error } = await supabase
    .from("shop_analytics_overview")
    .select("*")
    .eq("shop_id", shopId)
    .single()

  if (error) {
    console.error("Error fetching analytics overview:", error)
    return null
  }

  return data
}
