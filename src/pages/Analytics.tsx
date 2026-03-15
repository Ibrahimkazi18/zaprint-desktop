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
import { exportAnalyticsPDF, type ExportType } from "@/utils/exportAnalyticsPDF";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";


// Reusable Paginated Table Component
const PaginatedTable = ({ data, columns, itemsPerPage = 5 }: any) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
  const startIndex = (page - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  // Reset page if data length changes drastically
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 overflow-hidden bg-background/30">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-border/60">
              {columns.map((col: any, i: number) => (
                <TableHead key={i} className={col.className}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((row: any, i: number) => (
                <TableRow key={i} className="border-border/40 hover:bg-muted/30 transition-colors">
                  {columns.map((col: any, j: number) => (
                    <TableCell key={j} className={col.className}>{col.cell(row)}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center h-24 text-muted-foreground">
                  No data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{startIndex + 1}</span> to <span className="font-medium text-foreground">{Math.min(startIndex + itemsPerPage, data.length)}</span> of <span className="font-medium text-foreground">{data.length}</span> entries
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-border/60 hover:bg-muted/50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-border/60 hover:bg-muted/50"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
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

  // Export Dialog State
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportType, setExportType] = useState<ExportType>("lightweight");
  const [exportPeriod, setExportPeriod] = useState("30d");
  const [isExporting, setIsExporting] = useState(false);
  const [exportData, setExportData] = useState<{
    monthly: MonthlyRevenue[];
    customers: TopCustomer[];
    daily: DailyPerformance[];
    hourly: HourlyPerformance[];
  } | null>(null);

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

  const processExport = async () => {
    if (!shop?.id) {
      toast.error("Shop information not available");
      return;
    }

    try {
      setIsExporting(true);
      toast.loading("Generating premium PDF report...", { id: "export-pdf" });

      // If the user selected a different period for the export, fetch that specific data
      let exportOverview = overview;
      let exportMonthly = monthlyRevenue;
      let exportCustomers = topCustomers;
      let exportDaily = dailyPerformance;
      let exportGrowth = growthMetrics;
      let exportHourly = hourlyPerformance;

      if (exportPeriod !== selectedPeriod) {
        toast.loading("Fetching historical data...", { id: "export-pdf" });
        const [o, m, c, d, g, h] = await Promise.all([
          fetchAnalyticsOverview(shop.id),
          fetchMonthlyRevenue(shop.id, exportPeriod === "30d" ? 6 : exportPeriod === "90d" ? 12 : 3),
          fetchTopCustomers(shop.id, 10),
          fetchDailyPerformance(shop.id),
          fetchGrowthMetrics(shop.id),
          fetchHourlyPerformance(shop.id),
        ]);
        exportOverview = o;
        exportMonthly = m;
        exportCustomers = c;
        exportDaily = d;
        exportGrowth = g;
        exportHourly = h;
      }

      // Collect Chart Images if Heavyweight
      let chartImages = {};
      if (exportType === "heavyweight") {
        toast.loading("Rendering high-quality charts...", { id: "export-pdf" });
        
        // Render export charts specially with the requested period's data
        setExportData({
          monthly: exportMonthly,
          customers: exportCustomers,
          daily: exportDaily,
          hourly: exportHourly,
        });

        // Delay to allow Chart.js to mount and run its initial animation
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const getChartImage = (containerId: string) => {
          const container = document.getElementById(containerId);
          if (!container) return undefined;
          const canvas = container.querySelector('canvas');
          return canvas ? canvas.toDataURL("image/png", 1.0) : undefined;
        };

        chartImages = {
          revenue: getChartImage('export-revenue-chart'),
          customers: getChartImage('export-customers-chart'),
          daily: getChartImage('export-daily-chart'),
          hourly: getChartImage('export-hourly-chart')
        };

        // Clean up the hidden charts
        setExportData(null);
      }

      toast.loading("Assembling document...", { id: "export-pdf" });

      exportAnalyticsPDF({
        shopName: shop.shop_name,
        overview: exportOverview,
        monthlyRevenue: exportMonthly,
        topCustomers: exportCustomers,
        dailyPerformance: exportDaily,
        growthMetrics: exportGrowth,
        hourlyPerformance: exportHourly,
      }, {
        type: exportType,
        period: exportPeriod === "7d" ? "Last 7 Days" : exportPeriod === "30d" ? "Last 30 Days" : "Last 90 Days",
        chartImages
      });

      toast.success("PDF report downloaded perfectly!", { id: "export-pdf" });
      setIsExportOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF", { id: "export-pdf" });
    } finally {
      setIsExporting(false);
    }
  }; if (loading) {
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
              variant="default"
              size="sm"
              onClick={() => {
                setExportPeriod(selectedPeriod);
                setIsExportOpen(true);
              }}
              className="h-9 gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <Download className="h-4 w-4" />
              Generate Report
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
        <Tabs defaultValue="revenue" className="space-y-8">
          {/* Enhanced Horizontal Scrollable Tabs */}
          <div className="relative border-b border-border/60">
            <TabsList className="bg-transparent h-auto p-0 flex space-x-8 overflow-x-auto no-scrollbar w-full justify-start rounded-none">
              {[
                { value: "revenue", label: "Revenue Analysis", icon: DollarSign },
                { value: "customers", label: "Customer Insights", icon: Users },
                { value: "daily", label: "Daily Trends", icon: TrendingUp },
                { value: "hourly", label: "Peak Hours", icon: Clock },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="relative rounded-none border-b-2 border-transparent px-2 pb-4 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground"
                >
                  <div className="flex items-center gap-2">
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── Revenue Tab ── */}
          <TabsContent value="revenue" className="space-y-6 animate-fade-in">
            {/* Chart Graph */}
            <Card className="border-border/60 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">Monthly Revenue Trend</CardTitle>
                <CardDescription>Graphical representation of income and operations over time</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {monthlyRevenue.length > 0 ? (
                  <div id="revenue-chart-container" className="p-2 rounded-xl border border-border/40 bg-background/50">
                    <RevenueChart data={monthlyRevenue} />
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground text-sm border border-dashed rounded-xl border-border/60">
                    No revenue data available for this defined period.
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="md:col-span-2 border-border/60 shadow-md rounded-2xl overflow-hidden">
                <CardHeader className="pb-4 bg-muted/20">
                  <CardTitle className="text-lg font-bold">Detailed Records</CardTitle>
                  <CardDescription>Tabular data view of monthly revenue performance</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <PaginatedTable
                    data={monthlyRevenue}
                    itemsPerPage={5}
                    columns={[
                      { header: "Month", cell: (r: any) => <span className="font-semibold">{r.month_label}</span> },
                      { header: "Total Revenue", cell: (r: any) => <span className="text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(r.total_revenue)}</span> },
                      { header: "Jobs Completed", cell: (r: any) => r.order_count },
                      {
                        header: "Avg Value / Job",
                        cell: (r: any) => r.order_count ? formatCurrency(r.total_revenue / r.order_count) : formatCurrency(0)
                      },
                    ]}
                  />
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-md rounded-2xl h-fit">
                <CardHeader className="pb-4 border-b border-border/40">
                  <CardTitle className="text-lg font-bold">Growth Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-4">
                  {[
                    { label: "This Month", revenue: overview?.month_revenue || 0, orders: overview?.month_orders || 0, change: growthMetrics?.mom_revenue_growth, vsLabel: "vs last month" },
                    { label: "This Week", revenue: overview?.week_revenue || 0, orders: overview?.week_orders || 0, change: growthMetrics?.wow_revenue_growth, vsLabel: "vs last week" },
                    { label: "Today", revenue: overview?.today_revenue || 0, orders: overview?.today_orders || 0, change: overview && overview.yesterday_revenue > 0 ? calculateChange(overview.today_revenue, overview.yesterday_revenue) : null, vsLabel: "vs yesterday" },
                  ].map(({ label, revenue, orders, change, vsLabel }) => (
                    <div key={label} className="p-4 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors">
                      <p className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">{label}</p>
                      <p className="text-xl font-bold mt-1 text-foreground">{formatCurrency(revenue)}</p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-muted-foreground">{orders} jobs</p>
                        {change !== null && change !== undefined && (
                          <div className="flex flex-col items-end">
                            <span className={cn("text-xs font-bold", change >= 0 ? "text-emerald-600" : "text-red-500")}>
                              {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                            </span>
                            <span className="text-[9px] text-muted-foreground uppercase">{vsLabel}</span>
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
          <TabsContent value="customers" className="space-y-6 animate-fade-in">
            <Card className="border-border/60 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">Top Customers Overview</CardTitle>
                <CardDescription>Most valuable clients by revenue and job count</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {topCustomers.length > 0 ? (
                  <div id="customers-chart-container" className="p-2 rounded-xl border border-border/40 bg-background/50">
                    <CustomerChart data={topCustomers} />
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl border-border/60">
                    <Users className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    No customer data available yet
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-4 bg-muted/20">
                <CardTitle className="text-lg font-bold">Client Directory</CardTitle>
                <CardDescription>Ranked tabular view of your customer base</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {topCustomers.length > 0 ? (
                  <PaginatedTable
                    data={topCustomers}
                    itemsPerPage={10}
                    columns={[
                      { header: "Customer Name", cell: (r: any) => <span className="font-semibold">{r.customer_name || "Unknown"}</span> },
                      { header: "Contact", cell: (r: any) => <span className="text-muted-foreground text-sm">{r.customer_phone || "N/A"}</span> },
                      { header: "Total Jobs", cell: (r: any) => <Badge variant="secondary">{r.total_orders}</Badge> },
                      { header: "Total Revenue", cell: (r: any) => <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(r.total_revenue)}</span> },
                      { header: "Avg / Job", cell: (r: any) => <span className="text-sm">{formatCurrency(r.avg_order_value)}</span> },
                      { header: "Last Order", cell: (r: any) => <span className="text-xs text-muted-foreground">{formatTimeAgo(r.last_order_date)}</span> },
                    ]}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-xl border-border/60">
                    No customer data available.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Daily Tab ── */}
          <TabsContent value="daily" className="space-y-6 animate-fade-in">
            <Card className="border-border/60 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">Daily Performance Trends</CardTitle>
                <CardDescription>Average jobs and revenue indexed by the day of the week</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {dailyPerformance.length > 0 ? (
                  <div id="daily-chart-container" className="p-2 rounded-xl border border-border/40 bg-background/50">
                    <DailyChart data={dailyPerformance} />
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl border-border/60">
                    <TrendingUp className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    No daily performance data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-4 bg-muted/20">
                <CardTitle className="text-lg font-bold">Daily Metrics</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <PaginatedTable
                  data={dailyPerformance}
                  itemsPerPage={7}
                  columns={[
                    { header: "Day", cell: (r: any) => <span className="font-semibold">{r.day_name}</span> },
                    { header: "Average Revenue", cell: (r: any) => <span className="text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(r.total_revenue)}</span> },
                    { header: "Average Jobs", cell: (r: any) => r.total_orders },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Hourly Tab ── */}
          <TabsContent value="hourly" className="space-y-6 animate-fade-in">
            <Card className="border-border/60 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">Peak Hours Analysis</CardTitle>
                <CardDescription>Busiest hours throughout the operational day</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {hourlyPerformance.length > 0 ? (
                  <div id="hourly-chart-container" className="p-2 rounded-xl border border-border/40 bg-background/50">
                    <HourlyChart data={hourlyPerformance} />
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl border-border/60">
                    <Clock className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    No hourly data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-4 bg-muted/20">
                <CardTitle className="text-lg font-bold">Hourly Metrics</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <PaginatedTable
                  data={hourlyPerformance}
                  itemsPerPage={8}
                  columns={[
                    {
                      header: "Time", cell: (r: any) => (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-semibold">{r.hour}:00</span>
                        </div>
                      )
                    },
                    {
                      header: "Orders Handled", cell: (r: any) => {
                        const maxOrders = Math.max(...hourlyPerformance.map((h: any) => h.order_count));
                        const isPeak = r.order_count === maxOrders && maxOrders > 0;
                        return (
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{r.order_count}</span>
                            {isPeak && <Badge variant="default" className="text-[10px] h-5 rounded-full px-2">Peak</Badge>}
                          </div>
                        )
                      }
                    },
                    { header: "Total Revenue Generated", cell: (r: any) => <span className="font-bold text-amber-500">{formatCurrency(r.total_revenue)}</span> },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ── Export Export Dialog ── */}
        <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
          <DialogContent className="sm:max-w-[450px] border-border/40 bg-card backdrop-blur-xl shadow-2xl">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-xl dark:text-white">Generate Analytics Report</DialogTitle>
              <DialogDescription>
                Customize how your insights are exported to PDF.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="space-y-3">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Report Format</Label>
                <RadioGroup value={exportType} onValueChange={(v: ExportType) => setExportType(v)} className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <RadioGroupItem value="lightweight" id="lightweight" className="peer sr-only" />
                    <Label
                      htmlFor="lightweight"
                      className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-border/40 bg-muted/20 p-4 hover:bg-muted/40 transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer text-muted-foreground peer-data-[state=checked]:text-primary peer-data-[state=checked]:shadow-sm"
                    >
                      <FileText className="h-7 w-7 mb-1" />
                      <div className="font-semibold text-sm text-foreground">Lightweight</div>
                      <div className="text-[11px] text-center opacity-70">Tables & Summaries</div>
                    </Label>
                  </div>
                  <div className="relative">
                    <RadioGroupItem value="heavyweight" id="heavyweight" className="peer sr-only" />
                    <Label
                      htmlFor="heavyweight"
                      className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-border/40 bg-muted/20 p-4 hover:bg-muted/40 transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer text-muted-foreground peer-data-[state=checked]:text-primary peer-data-[state=checked]:shadow-sm"
                    >
                      <BarChart3 className="h-7 w-7 mb-1" />
                      <div className="font-semibold text-sm text-foreground">Heavyweight</div>
                      <div className="text-[11px] text-center opacity-70">High-Res Charts & Tables</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Data Period</Label>
                <Select value={exportPeriod} onValueChange={setExportPeriod}>
                  <SelectTrigger className="w-full h-[42px] rounded-xl bg-muted/30 border-border/40 hover:bg-muted/50 transition-colors text-foreground">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border/60">
                    <SelectItem value="7d" className="rounded-lg cursor-pointer">Last 7 Days (Short Term)</SelectItem>
                    <SelectItem value="30d" className="rounded-lg cursor-pointer">Last 30 Days (Monthly)</SelectItem>
                    <SelectItem value="90d" className="rounded-lg cursor-pointer">Last 90 Days (Quarterly)</SelectItem>
                  </SelectContent>
                </Select>
                {exportPeriod !== selectedPeriod && (
                  <p className="text-[11px] text-orange-500 flex items-center gap-1.5 mt-2 font-medium">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Historical data will be fetched for this export.
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={() => setIsExportOpen(false)} disabled={isExporting} className="rounded-xl h-10 border-border/50 hover:bg-muted/50 dark:text-white">
                Cancel
              </Button>
              <Button
                onClick={processExport}
                disabled={isExporting}
                className="rounded-xl px-8 h-10 shadow-md gap-2"
              >
                {isExporting ? "Generating..." : "Download PDF"}
                {!isExporting && <Download className="h-4 w-4" />}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Hidden Export Charts for PDF Generation */}
        {exportData && (
          <div className="fixed top-[-9999px] left-[-9999px] w-[900px] pointer-events-none opacity-0">
            <div id="export-revenue-chart" className="bg-background p-4">
              <RevenueChart data={exportData.monthly} />
            </div>
            <div id="export-customers-chart" className="bg-background p-4">
              <CustomerChart data={exportData.customers} />
            </div>
            <div id="export-daily-chart" className="bg-background p-4">
              <DailyChart data={exportData.daily} />
            </div>
            <div id="export-hourly-chart" className="bg-background p-4">
              <HourlyChart data={exportData.hourly} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}