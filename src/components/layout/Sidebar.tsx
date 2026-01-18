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
    },
    {
      title: "Analytics",
      icon: BarChart3,
      path: "/analytics",
      onClick: () => navigate("/analytics"),
    },
    {
      title: "Customers",
      icon: Users,
      path: "/customers",
      onClick: () => navigate("/customers"),
    },
  ];

  const settingsNavItems: NavItem[] = [
    {
      title: "Register Printer",
      icon: Settings,
      path: "/register-printer",
      onClick: () => navigate("/register-printer"),
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/settings",
      onClick: () => navigate("/settings"),
    },
  ];

  const NavButton = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const isActive = item.path && location.pathname === item.path;

    return (
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start h-10 px-3 transition-colors",
          collapsed && "px-2 justify-center",
          isActive && "bg-accent text-accent-foreground"
        )}
        onClick={item.onClick}
      >
        <Icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
        {!collapsed && <span className="truncate">{item.title}</span>}
        {!collapsed && item.badge && (
          <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
            {item.badge}
          </span>
        )}
      </Button>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-card/50 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
        {!collapsed && <h2 className="text-lg font-semibold">Navigation</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <h3 className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Main
              </h3>
            )}
            {mainNavItems.map((item, index) => (
              <NavButton key={index} item={item} />
            ))}
          </div>

          <Separator />

          {/* Settings Section */}
          <div className="space-y-1">
            {!collapsed && (
              <h3 className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                System
              </h3>
            )}
            {settingsNavItems.map((item, index) => (
              <NavButton key={index} item={item} />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
