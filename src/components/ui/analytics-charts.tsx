import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import type { MonthlyRevenue } from "@/backend/analytics/fetchMonthlyRevenue";
import type { DailyPerformance } from "@/backend/analytics/fetchDailyPerformance";
import type { HourlyPerformance } from "@/backend/analytics/fetchHourlyPerformance";
import type { TopCustomer } from "@/backend/analytics/fetchTopCustomers";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// Hook to detect dark mode
function useIsDark() {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

// Shared chart theming
function useChartTheme() {
  const isDark = useIsDark();

  return {
    isDark,
    gridColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    textColor: isDark ? "#a1a1aa" : "#71717a",
    tooltipBg: isDark ? "#18181b" : "#ffffff",
    tooltipText: isDark ? "#fafafa" : "#09090b",
    tooltipBorder: isDark ? "#27272a" : "#e4e4e7",
    primaryColor: "#3b82f6",
    primaryBg: isDark ? "rgba(59,130,246,0.25)" : "rgba(59,130,246,0.15)",
    secondaryColor: "#8b5cf6",
    secondaryBg: isDark ? "rgba(139,92,246,0.25)" : "rgba(139,92,246,0.15)",
    emeraldColor: "#10b981",
    emeraldBg: isDark ? "rgba(16,185,129,0.25)" : "rgba(16,185,129,0.15)",
    amberColor: "#f59e0b",
    amberBg: isDark ? "rgba(245,158,11,0.25)" : "rgba(245,158,11,0.15)",
  };
}

function baseOptions(
  theme: ReturnType<typeof useChartTheme>,
): ChartOptions<any> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: theme.textColor,
          font: { family: "Inter, system-ui, sans-serif", size: 12 },
          usePointStyle: true,
          pointStyle: "circle",
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: theme.tooltipBg,
        titleColor: theme.tooltipText,
        bodyColor: theme.tooltipText,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: {
          family: "Inter, system-ui, sans-serif",
          weight: "bold" as const,
          size: 13,
        },
        bodyFont: { family: "Inter, system-ui, sans-serif", size: 12 },
      },
    },
    scales: {
      x: {
        grid: { color: theme.gridColor },
        ticks: {
          color: theme.textColor,
          font: { family: "Inter, system-ui, sans-serif", size: 11 },
        },
      },
      y: {
        grid: { color: theme.gridColor },
        ticks: {
          color: theme.textColor,
          font: { family: "Inter, system-ui, sans-serif", size: 11 },
        },
      },
    },
  };
}

// ─── Revenue Chart ───────────────────────────────────────────────

