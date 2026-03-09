import { supabase } from "@/auth/supabase"

/**
 * Changes the current user's password.
 * First verifies the old password by re-authenticating,
 * then updates to the new password.
 */
export default async function changePassword(oldPassword: string, newPassword: string) {
  // 1. Get the current user's email
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user?.email) {
    throw new Error("Unable to verify current user")
  }

  // 2. Verify old password by re-authenticating
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: oldPassword,
  })

  if (signInError) {
    throw new Error("Current password is incorrect")
  }

  // 3. Update to new password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    console.error("Error changing password:", error)
    throw error
  }

  return { success: true }
}
