import { supabase } from "@/auth/supabase"

export default async function updateShopStatus(
  shopId: string,
  status: "open" | "closed" | "error"
) {
  const { error } = await supabase
    .from("shops")
    .update({ status })
    .eq("id", shopId)

  if (error) throw error
}
