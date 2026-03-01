-- ============================================
-- ZAPRINT DASHBOARD SCHEMA UPDATES
-- ============================================
-- This script adds dynamic dashboard functionality and OTP-based order pickup
-- Compatible with existing Zaprint database schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: ADD NEW ORDER STATUS VALUES
-- ============================================
-- Check current order_status enum values and add missing ones
-- Status flow: pending -> in_queue -> printing -> ready -> completed

DO $$ 
BEGIN
  -- Add 'in_queue' status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'in_queue' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')
  ) THEN
    ALTER TYPE order_status ADD VALUE 'in_queue';
  END IF;

  -- Add 'printing' status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'printing' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')
  ) THEN
    ALTER TYPE order_status ADD VALUE 'printing';
  END IF;

  -- Add 'ready' status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'ready' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')
  ) THEN
    ALTER TYPE order_status ADD VALUE 'ready';
  END IF;

  -- Add 'completed' status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'completed' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')
  ) THEN
    ALTER TYPE order_status ADD VALUE 'completed';
  END IF;
END $$;

-- ============================================
-- STEP 2: ADD OTP COLUMNS TO ORDERS TABLE
-- ============================================
-- For order verification when customer picks up

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS pickup_otp VARCHAR(6),
ADD COLUMN IF NOT EXISTS otp_generated_at TIMESTAMPTZ;

-- ============================================
-- STEP 3: CREATE OTP GENERATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION generate_pickup_otp()
RETURNS VARCHAR(6) AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 4: CREATE AUTO-GENERATE OTP TRIGGER
-- ============================================
-- Automatically generates OTP when order status becomes 'ready'

CREATE OR REPLACE FUNCTION auto_generate_otp()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate OTP when status changes TO 'ready'
  IF NEW.status::text = 'ready' AND (OLD.status IS NULL OR OLD.status::text != 'ready') THEN
    NEW.pickup_otp := generate_pickup_otp();
    NEW.otp_generated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_generate_otp ON public.orders;
CREATE TRIGGER trigger_auto_generate_otp
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_otp();

-- ============================================
-- STEP 5: CREATE DASHBOARD STATISTICS VIEW
-- ============================================
-- Aggregates real-time statistics for shop dashboard

CREATE OR REPLACE VIEW public.shop_dashboard_stats AS
SELECT 
  o.shop_id,
  
  -- Today's stats
  COUNT(DISTINCT CASE WHEN DATE(o.created_at) = CURRENT_DATE THEN o.id END)::integer as today_orders,
  COALESCE(SUM(CASE WHEN DATE(o.created_at) = CURRENT_DATE THEN o.total_amount END), 0) as today_earnings,
  
  -- Yesterday's stats for comparison
  COUNT(DISTINCT CASE WHEN DATE(o.created_at) = CURRENT_DATE - INTERVAL '1 day' THEN o.id END)::integer as yesterday_orders,
  COALESCE(SUM(CASE WHEN DATE(o.created_at) = CURRENT_DATE - INTERVAL '1 day' THEN o.total_amount END), 0) as yesterday_earnings,
  
  -- This month's stats
  COUNT(DISTINCT CASE WHEN DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', CURRENT_DATE) THEN o.id END)::integer as month_orders,
  COALESCE(SUM(CASE WHEN DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', CURRENT_DATE) THEN o.total_amount END), 0) as month_earnings,
  
  -- Last month's stats for comparison
  COUNT(DISTINCT CASE WHEN DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN o.id END)::integer as last_month_orders,
  COALESCE(SUM(CASE WHEN DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN o.total_amount END), 0) as last_month_earnings,
  
  -- Status-based counts (cast enum to text for comparison)
  COUNT(DISTINCT CASE WHEN o.status::text IN ('pending', 'in_queue', 'printing') THEN o.id END)::integer as active_orders,
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
-- STEP 6: CREATE PERFORMANCE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_orders_shop_status ON public.orders(shop_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_shop_created ON public.orders(shop_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_pickup_otp ON public.orders(pickup_otp) WHERE pickup_otp IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON public.orders(user_id, created_at DESC);

-- ============================================
-- STEP 7: ADD HELPFUL COMMENTS
-- ============================================

COMMENT ON VIEW public.shop_dashboard_stats IS 'Aggregated statistics for shop dashboard - updates automatically';
COMMENT ON COLUMN public.orders.pickup_otp IS '6-digit OTP for customer to verify order pickup';
COMMENT ON COLUMN public.orders.otp_generated_at IS 'Timestamp when OTP was generated';

-- ============================================
-- STEP 8: VERIFY FOREIGN KEY RELATIONSHIPS
-- ============================================
-- Ensure the foreign key from orders.user_id to profiles.id exists
-- This is needed for joining customer information

DO $$
BEGIN
  -- Check if foreign key exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_user_id_profiles_fkey'
    AND table_name = 'orders'
  ) THEN
    -- Note: This assumes profiles.id references auth.users(id)
    -- The foreign key should already exist from your schema
    RAISE NOTICE 'Foreign key orders.user_id -> profiles.id should exist from your original schema';
  END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the setup worked correctly

-- Check if new status values exist
-- SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status') ORDER BY enumlabel;

-- Check if OTP columns exist
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders' AND column_name IN ('pickup_otp', 'otp_generated_at');

-- Check if view was created
-- SELECT * FROM public.shop_dashboard_stats LIMIT 1;

-- Check if indexes were created
-- SELECT indexname FROM pg_indexes WHERE tablename = 'orders' AND indexname LIKE 'idx_orders%';

-- ============================================
-- COMPLETE!
-- ============================================
-- Your database is now ready for:
-- 1. Dynamic dashboard with real-time statistics
-- 2. OTP-based order pickup verification
-- 3. Optimized queries for better performance
