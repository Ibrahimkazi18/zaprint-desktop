import { supabase } from "@/auth/supabase"

interface UpdateShopPayload {
  shop_id: string;
  shop_name: string;
  phone: string;
  location: string;
  description?: string;
  image_url?: string | null;
  start_time: string;
  end_time: string;
}

export default async function updateShop(payload: UpdateShopPayload) {
  const { data, error } = await supabase
    .from("shops")
    .update({
      shop_name: payload.shop_name,
      phone: payload.phone,
      location: payload.location,
      description: payload.description,
      image_url: payload.image_url,
      start_time: payload.start_time,
      end_time: payload.end_time,
    })
    .eq("id", payload.shop_id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
