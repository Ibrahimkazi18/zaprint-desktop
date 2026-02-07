import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
  Users,
  Clock,
  Star,
  FileText,
  Printer,
  DollarSign,
  Activity,
  Zap,
  Target,
  ArrowUpRight,
} from "lucide-react";
import { PrintJob } from "@/types";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useShopDashboard } from "@/hooks/useShopDashboard";
import connectMockPrinter from "@/backend/printers/mockPrinter";

export default function Dashboard() {
  const navigate = useNavigate();

  const { shop, printers, loading } = useShopDashboard();

  // Mock queue data with more realistic content
  const [queue, setQueue] = useState<PrintJob[]>([
    {
      id: "job-001",
      customerName: "John Doe",
      jobType: "Document Print",
      status: "Printing",
      pages: 10,
      copies: 2,
      colorMode: "Color",
      paperSize: "A4",
      binding: "None",
      notes: "Urgent delivery",
      estimatedTime: "5 mins",
    },
    {
      id: "job-002",
      customerName: "Jane Smith",
      jobType: "Poster Print",
      status: "Queued",
      pages: 1,
      copies: 5,
      colorMode: "Color",
      paperSize: "A3",
      binding: "None",
      notes: "High quality gloss",
      estimatedTime: "20 mins",
    },
    {
      id: "job-003",
      customerName: "Alex Johnson",
      jobType: "Thesis Binding",
      status: "Queued",
      pages: 150,
      copies: 1,
      colorMode: "B&W",
      paperSize: "A4",
      binding: "Spiral",
      notes: "Include cover page",
      estimatedTime: "30 mins",
    },
    {
      id: "job-004",
      customerName: "Sarah Wilson",
      jobType: "Assignment Print",
      status: "Queued",
      pages: 25,
      copies: 1,
      colorMode: "B&W",
      paperSize: "A4",
      binding: "Stapled",
      notes: "Double sided",
      estimatedTime: "8 mins",
    },
    {
      id: "job-005",
      customerName: "Mike Chen",
      jobType: "ID Card Print",
      status: "Queued",
      pages: 1,
      copies: 10,
      colorMode: "Color",
      paperSize: "Card",
      binding: "None",
      notes: "Laminated finish",
      estimatedTime: "15 mins",
    },
  ]);

  // Mock recent activity data
  const recentActivity = [
    {
      action: "Job-001 completed successfully",
      time: "2 mins ago",
      type: "success",
    },
    {
      action: "New customer Sarah Wilson registered",
      time: "15 mins ago",
      type: "info",
    },
    {
      action: "Payment received for Job-045",
      time: "32 mins ago",
      type: "success",
    },
    {
      action: "Printer maintenance scheduled",
      time: "1 hour ago",
      type: "warning",
    },
    { action: "Monthly report generated", time: "2 hours ago", type: "info" },
    {
      action: "New review: 5 stars from Alex J.",
      time: "3 hours ago",
      type: "success",
    },
  ];

  // Mock financial data
  const todayEarnings = 2450;
  const monthlyEarnings = 45600;
  const pendingPayments = 1200;

  const fetchQueue = async () => {
    // Simulate API call without toast
    console.log("Refreshing queue...");
    // In real app, this would fetch from API
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
            <p className="text-lg text-muted-foreground">
              Loading your dashboard...
            </p>
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
          <Button variant="gradient" size="lg" className="shadow-lg">
            <Activity className="mr-2 h-5 w-5" />
            View Analytics
          </Button>
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
                  <p className="text-3xl font-bold">12</p>
                  <div className="flex items-center text-sm text-emerald-600 mt-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +3 from yesterday
                  </div>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <FileText className="h-6 w-6 text-blue-500" />
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
                  <p className="text-3xl font-bold">45</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ready for service
                  </p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Shop Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">4.8 ★</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    120 reviews
                  </p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-full">
                  <Star className="h-6 w-6 text-amber-500" />
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
                ₹{todayEarnings.toLocaleString()}
              </p>
              <div className="flex items-center text-sm text-emerald-600 mt-2">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                +12% from yesterday
              </div>
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
                ₹{monthlyEarnings.toLocaleString()}
              </p>
              <div className="flex items-center text-sm text-blue-600 mt-2">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                +8% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-600/5"></div>
            <CardHeader className="relative">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Pending Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-3xl font-bold text-amber-600">
                ₹{pendingPayments.toLocaleString()}
              </p>
              <p className="text-sm text-amber-600 mt-2">3 pending invoices</p>
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
                    {queue.map((job) => (
                      <TableRow key={job.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {job.customerName}
                        </TableCell>
                        <TableCell>{job.jobType}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              job.status === "Printing"
                                ? "default"
                                : job.status === "Completed"
                                  ? "success"
                                  : "outline"
                            }
                          >
                            {job.status}
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
                                  Job Details - {job.id}
                                </DialogTitle>
                                <DialogDescription>
                                  Complete information for this print job
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Customer
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                      {job.customerName}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Job Type
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                      {job.jobType}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Pages
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                      {job.pages} pages × {job.copies} copies
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Color Mode
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                      {job.colorMode}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Paper Size
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                      {job.paperSize}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Binding
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                      {job.binding || "None"}
                                    </p>
                                  </div>
                                </div>
                                {job.notes && (
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Notes
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                      {job.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {job.estimatedTime}
                        </TableCell>
                      </TableRow>
                    ))}
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
                          {printer.status === "offline" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => connectMockPrinter(printer.id)}
                              className="text-xs px-3 py-1 h-7"
                            >
                              Connect
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === "success"
                            ? "bg-emerald-500"
                            : activity.type === "warning"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-relaxed">
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.time}
                        </p>
                      </div>
                    </div>
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
