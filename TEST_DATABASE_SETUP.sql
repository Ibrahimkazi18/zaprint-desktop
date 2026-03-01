-- ============================================
-- TEST QUERIES FOR DATABASE SETUP
-- ============================================
-- Run these queries after executing DATABASE_SCHEMA.sql
-- to verify everything is working correctly

-- ============================================
-- 1. CHECK ORDER STATUS ENUM VALUES
-- ============================================
-- Should show: completed, in_queue, pending, printing, ready
SELECT enumlabel as status_value
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')
ORDER BY enumlabel;

-- ============================================
-- 2. CHECK OTP COLUMNS EXIST
-- ============================================
-- Should show: pickup_otp (character varying), otp_generated_at (timestamp with time zone)
SELECT 
  column_name, 
  data_type,
  character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name = 'orders' 
  AND column_name IN ('pickup_otp', 'otp_generated_at');

-- ============================================
-- 3. CHECK DASHBOARD VIEW EXISTS
-- ============================================
-- Should return one row with statistics (may be all zeros if no orders yet)
SELECT * FROM public.shop_dashboard_stats LIMIT 1;

-- ============================================
-- 4. CHECK INDEXES WERE CREATED
-- ============================================
-- Should show 4 new indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'orders' 
  AND indexname LIKE 'idx_orders%'
ORDER BY indexname;

-- ============================================
-- 5. CHECK TRIGGER EXISTS
-- ============================================
-- Should show trigger_auto_generate_otp
SELECT 
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'orders'
  AND trigger_name = 'trigger_auto_generate_otp';

-- ============================================
-- 6. TEST OTP GENERATION (OPTIONAL)
-- ============================================
-- Only run this if you have test data
-- Replace 'YOUR_ORDER_ID' with an actual order ID from your database

-- First, check current order status
-- SELECT id, status, pickup_otp FROM public.orders WHERE id = 'YOUR_ORDER_ID';

-- Update order to 'ready' to trigger OTP generation
-- UPDATE public.orders SET status = 'ready' WHERE id = 'YOUR_ORDER_ID';

-- Check if OTP was generated
-- SELECT id, status, pickup_otp, otp_generated_at FROM public.orders WHERE id = 'YOUR_ORDER_ID';

-- ============================================
-- 7. TEST DASHBOARD STATS WITH YOUR SHOP
-- ============================================
-- Replace 'YOUR_SHOP_ID' with your actual shop ID

-- SELECT * FROM public.shop_dashboard_stats WHERE shop_id = 'YOUR_SHOP_ID';

-- ============================================
-- 8. CHECK PENDING ORDERS QUERY
-- ============================================
-- This is what the app will use to fetch pending orders
-- Replace 'YOUR_SHOP_ID' with your actual shop ID

/*
SELECT 
  o.id,
  o.user_id,
  o.total_amount,
  o.pickup_otp,
  o.otp_generated_at,
  o.created_at,
  o.updated_at,
  p.name as customer_name,
  p.phone_number as customer_phone
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.id
WHERE o.shop_id = 'YOUR_SHOP_ID'
  AND o.status = 'ready'
ORDER BY o.updated_at DESC;
*/

-- ============================================
-- EXPECTED RESULTS SUMMARY
-- ============================================
-- Query 1: Should show 5 status values (completed, in_queue, pending, printing, ready)
-- Query 2: Should show 2 columns (pickup_otp, otp_generated_at)
-- Query 3: Should return data (may be zeros if no orders)
-- Query 4: Should show 4 indexes
-- Query 5: Should show 1 trigger
-- Query 6-8: Test with your actual data

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- If view doesn't exist, check for errors:
-- SELECT * FROM pg_views WHERE viewname = 'shop_dashboard_stats';

-- If trigger doesn't work, check function exists:
-- SELECT proname FROM pg_proc WHERE proname = 'auto_generate_otp';

-- Check for any errors in recent logs:
-- SELECT * FROM pg_stat_activity WHERE state = 'active';
