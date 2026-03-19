import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  FileText,
  Printer,
  DollarSign,
  Zap,
  Target,
  ArrowUpRight,
  Package,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useShopDashboard } from "@/hooks/useShopDashboard";
import {
  fetchMissedOrders,
  subscribeToOrders,
} from "@/backend/realtime/subscribeToOrders";
import { useEffect, useState } from "react";
import { supabase } from "@/auth/supabase";
import { usePrintQueue } from "@/hooks/usePrintQueue";
import { useLiveQueue } from "@/hooks/useLiveQueue";
import fetchDashboardStats, {
  DashboardStats,
} from "@/backend/dashboard/fetchDashboardStats";
import { cn } from "@/lib/utils";
import { useFeeReminder } from "@/hooks/useFeeReminder";

export default function Dashboard() {
  const navigate = useNavigate();

  const { shop, printers, loading } = useShopDashboard();
  useFeeReminder();
  const { addJob: addToQueue } = usePrintQueue(printers, {
    detectSystemPrinters: false,
  });
  const queue = useLiveQueue();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!shop?.id) return;
      try {
        setStatsLoading(true);
        const data = await fetchDashboardStats(shop.id);
        setStats(data);
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, [shop?.id]);

  useEffect(() => {
    if (!shop?.id) return;
    fetchMissedOrders(shop.id, addToQueue);
    const channel = subscribeToOrders(shop.id, addToQueue);
    return () => {
      supabase.removeChannel(channel);
    };
  }, [shop?.id, addToQueue]);

  const fetchQueue = async () => {
    console.log("Queue is live - no manual refresh needed");
  };

  const todayChange =
    stats && stats.yesterday_earnings > 0
      ? ((stats.today_earnings - stats.yesterday_earnings) /
          stats.yesterday_earnings) *
        100
      : 0;

  const monthChange =
    stats && stats.last_month_earnings > 0
      ? ((stats.month_earnings - stats.last_month_earnings) /
          stats.last_month_earnings) *
        100
      : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-5 w-80" />
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="stat-card">
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-32 mb-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-9 w-24 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const shopStatus = printers.some((p) => p.status === "online")
    ? "online"
    : printers.some((p) => p.status === "error")
      ? "error"
      : "offline";

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-slide-up">
        {/* ── Welcome Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back{shop?.shop_name ? `, ${shop.shop_name}` : ""}!
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Here's what's happening with your print shop today.
            </p>
          </div>
        </div>

        {/* ── Payment Onboarding Banner ── */}
        {shop && !shop.is_payment_onboarded && (
          <div className="p-5 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-100">
                    Complete Payment Setup
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                    Your shop is not visible on the website until payment onboarding is complete
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => navigate("/payment-onboarding")}
              >
                Complete Setup
              </Button>
            </div>
          </div>
        )}

        {/* ── Blocked Banner ── */}
        {shop && shop.is_blocked && (
          <div className="p-5 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-500/10">
                  <ShieldAlert className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-100">
                    Your shop is temporarily blocked
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                    {shop.blocked_reason || "You have overdue platform fees. Your shop is hidden from customers."}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => navigate("/platform-fees")}
              >
                Pay Fees
              </Button>
            </div>
          </div>
        )}

        {/* ── Stats Row ── */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* Shop Status */}
          <Card className="stat-card relative overflow-hidden border-border/60">
            <div
              className={cn(
                "absolute inset-0 opacity-[0.04]",
                shopStatus === "online"
                  ? "bg-emerald-500"
                  : shopStatus === "error"
                    ? "bg-red-500"
                    : "bg-amber-500",
              )}
            />
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Shop Status
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div
                      className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        shopStatus === "online"
                          ? "bg-emerald-500 animate-pulse"
                          : shopStatus === "error"
                            ? "bg-red-500 animate-pulse"
                            : "bg-amber-500",
                      )}
                    />
                    <p
                      className={cn(
                        "text-2xl font-bold",
                        shopStatus === "online"
                          ? "text-emerald-600"
                          : shopStatus === "error"
                            ? "text-red-600"
                            : "text-amber-600",
                      )}
                    >
                      {shopStatus === "online"
                        ? "Online"
                        : shopStatus === "error"
                          ? "Error"
                          : "Offline"}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {printers.filter((p) => p.status === "online").length} of{" "}
                    {printers.length} printers active
                  </p>
                </div>
                <div
                  className={cn(
                    "p-2.5 rounded-xl",
                    shopStatus === "online"
                      ? "bg-emerald-500/10"
                      : shopStatus === "error"
                        ? "bg-red-500/10"
                        : "bg-amber-500/10",
                  )}
                >
                  <Printer
                    className={cn(
                      "h-5 w-5",
                      shopStatus === "online"
                        ? "text-emerald-500"
                        : shopStatus === "error"
                          ? "text-red-500"
                          : "text-amber-500",
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Jobs */}
          <Card className="stat-card relative overflow-hidden border-border/60">
            <div className="absolute inset-0 bg-blue-500 opacity-[0.03]" />
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Today's Jobs
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {statsLoading ? "—" : stats?.today_orders || 0}
                  </p>
                  {stats && stats.yesterday_orders > 0 && (
                    <div
                      className={cn(
                        "flex items-center text-xs mt-1.5 font-medium",
                        stats.today_orders >= stats.yesterday_orders
                          ? "text-emerald-600"
                          : "text-red-500",
                      )}
                    >
                      {stats.today_orders >= stats.yesterday_orders ? (
                        <TrendingUp className="h-3.5 w-3.5 mr-1" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 mr-1" />
                      )}
                      {stats.today_orders >= stats.yesterday_orders ? "+" : ""}
                      {stats.today_orders - stats.yesterday_orders} from
                      yesterday
                    </div>
                  )}
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/10">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Orders */}
          <Card
            className="stat-card relative overflow-hidden border-border/60 cursor-pointer"
            onClick={() => navigate("/pending-orders")}
          >
            <div className="absolute inset-0 bg-amber-500 opacity-[0.03]" />
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {statsLoading ? "—" : stats?.pending_orders || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Ready for pickup
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10">
                  <Package className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Customers */}
          <Card className="stat-card relative overflow-hidden border-border/60">
            <div className="absolute inset-0 bg-purple-500 opacity-[0.03]" />
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Customers
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {statsLoading ? "—" : stats?.active_customers_week || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    This week
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-500/10">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Financial Overview ── */}
        <div className="grid gap-5 md:grid-cols-3">
          {/* Today's Earnings */}
          <Card className="stat-card relative overflow-hidden border-border/60">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 to-emerald-600/3" />
            <CardHeader className="relative pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                Today's Earnings
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                ₹
                {statsLoading
                  ? "—"
                  : (stats?.today_earnings || 0).toLocaleString()}
              </p>
              {stats && stats.yesterday_earnings > 0 && (
                <div
                  className={cn(
                    "flex items-center text-xs mt-2 font-medium",
                    todayChange >= 0 ? "text-emerald-600" : "text-red-500",
                  )}
                >
                  {todayChange >= 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 mr-1" />
                  )}
                  {todayChange >= 0 ? "+" : ""}
                  {todayChange.toFixed(1)}% from yesterday
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Revenue */}
          <Card className="stat-card relative overflow-hidden border-border/60">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 to-blue-600/3" />
            <CardHeader className="relative pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" />
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                ₹
                {statsLoading
                  ? "—"
                  : (stats?.month_earnings || 0).toLocaleString()}
              </p>
              {stats && stats.last_month_earnings > 0 && (
                <div
                  className={cn(
                    "flex items-center text-xs mt-2 font-medium",
                    monthChange >= 0 ? "text-blue-600" : "text-red-500",
                  )}
                >
                  {monthChange >= 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 mr-1" />
                  )}
                  {monthChange >= 0 ? "+" : ""}
                  {monthChange.toFixed(1)}% from last month
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Orders */}
          <Card className="stat-card relative overflow-hidden border-border/60">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 to-purple-600/3" />
            <CardHeader className="relative pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Active Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {statsLoading ? "—" : stats?.active_orders || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                In queue or printing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Print Queue */}
          <div className="lg:col-span-2">
            <Card className="border-border/60">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Print Queue
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Current jobs in progress and waiting
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchQueue}
                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                  </Button>
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
                        Type
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Details
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Position
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queue.length === 0 ? (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={5} className="text-center py-16">
                          <div className="flex flex-col items-center gap-2">
                            <div className="p-4 rounded-2xl bg-muted/40 mb-1">
                              <CheckCircle2 className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Queue is empty
                            </p>
                            <p className="text-xs text-muted-foreground/60">
                              New orders will appear here automatically
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      queue.map((job, index) => (
                        <TableRow
                          key={`${job.orderId}-${job.itemId}`}
                          className="border-border/40 hover:bg-muted/30 transition-colors"
                        >
                          <TableCell className="font-mono text-xs font-medium pl-6">
                            #{job.orderId.slice(0, 8)}
                          </TableCell>
                          <TableCell className="text-sm">Print Job</TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                "text-xs rounded-full font-semibold px-2.5",
                                job.status === "printing"
                                  ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                  : "bg-muted/60 text-muted-foreground border-border/60",
                              )}
                              variant="outline"
                            >
                              {job.status === "printing"
                                ? "Printing"
                                : "Queued"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                >
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>
                                    Job Details — #{job.orderId.slice(0, 8)}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Complete information for this print job
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-2">
                                  <div className="grid grid-cols-2 gap-3">
                                    {[
                                      { label: "Order ID", value: job.orderId },
                                      { label: "Item ID", value: job.itemId },
                                      {
                                        label: "Copies",
                                        value: String(job.copies),
                                      },
                                      {
                                        label: "Color Mode",
                                        value:
                                          job.colorMode === "bw"
                                            ? "Black & White"
                                            : "Color",
                                      },
                                      {
                                        label: "Pages/Sheet",
                                        value: String(job.pagesPerSheet),
                                      },
                                      {
                                        label: "Status",
                                        value:
                                          job.status === "printing"
                                            ? "Currently Printing"
                                            : `Position ${index + 1} in queue`,
                                      },
                                    ].map(({ label, value }) => (
                                      <div
                                        key={label}
                                        className="p-3 rounded-xl bg-muted/40"
                                      >
                                        <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                                          {label}
                                        </Label>
                                        <p className="text-sm mt-0.5 font-medium">
                                          {value}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="p-3 rounded-xl bg-muted/40">
                                    <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                                      File Path
                                    </Label>
                                    <p className="text-xs mt-0.5 text-muted-foreground break-all">
                                      {job.filePath}
                                    </p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {job.status === "printing"
                              ? "In Progress"
                              : `#${index + 1}`}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Printer Status Sidebar */}
          <div>
            <Card className="border-border/60">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Printer Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {printers.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="p-4 rounded-2xl bg-muted/40 inline-flex mb-3">
                        <Printer className="h-7 w-7 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        No printers registered
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/register-printer")}
                        className="text-xs"
                      >
                        Add Your First Printer
                      </Button>
                    </div>
                  ) : (
                    printers.map((printer: any) => (
                      <div
                        key={printer.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full flex-shrink-0",
                              printer.status === "online"
                                ? "bg-emerald-500 animate-pulse"
                                : printer.status === "error"
                                  ? "bg-red-500"
                                  : "bg-amber-500",
                            )}
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {printer.printer_name}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {printer.printer_type}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            printer.status === "online"
                              ? "default"
                              : printer.status === "error"
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-[10px] px-2 py-0.5 font-semibold capitalize flex-shrink-0 ml-2"
                        >
                          {printer.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
