# Quick Start Guide - Dynamic Dashboard & Pending Orders

## 🚀 Get Started in 3 Steps

### Step 1: Update Database (5 minutes)
1. Open your Supabase project: https://app.supabase.com
2. Go to SQL Editor
3. Copy and paste the entire contents of `DATABASE_SCHEMA.sql`
4. Click "Run" or press Ctrl+Enter
5. Wait for "Success. No rows returned" message

### Step 2: Verify Setup (2 minutes)
Run these quick checks in SQL Editor:

```sql
-- Check if view exists (should return data)
SELECT * FROM public.shop_dashboard_stats LIMIT 1;

-- Check if OTP columns exist (should return 2 rows)
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('pickup_otp', 'otp_generated_at');
```

### Step 3: Test the Features (3 minutes)
1. Start your app: `npm run dev`
2. Login to your shop account
3. Navigate to Dashboard - should show real statistics
4. Click on "Pending Orders" card or use sidebar
5. Test with a sample order (see below)

## 📝 Testing with Sample Data

### Create a Test Order
```sql
-- 1. Create a test order (replace with your IDs)
INSERT INTO public.orders (user_id, shop_id, status, total_amount)
VALUES (
  'your-user-id',  -- Get from profiles table
  'your-shop-id',  -- Get from shops table
  'pending',
  150.00
)
RETURNING id;

-- 2. Move order through statuses
UPDATE public.orders SET status = 'in_queue' WHERE id = 'order-id-from-above';
UPDATE public.orders SET status = 'printing' WHERE id = 'order-id-from-above';
UPDATE public.orders SET status = 'ready' WHERE id = 'order-id-from-above';

-- 3. Check OTP was generated
SELECT id, status, pickup_otp, otp_generated_at 
FROM public.orders 
WHERE id = 'order-id-from-above';
```

### Test OTP Verification
1. Go to Pending Orders page in your app
2. You should see the test order
3. Click "Verify OTP" button
4. Enter the OTP from the SQL query above
5. Click "Complete Order"
6. Order should disappear from the list

## 🎯 What You Should See

### Dashboard
- **Today's Orders**: Real count (not "12")
- **Today's Earnings**: Real amount in ₹
- **Pending Orders**: Clickable card with count
- **Monthly Revenue**: Real total
- **Percentage Changes**: Green ↑ or red ↓ arrows

### Pending Orders Page
- **Statistics Cards**: 
  - Ready for Pickup count
  - Total Value in ₹
  - Average Wait Time
- **Orders Table**:
  - Order ID
  - Customer name and phone
  - Amount
  - Time since ready
  - Verify OTP button

### Sidebar
- New "Pending Orders" menu item (amber package icon)
- Between Dashboard and Printers

## 🔧 Troubleshooting

### "No data" on Dashboard
**Problem**: Dashboard shows all zeros  
**Solution**: 
- Check if you have orders in database
- Verify shop_id is correct
- Run: `SELECT * FROM public.orders WHERE shop_id = 'your-shop-id';`

### OTP Not Generating
**Problem**: pickup_otp is NULL after setting status to 'ready'  
**Solution**:
- Check trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_auto_generate_otp';`
- Ensure status changed FROM something else TO 'ready'
- Check Supabase logs for errors

### Pending Orders Page Empty
**Problem**: No orders showing even though they exist  
**Solution**:
- Verify orders have status = 'ready'
- Check shop_id matches your logged-in shop
- Ensure profiles table has customer data

### View Not Found Error
**Problem**: "relation shop_dashboard_stats does not exist"  
**Solution**:
- Re-run DATABASE_SCHEMA.sql
- Check you're in the correct database
- Verify you have permissions

## 📊 Understanding the Data Flow

### Order Status Flow
```
pending → in_queue → printing → ready → completed
                                  ↓
                            OTP Generated
```

### Dashboard Updates
```
Order Created → Database → View Updates → Dashboard Refreshes
```

### OTP Verification
```
Customer → Provides OTP → Shop Owner → Enters in App → Verified → Order Completed
```

## 🎨 UI Features

### Dashboard Cards
- **Shop Status**: Green (online) / Yellow (offline) / Red (error)
- **Today's Jobs**: Shows count with comparison
- **Pending Orders**: Clickable, navigates to pending page
- **Active Customers**: This week's count

### Financial Cards
- **Today's Earnings**: With % change from yesterday
- **Monthly Revenue**: With % change from last month
- **Active Orders**: Currently in queue or printing

### Pending Orders
- **OTP Dialog**: Large input for easy entry
- **Customer Info**: Name and phone displayed
- **Wait Time**: Shows "Xm ago" or "Xh ago"
- **One-Click Complete**: Verify and complete in one action

## 🔐 Security Notes

### OTP System
- 6-digit random numbers (000000-999999)
- Auto-generated when order becomes 'ready'
- Single-use (order moves to completed)
- Stored securely in database

### Recommendations
1. Enable Row Level Security (RLS) on all tables
2. Add OTP expiry (24-48 hours)
3. Implement customer notification system
4. Log all OTP verification attempts

## 📱 Next Steps

### Immediate
1. ✅ Run database schema
2. ✅ Test with sample data
3. ✅ Verify all pages work
4. ✅ Check dark mode appearance

### Soon
1. Add customer OTP notifications (SMS/Email)
2. Implement OTP expiry logic
3. Add order search/filter
4. Create customer-facing tracking page

### Later
1. Analytics improvements
2. Bulk operations
3. Mobile app
4. Payment integration

## 💡 Pro Tips

1. **Bookmark Pending Orders**: Most-used page for daily operations
2. **Use Keyboard**: Tab through OTP input for speed
3. **Check Dashboard Daily**: Monitor trends and performance
4. **Test OTP Flow**: Practice with test orders first
5. **Monitor Statistics**: Use data to optimize operations

## 📞 Need Help?

### Check These First
1. `DATABASE_SETUP_INSTRUCTIONS.md` - Detailed setup guide
2. `TEST_DATABASE_SETUP.sql` - Verification queries
3. `IMPLEMENTATION_SUMMARY.md` - Complete feature list
4. Supabase logs - Check for errors

### Common Commands
```bash
# Start development server
npm run dev

# Check for TypeScript errors
npm run type-check

# Build for production
npm run build
```

## ✅ Success Checklist

- [ ] Database schema executed successfully
- [ ] View returns data (even if zeros)
- [ ] OTP columns exist on orders table
- [ ] Dashboard shows real statistics
- [ ] Pending Orders page loads
- [ ] Can create test order
- [ ] OTP generates automatically
- [ ] Can verify OTP and complete order
- [ ] Statistics update after completion
- [ ] Dark mode looks good

## 🎉 You're Done!

Your dynamic dashboard and pending orders system is now live. Start accepting orders and use the OTP system for secure pickups!

**Remember**: The system updates in real-time, so you'll see changes immediately as orders flow through your shop.
