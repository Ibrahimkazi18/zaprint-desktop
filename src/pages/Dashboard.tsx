import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
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

  const { shop, printers, loading } = useShopDashboard()

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

  if (loading) return <div>Loading dashboard...</div>

  return (
    <DashboardLayout>
      {loading ? (
      <div className="p-6">Loading dashboard...</div>
    ) : (
      <div className="container mx-auto px-6 py-8">
        {/* Enhanced Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
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

          <div className="rounded-lg border dark:border-slate-700 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Queue Time
                </h3>
                <p className="text-3xl font-bold mt-2">78m</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Estimated total
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
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
                <p className="text-sm text-muted-foreground mt-1">This month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
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
                <p className="text-sm text-orange-600 mt-1">3 customers</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="p-6 space-y-6">
          <h1 className="text-2xl font-bold">{shop.shop_name}</h1>

          <div>
            <span>Status: </span>
            <strong>{shop.status}</strong>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Printers</h2>

            {printers.length === 0 && (
              <p>No printers registered yet.</p>
            )}

            <ul className="space-y-2">
              {printers.map(printer => (
                <li
                  key={printer.id}
                  className="border p-3 rounded flex justify-between"
                >
                  <div>
                    <div className="font-medium">{printer.printer_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {printer.printer_type}
                    </div>
                  </div>

                  <div>
                    <span>{printer.status}</span>
                  </div>

                  <button
                    onClick={() => connectMockPrinter(printer.id)}
                    className="border px-3 py-1 rounded"
                  >
                    Connect (Mock)
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Queue Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Current Print Queue</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={fetchQueue}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={() => navigate("/queue")}>View All Jobs</Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Total Queued: {queue.length} jobs | Estimated Total Wait: 78 mins
          </div>

          {queue.length === 0 ? (
            <div className="text-center py-12">
              <Printer className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No jobs in queue</p>
              <p className="text-sm text-muted-foreground">Time to relax! ☕</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Est. Time</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.map((job, index) => (
                  <TableRow
                    key={job.id}
                    className="hover:bg-muted/50 dark:border-slate-700 transition-colors"
                  >
                    <TableCell className="font-medium">#{index + 1}</TableCell>
                    <TableCell>{job.id}</TableCell>
                    <TableCell>{job.customerName}</TableCell>
                    <TableCell>{job.jobType}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          job.status === "Printing"
                            ? "default"
                            : job.status === "Queued"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{job.estimatedTime}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border dark:border-slate-700 border-input hover:bg-accent"
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="text-foreground">
                              Job Details: {job.id}
                            </DialogTitle>
                            <DialogDescription>
                              Complete information for this print job.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Customer
                                </p>
                                <p className="text-foreground">
                                  {job.customerName}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Job Type
                                </p>
                                <p className="text-foreground">{job.jobType}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Color Mode
                                </p>
                                <p className="text-foreground">
                                  {job.colorMode}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Paper Size
                                </p>
                                <p className="text-foreground">
                                  {job.paperSize}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Pages
                                </p>
                                <p className="text-foreground">{job.pages}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Copies
                                </p>
                                <p className="text-foreground">{job.copies}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Binding
                                </p>
                                <p className="text-foreground">
                                  {job.binding || "None"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Est. Time
                                </p>
                                <p className="text-foreground">
                                  {job.estimatedTime}
                                </p>
                              </div>
                            </div>
                            {job.notes && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Special Notes
                                </p>
                                <p className="text-foreground">{job.notes}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <Separator className="my-8" />

        {/* Recent Activity */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border dark:border-slate-700 bg-card"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "success"
                        ? "bg-green-500"
                        : activity.type === "warning"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                    }`}
                  />
                  <span className="text-sm">{activity.action}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    </DashboardLayout>
  );
}