interface RevenueChartProps {
  data: MonthlyRevenue[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const theme = useChartTheme();

  const chartData = {
    labels: data.map((d) => d.month_label.split(" ")[0]),
    datasets: [
      {
        type: "line" as const,
        label: "Revenue (₹)",
        data: data.map((d) => d.total_revenue),
        borderColor: theme.primaryColor,
        backgroundColor: theme.primaryBg,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: theme.primaryColor,
        yAxisID: "y",
      },
      {
        type: "bar" as const,
        label: "Jobs",
        data: data.map((d) => d.order_count),
        backgroundColor: theme.secondaryBg,
        borderColor: theme.secondaryColor,
        borderWidth: 1,
        borderRadius: 6,
        yAxisID: "y1",
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    ...baseOptions(theme),
    scales: {
      ...baseOptions(theme).scales,
      y: {
        ...baseOptions(theme).scales!.y,
        position: "left" as const,
        title: {
          display: true,
          text: "Revenue (₹)",
          color: theme.textColor,
          font: { size: 11 },
        },
      },
      y1: {
        position: "right" as const,
        grid: { drawOnChartArea: false },
        ticks: {
          color: theme.textColor,
          font: { family: "Inter, system-ui, sans-serif", size: 11 },
        },
        title: {
          display: true,
          text: "Jobs",
          color: theme.textColor,
          font: { size: 11 },
        },
      },
    },
    plugins: {
      ...baseOptions(theme).plugins,
      tooltip: {
        ...baseOptions(theme).plugins!.tooltip,
        callbacks: {
          label: (ctx: any) => {
            if (ctx.dataset.label === "Revenue (₹)") {
              return `Revenue: ₹${ctx.parsed.y.toLocaleString()}`;
            }
            return `${ctx.dataset.label}: ${ctx.parsed.y}`;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: 350, position: "relative" }}>
      <Line data={chartData as any} options={options} />
    </div>
  );
}

// ─── Daily Performance Chart ─────────────────────────────────────

interface DailyChartProps {
  data: DailyPerformance[];
}

export function DailyChart({ data }: DailyChartProps) {
  const theme = useChartTheme();

  const chartData = {
    labels: data.map((d) => d.day_name),
    datasets: [
      {
        label: "Revenue (₹)",
        data: data.map((d) => d.total_revenue),
        backgroundColor: theme.primaryBg,
        borderColor: theme.primaryColor,
        borderWidth: 1.5,
        borderRadius: 8,
        yAxisID: "y",
      },
      {
        label: "Jobs",
        data: data.map((d) => d.total_orders),
        backgroundColor: theme.emeraldBg,
        borderColor: theme.emeraldColor,
        borderWidth: 1.5,
        borderRadius: 8,
        yAxisID: "y1",
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    ...baseOptions(theme),
    scales: {
      ...baseOptions(theme).scales,
      y: {
        ...baseOptions(theme).scales!.y,
        position: "left" as const,
        title: {
          display: true,
          text: "Revenue (₹)",
          color: theme.textColor,
          font: { size: 11 },
        },
      },
      y1: {
        position: "right" as const,
        grid: { drawOnChartArea: false },
        ticks: {
          color: theme.textColor,
          font: { family: "Inter, system-ui, sans-serif", size: 11 },
        },
        title: {
          display: true,
          text: "Jobs",
          color: theme.textColor,
          font: { size: 11 },
        },
      },
    },
    plugins: {
      ...baseOptions(theme).plugins,
      tooltip: {
        ...baseOptions(theme).plugins!.tooltip,
        callbacks: {
          label: (ctx: any) => {
            if (ctx.dataset.label === "Revenue (₹)") {
              return `Revenue: ₹${ctx.parsed.y.toLocaleString()}`;
            }
            return `${ctx.dataset.label}: ${ctx.parsed.y}`;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: 350, position: "relative" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

// ─── Hourly Performance Chart ────────────────────────────────────

interface HourlyChartProps {
  data: HourlyPerformance[];
}

export function HourlyChart({ data }: HourlyChartProps) {
  const theme = useChartTheme();

  const chartData = {
    labels: data.map((d) => `${d.hour}:00`),
    datasets: [
      {
        label: "Orders",
        data: data.map((d) => d.order_count),
        backgroundColor: data.map((d) => {
          const max = Math.max(...data.map((h) => h.order_count));
          return d.order_count === max && max > 0
            ? theme.primaryColor
            : theme.primaryBg;
        }),
        borderColor: theme.primaryColor,
        borderWidth: 1,
        borderRadius: 6,
        yAxisID: "y",
      },
      {
        type: "line" as const,
        label: "Revenue (₹)",
        data: data.map((d) => d.total_revenue),
        borderColor: theme.amberColor,
        backgroundColor: theme.amberBg,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: theme.amberColor,
        yAxisID: "y1",
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    ...baseOptions(theme),
    scales: {
      ...baseOptions(theme).scales,
      y: {
        ...baseOptions(theme).scales!.y,
        position: "left" as const,
        title: {
          display: true,
          text: "Orders",
          color: theme.textColor,
          font: { size: 11 },
        },
      },
      y1: {
        position: "right" as const,
        grid: { drawOnChartArea: false },
        ticks: {
          color: theme.textColor,
          font: { family: "Inter, system-ui, sans-serif", size: 11 },
        },
        title: {
          display: true,
          text: "Revenue (₹)",
          color: theme.textColor,
          font: { size: 11 },
        },
      },
    },
    plugins: {
      ...baseOptions(theme).plugins,
      tooltip: {
        ...baseOptions(theme).plugins!.tooltip,
        callbacks: {
          label: (ctx: any) => {
            if (ctx.dataset.label === "Revenue (₹)") {
              return `Revenue: ₹${ctx.parsed.y.toLocaleString()}`;
            }
            return `${ctx.dataset.label}: ${ctx.parsed.y}`;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: 350, position: "relative" }}>
      <Bar data={chartData as any} options={options} />
    </div>
  );
}

// ─── Customer Chart ──────────────────────────────────────────────

interface CustomerChartProps {
  data: TopCustomer[];
}

export function CustomerChart({ data }: CustomerChartProps) {
  const theme = useChartTheme();

  // Take top 8 for readability
  const top = data.slice(0, 8);

  const chartData = {
    labels: top.map((d) => d.customer_name || "Unknown"),
    datasets: [
      {
        label: "Revenue (₹)",
        data: top.map((d) => d.total_revenue),
        backgroundColor: theme.primaryBg,
        borderColor: theme.primaryColor,
        borderWidth: 1.5,
        borderRadius: 6,
      },
      {
        label: "Jobs",
        data: top.map((d) => d.total_orders),
        backgroundColor: theme.emeraldBg,
        borderColor: theme.emeraldColor,
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    ...baseOptions(theme),
    indexAxis: "y" as const,
    scales: {
      x: {
        ...baseOptions(theme).scales!.x,
        title: {
          display: true,
          text: "Value",
          color: theme.textColor,
          font: { size: 11 },
        },
      },
      y: {
        ...baseOptions(theme).scales!.y,
        ticks: {
          color: theme.textColor,
          font: { family: "Inter, system-ui, sans-serif", size: 11 },
          callback: function (_, index) {
            const label = top[index]?.customer_name || "Unknown";
            return label.length > 15 ? label.slice(0, 15) + "…" : label;
          },
        },
      },
    },
    plugins: {
      ...baseOptions(theme).plugins,
      tooltip: {
        ...baseOptions(theme).plugins!.tooltip,
        callbacks: {
          label: (ctx: any) => {
            if (ctx.dataset.label === "Revenue (₹)") {
              return `Revenue: ₹${ctx.parsed.x.toLocaleString()}`;
            }
            return `${ctx.dataset.label}: ${ctx.parsed.x}`;
          },
        },
      },
    },
  };

  return (
    <div
      style={{ height: Math.max(300, top.length * 50), position: "relative" }}
    >
      <Bar data={chartData} options={options} />
    </div>
  );
}
