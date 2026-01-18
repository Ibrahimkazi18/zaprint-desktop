import { useState, useEffect } from "react";
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
import fetchMyShop from "@/backend/shops/fetchMyShop";
import fetchShopStatus from "@/backend/shops/fetchShopStatus";
import updateShopStatus from "@/backend/shops/shopStatus";
import connectMockPrinter from "@/backend/printers/mockPrinter";

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Navbar({ darkMode, toggleDarkMode }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [shopStatus, setShopStatus] = useState<
    "open" | "closed" | "error" | null
  >(null);
  const [shopData, setShopData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch shop data and status
  useEffect(() => {
    const fetchShopData = async () => {
      try {
        if (!user) return;

        const shop = await fetchMyShop();
        setShopData(shop);

        const status = await fetchShopStatus(shop.id);
        setShopStatus(status.status);
      } catch (error) {
        console.error("Error fetching shop data:", error);
        setShopStatus("error");
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [user]);

  const handleStatusToggle = async () => {
    if (!shopData || shopStatus === "error") return;

    try {
      const newStatus = shopStatus === "open" ? "closed" : "open";

      // Only allow manual closing, opening requires printer connection (UI placeholder)
      if (newStatus === "open") {
        // TODO: Check printer connection before allowing open
        alert(
          "Shop can only be opened when printer is connected. This feature will be implemented later.",
        );
        return;
      }

      await updateShopStatus(shopData.id, newStatus);
      setShopStatus(newStatus);
    } catch (error) {
      console.error("Error updating shop status:", error);
    }
  };

  const getStatusBadge = () => {
    if (loading) return <Badge variant="secondary">Loading...</Badge>;

    switch (shopStatus) {
      case "open":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <Wifi className="h-3 w-3 mr-1" />
            Open
          </Badge>
        );
      case "closed":
        return (
          <Badge
            variant="secondary"
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <WifiOff className="h-3 w-3 mr-1" />
            Closed
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            <WifiOff className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  return (
    <header className="border-b dark:border-slate-700 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Zaprint Dashboard</h1>
          {shopData && (
            <div className="flex items-center space-x-2">
              <Store className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {shopData.shop_name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStatusToggle}
                disabled={loading}
                className="h-6 px-2"
              >
                {getStatusBadge()}
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => connectMockPrinter("mock-printer-001")}
            className="border px-3 py-1 rounded"
          >
            Connect (Mock)
          </button>


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
