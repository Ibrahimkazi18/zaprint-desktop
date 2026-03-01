# Troubleshooting Guide

## Common Issues and Solutions

### 1. Pending Orders - 400 Error on Load

**Error Message:**
```
Failed to load resource: the server responded with a status of 400
Error loading pending orders: Object
```

**Cause:**
The query is trying to join the `orders` table with the `profiles` table, but the relationship might not be properly configured in Supabase.

**Solution:**
The code has been updated to fetch orders and profiles separately, then combine them. This should resolve the issue.

**Verify Fix:**
1. Check browser console for detailed error
2. Ensure `profiles` table exists
3. Verify `orders.user_id` references valid user IDs
4. Check Supabase logs for more details

**Manual Check:**
```sql
-- Check if profiles table exists
SELECT * FROM public.profiles LIMIT 1;

-- Check if orders have valid user_ids
SELECT o.id, o.user_id, p.name 
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.id
WHERE o.shop_id = 'your-shop-id'
LIMIT 5;
```

---

### 2. Dashboard Shows All Zeros

**Symptoms:**
- Today's orders: 0
- Today's earnings: 0
- All statistics show zero

**Possible Causes:**
1. No orders in database
2. Wrong shop_id
3. View not created properly
4. Orders don't match shop_id

**Solutions:**

**Check 1: Verify orders exist**
```sql
SELECT COUNT(*) as order_count 
FROM public.orders 
WHERE shop_id = 'your-shop-id';
```

**Check 2: Verify view works**
```sql
SELECT * FROM public.shop_dashboard_stats 
WHERE shop_id = 'your-shop-id';
```

**Check 3: Check shop_id in app**
```javascript
// In browser console
console.log(shop?.id);
```

**Fix:** If view returns data but dashboard shows zeros, clear browser cache and reload.

---

### 3. OTP Not Generating

**Symptoms:**
- Order status changes to 'ready'
- `pickup_otp` remains NULL
- No OTP in database

**Possible Causes:**
1. Trigger not created
2. Function doesn't exist
3. Order status didn't change TO 'ready'
4. Permissions issue

**Solutions:**

**Check 1: Verify trigger exists**
```sql
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE event_object_table = 'orders'
AND trigger_name = 'trigger_auto_generate_otp';
```

**Check 2: Verify function exists**
```sql
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'auto_generate_otp';
```

**Check 3: Test manually**
```sql
-- Create test order
INSERT INTO public.orders (user_id, shop_id, status, total_amount)
VALUES ('user-id', 'shop-id', 'pending', 100)
RETURNING id;

-- Update to ready (should trigger OTP)
UPDATE public.orders 
SET status = 'ready' 
WHERE id = 'order-id-from-above';

-- Check OTP
SELECT id, status, pickup_otp, otp_generated_at 
FROM public.orders 
WHERE id = 'order-id-from-above';
```

**Fix:** If trigger doesn't exist, re-run `DATABASE_SCHEMA.sql`

---

### 4. View Not Found Error

**Error Message:**
```
relation "shop_dashboard_stats" does not exist
```

**Cause:**
The view wasn't created or was created in wrong schema.

**Solutions:**

**Check 1: Verify view exists**
```sql
SELECT schemaname, viewname 
FROM pg_views 
WHERE viewname = 'shop_dashboard_stats';
```

**Check 2: Check current schema**
```sql
SELECT current_schema();
```

**Fix:** Re-run the view creation part of `DATABASE_SCHEMA.sql`:
```sql
CREATE OR REPLACE VIEW public.shop_dashboard_stats AS
-- ... (copy from DATABASE_SCHEMA.sql)
```

---

### 5. Pending Orders Page Shows "No pending orders"

**Symptoms:**
- Page loads successfully
- Shows "No pending orders" message
- But orders with status 'ready' exist in database

**Possible Causes:**
1. Orders don't have status 'ready'
2. Wrong shop_id
3. OTP not generated (pickup_otp is NULL)
4. Profiles data missing

**Solutions:**

**Check 1: Verify ready orders exist**
```sql
SELECT id, status, pickup_otp, shop_id
FROM public.orders
WHERE shop_id = 'your-shop-id'
AND status = 'ready';
```

**Check 2: Check if OTP exists**
```sql
SELECT id, status, pickup_otp
FROM public.orders
WHERE shop_id = 'your-shop-id'
AND status = 'ready'
AND pickup_otp IS NULL;
```

If OTP is NULL, manually generate:
```sql
UPDATE public.orders
SET pickup_otp = LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'),
    otp_generated_at = NOW()
WHERE status = 'ready'
AND pickup_otp IS NULL;
```

**Check 3: Verify profiles exist**
```sql
SELECT o.id, o.user_id, p.name, p.phone_number
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.id
WHERE o.shop_id = 'your-shop-id'
AND o.status = 'ready';
```

---

### 6. OTP Verification Fails

**Symptoms:**
- Enter correct OTP
- Shows "Invalid OTP" error
- Order doesn't complete

