const fs = require('fs');
const path = require('path');

const targetFile = path.join('c:', 'Users', 'Ibrahim', 'Desktop', 'Zaprint', 'zaprint-desktop', 'src', 'pages', 'Analytics.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Remove viewMode state
code = code.replace(/const \[viewMode, setViewMode\] = useState<"table" \| "graph">\("table"\);\n\s*/g, '');

// 2. Add PaginatedTable component before export default function Analytics
const paginatedTableCode = `
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

export default function Analytics() {`;

code = code.replace('export default function Analytics() {', paginatedTableCode);

// 3. Remove ViewToggle
const viewToggleRegex = /\s*const ViewToggle = \(\{ onToggle \}: \{ onToggle: \(\) => void \}\) => \([\s\S]*?<\/button>\s*\);\s*/;
code = code.replace(viewToggleRegex, '');

// 4. Replace Tabs section
const tabsRegex = /<Tabs defaultValue="revenue" className="space-y-6">[\s\S]*?<\/Tabs>/;
const newTabsContent = `<Tabs defaultValue="revenue" className="space-y-8">
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
                  <div className="p-2 rounded-xl border border-border/40 bg-background/50">
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
                  <div className="p-2 rounded-xl border border-border/40 bg-background/50">
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
                  <div className="p-2 rounded-xl border border-border/40 bg-background/50">
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
                  <div className="p-2 rounded-xl border border-border/40 bg-background/50">
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
                    { header: "Time", cell: (r: any) => (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-semibold">{r.hour}:00</span>
                        </div>
                    )},
                    { header: "Orders Handled", cell: (r: any) => {
                       const maxOrders = Math.max(...hourlyPerformance.map((h: any) => h.order_count));
                       const isPeak = r.order_count === maxOrders && maxOrders > 0;
                       return (
                         <div className="flex items-center gap-3">
                           <span className="font-medium">{r.order_count}</span>
                           {isPeak && <Badge variant="default" className="text-[10px] h-5 rounded-full px-2">Peak</Badge>}
                         </div>
                       )
                    }},
                    { header: "Total Revenue Generated", cell: (r: any) => <span className="font-bold text-amber-500">{formatCurrency(r.total_revenue)}</span> },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>`;

code = code.replace(tabsRegex, newTabsContent);

fs.writeFileSync(targetFile, code);
console.log('Analytics file successfully completely rewritten.');
