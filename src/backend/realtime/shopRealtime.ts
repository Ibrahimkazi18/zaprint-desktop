import { supabase } from "@/auth/supabase"

export default function subscribeToShopPrinters(
  shopId: string,
  onChange: () => void
) {
  return supabase
    .channel(`shop-printers-${shopId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "shop_printers",
        filter: `shop_id=eq.${shopId}`,
      },
      payload => {
        console.log("📡 REALTIME EVENT:", payload)
        onChange()
      }
    )
    .subscribe()
}
