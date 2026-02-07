import { supabase } from "@/auth/supabase";

export default async function deleteResource(resourceId: string) {
  const { error } = await supabase
    .from("shop_resources")
    .delete()
    .eq("id", resourceId);

  if (error) throw error;
}
