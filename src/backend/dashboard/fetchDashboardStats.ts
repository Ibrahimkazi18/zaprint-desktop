import { supabase } from "@/auth/supabase"

export interface DashboardStats {
  today_orders: number
  today_earnings: number
  yesterday_orders: number
  yesterday_earnings: number
  month_orders: number
  month_earnings: number
  last_month_orders: number
  last_month_earnings: number
  active_orders: number
  pending_orders: number
  completed_today: number
  total_customers: number
  active_customers_week: number
}

export default async function fetchDashboardStats(
  shopId: string
): Promise<DashboardStats> {
  const { data, error } = await supabase
    .from("shop_dashboard_stats")
    .select("*")
    .eq("shop_id", shopId)
    .single()

  if (error) {
    console.error("Error fetching dashboard stats:", error)
    // Return default values if view doesn't exist or error occurs
    return {
      today_orders: 0,
      today_earnings: 0,
      yesterday_orders: 0,
      yesterday_earnings: 0,
      month_orders: 0,
      month_earnings: 0,
      last_month_orders: 0,
      last_month_earnings: 0,
      active_orders: 0,
      pending_orders: 0,
      completed_today: 0,
      total_customers: 0,
      active_customers_week: 0,
    }
  }

  return data
}
