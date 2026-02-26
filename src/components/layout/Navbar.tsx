import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, User, LogOut, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useShopDashboard } from "@/hooks/useShopDashboard";

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

  const getStatusBadge = () => {
    if (loading)
      return (
        <Badge variant="secondary" className="animate-pulse">
          Loading...
        </Badge>
      );

    // Check if there are any printers at all
    if (!printers || printers.length === 0) {
      return (
        <Badge
          variant="secondary"
          className="bg-gray-500 hover:bg-gray-600 text-white shadow-lg dark:shadow-gray-500/25"
          title="No printers registered"
        >
          <WifiOff className="h-3 w-3 mr-1" />
          No Printers
        </Badge>
      );
    }

    // Shop is open if at least one printer is online
    const hasOnlinePrinter = printers.some((p: any) => p.status === "online");
    const hasErrorPrinter = printers.some((p: any) => p.status === "error");

    if (hasOnlinePrinter) {
      return (
        <Badge
          variant="default"
          className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg dark:shadow-emerald-500/25"
          title="Shop is open - at least one printer is online"
        >
          <Wifi className="h-3 w-3 mr-1" />
          Online
        </Badge>
      );
    } else if (hasErrorPrinter) {
      return (
        <Badge
          variant="destructive"
          title="Shop has printer errors"
          className="shadow-lg dark:shadow-red-500/25"
        >
          <WifiOff className="h-3 w-3 mr-1" />
          Error
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="secondary"
          className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg dark:shadow-amber-500/25"
          title="Shop is closed - no printers online"
        >
          <WifiOff className="h-3 w-3 mr-1" />
          Offline
        </Badge>
      );
    }
  };

  return (
    <header className="border-b border-border bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/80 sticky top-0 z-50 shadow-sm dark:shadow-lg dark:shadow-primary/5">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-bold text-foreground">Zaprint</h1>

          {shop && (
            <div className="flex items-center space-x-3 pl-6 border-l border-border/50">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {shop.shop_name}
                </span>
                <span className="text-xs text-muted-foreground">Dashboard</span>
              </div>
              <div className="cursor-help">{getStatusBadge()}</div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="h-10 w-10 hover:bg-accent/50"
          >
            {darkMode ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full hover:bg-accent/50"
              >
                <Avatar className="h-8 w-8 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                  <AvatarImage src={user?.avatar_url} alt={user?.email} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar_url} alt={user?.email} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold leading-none">
                        {user?.user_metadata?.full_name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground mt-1">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer p-3 rounded-lg"
                onClick={() => console.log("Profile clicked")}
              >
                <User className="mr-3 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer p-3 rounded-lg text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-4 w-4" />
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
