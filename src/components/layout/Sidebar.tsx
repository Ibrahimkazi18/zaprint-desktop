import React, { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Printer,
  Plus,
  Package,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  badge?: string;
  path?: string;
  color: string;
  glow?: string;
}

const Sidebar = React.memo(function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const mainNavItems: NavItem[] = useMemo(
    () => [
      {
        title: "Dashboard",
        icon: Home,
        path: "/dashboard",
        onClick: () => navigate("/dashboard"),
        color: "text-blue-500",
        glow: "rgba(59,130,246,0.15)",
      },
      {
        title: "Pending Orders",
        icon: Package,
        path: "/pending-orders",
        onClick: () => navigate("/pending-orders"),
        color: "text-amber-500",
        glow: "rgba(245,158,11,0.15)",
      },
      {
        title: "Printers",
        icon: Printer,
        path: "/printers",
        onClick: () => navigate("/printers"),
        color: "text-emerald-500",
        glow: "rgba(16,185,129,0.15)",
      },
      {
        title: "Analytics",
        icon: BarChart3,
        path: "/analytics",
        onClick: () => navigate("/analytics"),
        color: "text-orange-500",
        glow: "rgba(249,115,22,0.15)",
      },
    ],
    [navigate],
  );

  const systemNavItems: NavItem[] = useMemo(
    () => [
      {
        title: "Add Printer",
        icon: Plus,
        path: "/register-printer",
        onClick: () => navigate("/register-printer"),
        color: "text-emerald-500",
        glow: "rgba(16,185,129,0.15)",
      },
      {
        title: "Settings",
        icon: Settings,
        path: "/settings",
        onClick: () => navigate("/settings"),
        color: "text-slate-500",
        glow: "rgba(100,116,139,0.15)",
      },
    ],
    [navigate],
  );

  const NavButton = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const isActive = item.path && location.pathname === item.path;

    return (
      <div className="relative px-2">
        {/* Active left accent bar */}
        {isActive && (
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full bg-primary"
            style={{ boxShadow: `0 0 8px var(--primary)` }}
          />
        )}
        <button
          className={cn(
            "w-full flex items-center h-11 rounded-xl px-3 transition-all duration-200 group relative",
            collapsed && "justify-center px-2",
            isActive
              ? "bg-primary/10 text-primary dark:bg-primary/15"
              : "hover:bg-accent/60 text-muted-foreground hover:text-foreground",
          )}
          style={
            isActive
              ? { boxShadow: `inset 0 0 0 1px rgba(59,130,246,0.18)` }
              : {}
          }
          onClick={item.onClick}
        >
          <Icon
            className={cn(
              "h-[18px] w-[18px] flex-shrink-0 transition-all duration-200",
              isActive ? "text-primary" : item.color,
              "group-hover:scale-110",
            )}
          />
          {!collapsed && (
            <div className="flex items-center justify-between w-full ml-3">
              <span
                className={cn(
                  "font-medium text-sm truncate",
                  isActive ? "text-primary" : "",
                )}
              >
                {item.title}
              </span>
              {item.badge && (
                <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-semibold leading-tight">
                  {item.badge}
                </span>
              )}
            </div>
          )}

          {/* Tooltip for collapsed state */}
          {collapsed && (
            <div className="absolute left-full ml-3 px-3 py-2 bg-popover text-popover-foreground text-xs font-medium rounded-lg shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
              {item.title}
              {item.badge && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px]">
                  {item.badge}
                </span>
              )}
            </div>
          )}
        </button>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col border-r border-border bg-card/50 backdrop-blur-sm transition-all duration-300",
        collapsed ? "w-[64px]" : "w-64",
        className,
      )}
    >
      {/* ── Sidebar Header / Logo ── */}
      <div
        className={cn(
          "flex items-center border-b border-border h-16",
          collapsed ? "justify-center px-3" : "px-4 justify-between",
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-primary/10 flex-shrink-0">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-base font-bold tracking-tight text-foreground truncate">
                Zaprint
              </span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                Dashboard
              </span>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center justify-center rounded-lg h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all flex-shrink-0",
            collapsed && "mx-auto",
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <ScrollArea className="flex-1 py-4">
        <div className="space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Main Menu
              </p>
            )}
            {mainNavItems.map((item, index) => (
              <NavButton key={index} item={item} />
            ))}
          </div>

          {/* Divider */}
          <div className="mx-4 h-px bg-border/60" />

          {/* System Section */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                System
              </p>
            )}
            {systemNavItems.map((item, index) => (
              <NavButton key={index} item={item} />
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        {!collapsed ? (
          <div className="px-2 py-1.5 rounded-lg bg-muted/40 text-center">
            <p className="text-[10px] text-muted-foreground font-medium">
              Zaprint v1.0.0
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              className="w-2 h-2 bg-primary rounded-full"
              style={{ boxShadow: "0 0 6px var(--primary)" }}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default Sidebar;
