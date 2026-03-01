# Analytics Setup Guide

## Overview
Comprehensive analytics system with 7 database views providing deep insights into shop performance.

## Quick Setup (5 minutes)

### Step 1: Run Analytics Schema
1. Open Supabase SQL Editor
2. Copy contents of `DATABASE_ANALYTICS_SCHEMA.sql`
3. Execute the SQL
4. Wait for "Success" message

### Step 2: Verify Views Created
Run this query to check all views exist:

```sql
SELECT viewname 
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname LIKE 'shop_%'
ORDER BY viewname;
```

Should return 7 views:
- shop_analytics_overview
- shop_daily_performance
- shop_growth_metrics
- shop_hourly_performance
- shop_monthly_revenue
- shop_order_status_distribution
- shop_top_customers

### Step 3: Test with Your Shop
```sql
-- Replace 'your-shop-id' with actual shop ID
SELECT * FROM shop_analytics_overview WHERE shop_id = 'your-shop-id';
```

## What You Get

### 1. Analytics Overview
**View:** `shop_analytics_overview`

Provides:
- Today, week, month, quarter stats
- Previous period comparisons
- Customer metrics
- Average order value
- Completion rate

### 2. Monthly Revenue Trend
**View:** `shop_monthly_revenue`

Shows:
- Last 12 months revenue
- Order count per month
- Average order value
- Month-over-month trends

### 3. Daily Performance
**View:** `shop_daily_performance`

Analyzes:
- Performance by day of week
- Average orders per day
- Revenue patterns
- Best performing days

### 4. Top Customers
**View:** `shop_top_customers`

Identifies:
- Top 50 customers by revenue
- Total orders per customer
- Average order value
- Last order date
- Customer loyalty metrics

### 5. Hourly Performance
**View:** `shop_hourly_performance`

Reveals:
- Peak hours (busiest times)
- Order distribution by hour
- Revenue by time of day
- Optimal staffing times

### 6. Order Status Distribution
**View:** `shop_order_status_distribution`

Tracks:
- Orders by status
- Percentage distribution
- Total value per status
- Workflow bottlenecks

### 7. Growth Metrics
**View:** `shop_growth_metrics`

Calculates:
- Month-over-month growth
- Week-over-week growth
- Revenue growth rates
- Order volume trends

## Analytics Page Features

### Overview Cards
- Total Revenue (quarter)
- Total Jobs (quarter)
- Total Customers
- Average Job Value
- Completion Rate

### Revenue Analysis Tab
- Monthly revenue trend chart
- This month vs last month
- This week vs last week
- Today vs yesterday
- Visual progress bars

### Customer Insights Tab
- Top 10 customers table
- Customer name and contact
- Total orders and revenue
- Average per order
- Last order date

### Daily Trends Tab
- Performance by day of week
- Visual comparison bars
- Revenue and order count
- Identify best days

### Peak Hours Tab
- Hourly performance chart
- Peak hour highlighting
- Order distribution
- Revenue by hour

## Period Filters

The analytics page supports 3 time periods:
- **7 Days**: Last week performance
- **30 Days**: Last month (default)
- **90 Days**: Last quarter

Data automatically adjusts based on selection.

## Performance Optimizations

### Indexes Created
- `idx_orders_created_at` - Fast date queries
- `idx_orders_shop_created` - Shop-specific queries
- `idx_orders_user_shop` - Customer analysis
- `idx_orders_status_created` - Status filtering

### View Optimization
- Views use efficient aggregations
- Limited to relevant time periods
- Indexed columns for fast joins
- Optimized for read performance

## Data Refresh

### Automatic Updates
All views update automatically when:
- New orders are created
- Order status changes
- Orders are completed
- Customer data updates

### Manual Refresh
Not needed! Views are always current.

## Troubleshooting

### No Data Showing

**Problem:** Analytics page shows zeros or "No data available"

