-- ============================================
-- ANALYTICS VIEWS AND FUNCTIONS
-- ============================================
-- Comprehensive analytics for shop performance tracking
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. SHOP ANALYTICS OVERVIEW
-- ============================================
-- Main analytics view with comprehensive metrics

CREATE OR REPLACE VIEW public.shop_analytics_overview AS
WITH date_ranges AS (
  SELECT 
    CURRENT_DATE as today,
    CURRENT_DATE - INTERVAL '1 day' as yesterday,
    CURRENT_DATE - INTERVAL '7 days' as week_ago,
    CURRENT_DATE - INTERVAL '30 days' as month_ago,
    CURRENT_DATE - INTERVAL '90 days' as quarter_ago,
    DATE_TRUNC('week', CURRENT_DATE) as week_start,
    DATE_TRUNC('month', CURRENT_DATE) as month_start,
    DATE_TRUNC('week', CURRENT_DATE - INTERVAL '7 days') as last_week_start,
    DATE_TRUNC('month', CURRENT_DATE - INTERVAL '30 days') as last_month_start
)
SELECT 
  o.shop_id,
  
  -- Current Period Stats
  COUNT(DISTINCT CASE WHEN DATE(o.created_at) >= dr.today THEN o.id END)::integer as today_orders,
  COALESCE(SUM(CASE WHEN DATE(o.created_at) >= dr.today THEN o.total_amount END), 0) as today_revenue,
  
  COUNT(DISTINCT CASE WHEN DATE(o.created_at) >= dr.week_start THEN o.id END)::integer as week_orders,
  COALESCE(SUM(CASE WHEN DATE(o.created_at) >= dr.week_start THEN o.total_amount END), 0) as week_revenue,
  
  COUNT(DISTINCT CASE WHEN DATE(o.created_at) >= dr.month_start THEN o.id END)::integer as month_orders,
  COALESCE(SUM(CASE WHEN DATE(o.created_at) >= dr.month_start THEN o.total_amount END), 0) as month_revenue,
  
  COUNT(DISTINCT CASE WHEN o.created_at >= dr.quarter_ago THEN o.id END)::integer as quarter_orders,
  COALESCE(SUM(CASE WHEN o.created_at >= dr.quarter_ago THEN o.total_amount END), 0) as quarter_revenue,
  
  -- Previous Period Stats (for comparison)
  COUNT(DISTINCT CASE WHEN DATE(o.created_at) = dr.yesterday THEN o.id END)::integer as yesterday_orders,
  COALESCE(SUM(CASE WHEN DATE(o.created_at) = dr.yesterday THEN o.total_amount END), 0) as yesterday_revenue,
  
  COUNT(DISTINCT CASE WHEN o.created_at >= dr.last_week_start AND o.created_at < dr.week_start THEN o.id END)::integer as last_week_orders,
  COALESCE(SUM(CASE WHEN o.created_at >= dr.last_week_start AND o.created_at < dr.week_start THEN o.total_amount END), 0) as last_week_revenue,
  
  COUNT(DISTINCT CASE WHEN o.created_at >= dr.last_month_start AND o.created_at < dr.month_start THEN o.id END)::integer as last_month_orders,
  COALESCE(SUM(CASE WHEN o.created_at >= dr.last_month_start AND o.created_at < dr.month_start THEN o.total_amount END), 0) as last_month_revenue,
  
  -- Customer Metrics
  COUNT(DISTINCT o.user_id)::integer as total_customers,
  COUNT(DISTINCT CASE WHEN o.created_at >= dr.week_ago THEN o.user_id END)::integer as active_customers_week,
  COUNT(DISTINCT CASE WHEN o.created_at >= dr.month_ago THEN o.user_id END)::integer as active_customers_month,
  
  -- Average Order Value
  CASE 
    WHEN COUNT(o.id) > 0 THEN ROUND(AVG(o.total_amount)::numeric, 2)
    ELSE 0
  END as avg_order_value,
  
  -- Completion Rate
  CASE 
    WHEN COUNT(o.id) > 0 THEN 
      ROUND((COUNT(CASE WHEN o.status::text = 'completed' THEN 1 END)::numeric / COUNT(o.id)::numeric) * 100, 1)
    ELSE 0
  END as completion_rate

FROM public.orders o
CROSS JOIN date_ranges dr
WHERE o.created_at >= dr.quarter_ago
GROUP BY o.shop_id;

GRANT SELECT ON public.shop_analytics_overview TO authenticated;

-- ============================================
-- 2. MONTHLY REVENUE TREND
-- ============================================
-- Last 12 months revenue and order count

