import { supabase } from "@/auth/supabase"

export default async function addShopResources(
  shopId: string,
  resources: string[]
) {
  const rows = resources.map(r => ({
    shop_id: shopId,
    resource_name: r,
  }))

  const { error } = await supabase
    .from("shop_resources")
    .insert(rows)

  if (error) throw error
}
