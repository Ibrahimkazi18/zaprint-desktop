import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useShopDashboard } from "@/hooks/useShopDashboard";
import { cn } from "@/lib/utils";

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar = React.memo(function Navbar({
  darkMode,
  toggleDarkMode,
}: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { shop, printers, loading } = useShopDashboard();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Determine shop connectivity status
  const hasOnline = printers?.some((p: any) => p.status === "online");
  const hasError = printers?.some((p: any) => p.status === "error");
  const noPrinters = !printers || printers.length === 0;

  const statusConfig = loading
    ? { dot: "bg-muted-foreground", label: "Loading", ring: "" }
    : noPrinters
      ? { dot: "bg-slate-400", label: "No printers", ring: "" }
      : hasOnline
        ? {
            dot: "bg-emerald-500",
            label: "Online",
            ring: "ring-emerald-500/30",
          }
        : hasError
          ? { dot: "bg-red-500", label: "Error", ring: "ring-red-500/30" }
          : {
              dot: "bg-amber-500",
              label: "Offline",
              ring: "ring-amber-500/30",
            };

  return (
    <header className="border-b border-border bg-card/90 backdrop-blur-xl supports-[backdrop-filter]:bg-card/70 sticky top-0 z-50 shadow-sm dark:shadow-none">
      <div className="px-5 h-16 flex items-center justify-between">
        {/* Left: shop info */}
        <div className="flex items-center gap-4 min-w-0">
          {shop && (
            <div className="flex items-center gap-3 min-w-0">
              {/* Status dot */}
              <div className="relative flex-shrink-0">
                <div
                  className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    statusConfig.dot,
                    hasOnline && !loading && "animate-pulse",
                  )}
                />
                {hasOnline && !loading && (
                  <div
                    className={cn(
                      "absolute inset-0 rounded-full animate-ping opacity-60",
                      statusConfig.dot,
                    )}
                  />
                )}
              </div>

              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-sm font-semibold text-foreground truncate max-w-[160px]">
                  {shop.shop_name}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {statusConfig.label}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle isDark={darkMode} onToggle={toggleDarkMode} />

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full hover:bg-accent/60 p-0"
              >
                <Avatar
                  className={cn(
                    "h-8 w-8 ring-2 ring-border hover:ring-primary/40 transition-all",
                    statusConfig.ring,
                  )}
                >
                  <AvatarImage src={user?.avatar_url} alt={user?.email} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs font-bold">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60 p-2" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-3 rounded-lg bg-muted/40 mb-1">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarImage src={user?.avatar_url} alt={user?.email} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs font-bold">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-semibold leading-tight truncate">
                      {user?.user_metadata?.full_name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer p-3 rounded-lg gap-3"
                onClick={() => navigate("/settings")}
              >
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer p-3 rounded-lg text-destructive focus:text-destructive gap-3"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
});

export default Navbar;
