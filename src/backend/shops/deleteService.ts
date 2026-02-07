import { supabase } from "@/auth/supabase";

export default async function deleteService(serviceId: string) {
  const { error } = await supabase
    .from("shop_services")
    .delete()
    .eq("id", serviceId);

  if (error) throw error;
}
