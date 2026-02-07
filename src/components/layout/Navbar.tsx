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
import {
  Sun,
  Moon,
  Settings,
  User,
  LogOut,
  Store,
  Wifi,
  WifiOff,
  Bell,
  Search,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useShopDashboard } from "@/hooks/useShopDashboard";

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Navbar({ darkMode, toggleDarkMode }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { shop, printers, loading } = useShopDashboard();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  const getStatusBadge = () => {
    if (loading)
      return (
        <Badge variant="secondary" className="animate-pulse">
          Loading...
        </Badge>
      );

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
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Store className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Zaprint
            </h1>
          </div>

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
          {/* Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 hover:bg-accent/50"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 hover:bg-accent/50 relative"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full text-[10px] text-primary-foreground flex items-center justify-center">
              3
            </span>
          </Button>

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

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSettings}
            aria-label="Settings"
            className="h-10 w-10 hover:bg-accent/50"
          >
            <Settings className="h-4 w-4" />
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
              <DropdownMenuItem
                className="cursor-pointer p-3 rounded-lg"
                onClick={() => console.log("More options clicked")}
              >
                <Settings className="mr-3 h-4 w-4" />
                <span>Preferences</span>
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
}
