import { supabase } from "@/auth/supabase"

export default async function fetchShopResources(shopId: string) {
  const { data, error } = await supabase
    .from("shop_resources")
    .select("id, resource_name")
    .eq("shop_id", shopId)
    .order("resource_name")

  if (error) throw error
  return data
}
