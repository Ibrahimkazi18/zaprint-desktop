-- ============================================
-- ZAPRINT RAZORPAY PAYMENT INTEGRATION
-- ============================================
-- This script adds Razorpay payment support to the Zaprint database.
-- It modifies the shops and orders tables to support:
--   1. Shop payment onboarding (Razorpay account linking)
--   2. Payment tracking on orders (Razorpay order/payment IDs)
--   3. Platform fee tracking
--   4. New 'paid' order status
-- 
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: ADD 'paid' STATUS TO order_status ENUM
-- ============================================
-- Status flow becomes: pending → paid → in_queue → printing → ready → completed
-- 'pending' = created but not yet paid
-- 'paid' = payment completed, ready for shop to process

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'paid' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')
  ) THEN
    ALTER TYPE order_status ADD VALUE 'paid' BEFORE 'in_queue';
  END IF;
END $$;

-- ============================================
-- STEP 2: ADD PAYMENT COLUMNS TO SHOPS TABLE
-- ============================================
-- razorpay_account_id: Linked Razorpay account for the shop
-- is_payment_onboarded: Whether the shop has completed payment setup

ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS razorpay_account_id TEXT,
ADD COLUMN IF NOT EXISTS is_payment_onboarded BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN public.shops.razorpay_account_id IS 'Razorpay linked account ID for the shop owner';
COMMENT ON COLUMN public.shops.is_payment_onboarded IS 'Whether the shop has completed Razorpay payment onboarding';

-- ============================================
-- STEP 3: ADD PAYMENT COLUMNS TO ORDERS TABLE
-- ============================================
-- razorpay_order_id: The Razorpay order ID created for this order
-- razorpay_payment_id: The Razorpay payment ID after successful payment
-- payment_status: Current payment status
-- print_amount: The cost of printing (shop's fee)
-- platform_fee: Zaprint's service fee
-- platform_fee_percentage: The percentage applied

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS print_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_fee_percentage DECIMAL(5,2) DEFAULT 0;

-- Add comments
COMMENT ON COLUMN public.orders.razorpay_order_id IS 'Razorpay order ID for payment tracking';
COMMENT ON COLUMN public.orders.razorpay_payment_id IS 'Razorpay payment ID after successful payment';
COMMENT ON COLUMN public.orders.payment_status IS 'Payment status: pending, paid, failed, refunded';
COMMENT ON COLUMN public.orders.print_amount IS 'The actual print cost (shop revenue)';
COMMENT ON COLUMN public.orders.platform_fee IS 'Zaprint platform service fee amount';
COMMENT ON COLUMN public.orders.platform_fee_percentage IS 'Platform fee percentage applied';

-- ============================================
-- STEP 4: ADD INDEXES FOR PAYMENT QUERIES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order ON public.orders(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shops_payment_onboarded ON public.shops(is_payment_onboarded) WHERE is_payment_onboarded = TRUE;

-- ============================================
-- STEP 5: UPDATE DASHBOARD STATS VIEW
-- ============================================
-- Update the view to only count paid/completed orders in earnings
-- and exclude unpaid orders from active counts

CREATE OR REPLACE VIEW public.shop_dashboard_stats AS
SELECT 
  o.shop_id,
  
  -- Today's stats (only count paid orders)
  COUNT(DISTINCT CASE WHEN DATE(o.created_at) = CURRENT_DATE AND o.payment_status = 'paid' THEN o.id END)::integer as today_orders,
  COALESCE(SUM(CASE WHEN DATE(o.created_at) = CURRENT_DATE AND o.payment_status = 'paid' THEN o.print_amount END), 0) as today_earnings,
  
  -- Yesterday's stats for comparison
  COUNT(DISTINCT CASE WHEN DATE(o.created_at) = CURRENT_DATE - INTERVAL '1 day' AND o.payment_status = 'paid' THEN o.id END)::integer as yesterday_orders,
  COALESCE(SUM(CASE WHEN DATE(o.created_at) = CURRENT_DATE - INTERVAL '1 day' AND o.payment_status = 'paid' THEN o.print_amount END), 0) as yesterday_earnings,
  
  -- This month's stats
  COUNT(DISTINCT CASE WHEN DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', CURRENT_DATE) AND o.payment_status = 'paid' THEN o.id END)::integer as month_orders,
  COALESCE(SUM(CASE WHEN DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', CURRENT_DATE) AND o.payment_status = 'paid' THEN o.print_amount END), 0) as month_earnings,
  
  -- Last month's stats for comparison
  COUNT(DISTINCT CASE WHEN DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND o.payment_status = 'paid' THEN o.id END)::integer as last_month_orders,
  COALESCE(SUM(CASE WHEN DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND o.payment_status = 'paid' THEN o.print_amount END), 0) as last_month_earnings,
  
  -- Status-based counts (only active = paid & being processed)
  COUNT(DISTINCT CASE WHEN o.status::text IN ('paid', 'in_queue', 'printing') THEN o.id END)::integer as active_orders,
  COUNT(DISTINCT CASE WHEN o.status::text = 'ready' THEN o.id END)::integer as pending_orders,
  COUNT(DISTINCT CASE WHEN o.status::text = 'completed' AND DATE(o.updated_at) = CURRENT_DATE THEN o.id END)::integer as completed_today,
  
  -- Customer stats (using user_id as customer identifier)
  COUNT(DISTINCT o.user_id)::integer as total_customers,
  COUNT(DISTINCT CASE WHEN DATE(o.created_at) >= CURRENT_DATE - INTERVAL '7 days' THEN o.user_id END)::integer as active_customers_week

FROM public.orders o
WHERE o.created_at >= CURRENT_DATE - INTERVAL '3 months' -- Only last 3 months for performance
GROUP BY o.shop_id;

-- Grant access to authenticated users
GRANT SELECT ON public.shop_dashboard_stats TO authenticated;

-- ============================================
-- STEP 6: SET EXISTING SHOPS' PAYMENT STATUS
-- ============================================
-- If you want existing shops to be visible while they set up payments,
-- uncomment the line below. Otherwise, they'll need to complete payment setup.
-- 
-- UPDATE public.shops SET is_payment_onboarded = TRUE WHERE is_onboarded = TRUE;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the setup worked correctly

-- Check if 'paid' status exists
-- SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status') ORDER BY enumlabel;

-- Check if new columns exist on shops
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'shops' AND column_name IN ('razorpay_account_id', 'is_payment_onboarded');

-- Check if new columns exist on orders
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders' AND column_name IN ('razorpay_order_id', 'razorpay_payment_id', 'payment_status', 'print_amount', 'platform_fee', 'platform_fee_percentage');

-- Check indexes
-- SELECT indexname FROM pg_indexes WHERE tablename IN ('orders', 'shops') AND indexname LIKE 'idx_%payment%' OR indexname LIKE 'idx_%razorpay%';

-- ============================================
-- COMPLETE!
-- ============================================
-- Your database is now ready for:
-- 1. Shop payment onboarding via Razorpay
-- 2. Order payment tracking with Razorpay
-- 3. Dynamic platform fee tracking
-- 4. Updated dashboard stats (only counts paid orders)
