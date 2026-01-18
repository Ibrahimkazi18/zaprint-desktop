import { supabase } from "@/auth/supabase"

export default async function createShop(payload: {
  shop_name: string
  phone: string
  location: string
  description?: string
  image_url?: string
  start_time: string
  end_time: string
  non_working_days: string[]
}) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("shops")
    .insert({
      owner_id: user.id,
      shop_name: payload.shop_name,
      phone: payload.phone,
      location: payload.location,
      description: payload.description,
      image_url: payload.image_url,
      start_time: payload.start_time,
      end_time: payload.end_time,
      non_working_days: payload.non_working_days,
      status: "closed",
    })
    .select()
    .single()

  if (error) throw error

  return data
}
