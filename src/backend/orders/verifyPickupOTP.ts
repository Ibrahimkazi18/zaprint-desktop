import { supabase } from "@/auth/supabase"

export default async function verifyPickupOTP(
  orderId: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  // Fetch the order
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("pickup_otp, status")
    .eq("id", orderId)
    .single()

  if (fetchError) {
    return { success: false, error: "Order not found" }
  }

  if (order.status !== "ready") {
    return { success: false, error: "Order is not ready for pickup" }
  }

  if (order.pickup_otp !== otp) {
    return { success: false, error: "Invalid OTP" }
  }

  // Update order status to completed
  const { error: updateError } = await supabase
    .from("orders")
    .update({ 
      status: "completed",
      updated_at: new Date().toISOString()
    })
    .eq("id", orderId)

  if (updateError) {
    return { success: false, error: "Failed to complete order" }
  }

  return { success: true }
}
