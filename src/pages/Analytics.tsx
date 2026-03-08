import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  BarChart3,
  Download,
  Clock,
  Target,
  LayoutList,
} from "lucide-react";
import {
  RevenueChart,
  DailyChart,
  HourlyChart,
  CustomerChart,
} from "@/components/ui/analytics-charts";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useShopDashboard } from "@/hooks/useShopDashboard";
import fetchAnalyticsOverview, {
  AnalyticsOverview,
} from "@/backend/analytics/fetchAnalyticsOverview";
import fetchMonthlyRevenue, {
  MonthlyRevenue,
} from "@/backend/analytics/fetchMonthlyRevenue";
import fetchTopCustomers, {
  TopCustomer,
} from "@/backend/analytics/fetchTopCustomers";
import fetchDailyPerformance, {
  DailyPerformance,
} from "@/backend/analytics/fetchDailyPerformance";
import fetchGrowthMetrics, {
  GrowthMetrics,
} from "@/backend/analytics/fetchGrowthMetrics";
import fetchHourlyPerformance, {
  HourlyPerformance,
} from "@/backend/analytics/fetchHourlyPerformance";
import toast from "react-hot-toast";
import { exportAnalyticsPDF } from "@/utils/exportAnalyticsPDF";
import { cn } from "@/lib/utils";

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [viewMode, setViewMode] = useState<"table" | "graph">("table");
  const { shop } = useShopDashboard();

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [dailyPerformance, setDailyPerformance] = useState<DailyPerformance[]>(
    [],
  );
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetrics | null>(
    null,
  );
  const [hourlyPerformance, setHourlyPerformance] = useState<
    HourlyPerformance[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!shop?.id) return;
      try {
        setLoading(true);
        const [
          overviewData,
          monthlyData,
          customersData,
          dailyData,
          growthData,
          hourlyData,
        ] = await Promise.all([
          fetchAnalyticsOverview(shop.id),
          fetchMonthlyRevenue(
            shop.id,
            selectedPeriod === "30d" ? 6 : selectedPeriod === "90d" ? 12 : 3,
          ),
          fetchTopCustomers(shop.id, 10),
          fetchDailyPerformance(shop.id),
          fetchGrowthMetrics(shop.id),
          fetchHourlyPerformance(shop.id),
        ]);
        setOverview(overviewData);
        setMonthlyRevenue(monthlyData);
        setTopCustomers(customersData);
        setDailyPerformance(dailyData);
        setGrowthMetrics(growthData);
        setHourlyPerformance(hourlyData);
      } catch (error) {
        console.error("Error loading analytics:", error);
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, [shop?.id, selectedPeriod]);

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  const formatChange = (change: number) => (
    <span
      className={cn(
        "flex items-center text-xs font-medium",
        change >= 0 ? "text-emerald-600" : "text-red-500",
      )}
    >
      {change >= 0 ? (
        <TrendingUp className="h-3.5 w-3.5 mr-1" />
      ) : (
        <TrendingDown className="h-3.5 w-3.5 mr-1" />
      )}
      {Math.abs(change).toFixed(1)}%
    </span>
  );

  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const handleExportPDF = () => {
    if (!shop?.shop_name) {
      toast.error("Shop information not available");
      return;
    }
    try {
      toast.loading("Generating PDF report...", { id: "export-pdf" });
      exportAnalyticsPDF({
        shopName: shop.shop_name,
        overview,
        monthlyRevenue,
        topCustomers,
        dailyPerformance,
        growthMetrics,
        hourlyPerformance,
        period:
          selectedPeriod === "7d"
            ? "Last 7 Days"
            : selectedPeriod === "30d"
              ? "Last 30 Days"
              : "Last 90 Days",
      });
      toast.success("PDF report downloaded!", { id: "export-pdf" });
    } catch (error) {
      toast.error("Failed to generate PDF", { id: "export-pdf" });
    }
  };

  const ViewToggle = ({ onToggle }: { onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className="absolute bottom-3 right-3 p-2 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
      title={
        viewMode === "graph" ? "Switch to table view" : "Switch to graph view"
      }
    >
      {viewMode === "graph" ? (
        <LayoutList className="h-3.5 w-3.5" />
      ) : (
        <BarChart3 className="h-3.5 w-3.5" />
      )}
    </button>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-6 py-8 animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-5 w-80" />
            </div>
            <Skeleton className="h-10 w-48" />
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="stat-card">
                <CardHeader>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </CardHeader>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full rounded-xl" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8 animate-slide-up">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Track your business performance and insights
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Pill period selector */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-muted/50 border border-border/60">
              {[
                { value: "7d", label: "7 Days" },
                { value: "30d", label: "30 Days" },
                { value: "90d", label: "90 Days" },
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={cn(
                    "period-pill",
                    selectedPeriod === period.value && "active",
                  )}
                >
                  {period.label}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="h-9 gap-1.5 text-sm"
            >
              <Download className="h-3.5 w-3.5" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* ── Overview Stat Cards ── */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Revenue */}
          <Card className="stat-card relative overflow-hidden border-border/60">
            <div className="absolute inset-0 bg-emerald-500 opacity-[0.03]" />
            <CardHeader className="flex flex-row items-start justify-between pb-2 relative">
              <div>
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Revenue
                </CardTitle>
                <p className="text-2xl font-bold mt-1.5 text-foreground">
                  {formatCurrency(overview?.quarter_revenue || 0)}
                </p>
                <div className="mt-1.5">
                  {formatChange(
                    growthMetrics ? growthMetrics.mom_revenue_growth : 0,
                  )}
                  <span className="text-[10px] text-muted-foreground ml-1">
                    vs last month
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 flex-shrink-0">
                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
          </Card>

          {/* Total Jobs */}
          <Card className="stat-card relative overflow-hidden border-border/60">
            <div className="absolute inset-0 bg-blue-500 opacity-[0.03]" />
            <CardHeader className="flex flex-row items-start justify-between pb-2 relative">
              <div>
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Jobs
                </CardTitle>
                <p className="text-2xl font-bold mt-1.5">
                  {overview?.quarter_orders || 0}
                </p>
                <div className="mt-1.5">
                  {formatChange(
                    growthMetrics ? growthMetrics.mom_orders_growth : 0,
                  )}
                  <span className="text-[10px] text-muted-foreground ml-1">
                    vs last month
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-500/10 flex-shrink-0">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
          </Card>

          {/* Total Customers */}
          <Card className="stat-card relative overflow-hidden border-border/60">
            <div className="absolute inset-0 bg-purple-500 opacity-[0.03]" />
            <CardHeader className="flex flex-row items-start justify-between pb-2 relative">
              <div>
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Customers
                </CardTitle>
                <p className="text-2xl font-bold mt-1.5">
                  {overview?.total_customers || 0}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  {overview?.active_customers_month || 0} active this month
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-500/10 flex-shrink-0">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
          </Card>

          {/* Avg Job Value */}
          <Card className="stat-card relative overflow-hidden border-border/60">
            <div className="absolute inset-0 bg-orange-500 opacity-[0.03]" />
            <CardHeader className="flex flex-row items-start justify-between pb-2 relative">
              <div>
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Avg Job Value
                </CardTitle>
                <p className="text-2xl font-bold mt-1.5">
                  {formatCurrency(overview?.avg_order_value || 0)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  {overview?.completion_rate || 0}% completion rate
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-orange-500/10 flex-shrink-0">
                <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="h-11 p-1 rounded-xl bg-muted/50 border border-border/60">
            <TabsTrigger
              value="revenue"
              className="rounded-lg text-sm font-medium"
            >
              Revenue Analysis
            </TabsTrigger>
            <TabsTrigger
              value="customers"
              className="rounded-lg text-sm font-medium"
            >
              Customer Insights
            </TabsTrigger>
            <TabsTrigger
              value="daily"
              className="rounded-lg text-sm font-medium"
            >
              Daily Trends
            </TabsTrigger>
            <TabsTrigger
              value="hourly"
              className="rounded-lg text-sm font-medium"
            >
              Peak Hours
            </TabsTrigger>
          </TabsList>

          {/* ── Revenue Tab ── */}
          <TabsContent value="revenue" className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Card className="relative border-border/60">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">
                    Monthly Revenue Trend
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Revenue and job count over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {viewMode === "graph" ? (
                    monthlyRevenue.length > 0 ? (
                      <RevenueChart data={monthlyRevenue} />
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No revenue data available
                      </div>
                    )
                  ) : (
                    <div className="space-y-3">
                      {monthlyRevenue.length > 0 ? (
                        monthlyRevenue.map((item, index) => {
                          const maxRevenue = Math.max(
                            ...monthlyRevenue.map((m) => m.total_revenue),
                          );
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-4"
                            >
                              <div className="w-12 text-xs font-semibold text-muted-foreground flex-shrink-0">
                                {item.month_label.split(" ")[0]}
                              </div>
                              <div className="flex-1">
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{
                                      width: `${(item.total_revenue / maxRevenue) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 w-24">
                                <div className="text-xs font-semibold">
                                  {formatCurrency(item.total_revenue)}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                  {item.order_count} jobs
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No revenue data available
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <ViewToggle
                  onToggle={() =>
                    setViewMode(viewMode === "graph" ? "table" : "graph")
                  }
                />
              </Card>

              <Card className="border-border/60">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">
                    Revenue Breakdown
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Current period performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      label: "This Month",
                      revenue: overview?.month_revenue || 0,
                      orders: overview?.month_orders || 0,
                      change: growthMetrics
                        ? growthMetrics.mom_revenue_growth
                        : null,
                      vsLabel: "vs last month",
                    },
                    {
                      label: "This Week",
                      revenue: overview?.week_revenue || 0,
                      orders: overview?.week_orders || 0,
                      change: growthMetrics
                        ? growthMetrics.wow_revenue_growth
                        : null,
                      vsLabel: "vs last week",
                    },
                    {
                      label: "Today",
                      revenue: overview?.today_revenue || 0,
                      orders: overview?.today_orders || 0,
                      change:
                        overview && overview.yesterday_revenue > 0
                          ? calculateChange(
                              overview.today_revenue,
                              overview.yesterday_revenue,
                            )
                          : null,
                      vsLabel: "vs yesterday",
                    },
                  ].map(({ label, revenue, orders, change, vsLabel }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">
                          {label}
                        </p>
                        <p className="text-xl font-bold mt-0.5">
                          {formatCurrency(revenue)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {orders} jobs
                        </p>
                        {change !== null && (
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            <span
                              className={cn(
                                "text-xs font-medium",
                                change >= 0
                                  ? "text-emerald-600"
                                  : "text-red-500",
                              )}
                            >
                              {change >= 0 ? "+" : ""}
                              {change.toFixed(1)}%
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {vsLabel}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Customers Tab ── */}
          <TabsContent value="customers" className="space-y-5">
            <Card className="relative border-border/60">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-base font-semibold">
                  Top Customers
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Your most valuable customers by revenue and job count
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {topCustomers.length > 0 ? (
                  viewMode === "graph" ? (
                    <div className="p-6">
                      <CustomerChart data={topCustomers} />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                          <TableHead className="text-xs font-semibold pl-6">
                            Customer
                          </TableHead>
                          <TableHead className="text-xs font-semibold">
                            Contact
                          </TableHead>
                          <TableHead className="text-xs font-semibold">
                            Total Jobs
                          </TableHead>
                          <TableHead className="text-xs font-semibold">
                            Total Revenue
                          </TableHead>
                          <TableHead className="text-xs font-semibold">
                            Avg / Job
                          </TableHead>
                          <TableHead className="text-xs font-semibold">
                            Last Order
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topCustomers.map((customer, index) => (
                          <TableRow
                            key={index}
                            className="border-border/40 hover:bg-muted/30 transition-colors"
                          >
                            <TableCell className="font-semibold text-sm pl-6">
                              {customer.customer_name || "Unknown"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {customer.customer_phone || "N/A"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {customer.total_orders}
                            </TableCell>
                            <TableCell className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(customer.total_revenue)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatCurrency(customer.avg_order_value)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className="text-[10px] rounded-full"
                              >
                                {formatTimeAgo(customer.last_order_date)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )
                ) : (
                  <div className="text-center py-16">
                    <div className="inline-flex p-5 rounded-2xl bg-muted/40 mb-4">
                      <Users className="h-9 w-9 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No customer data available yet
                    </p>
                  </div>
                )}
              </CardContent>
              <ViewToggle
                onToggle={() =>
                  setViewMode(viewMode === "graph" ? "table" : "graph")
                }
              />
            </Card>
          </TabsContent>

          {/* ── Daily Tab ── */}
          <TabsContent value="daily" className="space-y-5">
            <Card className="relative border-border/60">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">
                  Daily Performance
                </CardTitle>
                <CardDescription className="text-xs">
                  Average jobs and revenue by day of the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dailyPerformance.length > 0 ? (
                  viewMode === "graph" ? (
                    <DailyChart data={dailyPerformance} />
                  ) : (
                    <div className="space-y-2">
                      {dailyPerformance.map((day, index) => {
                        const maxOrders = Math.max(
                          ...dailyPerformance.map((d) => d.total_orders),
                        );
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-3 rounded-xl border border-border/40 hover:bg-muted/30 transition-colors"
                          >
                            <div className="w-24 text-sm font-semibold flex-shrink-0">
                              {day.day_name}
                            </div>
                            <div className="flex-1">
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{
                                    width: `${(day.total_orders / maxOrders) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 w-28">
                              <div className="text-xs font-semibold">
                                {formatCurrency(day.total_revenue)}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {day.total_orders} jobs
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex p-4 rounded-2xl bg-muted/40 mb-3">
                      <BarChart3 className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No daily performance data available
                    </p>
                  </div>
                )}
              </CardContent>
              <ViewToggle
                onToggle={() =>
                  setViewMode(viewMode === "graph" ? "table" : "graph")
                }
              />
            </Card>
          </TabsContent>

          {/* ── Hourly Tab ── */}
          <TabsContent value="hourly" className="space-y-5">
            <Card className="relative border-border/60">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">
                  Peak Hours Analysis
                </CardTitle>
                <CardDescription className="text-xs">
                  Busiest hours of the day for your shop
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hourlyPerformance.length > 0 ? (
                  viewMode === "graph" ? (
                    <HourlyChart data={hourlyPerformance} />
                  ) : (
                    <div className="space-y-2">
                      {hourlyPerformance.map((hour, index) => {
                        const maxOrders = Math.max(
                          ...hourlyPerformance.map((h) => h.order_count),
                        );
                        const isPeak =
                          hour.order_count === maxOrders && maxOrders > 0;
                        return (
                          <div
                            key={index}
                            className={cn(
                              "flex items-center gap-4 p-3 rounded-xl border transition-colors",
                              isPeak
                                ? "bg-primary/5 border-primary/30"
                                : "border-border/40 hover:bg-muted/30",
                            )}
                          >
                            <div className="w-20 text-sm font-semibold flex-shrink-0 flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              {hour.hour}:00
                            </div>
                            <div className="flex-1">
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className={cn(
                                    "h-2 rounded-full transition-all",
                                    isPeak ? "bg-primary" : "bg-primary/50",
                                  )}
                                  style={{
                                    width: `${(hour.order_count / maxOrders) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 w-24">
                              <div className="text-xs font-semibold">
                                {hour.order_count} orders
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {formatCurrency(hour.total_revenue)}
                              </div>
                            </div>
                            {isPeak && (
                              <Badge
                                variant="default"
                                className="text-[10px] rounded-full flex-shrink-0"
                              >
                                Peak
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex p-4 rounded-2xl bg-muted/40 mb-3">
                      <Clock className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No hourly performance data available
                    </p>
                  </div>
                )}
              </CardContent>
              <ViewToggle
                onToggle={() =>
                  setViewMode(viewMode === "graph" ? "table" : "graph")
                }
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
