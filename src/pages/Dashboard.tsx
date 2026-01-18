import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        {/* Enhanced Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Shop Status Card */}
          <div className="rounded-lg border dark:border-slate-700 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Shop Status
                </h3>
                <div className="flex items-center space-x-2 mt-2">
                  {printers.some((p) => p.status === "online") ? (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <p className="text-2xl font-bold text-green-600">Open</p>
                    </>
                  ) : printers.some((p) => p.status === "error") ? (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <p className="text-2xl font-bold text-red-600">Error</p>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <p className="text-2xl font-bold text-yellow-600">
                        Closed
                      </p>
                    </>
                  )}
                </div>
                <p
                  className="text-sm text-muted-foreground mt-1"
                  title="Shop is open if at least one printer is online"
                >
                  {printers.filter((p) => p.status === "online").length} of{" "}
                  {printers.length} printers online
                </p>
              </div>
              <Printer className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>

          <div className="rounded-lg border dark:border-slate-700 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Today's Jobs
                </h3>
                <p className="text-3xl font-bold mt-2">12</p>
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +3 from yesterday
                </p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>

          <div className="rounded-lg border dark:border-slate-700 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Active Customers
                </h3>
                <p className="text-3xl font-bold mt-2">45</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ready for more
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>

          <div className="rounded-lg border dark:border-slate-700 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Shop Rating
                </h3>
                <p className="text-3xl font-bold mt-2">4.8 ★</p>
                <p className="text-sm text-muted-foreground mt-1">
                  120 reviews
                </p>
              </div>
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <div className="rounded-lg border dark:border-slate-700 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Today's Earnings
                </h3>
                <p className="text-2xl font-bold mt-2">
                  ₹{todayEarnings.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  +12% from yesterday
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="rounded-lg border dark:border-slate-700 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Monthly Revenue
                </h3>
                <p className="text-2xl font-bold mt-2">
                  ₹{monthlyEarnings.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  +8% from last month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="rounded-lg border dark:border-slate-700 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Pending Payments
                </h3>
                <p className="text-2xl font-bold mt-2">
                  ₹{pendingPayments.toLocaleString()}
                </p>
                <p className="text-sm text-yellow-600 mt-1">
                  3 pending invoices
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Print Queue */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border dark:border-slate-700 bg-card shadow-sm">
              <div className="p-6 pb-0">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">Print Queue</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Current jobs in progress and waiting
                    </p>
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
              </div>

              <div className="px-6 pb-6">
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
                      <TableRow key={job.id}>
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
                                  ? "secondary"
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
                            <DialogContent>
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
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Printer Status */}
            <div className="rounded-lg border dark:border-slate-700 bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Printer Status</h3>
              <div className="space-y-3">
                {printers.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      No printers registered
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/register-printer")}
                      className="mt-2"
                    >
                      Add Printer
                    </Button>
                  </div>
                ) : (
                  printers.map((printer: any) => (
                    <div
                      key={printer.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
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
                              ? "default"
                              : printer.status === "error"
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {printer.status}
                        </Badge>
                        {printer.status === "offline" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => connectMockPrinter(printer.id)}
                            className="text-xs px-2 py-1 h-6"
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-lg border dark:border-slate-700 bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === "success"
                          ? "bg-green-500"
                          : activity.type === "warning"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