**Possible Causes:**
1. OTP doesn't match
2. Order status not 'ready'
3. Case sensitivity issue
4. Whitespace in OTP

**Solutions:**

**Check 1: Verify OTP in database**
```sql
SELECT id, pickup_otp, status
FROM public.orders
WHERE id = 'order-id';
```

**Check 2: Test verification manually**
```sql
-- Check if OTP matches
SELECT id, pickup_otp, status
FROM public.orders
WHERE id = 'order-id'
AND pickup_otp = '123456'  -- Replace with actual OTP
AND status = 'ready';
```

**Fix:** Ensure:
- OTP is exactly 6 digits
- No spaces before/after
- Order status is 'ready'
- Using correct order ID

---

### 7. Dashboard Statistics Not Updating

**Symptoms:**
- Create new order
- Dashboard doesn't show updated count
- Statistics remain the same

**Possible Causes:**
1. Browser cache
2. View not refreshing
3. Order not committed to database
4. Wrong shop_id

**Solutions:**

**Quick Fix:**
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Logout and login again

**Check database:**
```sql
-- Force view refresh (if materialized)
-- REFRESH MATERIALIZED VIEW public.shop_dashboard_stats;

-- Check if order exists
SELECT * FROM public.orders 
WHERE shop_id = 'your-shop-id'
ORDER BY created_at DESC
LIMIT 5;

-- Check view data
SELECT * FROM public.shop_dashboard_stats
WHERE shop_id = 'your-shop-id';
```

---

### 8. Printer Test Print Not Working

**Symptoms:**
- Click "Test" button
- Shows loading
- No print output
- Error message

**Possible Causes:**
1. Printer offline
2. Electron API not available
3. Printer name mismatch
4. Permission issues

**Solutions:**

**Check 1: Verify printer status**
- Ensure printer shows "online" in Printers page
- Check physical printer is on and connected

**Check 2: Check Electron API**
```javascript
// In browser console
console.log(window.printerAPI);
// Should show object with methods
```

**Check 3: Verify printer name**
- Printer name in app must exactly match system printer name
- Check for extra spaces or special characters

**Fix:** 
- Restart printer
- Re-register printer with exact system name
- Check printer drivers are installed

---

## General Debugging Tips

### Enable Detailed Logging

**Browser Console:**
```javascript
// Enable verbose logging
localStorage.setItem('debug', 'true');
```

**Supabase Logs:**
1. Go to Supabase Dashboard
2. Navigate to Logs section
3. Filter by API or Database logs
4. Look for errors around the time of issue

### Check Network Requests

1. Open Browser DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for failed requests (red)
5. Click on request to see details

### Verify Database Connection

```sql
-- Test basic connectivity
SELECT NOW();

-- Check if you can access tables
SELECT COUNT(*) FROM public.orders;

-- Verify permissions
SELECT * FROM information_schema.table_privileges
WHERE grantee = current_user
AND table_name IN ('orders', 'profiles', 'shops');
```

### Clear All Caches

1. Browser cache (Ctrl+Shift+Delete)
2. Service workers (DevTools > Application > Service Workers > Unregister)
3. Local storage (DevTools > Application > Local Storage > Clear)
4. Reload app (Ctrl+Shift+R)

---

## Getting Help

### Information to Provide

When asking for help, include:

1. **Error Message:** Exact error from console
2. **Steps to Reproduce:** What you did before error
3. **Environment:** Browser, OS, Supabase region
4. **Database State:** Results of relevant SQL queries
5. **Screenshots:** If UI issue

### Useful Queries for Support

```sql
-- System info
SELECT version();

-- Check table structure
\d public.orders

-- Check view definition
SELECT pg_get_viewdef('public.shop_dashboard_stats', true);

-- Check triggers
SELECT * FROM pg_trigger WHERE tgrelid = 'public.orders'::regclass;

-- Check recent orders
SELECT * FROM public.orders 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## Prevention Tips

1. **Regular Backups:** Backup database before major changes
2. **Test in Development:** Test features with sample data first
3. **Monitor Logs:** Check Supabase logs regularly
4. **Update Dependencies:** Keep packages up to date
5. **Document Changes:** Note any custom modifications

---

## Quick Fixes Checklist

When something breaks, try these in order:

- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Clear browser cache
- [ ] Check browser console for errors
- [ ] Check Supabase logs
- [ ] Verify database connection
- [ ] Re-run DATABASE_SCHEMA.sql
- [ ] Restart development server
- [ ] Logout and login again
- [ ] Check network connectivity
- [ ] Verify environment variables

---

## Still Having Issues?

1. Check `DATABASE_SETUP_INSTRUCTIONS.md` for setup details
2. Review `IMPLEMENTATION_SUMMARY.md` for feature documentation
3. Run queries from `TEST_DATABASE_SETUP.sql` to verify setup
4. Check Supabase documentation: https://supabase.com/docs
5. Review error logs in Supabase dashboard
