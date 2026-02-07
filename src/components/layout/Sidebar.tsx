import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Settings,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Printer,
  List,
  Plus,
  Activity,
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
  color?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const mainNavItems: NavItem[] = [
    {
      title: "Dashboard",
      icon: Home,
      path: "/dashboard",
      onClick: () => navigate("/dashboard"),
      color: "text-blue-500",
    },
    {
      title: "Print Queue",
      icon: List,
      path: "/queue",
      onClick: () => navigate("/queue"),
      color: "text-purple-500",
      badge: "12",
    },
    {
      title: "Printers",
      icon: Printer,
      path: "/printers",
      onClick: () => navigate("/printers"),
      color: "text-green-500",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      path: "/analytics",
      onClick: () => navigate("/analytics"),
      color: "text-orange-500",
    },
    {
      title: "Customers",
      icon: Users,
      path: "/customers",
      onClick: () => navigate("/customers"),
      color: "text-pink-500",
    },
  ];

  const systemNavItems: NavItem[] = [
    {
      title: "Add Printer",
      icon: Plus,
      path: "/register-printer",
      onClick: () => navigate("/register-printer"),
      color: "text-emerald-500",
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/settings",
      onClick: () => navigate("/settings"),
      color: "text-gray-500",
    },
  ];

  const NavButton = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const isActive = item.path && location.pathname === item.path;

    return (
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start h-12 px-4 transition-all duration-200 group relative",
          collapsed && "px-3 justify-center",
          isActive
            ? "bg-primary/10 text-primary border-r-2 border-primary shadow-lg dark:bg-primary/20 dark:shadow-primary/25"
            : "hover:bg-accent/50 hover:text-accent-foreground",
          !collapsed && "rounded-xl mx-2",
          collapsed && "rounded-lg mx-1",
        )}
        onClick={item.onClick}
      >
        <Icon
          className={cn(
            "h-5 w-5 transition-colors",
            !collapsed && "mr-4",
            isActive ? "text-primary" : item.color,
            "group-hover:scale-110 transition-transform",
          )}
        />
        {!collapsed && (
          <div className="flex items-center justify-between w-full">
            <span className="font-medium truncate">{item.title}</span>
            {item.badge && (
              <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full px-2 py-1 font-semibold shadow-sm">
                {item.badge}
              </span>
            )}
          </div>
        )}

        {/* Tooltip for collapsed state */}
        {collapsed && (
          <div className="absolute left-full ml-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
            {item.title}
            {item.badge && (
              <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                {item.badge}
              </span>
            )}
          </div>
        )}
      </Button>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col border-r border-border bg-card/30 backdrop-blur-sm transition-all duration-300 shadow-sm dark:shadow-lg dark:shadow-primary/5",
        collapsed ? "w-20" : "w-72",
        className,
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Menu</h2>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-9 w-9 hover:bg-accent/50 rounded-lg"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2 py-6">
        <div className="space-y-8">
          {/* Main Navigation */}
          <div className="space-y-2">
            {!collapsed && (
              <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Main Menu
              </h3>
            )}
            {mainNavItems.map((item, index) => (
              <NavButton key={index} item={item} />
            ))}
          </div>

          <Separator className="mx-4" />

          {/* System Section */}
          <div className="space-y-2">
            {!collapsed && (
              <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                System
              </h3>
            )}
            {systemNavItems.map((item, index) => (
              <NavButton key={index} item={item} />
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        {!collapsed ? (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Zaprint v1.0.0</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
}
