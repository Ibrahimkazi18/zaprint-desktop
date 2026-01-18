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
    if (loading) return <Badge variant="secondary">Loading...</Badge>;

    // Shop is open if at least one printer is online
    const hasOnlinePrinter = printers.some((p: any) => p.status === "online");
    const hasErrorPrinter = printers.some((p: any) => p.status === "error");

    if (hasOnlinePrinter) {
      return (
        <Badge
          variant="default"
          className="bg-green-500 hover:bg-green-600"
          title="Shop is open - at least one printer is online"
        >
          <Wifi className="h-3 w-3 mr-1" />
          Open
        </Badge>
      );
    } else if (hasErrorPrinter) {
      return (
        <Badge variant="destructive" title="Shop has printer errors">
          <WifiOff className="h-3 w-3 mr-1" />
          Error
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
          title="Shop is closed - no printers online"
        >
          <WifiOff className="h-3 w-3 mr-1" />
          Closed
        </Badge>
      );
    }
  };

  return (
    <header className="border-b dark:border-slate-700 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Zaprint Dashboard</h1>
          {shop && (
            <div className="flex items-center space-x-2">
              <Store className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {shop.shop_name}
              </span>
              <div className="cursor-help">{getStatusBadge()}</div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="h-9 w-9"
          >
            {darkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSettings}
            aria-label="Settings"
            className="h-9 w-9"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar_url} alt={user?.email} />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.full_name || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => console.log("Profile clicked")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => console.log("More options clicked")}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>More</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
