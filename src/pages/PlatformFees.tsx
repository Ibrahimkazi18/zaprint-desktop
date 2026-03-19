import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  IndianRupee,
  Loader2,
  Receipt,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Wallet,
  Zap,
} from "lucide-react";
import { useShopDashboard } from "@/hooks/useShopDashboard";
import {
  fetchFeeSummary,
  fetchUnpaidFees,
  fetchFeePayments,
  checkShopBlocked,
  type FeeSummary,
  type FeeLedgerEntry,
  type FeePayment,
} from "@/backend/fees/platformFees";
import { initiateRazorpayFeePayment } from "@/backend/fees/razorpayFeePayment";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function PlatformFees() {
  const { shop, loading: shopLoading } = useShopDashboard();
  const { user } = useAuth();

  const [summary, setSummary] = useState<FeeSummary | null>(null);
  const [unpaidFees, setUnpaidFees] = useState<FeeLedgerEntry[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const loadData = useCallback(async () => {
    if (!shop?.id) return;
    try {
      setLoading(true);
      const [summaryData, unpaidData, paymentsData, blockedData] =
        await Promise.all([
          fetchFeeSummary(shop.id),
          fetchUnpaidFees(shop.id),
          fetchFeePayments(shop.id),
          checkShopBlocked(shop.id),
        ]);

      setSummary(summaryData);
      setUnpaidFees(unpaidData);
      setPayments(paymentsData);
      setIsBlocked(blockedData.isBlocked);
      setBlockedReason(blockedData.reason);
    } catch (error) {
      console.error("Error loading platform fee data:", error);
      toast.error("Failed to load fee data");
    } finally {
      setLoading(false);
    }
  }, [shop?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePayWithRazorpay = async () => {
    if (!shop?.id || !summary || summary.unpaidFees <= 0) return;

    setPaying(true);

    await initiateRazorpayFeePayment({
      shopId: shop.id,
      shopName: shop.shop_name || "Shop",
      amount: summary.unpaidFees,
      unpaidCount: summary.unpaidCount,
      userEmail: user?.email || undefined,
      userName: user?.user_metadata?.full_name || shop.shop_name || undefined,
      onSuccess: async () => {
        setPaying(false);
        toast.success(
          "Payment successful! Your fees have been settled.",
          { duration: 5000, icon: "🎉" }
        );
        // Refresh data
        await loadData();
      },
      onError: (error) => {
        setPaying(false);
        toast.error(error || "Payment failed. Please try again.");
      },
    });

    // Reset paying state in case the modal was dismissed
    setTimeout(() => setPaying(false), 1000);
  };

  if (shopLoading || loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-2">
            <Skeleton className="h-9 w-56" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="stat-card">
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-20" />
                </CardHeader>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const urgencyLevel = summary
    ? summary.isOverdue
      ? "critical"
      : summary.daysOverdue !== null && summary.daysOverdue >= 5
        ? "warning"
        : summary.unpaidFees > 0
          ? "info"
          : "clear"
    : "clear";

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Platform Fees
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Track and settle your Zaprint platform service fees
            </p>
          </div>
          {summary && summary.unpaidFees > 0 && (
            <Button
              size="lg"
              onClick={handlePayWithRazorpay}
              disabled={paying}
              className={cn(
                "gap-2.5 font-semibold shadow-lg transition-all duration-200",
                urgencyLevel === "critical"
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-red-200"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-200",
                paying && "opacity-80 cursor-not-allowed"
              )}
            >
              {paying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pay ₹{summary.unpaidFees.toFixed(2)}
                  <Zap className="h-3.5 w-3.5 opacity-60" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Razorpay Security Badge */}
        {summary && summary.unpaidFees > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            <span>Payments secured by <strong>Razorpay</strong> — India's most trusted payment gateway</span>
          </div>
        )}

        {/* Blocked Banner */}
        {isBlocked && (
          <div className="p-5 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10">
                <ShieldAlert className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-900 dark:text-red-100 text-base">
                  Your shop is currently blocked
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">
                  {blockedReason ||
                    "Your shop is hidden from customers due to overdue platform fees."}{" "}
                  Pay your outstanding fees to unblock instantly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Overdue Warning Banner (not yet blocked) */}
        {!isBlocked && urgencyLevel === "warning" && (
          <div className="p-5 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  Fees due soon
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                  You have fees pending for {summary?.daysOverdue} days. Your
                  shop will be blocked after 7 days. Please pay to avoid
                  disruption.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-5 md:grid-cols-3">
          {/* Unpaid Fees */}
          <Card
            className={cn(
              "stat-card relative overflow-hidden border-border/60",
              urgencyLevel === "critical" && "border-red-300 dark:border-red-800"
            )}
          >
            <div
              className={cn(
                "absolute inset-0 opacity-[0.04]",
                urgencyLevel === "critical"
                  ? "bg-red-500"
                  : urgencyLevel === "warning"
                    ? "bg-amber-500"
                    : "bg-orange-500"
              )}
            />
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Outstanding Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={cn(
                      "text-3xl font-bold",
                      urgencyLevel === "critical"
                        ? "text-red-600"
                        : urgencyLevel === "warning"
                          ? "text-amber-600"
                          : summary?.unpaidFees === 0
                            ? "text-emerald-600"
                            : "text-orange-600"
                    )}
                  >
                    ₹{summary?.unpaidFees.toFixed(2) || "0.00"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {summary?.unpaidCount || 0} pending fee
                    {summary?.unpaidCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div
                  className={cn(
                    "p-2.5 rounded-xl",
                    summary?.unpaidFees === 0
                      ? "bg-emerald-500/10"
                      : urgencyLevel === "critical"
                        ? "bg-red-500/10"
                        : "bg-orange-500/10"
                  )}
                >
                  {summary?.unpaidFees === 0 ? (
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <IndianRupee
                      className={cn(
                        "h-5 w-5",
                        urgencyLevel === "critical"
                          ? "text-red-500"
                          : "text-orange-500"
                      )}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Paid */}
          <Card className="stat-card relative overflow-hidden border-border/60">
            <div className="absolute inset-0 bg-emerald-500 opacity-[0.03]" />
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Paid
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{summary?.paidFees.toFixed(2) || "0.00"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Lifetime settled
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Days Since Oldest */}
          <Card className="stat-card relative overflow-hidden border-border/60">
            <div className="absolute inset-0 bg-blue-500 opacity-[0.03]" />
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Fee Status
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center justify-between">
                <div>
                  {summary?.daysOverdue !== null && summary?.daysOverdue !== undefined ? (
                    <>
                      <p
                        className={cn(
                          "text-3xl font-bold",
                          summary.daysOverdue >= 7
                            ? "text-red-600"
                            : summary.daysOverdue >= 5
                              ? "text-amber-600"
                              : "text-blue-600"
                        )}
                      >
                        {summary.daysOverdue}d
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Since oldest unpaid fee
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-emerald-600">✓</p>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        All fees cleared!
                      </p>
                    </>
                  )}
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Unpaid Fees Table */}
          <div className="lg:col-span-2">
            <Card className="border-border/60">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Pending Fees
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Platform fees from each order that need to be settled
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      summary?.unpaidFees === 0
                        ? "text-emerald-600 border-emerald-300"
                        : "text-orange-600 border-orange-300"
                    )}
                  >
                    {summary?.unpaidCount || 0} pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold pl-6">
                        Order
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Date
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Order Total
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Fee %
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-right pr-6">
                        Fee Amount
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unpaidFees.length === 0 ? (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={5} className="text-center py-16">
                          <div className="flex flex-col items-center gap-2">
                            <div className="p-4 rounded-2xl bg-muted/40 mb-1">
                              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">
                              No pending fees!
                            </p>
                            <p className="text-xs text-muted-foreground/60">
                              All platform fees have been settled
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      unpaidFees.map((entry) => (
                        <TableRow
                          key={entry.id}
                          className="border-border/40 hover:bg-muted/30 transition-colors"
                        >
                          <TableCell className="font-mono text-xs font-medium pl-6">
                            #{entry.order_id.slice(0, 8)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(entry.created_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                              }
                            )}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            ₹{Number(entry.order_total).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {entry.fee_percentage}%
                          </TableCell>
                          <TableCell className="text-sm font-bold text-right pr-6 text-orange-600">
                            ₹{Number(entry.fee_amount).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Payment History Sidebar */}
          <div>
            <Card className="border-border/60">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {payments.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="p-4 rounded-2xl bg-muted/40 inline-flex mb-3">
                        <Wallet className="h-7 w-7 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No payments recorded yet
                      </p>
                    </div>
                  ) : (
                    payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">
                              ₹{Number(payment.amount).toFixed(2)}
                            </p>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] px-2 py-0.5 font-semibold capitalize",
                                payment.status === "verified"
                                  ? "text-emerald-600 border-emerald-300"
                                  : payment.status === "rejected"
                                    ? "text-red-600 border-red-300"
                                    : "text-amber-600 border-amber-300"
                              )}
                            >
                              {payment.status}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {payment.payment_method === "razorpay" ? (
                              <span className="inline-flex items-center gap-1">
                                <CreditCard className="h-3 w-3" />
                                Razorpay
                              </span>
                            ) : (
                              payment.payment_method.toUpperCase()
                            )}{" "}
                            •{" "}
                            {new Date(payment.created_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="border-border/60 mt-5">
              <CardContent className="pt-5">
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    How it works
                  </h4>
                  <div className="space-y-2.5 text-xs text-muted-foreground">
                    <div className="flex gap-2">
                      <span className="text-primary font-bold">1.</span>
                      <span>
                        For every order, a small platform fee is charged
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-primary font-bold">2.</span>
                      <span>
                        Fees accumulate and must be settled weekly
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-primary font-bold">3.</span>
                      <span>
                        Click "Pay" to settle instantly via Razorpay (UPI, Cards, Net Banking)
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-primary font-bold">4.</span>
                      <span>
                        Payment is verified automatically — no manual approval needed
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                      <Shield className="h-3 w-3" />
                      Secured by Razorpay — UPI, Cards, Net Banking accepted
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-red-500 font-medium">
                      ⚠️ Shops with fees unpaid for more than 7 days will be
                      temporarily hidden from customers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
