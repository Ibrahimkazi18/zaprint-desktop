import { supabase } from "@/auth/supabase";

export default async function addNewService(
  shopId: string,
  service_name: string,
  price: number
) {
  const { error } = await supabase.from("shop_services").insert({
    shop_id: shopId,
    service_name,
    price,
  });

  if (error) throw error;
}
