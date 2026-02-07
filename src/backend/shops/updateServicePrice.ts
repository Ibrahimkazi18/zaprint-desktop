import { supabase } from "@/auth/supabase";

export default async function updateServicePrice(
  serviceId: string,
  price: number
) {
  const { error } = await supabase
    .from("shop_services")
    .update({ price })
    .eq("id", serviceId);

  if (error) throw error;
}
