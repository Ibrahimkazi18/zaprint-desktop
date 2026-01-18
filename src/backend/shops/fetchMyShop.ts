import { supabase } from "@/auth/supabase"

export default async function fetchMyShop() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .eq("owner_id", user.id)
    .single()

  if (error) throw error
  return data
}
