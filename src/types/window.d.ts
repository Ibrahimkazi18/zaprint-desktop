// src/types/window.d.ts
import { PrinterAPI } from '../../electron/preload/printerPreload';

export {};

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    confirm_close?: boolean;
  };
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

interface CreateFeeOrderResult {
  success: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  error?: string;
}

interface VerifyFeePaymentResult {
  success: boolean;
  verified?: boolean;
  error?: string;
}

declare global {
  interface Window {
    printerAPI: PrinterAPI;
    auth: {
      saveSession: (session: any) => Promise<void>
      getSession: () => Promise<any | null>
      clearSession: () => Promise<void>
    };
    razorpayAPI: {
      createFeeOrder: (params: {
        amount: number;
        shopId: string;
        shopName: string;
        unpaidCount: number;
      }) => Promise<CreateFeeOrderResult>;
      verifyFeePayment: (params: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => Promise<VerifyFeePaymentResult>;
      getKeyId: () => Promise<string | null>;
    };
    Razorpay?: RazorpayConstructor;
  }
}
