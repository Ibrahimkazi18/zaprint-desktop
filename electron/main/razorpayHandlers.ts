/**
 * Razorpay IPC handlers for the Electron main process.
 * Handles order creation and payment verification using the secret key,
 * keeping it secure in the main process only.
 */
const { ipcMain } = require('electron');
const crypto = require('crypto');

// Read Razorpay keys from environment variables (Vite replaces these at build/dev time)
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = import.meta.env.VITE_RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET || '';

interface CreateFeeOrderParams {
  amount: number; // Amount in rupees
  shopId: string;
  shopName: string;
  unpaidCount: number;
}

interface VerifyFeePaymentParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export function setupRazorpayHandlers() {
  console.log('[Razorpay] Setting up handlers...');
  console.log('[Razorpay] Key ID present:', !!RAZORPAY_KEY_ID);
  console.log('[Razorpay] Key Secret present:', !!RAZORPAY_KEY_SECRET);

  /**
   * Create a Razorpay order for fee payment.
   * Uses Razorpay's REST API directly (no npm package needed).
   */
  ipcMain.handle('razorpay:create-fee-order', async (_: any, params: CreateFeeOrderParams) => {
    try {
      if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay credentials not configured');
      }

      const amountInPaise = Math.round(params.amount * 100);

      // Use Razorpay REST API to create an order
      const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
      
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `fee_${params.shopId.slice(0, 8)}_${Date.now()}`,
          notes: {
            type: 'platform_fee_payment',
            shop_id: params.shopId,
            shop_name: params.shopName,
            unpaid_count: params.unpaidCount.toString(),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Razorpay] Order creation failed:', errorData);
        throw new Error(errorData?.error?.description || 'Failed to create Razorpay order');
      }

      const order = await response.json();
      console.log('[Razorpay] Order created:', order.id);

      return {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: RAZORPAY_KEY_ID,
      };
    } catch (error: any) {
      console.error('[Razorpay] Error creating order:', error);
      return {
        success: false,
        error: error.message || 'Failed to create payment order',
      };
    }
  });

  /**
   * Verify a Razorpay payment signature.
   * This ensures the payment was genuinely processed by Razorpay.
   */
  ipcMain.handle('razorpay:verify-fee-payment', async (_: any, params: VerifyFeePaymentParams) => {
    try {
      if (!RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay secret key not configured');
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params;

      // Generate expected signature
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      const isValid = expectedSignature === razorpay_signature;
      console.log('[Razorpay] Signature verification:', isValid ? 'VALID' : 'INVALID');

      return {
        success: true,
        verified: isValid,
      };
    } catch (error: any) {
      console.error('[Razorpay] Error verifying payment:', error);
      return {
        success: false,
        error: error.message || 'Payment verification failed',
      };
    }
  });

  /**
   * Get the Razorpay key ID (public key, safe to expose to renderer).
   */
  ipcMain.handle('razorpay:get-key-id', async () => {
    return RAZORPAY_KEY_ID || null;
  });

  console.log('[Razorpay] Handlers registered successfully');
}

export function cleanupRazorpayHandlers() {
  ipcMain.removeHandler('razorpay:create-fee-order');
  ipcMain.removeHandler('razorpay:verify-fee-payment');
  ipcMain.removeHandler('razorpay:get-key-id');
  console.log('[Razorpay] Handlers cleaned up');
}
