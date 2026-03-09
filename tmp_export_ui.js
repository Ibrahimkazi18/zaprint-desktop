const fs = require('fs');
const path = require('path');

const targetFile = path.join('c:', 'Users', 'Ibrahim', 'Desktop', 'Zaprint', 'zaprint-desktop', 'src', 'pages', 'Analytics.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Add Dialog Imports and ExportType
const importRegex = /import \{ exportAnalyticsPDF \} from "@\/utils\/exportAnalyticsPDF";/;
const newImports = `import { exportAnalyticsPDF, type ExportType } from "@/utils/exportAnalyticsPDF";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";`;
code = code.replace(importRegex, newImports);

// 2. Add State for Export Dialog
const stateRegex = /const \[loading, setLoading\] = useState\(true\);/;
const newState = `const [loading, setLoading] = useState(true);
  
  // Export Dialog State
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportType, setExportType] = useState<ExportType>("lightweight");
  const [exportPeriod, setExportPeriod] = useState("30d");
  const [isExporting, setIsExporting] = useState(false);`;
code = code.replace(stateRegex, newState);

// 3. Replace handleExportPDF with the complex version
const oldHandleExportRegex = /const handleExportPDF = \(\) => \{[\s\S]*?toast\.error\("Failed to generate PDF", \{ id: "export-pdf" \}\);\s*\}\s*\};/;
const newHandleExport = `const processExport = async () => {
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
        // We delay slightly to ensure charts are rendered if they were hidden in tabs
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const getChartImage = (containerId: string) => {
           const container = document.getElementById(containerId);
           if (!container) return undefined;
           const canvas = container.querySelector('canvas');
           return canvas ? canvas.toDataURL("image/png", 1.0) : undefined;
        };

        // Note: Chart components will need id attributes added to their wrappers
        chartImages = {
          revenue: getChartImage('revenue-chart-container'),
          customers: getChartImage('customers-chart-container'),
          daily: getChartImage('daily-chart-container'),
          hourly: getChartImage('hourly-chart-container')
        };
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
  };`;
code = code.replace(oldHandleExportRegex, newHandleExport);

// 4. Update the Export Button to open the dialog
const exportButtonRegex = /<Button\s*variant="outline"\s*size="sm"\s*onClick=\{handleExportPDF\}\s*className="h-9 gap-1\.5 text-sm"\s*>\s*<Download className="h-3\.5 w-3\.5" \/>\s*Export PDF\s*<\/Button>/;
const newExportButton = `<Button
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
            </Button>`;
code = code.replace(exportButtonRegex, newExportButton);

// 5. Inject the Dialog component right before the closing DashboardLayout
const dialogHTML = `
        {/* ── Export Export Dialog ── */}
        <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
          <DialogContent className="sm:max-w-[500px] border-border/60 bg-background/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Generate Analytics Report</DialogTitle>
              <DialogDescription>
                Customize how your insights are exported to PDF.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Report Format</Label>
                <RadioGroup value={exportType} onValueChange={(v: ExportType) => setExportType(v)} className="grid grid-cols-2 gap-4">
                   <div>
                    <RadioGroupItem value="lightweight" id="lightweight" className="peer sr-only" />
                    <Label
                      htmlFor="lightweight"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                    >
                      <FileText className="mb-3 h-6 w-6 text-muted-foreground" />
                      <div className="font-semibold text-sm text-foreground">Lightweight</div>
                      <div className="text-xs text-muted-foreground mt-1 text-center">Tables & Summaries</div>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="heavyweight" id="heavyweight" className="peer sr-only" />
                    <Label
                      htmlFor="heavyweight"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                    >
                      <BarChart3 className="mb-3 h-6 w-6 text-muted-foreground" />
                      <div className="font-semibold text-sm text-foreground">Heavyweight</div>
                      <div className="text-xs text-muted-foreground mt-1 text-center">High-Res Charts & Tables</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Data Period</Label>
                <Select value={exportPeriod} onValueChange={setExportPeriod}>
                  <SelectTrigger className="w-full h-11 rounded-xl">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 Days (Short Term)</SelectItem>
                    <SelectItem value="30d">Last 30 Days (Monthly)</SelectItem>
                    <SelectItem value="90d">Last 90 Days (Quarterly)</SelectItem>
                  </SelectContent>
                </Select>
                {exportPeriod !== selectedPeriod && (
                  <p className="text-[11px] text-amber-500 flex items-center gap-1.5 mt-2">
                    <TrendingUp className="h-3 w-3" />
                    Historical data will be fetched for this export.
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsExportOpen(false)} disabled={isExporting} className="rounded-xl">
                Cancel
              </Button>
              <Button 
                onClick={processExport} 
                disabled={isExporting}
                className="rounded-xl px-8 shadow-md"
              >
                {isExporting ? "Generating..." : "Download PDF"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}`;
code = code.replace(/<\/div>\s*<\/DashboardLayout>\s*\);\s*\}\s*$/, dialogHTML);


// 6. Add ID flags to Chart Wrappers so they can be captured to canvas
code = code.replace(/<div className="p-2 rounded-xl border border-border\/40 bg-background\/50">\s*<RevenueChart/g, '<div id="revenue-chart-container" className="p-2 rounded-xl border border-border/40 bg-background/50">\n                    <RevenueChart');
code = code.replace(/<div className="p-2 rounded-xl border border-border\/40 bg-background\/50">\s*<CustomerChart/g, '<div id="customers-chart-container" className="p-2 rounded-xl border border-border/40 bg-background/50">\n                     <CustomerChart');
code = code.replace(/<div className="p-2 rounded-xl border border-border\/40 bg-background\/50">\s*<DailyChart/g, '<div id="daily-chart-container" className="p-2 rounded-xl border border-border/40 bg-background/50">\n                    <DailyChart');
code = code.replace(/<div className="p-2 rounded-xl border border-border\/40 bg-background\/50">\s*<HourlyChart/g, '<div id="hourly-chart-container" className="p-2 rounded-xl border border-border/40 bg-background/50">\n                    <HourlyChart');

// 7. Make sure BarChart3 is imported since it was removed earlier
const lucideImportRegex = /import \{\s*TrendingUp,\s*TrendingDown,\s*DollarSign,\s*Users,\s*FileText,\s*Download,\s*Clock,\s*Target,\s*\} from "lucide-react";/;
code = code.replace(lucideImportRegex, `import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  Download,
  Clock,
  Target,
  BarChart3,
} from "lucide-react";`);

fs.writeFileSync(targetFile, code);
console.log('Finished updating Analytics.tsx Export flow');
