import { supabase } from "@/auth/supabase"

export interface FeeLedgerEntry {
  id: string
  shop_id: string
  order_id: string
  fee_amount: number
  fee_percentage: number
  order_total: number
  print_amount: number
  status: 'unpaid' | 'paid'
  created_at: string
  paid_at: string | null
  payment_id: string | null
}

export interface FeePayment {
  id: string
  shop_id: string
  amount: number
  payment_method: string
  payment_reference: string | null
  notes: string | null
  created_at: string
  verified_at: string | null
  status: 'pending' | 'verified' | 'rejected'
}

export interface FeeSummary {
  totalFees: number
  unpaidFees: number
  paidFees: number
  unpaidCount: number
  oldestUnpaidDate: string | null
  daysOverdue: number | null
  isOverdue: boolean
}

/**
 * Fetch the fee summary for a shop
 */
export async function fetchFeeSummary(shopId: string): Promise<FeeSummary> {
  const { data, error } = await supabase
    .from('platform_fee_ledger')
    .select('fee_amount, status, created_at')
    .eq('shop_id', shopId)

  if (error) {
    console.error('Error fetching fee summary:', error)
    throw error
  }

  const entries = data || []
  const unpaidEntries = entries.filter(e => e.status === 'unpaid')
  const paidEntries = entries.filter(e => e.status === 'paid')

  const unpaidFees = unpaidEntries.reduce((sum, e) => sum + Number(e.fee_amount), 0)
  const paidFees = paidEntries.reduce((sum, e) => sum + Number(e.fee_amount), 0)

  const oldestUnpaid = unpaidEntries.length > 0
    ? unpaidEntries.reduce((oldest, e) => 
        e.created_at < oldest ? e.created_at : oldest, unpaidEntries[0].created_at)
    : null

  const daysOverdue = oldestUnpaid
    ? Math.floor((Date.now() - new Date(oldestUnpaid).getTime()) / (1000 * 60 * 60 * 24))
    : null

  return {
    totalFees: unpaidFees + paidFees,
    unpaidFees: Math.round(unpaidFees * 100) / 100,
    paidFees: Math.round(paidFees * 100) / 100,
    unpaidCount: unpaidEntries.length,
    oldestUnpaidDate: oldestUnpaid,
    daysOverdue,
    isOverdue: daysOverdue !== null && daysOverdue >= 7,
  }
}

/**
 * Fetch unpaid ledger entries for a shop
 */
export async function fetchUnpaidFees(shopId: string): Promise<FeeLedgerEntry[]> {
  const { data, error } = await supabase
    .from('platform_fee_ledger')
    .select('*')
    .eq('shop_id', shopId)
    .eq('status', 'unpaid')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching unpaid fees:', error)
    throw error
  }

  return data || []
}

/**
 * Fetch payment history for a shop
 */
export async function fetchFeePayments(shopId: string): Promise<FeePayment[]> {
  const { data, error } = await supabase
    .from('shop_fee_payments')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching fee payments:', error)
    throw error
  }

  return data || []
}

/**
 * Submit a fee payment record
 */
export async function submitFeePayment(
  shopId: string,
  amount: number,
  paymentMethod: string,
  paymentReference: string,
  notes?: string
): Promise<FeePayment> {
  const { data, error } = await supabase
    .from('shop_fee_payments')
    .insert({
      shop_id: shopId,
      amount,
      payment_method: paymentMethod,
      payment_reference: paymentReference,
      notes: notes || null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('Error submitting fee payment:', error)
    throw error
  }

  return data
}

/**
 * Check if shop is currently blocked
 */
export async function checkShopBlocked(shopId: string): Promise<{ isBlocked: boolean; reason: string | null }> {
  const { data, error } = await supabase
    .from('shops')
    .select('is_blocked, blocked_reason')
    .eq('id', shopId)
    .single()

  if (error) {
    console.error('Error checking shop blocked status:', error)
    return { isBlocked: false, reason: null }
  }

  return {
    isBlocked: data?.is_blocked || false,
    reason: data?.blocked_reason || null,
  }
}
