import { supabase } from "@/auth/supabase"

export default async function deletePrinter(printerId: string) {
  const { error } = await supabase
    .from("shop_printers")
    .delete()
    .eq("id", printerId)

  if (error) throw error
}