**Solutions:**
1. Check if orders exist:
```sql
SELECT COUNT(*) FROM orders WHERE shop_id = 'your-shop-id';
```

2. Verify views return data:
```sql
SELECT * FROM shop_analytics_overview WHERE shop_id = 'your-shop-id';
```

3. Check date range:
```sql
SELECT MIN(created_at), MAX(created_at) 
FROM orders 
WHERE shop_id = 'your-shop-id';
```

### View Not Found

**Problem:** "relation does not exist" error

**Solution:** Re-run `DATABASE_ANALYTICS_SCHEMA.sql`

### Slow Performance

**Problem:** Analytics page loads slowly

**Solutions:**
1. Check if indexes exist:
```sql
SELECT indexname FROM pg_indexes 
WHERE tablename = 'orders' 
AND indexname LIKE 'idx_orders%';
```

2. Analyze table statistics:
```sql
ANALYZE orders;
```

3. Check query performance:
```sql
EXPLAIN ANALYZE 
SELECT * FROM shop_analytics_overview 
WHERE shop_id = 'your-shop-id';
```

## Export Functionality

The "Export Report" button is ready for implementation. Suggested formats:
- PDF report with charts
- Excel spreadsheet
- CSV data export
- Email report

## Best Practices

### Regular Monitoring
- Check analytics daily
- Track growth trends
- Identify peak hours
- Monitor top customers

### Data-Driven Decisions
- Staff during peak hours
- Focus on top customers
- Optimize slow days
- Track completion rates

### Performance Tracking
- Set monthly targets
- Compare periods
- Monitor growth rates
- Celebrate milestones

## Advanced Queries

### Custom Date Range
```sql
SELECT 
  COUNT(*) as orders,
  SUM(total_amount) as revenue
FROM orders
WHERE shop_id = 'your-shop-id'
  AND created_at >= '2024-01-01'
  AND created_at < '2024-02-01';
```

### Customer Retention
```sql
SELECT 
  user_id,
  COUNT(*) as order_count,
  MIN(created_at) as first_order,
  MAX(created_at) as last_order,
  MAX(created_at) - MIN(created_at) as customer_lifetime
FROM orders
WHERE shop_id = 'your-shop-id'
GROUP BY user_id
HAVING COUNT(*) > 1
ORDER BY order_count DESC;
```

### Revenue by Hour and Day
```sql
SELECT 
  EXTRACT(DOW FROM created_at) as day_of_week,
  EXTRACT(HOUR FROM created_at) as hour,
  COUNT(*) as orders,
  SUM(total_amount) as revenue
FROM orders
WHERE shop_id = 'your-shop-id'
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY day_of_week, hour
ORDER BY day_of_week, hour;
```

## Future Enhancements

### Planned Features
- [ ] Chart visualizations (line, bar, pie)
- [ ] Predictive analytics
- [ ] Customer segmentation
- [ ] Revenue forecasting
- [ ] Automated reports
- [ ] Email notifications
- [ ] Goal tracking
- [ ] Comparison with industry benchmarks

### Integration Ideas
- Google Analytics
- Payment gateway data
- Inventory tracking
- Customer feedback
- Marketing campaigns

## Support

### Quick Checks
1. Views exist: `\dv shop_*`
2. Data present: `SELECT * FROM shop_analytics_overview LIMIT 1;`
3. Indexes active: `\di idx_orders*`
4. No errors: Check Supabase logs

### Common Issues
- **Zeros everywhere**: No orders in database
- **View not found**: Run schema SQL
- **Slow queries**: Check indexes
- **Wrong data**: Verify shop_id

## Success Metrics

After setup, you should see:
- ✅ 7 views created
- ✅ 4 indexes active
- ✅ Analytics page loads
- ✅ Real data displayed
- ✅ Period filters work
- ✅ All tabs functional

## Conclusion

Your analytics system is now ready to provide deep insights into your shop's performance. Use the data to make informed decisions and grow your business!
