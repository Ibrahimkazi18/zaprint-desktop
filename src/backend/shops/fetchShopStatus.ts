import { supabase } from "@/auth/supabase"

export default async function fetchShopStatus(shopId: string) {
  const { data, error } = await supabase
    .from("shops")
    .select("status, start_time, end_time, non_working_days")
    .eq("id", shopId)
    .single()

  if (error) throw error
  return data
}
