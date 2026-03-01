# Database Setup Instructions

## Overview
This document provides instructions for setting up the database schema to support the dynamic dashboard and pending orders functionality.

## Prerequisites
- Access to your Supabase project dashboard
- SQL Editor access in Supabase

## Setup Steps

### 1. Run the SQL Schema

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `DATABASE_SCHEMA.sql`
4. Paste and execute the SQL

### 2. What Gets Created

#### A. Dashboard Statistics View (`shop_dashboard_stats`)
A materialized view that aggregates key metrics:
- Today's orders and earnings
- Yesterday's orders and earnings (for comparison)
- Monthly orders and earnings
- Last month's orders and earnings (for comparison)
- Active orders count (pending, in_queue, printing)
- Pending orders count (ready for pickup)
- Completed orders today
- Total customers
- Active customers this week

#### B. Order Pickup System
- `pickup_otp` column: 6-digit OTP for order verification
- `otp_generated_at` column: Timestamp when OTP was generated
- Auto-generation trigger: OTP is automatically created when order status becomes 'ready'

#### C. Performance Indexes
- Index on `(shop_id, status)` for fast filtering
- Index on `(shop_id, created_at)` for date-based queries
- Index on `pickup_otp` for quick OTP lookups

### 3. Order Status Flow

The system now supports the following order statuses:

```
pending → in_queue → printing → ready → completed
```

- **pending**: Order received, not yet processed
- **in_queue**: Order added to print queue
- **printing**: Currently being printed
- **ready**: Print completed, waiting for customer pickup (OTP generated)
- **completed**: Customer picked up order (OTP verified)

### 4. Verify Installation

Run this query to verify the view was created:

```sql
SELECT * FROM shop_dashboard_stats LIMIT 1;
```

Run this query to verify the OTP columns exist:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('pickup_otp', 'otp_generated_at');
```

### 5. Testing the OTP System

To test the OTP generation:

```sql
-- Update an order to 'ready' status
UPDATE orders 
SET status = 'ready' 
WHERE id = 'your-order-id';

-- Check if OTP was generated
SELECT id, status, pickup_otp, otp_generated_at 
FROM orders 
WHERE id = 'your-order-id';
```

## Features Enabled

### Dashboard
- Real-time statistics from database
- Comparison with previous periods
- Dynamic earnings and order counts
- Active customer tracking

### Pending Orders Page
- List of orders ready for pickup
- OTP verification system
- Customer information display
- One-click order completion

### Security
- OTPs are 6-digit random numbers
- OTPs are regenerated if order status changes back to 'ready'
- Only orders with status 'ready' can be completed via OTP

## Troubleshooting

### View Not Found Error
If you get "relation shop_dashboard_stats does not exist":
1. Ensure you ran the SQL in the correct database
2. Check if your user has SELECT permissions
3. Try refreshing the schema cache

### OTP Not Generating
If OTPs aren't being generated:
1. Check if the trigger was created: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_auto_generate_otp';`
2. Verify the function exists: `SELECT * FROM pg_proc WHERE proname = 'auto_generate_otp';`
3. Ensure order status is changing TO 'ready' (not already 'ready')

### Performance Issues
If queries are slow:
1. Verify indexes were created: `SELECT * FROM pg_indexes WHERE tablename = 'orders';`
2. Consider adding more indexes based on your query patterns
3. The view only looks at last 3 months of data for performance

## Maintenance

### Refreshing Statistics
The view is automatically updated as orders change. No manual refresh needed.

### Cleaning Old OTPs
OTPs remain in the database for audit purposes. To clean old OTPs:

```sql
UPDATE orders 
SET pickup_otp = NULL, otp_generated_at = NULL 
WHERE status = 'completed' 
AND updated_at < NOW() - INTERVAL '30 days';
```

## Support

If you encounter issues:
1. Check Supabase logs for errors
2. Verify your database schema matches the expected structure
3. Ensure all migrations completed successfully
