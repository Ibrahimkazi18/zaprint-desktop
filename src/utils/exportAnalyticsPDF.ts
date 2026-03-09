import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { AnalyticsOverview } from "@/backend/analytics/fetchAnalyticsOverview";
import type { MonthlyRevenue } from "@/backend/analytics/fetchMonthlyRevenue";
import type { TopCustomer } from "@/backend/analytics/fetchTopCustomers";
import type { DailyPerformance } from "@/backend/analytics/fetchDailyPerformance";
import type { GrowthMetrics } from "@/backend/analytics/fetchGrowthMetrics";
import type { HourlyPerformance } from "@/backend/analytics/fetchHourlyPerformance";

interface ExportData {
  shopName: string;
  overview: AnalyticsOverview | null;
  monthlyRevenue: MonthlyRevenue[];
  topCustomers: TopCustomer[];
  dailyPerformance: DailyPerformance[];
  growthMetrics: GrowthMetrics | null;
  hourlyPerformance: HourlyPerformance[];
}

export type ExportType = "lightweight" | "heavyweight";

interface ExportOptions {
  type: ExportType;
  period: string;
  chartImages?: {
    revenue?: string;
    customers?: string;
    daily?: string;
    hourly?: string;
  };
}

export function exportAnalyticsPDF(data: ExportData, options: ExportOptions) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ============================================
  // BACKGROUND & LETTERHEAD
  // ============================================

  // Subtle top border color bar
  doc.setFillColor(37, 99, 235); // Tailwind blue-600
  doc.rect(0, 0, pageWidth, 6, "F");

  // Premium Header Area Background
  doc.setFillColor(248, 250, 252); // Tailwind slate-50
  doc.rect(0, 6, pageWidth, 40, "F");

  // Zaprint Logo/Typography
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("Z A P R I N T", 14, 28);

  // Aesthetic dot
  doc.setFillColor(59, 130, 246); // blue-500
  doc.circle(73, 26, 2, "F");

  // Subtitle
  doc.setTextColor(100, 116, 139); // slate-500
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Analytics Intelligence Report", 14, 38);

  // Right side header info (Shop & Date)
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(data.shopName, pageWidth - 14, 25, { align: "right" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Generated: ${formatDate()}`, pageWidth - 14, 32, { align: "right" });

  // Mode & Period Badge
  doc.setFillColor(239, 246, 255); // blue-50
  doc.setDrawColor(191, 219, 254); // blue-200
  doc.roundedRect(pageWidth - 75, 36, 61, 6, 1, 1, "FD");
  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text(`${options.type.toUpperCase()} • ${options.period.toUpperCase()}`, pageWidth - 45, 40.5, { align: "center" });

  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(14, 52, pageWidth - 14, 52);

  yPosition = 65;

  // ============================================
  // EXECUTIVE SUMMARY
  // ============================================
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", 14, yPosition);

  yPosition += 8;

  if (data.overview) {
    const summaryData = [
      [
        "Total Revenue",
        formatCurrency(data.overview.quarter_revenue),
        "Quarter",
      ],
      ["Total Orders", data.overview.quarter_orders.toString(), "Quarter"],
      [
        "Total Customers",
        data.overview.total_customers.toString(),
        "All Time",
      ],
      [
        "Avg Order Value",
        formatCurrency(data.overview.avg_order_value),
        "Quarter",
      ],
      [
        "Completion Rate",
        `${data.overview.completion_rate}%`,
        "Quarter",
      ],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [["Metric", "Value", "Period"]],
      body: summaryData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255, halign: 'left', fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4, textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // ============================================
  // GROWTH METRICS
  // ============================================
  checkNewPage(60);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Growth Comparison", 14, yPosition);

  yPosition += 8;

  if (data.growthMetrics) {
    const growthData = [
      [
        "Month over Month",
        `${data.growthMetrics.mom_orders_growth >= 0 ? "+" : ""}${data.growthMetrics.mom_orders_growth}%`,
        `${data.growthMetrics.mom_revenue_growth >= 0 ? "+" : ""}${data.growthMetrics.mom_revenue_growth}%`,
      ],
      [
        "Week over Week",
        `${data.growthMetrics.wow_orders_growth >= 0 ? "+" : ""}${data.growthMetrics.wow_orders_growth}%`,
        `${data.growthMetrics.wow_revenue_growth >= 0 ? "+" : ""}${data.growthMetrics.wow_revenue_growth}%`,
      ],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [["Period", "Orders Growth", "Revenue Growth"]],
      body: growthData,
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129], textColor: 255 }, // emerald-500
      styles: { fontSize: 10, cellPadding: 4, textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }

  // ============================================
  // PDF GRAPHICS HELPER
  // ============================================
  const insertChartImage = (base64Image: string | undefined, title: string) => {
    if (options.type === "heavyweight" && base64Image) {
      checkNewPage(100);
      doc.setFontSize(12);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 116, 139);
      doc.text(`Chart: ${title}`, 14, yPosition);
      yPosition += 5;

      const imgProps = doc.getImageProperties(base64Image);
      const maxWidth = pageWidth - 28; // Margins
      const ratio = imgProps.height / imgProps.width;
      const calcHeight = maxWidth * ratio;

      doc.addImage(base64Image, "PNG", 14, yPosition, maxWidth, calcHeight);
      yPosition += calcHeight + 15;
    }
  };

  // ============================================
  // MONTHLY REVENUE TREND
  // ============================================
  checkNewPage(80);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Revenue Analytics", 14, yPosition);
  yPosition += 8;

  insertChartImage(options.chartImages?.revenue, "Revenue Trend (Selected Period)");

  if (data.monthlyRevenue.length > 0) {
    checkNewPage(40);
    const revenueData = data.monthlyRevenue.map((item) => [
      item.month_label,
      item.order_count.toString(),
      formatCurrency(item.total_revenue),
      formatCurrency(item.avg_order_value),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Date Grouping", "Jobs Complete", "Total Revenue", "Avg Job Value"]],
      body: revenueData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3, textColor: [51, 65, 85] },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }

  // ============================================
  // TOP CUSTOMERS
  // ============================================
  checkNewPage(80);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Top Customers Directory", 14, yPosition);
  yPosition += 8;

  insertChartImage(options.chartImages?.customers, "Client Revenue Distribution");

  if (data.topCustomers.length > 0) {
    checkNewPage(40);
    const customerData = data.topCustomers.slice(0, 15).map((customer) => [
      customer.customer_name || "Unknown",
      customer.total_orders.toString(),
      formatCurrency(customer.total_revenue),
      formatCurrency(customer.avg_order_value),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Client Name", "Total Jobs", "Gross Profit", "Avg Value / Job"]],
      body: customerData,
      theme: "striped",
      headStyles: { fillColor: [139, 92, 246], textColor: 255 }, // violet-500
      styles: { fontSize: 9, cellPadding: 3, textColor: [51, 65, 85] },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }

  // ============================================
  // DAILY PERFORMANCE
  // ============================================
  checkNewPage(80);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Daily Performance Index", 14, yPosition);
  yPosition += 8;

  insertChartImage(options.chartImages?.daily, "Average Volume by Day");

  if (data.dailyPerformance.length > 0) {
    checkNewPage(40);
    const dailyData = data.dailyPerformance.map((day) => [
      day.day_name,
      day.total_orders.toString(),
      formatCurrency(day.total_revenue),
      formatCurrency(day.avg_order_value),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Day of Week", "Avg Jobs", "Avg Revenue", "Value/Job Tracker"]],
      body: dailyData,
      theme: "grid",
      headStyles: { fillColor: [245, 158, 11], textColor: 255 }, // amber-500
      styles: { fontSize: 9, cellPadding: 3, textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }

  // ============================================
  // PEAK HOURS
  // ============================================
  checkNewPage(80);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Peak Hours Operations", 14, yPosition);
  yPosition += 8;

  insertChartImage(options.chartImages?.hourly, "Operational Traffic Timeline");

  if (data.hourlyPerformance.length > 0) {
    checkNewPage(40);
    const activeHours = data.hourlyPerformance.filter((h) => h.order_count > 0);

    if (activeHours.length > 0) {
      const hourlyData = activeHours.map((hour) => [
        `${hour.hour}:00 - ${hour.hour + 1}:00`,
        hour.order_count.toString(),
        formatCurrency(hour.total_revenue),
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Time Block", "Jobs Handled", "Revenue Captured"]],
        body: hourlyData,
        theme: "striped",
        headStyles: { fillColor: [239, 68, 68], textColor: 255 }, // red-500
        styles: { fontSize: 9, cellPadding: 3, textColor: [51, 65, 85] },
        margin: { left: 14, right: 14 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }
  }

  // ============================================
  // FOOTER ACROSS ALL PAGES
  // ============================================
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

    // Page number
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFont("helvetica", "bold");
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );

    // Footer text
    doc.setFont("helvetica", "normal");
    doc.text(
      "Generated by Zaprint Analytics",
      14,
      pageHeight - 8
    );
    doc.text(
      `${data.shopName} - Confidential`,
      pageWidth - 14,
      pageHeight - 8,
      { align: "right" }
    );
  }

  // ============================================
  // FINAL SAVE
  // ============================================
  const fileName = `Zaprint_${options.type}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