CREATE OR REPLACE VIEW public.shop_monthly_revenue AS
SELECT 
  o.shop_id,
  DATE_TRUNC('month', o.created_at) as month,
  TO_CHAR(DATE_TRUNC('month', o.created_at), 'Mon YYYY') as month_label,
  COUNT(o.id)::integer as order_count,
  COALESCE(SUM(o.total_amount), 0) as total_revenue,
  ROUND(AVG(o.total_amount)::numeric, 2) as avg_order_value
FROM public.orders o
WHERE o.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
GROUP BY o.shop_id, DATE_TRUNC('month', o.created_at)
ORDER BY month DESC;

GRANT SELECT ON public.shop_monthly_revenue TO authenticated;

-- ============================================
-- 3. DAILY PERFORMANCE BY DAY OF WEEK
-- ============================================
-- Average performance by day of week

CREATE OR REPLACE VIEW public.shop_daily_performance AS
SELECT 
  o.shop_id,
  EXTRACT(DOW FROM o.created_at)::integer as day_of_week,
  CASE EXTRACT(DOW FROM o.created_at)::integer
    WHEN 0 THEN 'Sunday'
    WHEN 1 THEN 'Monday'
    WHEN 2 THEN 'Tuesday'
    WHEN 3 THEN 'Wednesday'
    WHEN 4 THEN 'Thursday'
    WHEN 5 THEN 'Friday'
    WHEN 6 THEN 'Saturday'
  END as day_name,
  COUNT(o.id)::integer as total_orders,
  COALESCE(SUM(o.total_amount), 0) as total_revenue,
  ROUND(AVG(o.total_amount)::numeric, 2) as avg_order_value
FROM public.orders o
WHERE o.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY o.shop_id, EXTRACT(DOW FROM o.created_at)
ORDER BY day_of_week;

GRANT SELECT ON public.shop_daily_performance TO authenticated;

-- ============================================
-- 4. TOP CUSTOMERS
-- ============================================
-- Best customers by revenue and order count

CREATE OR REPLACE VIEW public.shop_top_customers AS
SELECT 
  o.shop_id,
  o.user_id,
  p.name as customer_name,
  p.phone_number as customer_phone,
  COUNT(o.id)::integer as total_orders,
  COALESCE(SUM(o.total_amount), 0) as total_revenue,
  ROUND(AVG(o.total_amount)::numeric, 2) as avg_order_value,
  MAX(o.created_at) as last_order_date,
  MIN(o.created_at) as first_order_date
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.id
WHERE o.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY o.shop_id, o.user_id, p.name, p.phone_number
HAVING COUNT(o.id) > 0
ORDER BY total_revenue DESC
LIMIT 50;

GRANT SELECT ON public.shop_top_customers TO authenticated;

-- ============================================
-- 5. HOURLY PERFORMANCE
-- ============================================
-- Peak hours analysis

CREATE OR REPLACE VIEW public.shop_hourly_performance AS
SELECT 
  o.shop_id,
  EXTRACT(HOUR FROM o.created_at)::integer as hour,
  COUNT(o.id)::integer as order_count,
  COALESCE(SUM(o.total_amount), 0) as total_revenue,
  ROUND(AVG(o.total_amount)::numeric, 2) as avg_order_value
FROM public.orders o
WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY o.shop_id, EXTRACT(HOUR FROM o.created_at)
ORDER BY hour;

GRANT SELECT ON public.shop_hourly_performance TO authenticated;

-- ============================================
-- 6. ORDER STATUS DISTRIBUTION
-- ============================================
-- Current orders by status

CREATE OR REPLACE VIEW public.shop_order_status_distribution AS
SELECT 
  o.shop_id,
  o.status::text as status,
  COUNT(o.id)::integer as order_count,
  COALESCE(SUM(o.total_amount), 0) as total_value,
  ROUND((COUNT(o.id)::numeric / SUM(COUNT(o.id)) OVER (PARTITION BY o.shop_id)) * 100, 1) as percentage
FROM public.orders o
WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY o.shop_id, o.status::text;

GRANT SELECT ON public.shop_order_status_distribution TO authenticated;

-- ============================================
-- 7. GROWTH METRICS
-- ============================================
-- Month-over-month and week-over-week growth

