/**
 * Razorpay fee payment integration for the desktop app.
 * This module handles opening the Razorpay checkout popup,
 * communicating with the Electron main process for order creation
 * and payment verification, and updating Supabase after success.
 */
import { supabase } from "@/auth/supabase";

interface RazorpayFeePaymentOptions {
  shopId: string;
  shopName: string;
  amount: number; // in rupees
  unpaidCount: number;
  userEmail?: string;
  userName?: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

/**
 * Initiate a Razorpay payment for platform fees.
 * 
 * Flow:
 * 1. Create Razorpay order via Electron main process (keeps secret key secure)
 * 2. Open Razorpay checkout popup in the renderer
 * 3. On success, verify signature via Electron main process
 * 4. Record payment in Supabase and mark ledger entries as paid
 */
export async function initiateRazorpayFeePayment(options: RazorpayFeePaymentOptions): Promise<void> {
  const { shopId, shopName, amount, unpaidCount, userEmail, userName, onSuccess, onError } = options;

  // Step 1: Check if Razorpay SDK is loaded
  if (!window.Razorpay) {
    onError("Razorpay SDK not loaded. Please check your internet connection and restart the app.");
    return;
  }

  // Step 2: Check if Razorpay IPC API is available
  if (!window.razorpayAPI) {
    onError("Payment system not available. Please restart the app.");
    return;
  }

  try {
    // Step 3: Create Razorpay order via main process
    const orderResult = await window.razorpayAPI.createFeeOrder({
      amount,
      shopId,
      shopName,
      unpaidCount,
    });

    if (!orderResult.success || !orderResult.orderId || !orderResult.keyId) {
      onError(orderResult.error || "Failed to create payment order");
      return;
    }

    // Step 4: Open Razorpay checkout popup
    const razorpayOptions = {
      key: orderResult.keyId,
      amount: orderResult.amount!,
      currency: orderResult.currency!,
      name: "Zaprint",
      description: `Platform Fee Payment (${unpaidCount} order${unpaidCount !== 1 ? "s" : ""})`,
      order_id: orderResult.orderId,
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        try {
          // Step 5: Verify payment signature via main process
          const verifyResult = await window.razorpayAPI.verifyFeePayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (!verifyResult.success || !verifyResult.verified) {
            onError("Payment verification failed. Please contact support.");
            return;
          }

          // Step 6: Record payment in Supabase
          await recordFeePaymentInSupabase({
            shopId,
            amount,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
          });

          onSuccess();
        } catch (error: any) {
          console.error("Error processing payment:", error);
          onError(error.message || "Payment processing failed");
        }
      },
      prefill: {
        name: userName || shopName,
        email: userEmail || "",
      },
      theme: {
        color: "#2563eb", // Primary blue color matching the app
      },
      modal: {
        ondismiss: () => {
          console.log("[Razorpay] Checkout dismissed by user");
        },
        escape: true,
        confirm_close: true,
      },
    };

    const razorpay = new window.Razorpay!(razorpayOptions);
    razorpay.open();
  } catch (error: any) {
    console.error("Error initiating Razorpay payment:", error);
    onError(error.message || "Failed to initiate payment");
  }
}

/**
 * Record the fee payment in Supabase after successful Razorpay verification.
 * This creates a payment record and marks all unpaid ledger entries as paid.
 */
async function recordFeePaymentInSupabase(params: {
  shopId: string;
  amount: number;
  razorpayPaymentId: string;
  razorpayOrderId: string;
}): Promise<void> {
  const { shopId, amount, razorpayPaymentId, razorpayOrderId } = params;

  // 1. Get all unpaid ledger entry IDs for this shop
  const { data: unpaidEntries, error: fetchError } = await supabase
    .from("platform_fee_ledger")
    .select("id")
    .eq("shop_id", shopId)
    .eq("status", "unpaid");

  if (fetchError) {
    console.error("Error fetching unpaid entries:", fetchError);
    throw fetchError;
  }

  const unpaidIds = (unpaidEntries || []).map((e) => e.id);

  // 2. Create the fee payment record (auto-verified since it's Razorpay)
  const { data: payment, error: paymentError } = await supabase
    .from("shop_fee_payments")
    .insert({
      shop_id: shopId,
      amount,
      payment_method: "razorpay",
      payment_reference: razorpayPaymentId,
      notes: `Razorpay Order: ${razorpayOrderId}`,
      fees_covered: unpaidIds,
      status: "verified", // Auto-verified because Razorpay signature was verified
      verified_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (paymentError) {
    console.error("Error creating fee payment record:", paymentError);
    throw paymentError;
  }

  // 3. Mark all unpaid ledger entries as paid
  if (unpaidIds.length > 0 && payment) {
    const { error: updateError } = await supabase
      .from("platform_fee_ledger")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        payment_id: payment.id,
      })
      .in("id", unpaidIds);

    if (updateError) {
      console.error("Error marking ledger entries as paid:", updateError);
      // Don't throw — payment was recorded, ledger update can be reconciled
    }
  }

  // 4. If shop was blocked due to fees, unblock it
  const { error: unblockError } = await supabase
    .from("shops")
    .update({
      is_blocked: false,
      blocked_at: null,
      blocked_reason: null,
    })
    .eq("id", shopId)
    .eq("is_blocked", true);

  if (unblockError) {
    console.error("Error unblocking shop:", unblockError);
    // Don't throw — payment was successful, unblock can be done manually
  }
}
