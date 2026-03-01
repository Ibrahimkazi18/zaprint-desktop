import { supabase } from "@/auth/supabase"

export default async function updatePrinter(
  printerId: string,
  payload: {
    printer_name?: string
    printer_type?: string
    supported_services?: string[]
    supported_sizes?: string[]
  }
) {
  const { data, error } = await supabase
    .from("shop_printers")
    .update(payload)
    .eq("id", printerId)
    .select()
    .single()

  if (error) throw error
  return data
}
