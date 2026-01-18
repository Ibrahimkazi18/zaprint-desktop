import { supabase } from "@/auth/supabase"

export default async function updatePrinterStatus(
  printerId: string,
  status: "online" | "offline" | "error"
) {
  const { error } = await supabase
    .from("shop_printers")
    .update({
      status,
      last_heartbeat: new Date().toISOString(),
    })
    .eq("id", printerId)

  if (error) throw error
}
