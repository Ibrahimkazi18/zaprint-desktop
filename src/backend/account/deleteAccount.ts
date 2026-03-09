import { supabase } from "@/auth/supabase"

/**
 * Deletes the entire account including:
 * - Shop services
 * - Shop resources
 * - Shop printers
 * - Shop record
 * - User profile
 * - Auth user (sign out)
 * 
 * Note: Supabase auth.admin.deleteUser requires service_role key.
 * Instead, we delete all user data and sign them out.
 * The auth record can be cleaned up via a database trigger or admin panel.
 */
export default async function deleteAccount(shopId: string, userId: string) {
  // 1. Delete all shop services
  const { error: servicesError } = await supabase
    .from("shop_services")
    .delete()
    .eq("shop_id", shopId)

  if (servicesError) {
    console.error("Error deleting shop services:", servicesError)
    throw new Error("Failed to delete shop services")
  }

  // 2. Delete all shop resources
  const { error: resourcesError } = await supabase
    .from("shop_resources")
    .delete()
    .eq("shop_id", shopId)

  if (resourcesError) {
    console.error("Error deleting shop resources:", resourcesError)
    throw new Error("Failed to delete shop resources")
  }

  // 3. Delete all printers
  const { error: printersError } = await supabase
    .from("printers")
    .delete()
    .eq("shop_id", shopId)

  if (printersError) {
    console.error("Error deleting printers:", printersError)
    throw new Error("Failed to delete printers")
  }

  // 4. Delete the shop itself
  const { error: shopError } = await supabase
    .from("shops")
    .delete()
    .eq("id", shopId)

  if (shopError) {
    console.error("Error deleting shop:", shopError)
    throw new Error("Failed to delete shop")
  }

  // 5. Delete the user profile
  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId)

  if (profileError) {
    console.error("Error deleting profile:", profileError)
    throw new Error("Failed to delete profile")
  }

  // 6. Sign out the user
  await supabase.auth.signOut()

  return { success: true }
}
