import { useState } from "react";
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
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  Download,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");

  // Mock analytics data
  const overviewStats = {
    totalRevenue: 125400,
    revenueChange: 12.5,
    totalJobs: 1247,
    jobsChange: 8.3,
    totalCustomers: 342,
    customersChange: 15.2,
    avgJobValue: 100.56,
    avgJobValueChange: -2.1,
  };

  const revenueData = [
    { period: "Jan", revenue: 8500, jobs: 85 },
    { period: "Feb", revenue: 9200, jobs: 92 },
    { period: "Mar", revenue: 10100, jobs: 101 },
    { period: "Apr", revenue: 11800, jobs: 118 },
    { period: "May", revenue: 12400, jobs: 124 },
    { period: "Jun", revenue: 13200, jobs: 132 },
  ];

  const topServices = [
    {
      service: "Document Printing",
      revenue: 45600,
      jobs: 456,
      percentage: 36.4,
    },
    {
      service: "Binding Services",
      revenue: 28900,
      jobs: 289,
      percentage: 23.1,
    },
    { service: "Color Printing", revenue: 22100, jobs: 221, percentage: 17.6 },
    { service: "Large Format", revenue: 15800, jobs: 158, percentage: 12.6 },
    { service: "Scanning", revenue: 8900, jobs: 89, percentage: 7.1 },
    { service: "Others", revenue: 4100, jobs: 41, percentage: 3.2 },
  ];

  const topCustomers = [
    { name: "John Doe", jobs: 45, revenue: 4500, lastOrder: "2 days ago" },
    { name: "Jane Smith", jobs: 38, revenue: 3800, lastOrder: "1 day ago" },
    { name: "Alex Johnson", jobs: 32, revenue: 3200, lastOrder: "3 days ago" },
    { name: "Sarah Wilson", jobs: 28, revenue: 2800, lastOrder: "1 week ago" },
    { name: "Mike Chen", jobs: 25, revenue: 2500, lastOrder: "4 days ago" },
  ];

  const dailyStats = [
    { day: "Monday", jobs: 18, revenue: 1800 },
    { day: "Tuesday", jobs: 22, revenue: 2200 },
    { day: "Wednesday", jobs: 25, revenue: 2500 },
    { day: "Thursday", jobs: 20, revenue: 2000 },
    { day: "Friday", jobs: 28, revenue: 2800 },
    { day: "Saturday", jobs: 15, revenue: 1500 },
    { day: "Sunday", jobs: 8, revenue: 800 },
  ];

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
      {Math.abs(change)}%
    </span>
  );

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
            <Button variant="outline">
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
                {formatCurrency(overviewStats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatChange(overviewStats.revenueChange)} from last period
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
                {overviewStats.totalJobs.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatChange(overviewStats.jobsChange)} from last period
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
                {overviewStats.totalCustomers}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatChange(overviewStats.customersChange)} from last period
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
                {formatCurrency(overviewStats.avgJobValue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatChange(overviewStats.avgJobValueChange)} from last period
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList>
            <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
            <TabsTrigger value="services">Service Performance</TabsTrigger>
            <TabsTrigger value="customers">Customer Insights</TabsTrigger>
            <TabsTrigger value="daily">Daily Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue Trend</CardTitle>
                  <CardDescription>
                    Revenue and job count over the last 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueData.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 text-sm font-medium">
                            {item.period}
                          </div>
                          <div className="flex-1">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{
                                  width: `${(item.revenue / 15000) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {formatCurrency(item.revenue)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.jobs} jobs
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                  <CardDescription>
                    Current month performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">This Month</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(13200)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">132 jobs</p>
                      <p className="text-sm text-green-600">
                        +11.8% vs last month
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">This Week</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(3200)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">32 jobs</p>
                      <p className="text-sm text-green-600">
                        +5.2% vs last week
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Today</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(450)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">5 jobs</p>
                      <p className="text-sm text-green-600">
                        +12% vs yesterday
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Services</CardTitle>
                <CardDescription>
                  Revenue and job count by service type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Jobs</TableHead>
                      <TableHead>Share</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topServices.map((service, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {service.service}
                        </TableCell>
                        <TableCell>{formatCurrency(service.revenue)}</TableCell>
                        <TableCell>{service.jobs}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {service.percentage}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${service.percentage}%` }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>
                  Your most valuable customers by revenue and job count
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
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
                          {customer.name}
                        </TableCell>
                        <TableCell>{customer.jobs}</TableCell>
                        <TableCell>
                          {formatCurrency(customer.revenue)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(customer.revenue / customer.jobs)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {customer.lastOrder}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="daily" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Performance</CardTitle>
                <CardDescription>
                  Average jobs and revenue by day of the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dailyStats.map((day, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-20 text-sm font-medium">
                          {day.day}
                        </div>
                        <div className="flex-1">
                          <div className="w-full bg-muted rounded-full h-3">
                            <div
                              className="bg-primary h-3 rounded-full"
                              style={{ width: `${(day.jobs / 30) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatCurrency(day.revenue)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {day.jobs} jobs
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
