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
import fetchDashboardStats, { DashboardStats } from "@/backend/dashboard/fetchDashboardStats";

export default function Dashboard() {
  const navigate = useNavigate();

  const { shop, printers, loading } = useShopDashboard();
  const { addJob: addToQueue } = usePrintQueue(printers, {
    detectSystemPrinters: false,
  });
  const queue = useLiveQueue();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Load dashboard stats
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
    // Queue is now live and updates automatically
    console.log("Queue is live - no manual refresh needed");
  };

  // Calculate percentage changes
  const todayChange = stats && stats.yesterday_earnings > 0
    ? ((stats.today_earnings - stats.yesterday_earnings) / stats.yesterday_earnings) * 100
    : 0;
    
  const monthChange = stats && stats.last_month_earnings > 0
    ? ((stats.month_earnings - stats.last_month_earnings) / stats.last_month_earnings) * 100
    : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          {/* Welcome Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-5 w-96" />
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Financial Overview Skeleton */}
          <div className="grid gap-6 md:grid-cols-3">
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

          {/* Main Content Skeleton */}
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
            <p className="text-muted-foreground mt-2">
              Here's what's happening with your print shop today.
            </p>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Shop Status Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Shop Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    {printers.some((p) => p.status === "online") ? (
                      <>
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                        <p className="text-2xl font-bold text-emerald-600">
                          Online
                        </p>
                      </>
                    ) : printers.some((p) => p.status === "error") ? (
                      <>
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <p className="text-2xl font-bold text-red-600">Error</p>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        <p className="text-2xl font-bold text-amber-600">
                          Offline
                        </p>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {printers.filter((p) => p.status === "online").length} of{" "}
                    {printers.length} printers active
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Printer className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {statsLoading ? "..." : stats?.today_orders || 0}
                  </p>
                  {stats && stats.yesterday_orders > 0 && (
                    <div className={`flex items-center text-sm mt-1 ${
                      stats.today_orders >= stats.yesterday_orders ? "text-emerald-600" : "text-red-600"
                    }`}>
                      {stats.today_orders >= stats.yesterday_orders ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {stats.today_orders >= stats.yesterday_orders ? "+" : ""}
                      {stats.today_orders - stats.yesterday_orders} from yesterday
                    </div>
                  )}
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/pending-orders")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {statsLoading ? "..." : stats?.pending_orders || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ready for pickup
                  </p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-full">
                  <Package className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {statsLoading ? "..." : stats?.active_customers_week || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This week
                  </p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5"></div>
            <CardHeader className="relative">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Today's Earnings
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-3xl font-bold text-emerald-600">
                ₹{statsLoading ? "..." : (stats?.today_earnings || 0).toLocaleString()}
              </p>
              {stats && stats.yesterday_earnings > 0 && (
                <div className={`flex items-center text-sm mt-2 ${
                  todayChange >= 0 ? "text-emerald-600" : "text-red-600"
                }`}>
                  {todayChange >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {todayChange >= 0 ? "+" : ""}{todayChange.toFixed(1)}% from yesterday
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5"></div>
            <CardHeader className="relative">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-3xl font-bold text-blue-600">
                ₹{statsLoading ? "..." : (stats?.month_earnings || 0).toLocaleString()}
              </p>
              {stats && stats.last_month_earnings > 0 && (
                <div className={`flex items-center text-sm mt-2 ${
                  monthChange >= 0 ? "text-blue-600" : "text-red-600"
                }`}>
                  {monthChange >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {monthChange >= 0 ? "+" : ""}{monthChange.toFixed(1)}% from last month
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5"></div>
            <CardHeader className="relative">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Active Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-3xl font-bold text-purple-600">
                {statsLoading ? "..." : stats?.active_orders || 0}
              </p>
              <p className="text-sm text-purple-600 mt-2">
                In queue or printing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Print Queue */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Print Queue</CardTitle>
                    <CardDescription>
                      Current jobs in progress and waiting
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchQueue}
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Job Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>ETA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queue.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <p className="text-muted-foreground">
                            No jobs in queue
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Orders will appear here automatically
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      queue.map((job, index) => (
                        <TableRow
                          key={`${job.orderId}-${job.itemId}`}
                          className="hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            Order #{job.orderId.slice(0, 8)}
                          </TableCell>
                          <TableCell>Print Job</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                job.status === "printing"
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {job.status === "printing"
                                ? "Printing"
                                : "Queued"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>
                                    Job Details - {job.orderId.slice(0, 8)}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Complete information for this print job
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">
                                        Order ID
                                      </Label>
                                      <p className="text-sm text-muted-foreground">
                                        {job.orderId}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">
                                        Item ID
                                      </Label>
                                      <p className="text-sm text-muted-foreground">
                                        {job.itemId}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">
                                        Copies
                                      </Label>
                                      <p className="text-sm text-muted-foreground">
                                        {job.copies}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">
                                        Color Mode
                                      </Label>
                                      <p className="text-sm text-muted-foreground">
                                        {job.colorMode === "bw"
                                          ? "Black & White"
                                          : "Color"}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">
                                        Pages Per Sheet
                                      </Label>
                                      <p className="text-sm text-muted-foreground">
                                        {job.pagesPerSheet}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">
                                        Status
                                      </Label>
                                      <p className="text-sm text-muted-foreground">
                                        {job.status === "printing"
                                          ? "Currently Printing"
                                          : `Position ${index + 1} in queue`}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      File Path
                                    </Label>
                                    <p className="text-xs text-muted-foreground break-all">
                                      {job.filePath}
                                    </p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {job.status === "printing"
                              ? "In Progress"
                              : `Position ${index + 1}`}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Printer Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-primary" />
                  Printer Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {printers.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="p-4 bg-muted/50 rounded-lg mb-4">
                        <Printer className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No printers registered
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => navigate("/register-printer")}
                      >
                        Add Your First Printer
                      </Button>
                    </div>
                  ) : (
                    printers.map((printer: any) => (
                      <div
                        key={printer.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {printer.printer_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {printer.printer_type}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              printer.status === "online"
                                ? "success"
                                : printer.status === "error"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {printer.status}
                          </Badge>
                        </div>
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
