import { supabase } from "@/auth/supabase";

export default async function addResource(
  shopId: string,
  resource_name: string
) {
  const { error } = await supabase.from("shop_resources").insert({
    shop_id: shopId,
    resource_name,
  });

  if (error) throw error;
}
