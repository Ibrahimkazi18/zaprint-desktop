import { supabase } from "@/auth/supabase"

export default async function fetchShopServices(shopId: string) {
  const { data, error } = await supabase
    .from("shop_services")
    .select("id, service_name, price")
    .eq("shop_id", shopId)
    .order("service_name")

  if (error) throw error
  return data
}
