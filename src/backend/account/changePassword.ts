import { supabase } from "@/auth/supabase";

export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
}

export async function changePassword(params: ChangePasswordParams): Promise<void> {
  const { currentPassword, newPassword } = params;

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) {
    throw new Error("Current password is incorrect");
  }

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    throw new Error(updateError.message);
  }
}
