  -- ============================================
  -- ZAPRINT PLATFORM FEE LEDGER SYSTEM
  -- ============================================
  -- This creates tables to track platform fees owed by shops
  -- and their payments, plus blocking mechanism for overdue shops.
  --
  -- Run this in your Supabase SQL Editor
  -- ============================================

  -- ============================================
  -- STEP 1: CREATE PLATFORM FEE LEDGER TABLE
  -- ============================================
  -- Records each platform fee owed per order.
  -- When a customer pays, a row is inserted here.

  CREATE TABLE IF NOT EXISTS public.platform_fee_ledger (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    fee_amount DECIMAL(10,2) NOT NULL,
    fee_percentage DECIMAL(5,2) NOT NULL,
    order_total DECIMAL(10,2) NOT NULL,
    print_amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'unpaid', -- 'unpaid', 'paid'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    payment_id UUID -- references shop_fee_payments.id when paid
  );

  -- Comments
  COMMENT ON TABLE public.platform_fee_ledger IS 'Tracks platform fees owed by each shop per order';
  COMMENT ON COLUMN public.platform_fee_ledger.status IS 'unpaid = shop owes this fee, paid = shop has settled this fee';

  -- Indexes
  CREATE INDEX IF NOT EXISTS idx_fee_ledger_shop ON public.platform_fee_ledger(shop_id);
  CREATE INDEX IF NOT EXISTS idx_fee_ledger_status ON public.platform_fee_ledger(shop_id, status) WHERE status = 'unpaid';
  CREATE INDEX IF NOT EXISTS idx_fee_ledger_order ON public.platform_fee_ledger(order_id);
  CREATE INDEX IF NOT EXISTS idx_fee_ledger_created ON public.platform_fee_ledger(created_at);

  -- ============================================
  -- STEP 2: CREATE SHOP FEE PAYMENTS TABLE
  -- ============================================
  -- Records when a shop makes a payment to settle accumulated fees.

  CREATE TABLE IF NOT EXISTS public.shop_fee_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'upi', 'bank_transfer'
    payment_reference TEXT, -- UPI transaction ID, bank reference, etc
    notes TEXT,
    fees_covered UUID[] DEFAULT '{}', -- Array of platform_fee_ledger IDs that this payment covers
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    verified_by UUID, -- admin user who verified the payment
    status TEXT NOT NULL DEFAULT 'pending' -- 'pending', 'verified', 'rejected'
  );

  -- Comments
  COMMENT ON TABLE public.shop_fee_payments IS 'Records payments made by shops to settle platform fees';
  COMMENT ON COLUMN public.shop_fee_payments.fees_covered IS 'Array of ledger entry IDs covered by this payment';

  -- Indexes
  CREATE INDEX IF NOT EXISTS idx_fee_payments_shop ON public.shop_fee_payments(shop_id);
  CREATE INDEX IF NOT EXISTS idx_fee_payments_status ON public.shop_fee_payments(status);

  -- ============================================
  -- STEP 3: ADD BLOCKING COLUMNS TO SHOPS TABLE
  -- ============================================

  ALTER TABLE public.shops 
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS blocked_reason TEXT;

  COMMENT ON COLUMN public.shops.is_blocked IS 'Whether shop is blocked due to unpaid platform fees';
  COMMENT ON COLUMN public.shops.blocked_at IS 'When the shop was blocked';
  COMMENT ON COLUMN public.shops.blocked_reason IS 'Reason for blocking (e.g. overdue platform fees)';

  -- ============================================
  -- STEP 4: CREATE VIEW FOR SHOP FEE SUMMARY
  -- ============================================
  -- Convenient view to see each shop's fee status at a glance.

  CREATE OR REPLACE VIEW public.shop_fee_summary AS
  SELECT 
    s.id AS shop_id,
    s.shop_name,
    s.is_blocked,
    
    -- Total fees ever
    COALESCE(SUM(l.fee_amount), 0) AS total_fees,
    
    -- Unpaid fees
    COALESCE(SUM(CASE WHEN l.status = 'unpaid' THEN l.fee_amount ELSE 0 END), 0) AS unpaid_fees,
    
    -- Paid fees
    COALESCE(SUM(CASE WHEN l.status = 'paid' THEN l.fee_amount ELSE 0 END), 0) AS paid_fees,
    
    -- Count of unpaid entries
    COUNT(CASE WHEN l.status = 'unpaid' THEN 1 END)::integer AS unpaid_count,
    
    -- Oldest unpaid fee date (for overdue calculation)
    MIN(CASE WHEN l.status = 'unpaid' THEN l.created_at END) AS oldest_unpaid_date,
    
    -- Days since oldest unpaid
    EXTRACT(DAY FROM NOW() - MIN(CASE WHEN l.status = 'unpaid' THEN l.created_at END))::integer AS days_overdue

  FROM public.shops s
  LEFT JOIN public.platform_fee_ledger l ON s.id = l.shop_id
  GROUP BY s.id, s.shop_name, s.is_blocked;

  -- Grant access
  GRANT SELECT ON public.shop_fee_summary TO authenticated;

  -- ============================================
  -- STEP 5: RLS POLICIES
  -- ============================================

  -- Enable RLS
  ALTER TABLE public.platform_fee_ledger ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.shop_fee_payments ENABLE ROW LEVEL SECURITY;

  -- Shop owners can read their own ledger entries
  CREATE POLICY "Shop owners can view own fee ledger"
    ON public.platform_fee_ledger
    FOR SELECT
    USING (
      shop_id IN (
        SELECT id FROM public.shops WHERE owner_id = auth.uid()
      )
    );

  -- Shop owners can view their own payments
  CREATE POLICY "Shop owners can view own fee payments"
    ON public.shop_fee_payments
    FOR SELECT
    USING (
      shop_id IN (
        SELECT id FROM public.shops WHERE owner_id = auth.uid()
      )
    );

  -- Shop owners can insert fee payments (to record their payment)
  CREATE POLICY "Shop owners can create fee payments"
    ON public.shop_fee_payments
    FOR INSERT
    WITH CHECK (
      shop_id IN (
        SELECT id FROM public.shops WHERE owner_id = auth.uid()
      )
    );

  -- Service role can do everything (for API routes)
  CREATE POLICY "Service role full access to fee ledger"
    ON public.platform_fee_ledger
    FOR ALL
    USING (true)
    WITH CHECK (true);

  CREATE POLICY "Service role full access to fee payments"
    ON public.shop_fee_payments
    FOR ALL
    USING (true)
    WITH CHECK (true);

  -- ============================================
  -- STEP 6: AUTO-BLOCK FUNCTION (Optional cron)
  -- ============================================
  -- This function can be called by a Supabase cron job or edge function
  -- to check for shops with fees overdue > 7 days and block them.

  CREATE OR REPLACE FUNCTION public.check_and_block_overdue_shops()
  RETURNS void AS $$
  BEGIN
    -- Block shops with unpaid fees older than 7 days
    UPDATE public.shops
    SET 
      is_blocked = TRUE,
      blocked_at = NOW(),
      blocked_reason = 'Overdue platform fees (>7 days unpaid)'
    WHERE id IN (
      SELECT shop_id 
      FROM public.platform_fee_ledger
      WHERE status = 'unpaid'
      GROUP BY shop_id
      HAVING MIN(created_at) < NOW() - INTERVAL '7 days'
    )
    AND is_blocked = FALSE;
    
    -- Unblock shops that have no unpaid fees (they paid everything)
    UPDATE public.shops
    SET 
      is_blocked = FALSE,
      blocked_at = NULL,
      blocked_reason = NULL
    WHERE is_blocked = TRUE
    AND blocked_reason = 'Overdue platform fees (>7 days unpaid)'
    AND id NOT IN (
      SELECT shop_id 
      FROM public.platform_fee_ledger
      WHERE status = 'unpaid'
    );
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- ============================================
  -- VERIFICATION QUERIES
  -- ============================================
  -- Run these to verify the setup:

  -- Check tables exist:
  -- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('platform_fee_ledger', 'shop_fee_payments');

  -- Check new columns on shops:
  -- SELECT column_name FROM information_schema.columns WHERE table_name = 'shops' AND column_name IN ('is_blocked', 'blocked_at', 'blocked_reason');

  -- Check the view:
  -- SELECT * FROM shop_fee_summary;

  -- ============================================
  -- COMPLETE!
  -- ============================================
