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
  period: string;
}

export function exportAnalyticsPDF(data: ExportData) {
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

  // Helper function to format currency
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  // Helper function to format date
  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ============================================
  // HEADER
  // ============================================
  doc.setFillColor(59, 130, 246); // Blue
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Analytics Report", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(data.shopName, pageWidth / 2, 30, { align: "center" });

  yPosition = 50;

  // ============================================
  // REPORT INFO
  // ============================================
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text(`Generated: ${formatDate()}`, 14, yPosition);
  doc.text(`Period: ${data.period}`, pageWidth - 14, yPosition, {
    align: "right",
  });

  yPosition += 15;

  // ============================================
  // EXECUTIVE SUMMARY
  // ============================================
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", 14, yPosition);

  yPosition += 10;

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
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      styles: { fontSize: 10 },
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
  doc.text("Growth Metrics", 14, yPosition);

  yPosition += 10;

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
      headStyles: { fillColor: [34, 197, 94], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // ============================================
  // MONTHLY REVENUE TREND
  // ============================================
  checkNewPage(80);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Monthly Revenue Trend", 14, yPosition);

  yPosition += 10;

  if (data.monthlyRevenue.length > 0) {
    const revenueData = data.monthlyRevenue.map((item) => [
      item.month_label,
      item.order_count.toString(),
      formatCurrency(item.total_revenue),
      formatCurrency(item.avg_order_value),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Month", "Orders", "Revenue", "Avg Order Value"]],
      body: revenueData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // ============================================
  // TOP CUSTOMERS
  // ============================================
  checkNewPage(80);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Top Customers", 14, yPosition);

  yPosition += 10;

  if (data.topCustomers.length > 0) {
    const customerData = data.topCustomers.slice(0, 10).map((customer) => [
      customer.customer_name || "Unknown",
      customer.total_orders.toString(),
      formatCurrency(customer.total_revenue),
      formatCurrency(customer.avg_order_value),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Customer", "Orders", "Revenue", "Avg/Order"]],
      body: customerData,
      theme: "striped",
      headStyles: { fillColor: [168, 85, 247], textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // ============================================
  // DAILY PERFORMANCE
  // ============================================
  checkNewPage(70);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Performance by Day of Week", 14, yPosition);

  yPosition += 10;

  if (data.dailyPerformance.length > 0) {
    const dailyData = data.dailyPerformance.map((day) => [
      day.day_name,
      day.total_orders.toString(),
      formatCurrency(day.total_revenue),
      formatCurrency(day.avg_order_value),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Day", "Orders", "Revenue", "Avg/Order"]],
      body: dailyData,
      theme: "grid",
      headStyles: { fillColor: [234, 179, 8], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // ============================================
  // PEAK HOURS
  // ============================================
  checkNewPage(80);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Peak Hours Analysis", 14, yPosition);

  yPosition += 10;

  if (data.hourlyPerformance.length > 0) {
    // Filter to show only hours with activity
    const activeHours = data.hourlyPerformance.filter((h) => h.order_count > 0);

    if (activeHours.length > 0) {
      const hourlyData = activeHours.map((hour) => [
        `${hour.hour}:00 - ${hour.hour + 1}:00`,
        hour.order_count.toString(),
        formatCurrency(hour.total_revenue),
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Time", "Orders", "Revenue"]],
        body: hourlyData,
        theme: "striped",
        headStyles: { fillColor: [239, 68, 68], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }
  }

  // ============================================
  // FOOTER ON LAST PAGE
  // ============================================
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Page number
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );

    // Footer text
    doc.setFontSize(8);
    doc.text(
      "Generated by Zaprint Analytics",
      14,
      pageHeight - 10
    );
    doc.text(
      "Confidential",
      pageWidth - 14,
      pageHeight - 10,
      { align: "right" }
    );
  }

  // ============================================
  // SAVE PDF
  // ============================================
  const fileName = `${data.shopName.replace(/\s+/g, "_")}_Analytics_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
