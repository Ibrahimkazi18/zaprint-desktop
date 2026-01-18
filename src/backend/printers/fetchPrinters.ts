import { supabase } from "@/auth/supabase"

export default async function fetchShopPrinters(shopId: string) {
  const { data, error } = await supabase
    .from("shop_printers")
    .select("*")
    .eq("shop_id", shopId)
    .order("created_at")

  if (error) throw error
  return data
}
