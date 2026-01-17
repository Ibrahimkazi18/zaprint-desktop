import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCw,
  Search,
  Filter,
  Plus,
  Printer,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  ArrowLeft,
} from "lucide-react";
import { PrintJob } from "@/types";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Queue() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Extended mock queue data
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
    {
      id: "job-006",
      customerName: "Emily Davis",
      jobType: "Booklet Print",
      status: "Paused",
      pages: 50,
      copies: 3,
      colorMode: "B&W",
      paperSize: "A4",
      binding: "Saddle Stitch",
      notes: "Waiting for customer approval",
      estimatedTime: "25 mins",
    },
    {
      id: "job-007",
      customerName: "David Brown",
      jobType: "Banner Print",
      status: "Completed",
      pages: 1,
      copies: 2,
      colorMode: "Color",
      paperSize: "A1",
      binding: "None",
      notes: "Ready for pickup",
      estimatedTime: "0 mins",
    },
    {
      id: "job-008",
      customerName: "Lisa Garcia",
      jobType: "Business Cards",
      status: "Failed",
      pages: 1,
      copies: 100,
      colorMode: "Color",
      paperSize: "Card",
      binding: "None",
      notes: "Printer jam - needs restart",
      estimatedTime: "0 mins",
    },
  ]);

  const completedJobs = [
    {
      id: "job-101",
      customer: "Robert Taylor",
      service: "Document Print",
      completedAt: "2024-01-16 14:30",
      amount: 150,
    },
    {
      id: "job-102",
      customer: "Maria Rodriguez",
      service: "Binding",
      completedAt: "2024-01-16 13:45",
      amount: 200,
    },
    {
      id: "job-103",
      customer: "James Wilson",
      service: "Color Print",
      completedAt: "2024-01-16 12:20",
      amount: 300,
    },
    {
      id: "job-104",
      customer: "Jennifer Lee",
      service: "Scanning",
      completedAt: "2024-01-16 11:15",
      amount: 100,
    },
    {
      id: "job-105",
      customer: "Michael Davis",
      service: "Lamination",
      completedAt: "2024-01-16 10:30",
      amount: 80,
    },
  ];

  const filteredQueue = queue.filter((job) => {
    const matchesSearch =
      job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" ||
      job.status.toLowerCase() === selectedFilter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const queueStats = {
    total: queue.length,
    printing: queue.filter((j) => j.status === "Printing").length,
    queued: queue.filter((j) => j.status === "Queued").length,
    paused: queue.filter((j) => j.status === "Paused").length,
    completed: queue.filter((j) => j.status === "Completed").length,
    failed: queue.filter((j) => j.status === "Failed").length,
  };

  const fetchQueue = () => {
    console.log("Refreshing queue...");
  };

  const updateJobStatus = (jobId: string, newStatus: string) => {
    setQueue((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      Printing: "default",
      Queued: "secondary",
      Paused: "outline",
      Completed: "default",
      Failed: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Printing":
        return <Printer className="h-4 w-4 text-blue-600" />;
      case "Queued":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "Paused":
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Print Queue Management</h1>
              <p className="text-muted-foreground mt-2">
                Monitor and manage all print jobs in your queue
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={fetchQueue}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Job
            </Button>
          </div>
        </div>

        {/* Queue Stats */}
        <div className="grid gap-6 md:grid-cols-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Printer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueStats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Printing</CardTitle>
              <Printer className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueStats.printing}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Queued</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueStats.queued}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paused</CardTitle>
              <Pause className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueStats.paused}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueStats.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueStats.failed}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active Queue</TabsTrigger>
            <TabsTrigger value="completed">Completed Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Button
                  variant={selectedFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={
                    selectedFilter === "printing" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedFilter("printing")}
                >
                  Printing
                </Button>
                <Button
                  variant={selectedFilter === "queued" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter("queued")}
                >
                  Queued
                </Button>
                <Button
                  variant={selectedFilter === "paused" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter("paused")}
                >
                  Paused
                </Button>
              </div>
            </div>

            {/* Queue Table */}
            <Card>
              <CardHeader>
                <CardTitle>Print Queue</CardTitle>
                <CardDescription>
                  Showing {filteredQueue.length} of {queue.length} jobs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead>Job ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Est. Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQueue.map((job, index) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">
                          #{index + 1}
                        </TableCell>
                        <TableCell>{job.id}</TableCell>
                        <TableCell>{job.customerName}</TableCell>
                        <TableCell>{job.jobType}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(job.status)}
                            {getStatusBadge(job.status)}
                          </div>
                        </TableCell>
                        <TableCell>{job.estimatedTime}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
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
                                      <p className="text-foreground">
                                        {job.jobType}
                                      </p>
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
                                      <p className="text-foreground">
                                        {job.pages}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">
                                        Copies
                                      </p>
                                      <p className="text-foreground">
                                        {job.copies}
                                      </p>
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
                                      <p className="text-foreground">
                                        {job.notes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>

                            {job.status === "Queued" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateJobStatus(job.id, "Printing")
                                }
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Start
                              </Button>
                            )}

                            {job.status === "Printing" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateJobStatus(job.id, "Paused")
                                }
                              >
                                <Pause className="h-4 w-4 mr-1" />
                                Pause
                              </Button>
                            )}

                            {job.status === "Paused" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateJobStatus(job.id, "Printing")
                                }
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Resume
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Completed Jobs</CardTitle>
                <CardDescription>Recently completed print jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Completed At</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.id}</TableCell>
                        <TableCell>{job.customer}</TableCell>
                        <TableCell>{job.service}</TableCell>
                        <TableCell>{job.completedAt}</TableCell>
                        <TableCell>₹{job.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
