import { supabase } from "@/auth/supabase"

export default async function sendPrinterHeartbeat(printerId: string) {
  const { error } = await supabase
    .from("shop_printers")
    .update({
      last_heartbeat: new Date().toISOString(),
      status: "online",
    })
    .eq("id", printerId)

  if (error) throw error
}
