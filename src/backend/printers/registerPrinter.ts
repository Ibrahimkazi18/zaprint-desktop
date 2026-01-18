import { supabase } from "@/auth/supabase"

export default async function registerPrinter(payload: {
  shop_id: string
  printer_name: string
  printer_type: string
  supported_services: string[]
  supported_sizes: string[]
}) {
  const { data, error } = await supabase
    .from("shop_printers")
    .insert({
      shop_id: payload.shop_id,
      printer_name: payload.printer_name,
      printer_type: payload.printer_type,
      supported_services: payload.supported_services,
      supported_sizes: payload.supported_sizes,
      status: "offline",
    })
    .select()
    .single()

  if (error) throw error
  return data
}
