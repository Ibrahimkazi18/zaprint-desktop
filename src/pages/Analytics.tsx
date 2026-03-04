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

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [viewMode, setViewMode] = useState<"table" | "graph">("table");
  const { shop } = useShopDashboard();

  // State for analytics data
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

  // Load all analytics data
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
      className={`flex items-center ${change >= 0 ? "text-green-600" : "text-red-600"}`}
    >
      {change >= 0 ? (
        <TrendingUp className="h-4 w-4 mr-1" />
      ) : (
        <TrendingDown className="h-4 w-4 mr-1" />
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
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

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

      toast.success("PDF report downloaded successfully!", {
        id: "export-pdf",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to generate PDF report", { id: "export-pdf" });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-10 w-48" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
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
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Track your business performance and insights
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={selectedPeriod === "7d" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("7d")}
              >
                7 Days
              </Button>
              <Button
                variant={selectedPeriod === "30d" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("30d")}
              >
                30 Days
              </Button>
              <Button
                variant={selectedPeriod === "90d" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("90d")}
              >
                90 Days
              </Button>
            </div>

            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(overview?.quarter_revenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatChange(
                  growthMetrics ? growthMetrics.mom_revenue_growth : 0,
                )}{" "}
                from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview?.quarter_orders || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatChange(
                  growthMetrics ? growthMetrics.mom_orders_growth : 0,
                )}{" "}
                from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview?.total_customers || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {overview?.active_customers_month || 0} active this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Job Value
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(overview?.avg_order_value || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {overview?.completion_rate || 0}% completion rate
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList>
            <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
            <TabsTrigger value="customers">Customer Insights</TabsTrigger>
            <TabsTrigger value="daily">Daily Trends</TabsTrigger>
            <TabsTrigger value="hourly">Peak Hours</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            {viewMode === "graph" ? (
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="relative">
                  <CardHeader>
                    <CardTitle>Monthly Revenue Trend</CardTitle>
                    <CardDescription>
                      Revenue and job count over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {monthlyRevenue.length > 0 ? (
                      <RevenueChart data={monthlyRevenue} />
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No revenue data available
                      </div>
                    )}
                  </CardContent>
                  <button
                    onClick={() => setViewMode("table")}
                    className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                    title="Switch to table view"
                  >
                    <LayoutList className="h-4 w-4" />
                  </button>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Breakdown</CardTitle>
                    <CardDescription>
                      Current period performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">This Month</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(overview?.month_revenue || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {overview?.month_orders || 0} jobs
                        </p>
                        {growthMetrics && (
                          <p
                            className={`text-sm ${growthMetrics.mom_revenue_growth >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {growthMetrics.mom_revenue_growth >= 0 ? "+" : ""}
                            {growthMetrics.mom_revenue_growth.toFixed(1)}% vs
                            last month
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">This Week</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(overview?.week_revenue || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {overview?.week_orders || 0} jobs
                        </p>
                        {growthMetrics && (
                          <p
                            className={`text-sm ${growthMetrics.wow_revenue_growth >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {growthMetrics.wow_revenue_growth >= 0 ? "+" : ""}
                            {growthMetrics.wow_revenue_growth.toFixed(1)}% vs
                            last week
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Today</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(overview?.today_revenue || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {overview?.today_orders || 0} jobs
                        </p>
                        {overview && overview.yesterday_revenue > 0 && (
                          <p
                            className={`text-sm ${
                              calculateChange(
                                overview.today_revenue,
                                overview.yesterday_revenue,
                              ) >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {calculateChange(
                              overview.today_revenue,
                              overview.yesterday_revenue,
                            ) >= 0
                              ? "+"
                              : ""}
                            {calculateChange(
                              overview.today_revenue,
                              overview.yesterday_revenue,
                            ).toFixed(1)}
                            % vs yesterday
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="relative">
                  <CardHeader>
                    <CardTitle>Monthly Revenue Trend</CardTitle>
                    <CardDescription>
                      Revenue and job count over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {monthlyRevenue.length > 0 ? (
                        monthlyRevenue.map((item, index) => {
                          const maxRevenue = Math.max(
                            ...monthlyRevenue.map((m) => m.total_revenue),
                          );
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-4 flex-1">
                                <div className="w-16 text-sm font-medium">
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
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-sm font-medium">
                                  {formatCurrency(item.total_revenue)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {item.order_count} jobs
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No revenue data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <button
                    onClick={() => setViewMode("graph")}
                    className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                    title="Switch to graph view"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </button>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Breakdown</CardTitle>
                    <CardDescription>
                      Current period performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">This Month</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(overview?.month_revenue || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {overview?.month_orders || 0} jobs
                        </p>
                        {growthMetrics && (
                          <p
                            className={`text-sm ${growthMetrics.mom_revenue_growth >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {growthMetrics.mom_revenue_growth >= 0 ? "+" : ""}
                            {growthMetrics.mom_revenue_growth.toFixed(1)}% vs
                            last month
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">This Week</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(overview?.week_revenue || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {overview?.week_orders || 0} jobs
                        </p>
                        {growthMetrics && (
                          <p
                            className={`text-sm ${growthMetrics.wow_revenue_growth >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {growthMetrics.wow_revenue_growth >= 0 ? "+" : ""}
                            {growthMetrics.wow_revenue_growth.toFixed(1)}% vs
                            last week
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Today</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(overview?.today_revenue || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {overview?.today_orders || 0} jobs
                        </p>
                        {overview && overview.yesterday_revenue > 0 && (
                          <p
                            className={`text-sm ${
                              calculateChange(
                                overview.today_revenue,
                                overview.yesterday_revenue,
                              ) >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {calculateChange(
                              overview.today_revenue,
                              overview.yesterday_revenue,
                            ) >= 0
                              ? "+"
                              : ""}
                            {calculateChange(
                              overview.today_revenue,
                              overview.yesterday_revenue,
                            ).toFixed(1)}
                            % vs yesterday
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <Card className="relative">
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>
                  Your most valuable customers by revenue and job count
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topCustomers.length > 0 ? (
                  viewMode === "graph" ? (
                    <CustomerChart data={topCustomers} />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Total Jobs</TableHead>
                          <TableHead>Total Revenue</TableHead>
                          <TableHead>Avg per Job</TableHead>
                          <TableHead>Last Order</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topCustomers.map((customer, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {customer.customer_name || "Unknown"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {customer.customer_phone || "N/A"}
                            </TableCell>
                            <TableCell>{customer.total_orders}</TableCell>
                            <TableCell>
                              {formatCurrency(customer.total_revenue)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(customer.avg_order_value)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatTimeAgo(customer.last_order_date)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No customer data available yet</p>
                  </div>
                )}
              </CardContent>
              <button
                onClick={() =>
                  setViewMode(viewMode === "graph" ? "table" : "graph")
                }
                className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                title={
                  viewMode === "graph"
                    ? "Switch to table view"
                    : "Switch to graph view"
                }
              >
                {viewMode === "graph" ? (
                  <LayoutList className="h-4 w-4" />
                ) : (
                  <BarChart3 className="h-4 w-4" />
                )}
              </button>
            </Card>
          </TabsContent>

          <TabsContent value="daily" className="space-y-6">
            <Card className="relative">
              <CardHeader>
                <CardTitle>Daily Performance</CardTitle>
                <CardDescription>
                  Average jobs and revenue by day of the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dailyPerformance.length > 0 ? (
                  viewMode === "graph" ? (
                    <DailyChart data={dailyPerformance} />
                  ) : (
                    <div className="space-y-4">
                      {dailyPerformance.map((day, index) => {
                        const maxOrders = Math.max(
                          ...dailyPerformance.map((d) => d.total_orders),
                        );
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center space-x-4 flex-1">
                              <div className="w-24 text-sm font-medium">
                                {day.day_name}
                              </div>
                              <div className="flex-1">
                                <div className="w-full bg-muted rounded-full h-3">
                                  <div
                                    className="bg-primary h-3 rounded-full transition-all"
                                    style={{
                                      width: `${(day.total_orders / maxOrders) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-sm font-medium">
                                {formatCurrency(day.total_revenue)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {day.total_orders} jobs
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No daily performance data available</p>
                  </div>
                )}
              </CardContent>
              <button
                onClick={() =>
                  setViewMode(viewMode === "graph" ? "table" : "graph")
                }
                className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                title={
                  viewMode === "graph"
                    ? "Switch to table view"
                    : "Switch to graph view"
                }
              >
                {viewMode === "graph" ? (
                  <LayoutList className="h-4 w-4" />
                ) : (
                  <BarChart3 className="h-4 w-4" />
                )}
              </button>
            </Card>
          </TabsContent>

          <TabsContent value="hourly" className="space-y-6">
            <Card className="relative">
              <CardHeader>
                <CardTitle>Peak Hours Analysis</CardTitle>
                <CardDescription>
                  Busiest hours of the day for your shop
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hourlyPerformance.length > 0 ? (
                  viewMode === "graph" ? (
                    <HourlyChart data={hourlyPerformance} />
                  ) : (
                    <div className="space-y-3">
                      {hourlyPerformance.map((hour, index) => {
                        const maxOrders = Math.max(
                          ...hourlyPerformance.map((h) => h.order_count),
                        );
                        const isPeakHour =
                          hour.order_count === maxOrders && maxOrders > 0;
                        return (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-3 border rounded-lg ${
                              isPeakHour
                                ? "bg-primary/5 border-primary"
                                : "hover:bg-muted/50"
                            } transition-colors`}
                          >
                            <div className="flex items-center space-x-4 flex-1">
                              <div className="w-20 text-sm font-medium flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                {hour.hour}:00
                              </div>
                              <div className="flex-1">
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      isPeakHour
                                        ? "bg-primary"
                                        : "bg-primary/60"
                                    }`}
                                    style={{
                                      width: `${(hour.order_count / maxOrders) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-sm font-medium">
                                {hour.order_count} orders
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatCurrency(hour.total_revenue)}
                              </div>
                            </div>
                            {isPeakHour && (
                              <Badge variant="default" className="ml-2">
                                Peak
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hourly performance data available</p>
                  </div>
                )}
              </CardContent>
              <button
                onClick={() =>
                  setViewMode(viewMode === "graph" ? "table" : "graph")
                }
                className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                title={
                  viewMode === "graph"
                    ? "Switch to table view"
                    : "Switch to graph view"
                }
              >
                {viewMode === "graph" ? (
                  <LayoutList className="h-4 w-4" />
                ) : (
                  <BarChart3 className="h-4 w-4" />
                )}
              </button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
