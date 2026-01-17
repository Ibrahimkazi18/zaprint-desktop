import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Users,
  Star,
  FileText,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalJobs: number;
  totalSpent: number;
  lastOrder: string;
  joinDate: string;
  status: "active" | "inactive" | "vip";
  avatar?: string;
}

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Mock customer data
  const customers: Customer[] = [
    {
      id: "cust-001",
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+91 98765 43210",
      address: "123 Main St, Mumbai, MH 400001",
      totalJobs: 45,
      totalSpent: 4500,
      lastOrder: "2024-01-15",
      joinDate: "2023-06-15",
      status: "vip",
    },
    {
      id: "cust-002",
      name: "Jane Smith",
      email: "jane.smith@email.com",
      phone: "+91 98765 43211",
      address: "456 Oak Ave, Delhi, DL 110001",
      totalJobs: 38,
      totalSpent: 3800,
      lastOrder: "2024-01-16",
      joinDate: "2023-07-20",
      status: "active",
    },
    {
      id: "cust-003",
      name: "Alex Johnson",
      email: "alex.johnson@email.com",
      phone: "+91 98765 43212",
      address: "789 Pine Rd, Bangalore, KA 560001",
      totalJobs: 32,
      totalSpent: 3200,
      lastOrder: "2024-01-14",
      joinDate: "2023-08-10",
      status: "active",
    },
    {
      id: "cust-004",
      name: "Sarah Wilson",
      email: "sarah.wilson@email.com",
      phone: "+91 98765 43213",
      address: "321 Elm St, Chennai, TN 600001",
      totalJobs: 28,
      totalSpent: 2800,
      lastOrder: "2024-01-10",
      joinDate: "2023-09-05",
      status: "active",
    },
    {
      id: "cust-005",
      name: "Mike Chen",
      email: "mike.chen@email.com",
      phone: "+91 98765 43214",
      address: "654 Maple Dr, Pune, MH 411001",
      totalJobs: 25,
      totalSpent: 2500,
      lastOrder: "2024-01-13",
      joinDate: "2023-10-12",
      status: "active",
    },
    {
      id: "cust-006",
      name: "Emily Davis",
      email: "emily.davis@email.com",
      phone: "+91 98765 43215",
      address: "987 Cedar Ln, Hyderabad, TS 500001",
      totalJobs: 15,
      totalSpent: 1500,
      lastOrder: "2023-12-20",
      joinDate: "2023-11-08",
      status: "inactive",
    },
  ];

  const recentJobs = [
    {
      id: "job-101",
      customer: "John Doe",
      service: "Document Print",
      amount: 150,
      date: "2024-01-15",
    },
    {
      id: "job-102",
      customer: "Jane Smith",
      service: "Binding",
      amount: 200,
      date: "2024-01-16",
    },
    {
      id: "job-103",
      customer: "Alex Johnson",
      service: "Color Print",
      amount: 300,
      date: "2024-01-14",
    },
    {
      id: "job-104",
      customer: "Sarah Wilson",
      service: "Scanning",
      amount: 100,
      date: "2024-01-10",
    },
    {
      id: "job-105",
      customer: "Mike Chen",
      service: "Lamination",
      amount: 80,
      date: "2024-01-13",
    },
  ];

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);

    const matchesFilter =
      selectedFilter === "all" || customer.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const customerStats = {
    total: customers.length,
    active: customers.filter((c) => c.status === "active").length,
    vip: customers.filter((c) => c.status === "vip").length,
    inactive: customers.filter((c) => c.status === "inactive").length,
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString();

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      vip: "secondary",
      inactive: "outline",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const CustomerDetailsDialog = ({ customer }: { customer: Customer }) => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Customer Details</DialogTitle>
        <DialogDescription>
          Complete information for {customer.name}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={customer.avatar} />
            <AvatarFallback className="text-lg">
              {customer.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold">{customer.name}</h3>
            <p className="text-muted-foreground">Customer ID: {customer.id}</p>
            {getStatusBadge(customer.status)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">Contact Information</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{customer.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{customer.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{customer.address}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Account Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Jobs:
                </span>
                <span className="text-sm font-medium">
                  {customer.totalJobs}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Spent:
                </span>
                <span className="text-sm font-medium">
                  {formatCurrency(customer.totalSpent)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Avg per Job:
                </span>
                <span className="text-sm font-medium">
                  {formatCurrency(customer.totalSpent / customer.totalJobs)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Last Order:
                </span>
                <span className="text-sm font-medium">
                  {formatDate(customer.lastOrder)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Member Since:
                </span>
                <span className="text-sm font-medium">
                  {formatDate(customer.joinDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Customer Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage your customers and track their activity
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        {/* Customer Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customerStats.total}</div>
              <p className="text-xs text-muted-foreground">
                All registered customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Customers
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customerStats.active}</div>
              <p className="text-xs text-muted-foreground">Recently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                VIP Customers
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customerStats.vip}</div>
              <p className="text-xs text-muted-foreground">
                High-value customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customerStats.inactive}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="customers">All Customers</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
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
                  variant={selectedFilter === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter("active")}
                >
                  Active
                </Button>
                <Button
                  variant={selectedFilter === "vip" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter("vip")}
                >
                  VIP
                </Button>
                <Button
                  variant={
                    selectedFilter === "inactive" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedFilter("inactive")}
                >
                  Inactive
                </Button>
              </div>
            </div>

            {/* Customer Table */}
            <Card>
              <CardHeader>
                <CardTitle>Customer List</CardTitle>
                <CardDescription>
                  Showing {filteredCustomers.length} of {customers.length}{" "}
                  customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Jobs</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Last Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={customer.avatar} />
                              <AvatarFallback>
                                {customer.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {customer.id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{customer.email}</div>
                            <div className="text-muted-foreground">
                              {customer.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{customer.totalJobs}</TableCell>
                        <TableCell>
                          {formatCurrency(customer.totalSpent)}
                        </TableCell>
                        <TableCell>{formatDate(customer.lastOrder)}</TableCell>
                        <TableCell>{getStatusBadge(customer.status)}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </DialogTrigger>
                            <CustomerDetailsDialog customer={customer} />
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Customer Activity</CardTitle>
                <CardDescription>
                  Latest orders and customer interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.id}</TableCell>
                        <TableCell>{job.customer}</TableCell>
                        <TableCell>{job.service}</TableCell>
                        <TableCell>{formatCurrency(job.amount)}</TableCell>
                        <TableCell>{formatDate(job.date)}</TableCell>
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
