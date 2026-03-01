import { supabase } from "@/auth/supabase"

export interface HourlyPerformance {
  shop_id: string
  hour: number
  order_count: number
  total_revenue: number
  avg_order_value: number
}

export default async function fetchHourlyPerformance(
  shopId: string
): Promise<HourlyPerformance[]> {
  const { data, error } = await supabase
    .from("shop_hourly_performance")
    .select("*")
    .eq("shop_id", shopId)
    .order("hour", { ascending: true })

  if (error) {
    console.error("Error fetching hourly performance:", error)
    return []
  }

  return data || []
}
