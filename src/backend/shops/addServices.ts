import { supabase } from "@/auth/supabase"

export default async function addShopServices(
  shopId: string,
  services: { service_name: string; price: number }[]
) {
  const rows = services.map(s => ({
    shop_id: shopId,
    service_name: s.service_name,
    price: s.price,
  }))

  const { error } = await supabase
    .from("shop_services")
    .insert(rows)

  if (error) throw error
}