CREATE OR REPLACE VIEW public.shop_growth_metrics AS
WITH current_month AS (
  SELECT 
    shop_id,
    COUNT(id) as orders,
    SUM(total_amount) as revenue
  FROM public.orders
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY shop_id
),
last_month AS (
  SELECT 
    shop_id,
    COUNT(id) as orders,
    SUM(total_amount) as revenue
  FROM public.orders
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    AND created_at < DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY shop_id
),
current_week AS (
  SELECT 
    shop_id,
    COUNT(id) as orders,
    SUM(total_amount) as revenue
  FROM public.orders
  WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)
  GROUP BY shop_id
),
last_week AS (
  SELECT 
    shop_id,
    COUNT(id) as orders,
    SUM(total_amount) as revenue
  FROM public.orders
  WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE - INTERVAL '7 days')
    AND created_at < DATE_TRUNC('week', CURRENT_DATE)
  GROUP BY shop_id
)
SELECT 
  COALESCE(cm.shop_id, lm.shop_id, cw.shop_id, lw.shop_id) as shop_id,
  
  -- Month over Month
  COALESCE(cm.orders, 0)::integer as current_month_orders,
  COALESCE(lm.orders, 0)::integer as last_month_orders,
  CASE 
    WHEN COALESCE(lm.orders, 0) > 0 THEN 
      ROUND(((COALESCE(cm.orders, 0)::numeric - COALESCE(lm.orders, 0)::numeric) / COALESCE(lm.orders, 0)::numeric) * 100, 1)
    ELSE 0
  END as mom_orders_growth,
  
  COALESCE(cm.revenue, 0) as current_month_revenue,
  COALESCE(lm.revenue, 0) as last_month_revenue,
  CASE 
    WHEN COALESCE(lm.revenue, 0) > 0 THEN 
      ROUND(((COALESCE(cm.revenue, 0) - COALESCE(lm.revenue, 0)) / COALESCE(lm.revenue, 0)) * 100, 1)
    ELSE 0
  END as mom_revenue_growth,
  
  -- Week over Week
  COALESCE(cw.orders, 0)::integer as current_week_orders,
  COALESCE(lw.orders, 0)::integer as last_week_orders,
  CASE 
    WHEN COALESCE(lw.orders, 0) > 0 THEN 
      ROUND(((COALESCE(cw.orders, 0)::numeric - COALESCE(lw.orders, 0)::numeric) / COALESCE(lw.orders, 0)::numeric) * 100, 1)
    ELSE 0
  END as wow_orders_growth,
  
  COALESCE(cw.revenue, 0) as current_week_revenue,
  COALESCE(lw.revenue, 0) as last_week_revenue,
  CASE 
    WHEN COALESCE(lw.revenue, 0) > 0 THEN 
      ROUND(((COALESCE(cw.revenue, 0) - COALESCE(lw.revenue, 0)) / COALESCE(lw.revenue, 0)) * 100, 1)
    ELSE 0
  END as wow_revenue_growth

FROM current_month cm
FULL OUTER JOIN last_month lm ON cm.shop_id = lm.shop_id
FULL OUTER JOIN current_week cw ON COALESCE(cm.shop_id, lm.shop_id) = cw.shop_id
FULL OUTER JOIN last_week lw ON COALESCE(cm.shop_id, lm.shop_id, cw.shop_id) = lw.shop_id;

GRANT SELECT ON public.shop_growth_metrics TO authenticated;

-- ============================================
-- 8. PERFORMANCE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_shop_created ON public.orders(shop_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_shop ON public.orders(user_id, shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON public.orders(status, created_at DESC);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON VIEW public.shop_analytics_overview IS 'Comprehensive analytics overview with current and comparison periods';
COMMENT ON VIEW public.shop_monthly_revenue IS 'Monthly revenue trend for last 12 months';
COMMENT ON VIEW public.shop_daily_performance IS 'Average performance by day of week';
COMMENT ON VIEW public.shop_top_customers IS 'Top 50 customers by revenue in last 90 days';
COMMENT ON VIEW public.shop_hourly_performance IS 'Peak hours analysis for last 30 days';
COMMENT ON VIEW public.shop_order_status_distribution IS 'Current order distribution by status';
COMMENT ON VIEW public.shop_growth_metrics IS 'Month-over-month and week-over-week growth metrics';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Test analytics overview
-- SELECT * FROM public.shop_analytics_overview WHERE shop_id = 'your-shop-id';

-- Test monthly revenue
-- SELECT * FROM public.shop_monthly_revenue WHERE shop_id = 'your-shop-id' LIMIT 6;

-- Test daily performance
-- SELECT * FROM public.shop_daily_performance WHERE shop_id = 'your-shop-id';

-- Test top customers
-- SELECT * FROM public.shop_top_customers WHERE shop_id = 'your-shop-id' LIMIT 10;

-- Test growth metrics
-- SELECT * FROM public.shop_growth_metrics WHERE shop_id = 'your-shop-id';
