import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Settings as SettingsIcon,
  User,
  Store,
  Bell,
  Shield,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  Camera,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { fetchFullShopProfile } from "@/backend/shops/fetchFullShopProfile";

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Shop Profile Settings - Initialize with empty values, will be populated from API
  const [shopProfile, setShopProfile] = useState({
    name: "",
    phone: "",
    address: "",
    description: "",
    website: "",
    logo: null as string | null,
  });

  // User Profile Settings - Initialize from auth context
  const [userProfile, setUserProfile] = useState({
    name: user?.user_metadata?.full_name || user?.user_metadata?.name || "",
    email: user?.email || "",
    phone: "",
    role: "Owner",
    avatar: user?.user_metadata?.avatar_url || null,
  });

  // Load shop data on component mount
  useEffect(() => {
    const loadShopData = async () => {
      try {
        if (!user) return;

        const { shop } = await fetchFullShopProfile();

        // Update shop profile with real data
        setShopProfile({
          name: shop.shop_name || "",
          phone: shop.phone || "",
          address: shop.location || "",
          description: shop.description || "",
          website: shop.website || "",
          logo: shop.image_url || null,
        });

        // Update user profile with any additional data from shop
        setUserProfile((prev) => ({
          ...prev,
          phone: shop.owner_phone || shop.phone || prev.phone,
        }));
      } catch (error) {
        console.error("Error loading shop data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadShopData();
  }, [user]);

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderUpdates: true,
    paymentAlerts: true,
    systemUpdates: false,
    marketingEmails: false,
  });

  // Business Settings
  const [businessSettings, setBusinessSettings] = useState({
    currency: "INR",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    workingHours: {
      start: "09:00",
      end: "18:00",
    },
    workingDays: [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ],
    autoAcceptOrders: false,
    requirePaymentUpfront: false,
  });

  // Pricing Settings
  const [pricingSettings, setPricingSettings] = useState({
    blackWhitePrint: 2,
    colorPrint: 5,
    binding: 20,
    lamination: 10,
    scanning: 3,
    urgentJobSurcharge: 50, // percentage
  });

  const handleSave = (section: string) => {
    console.log(`Saving ${section} settings...`);
    setUnsavedChanges(false);
    // TODO: Implement actual API calls to save settings
    // For now, just showing success message
    alert(
      `${section} settings saved successfully! (Update functions will be implemented later)`,
    );
  };

  const handleImageUpload = (
    type: "logo" | "avatar",
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "logo") {
          setShopProfile((prev) => ({
            ...prev,
            logo: reader.result as string,
          }));
        } else {
          setUserProfile((prev) => ({
            ...prev,
            avatar: reader.result as string,
          }));
        }
        setUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const exportData = () => {
    console.log("Exporting data...");
    // In real app, this would trigger data export
  };

  const importData = () => {
    console.log("Importing data...");
    // In real app, this would handle data import
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your shop preferences and configuration
            </p>
          </div>
          {unsavedChanges && (
            <Badge variant="secondary" className="animate-pulse">
              Unsaved Changes
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading settings...</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="shop" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="shop" className="flex items-center space-x-2">
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">Shop</span>
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center space-x-2"
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger
                value="business"
                className="flex items-center space-x-2"
              >
                <SettingsIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Business</span>
              </TabsTrigger>
              <TabsTrigger
                value="pricing"
                className="flex items-center space-x-2"
              >
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Pricing</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Data</span>
              </TabsTrigger>
            </TabsList>

            {/* Shop Settings */}
            <TabsContent value="shop" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shop Information</CardTitle>
                  <CardDescription>
                    Update your shop details and branding
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={shopProfile.logo || ""} />
                      <AvatarFallback className="text-2xl">
                        {shopProfile.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Label htmlFor="shop-logo" className="cursor-pointer">
                        <Button variant="outline" asChild>
                          <span className="flex items-center space-x-2">
                            <Camera className="h-4 w-4" />
                            <span>Upload Logo</span>
                          </span>
                        </Button>
                        <Input
                          id="shop-logo"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload("logo", e)}
                        />
                      </Label>
                      <p className="text-xs text-muted-foreground mt-2">
                        Recommended: 200x200px, PNG or JPG
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="shop-name">Shop Name</Label>
                      <Input
                        id="shop-name"
                        value={shopProfile.name}
                        onChange={(e) => {
                          setShopProfile((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shop-phone">Phone</Label>
                      <Input
                        id="shop-phone"
                        value={shopProfile.phone}
                        onChange={(e) => {
                          setShopProfile((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shop-website">Website</Label>
                      <Input
                        id="shop-website"
                        value={shopProfile.website}
                        onChange={(e) => {
                          setShopProfile((prev) => ({
                            ...prev,
                            website: e.target.value,
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shop-address">Address</Label>
                    <Textarea
                      id="shop-address"
                      value={shopProfile.address}
                      onChange={(e) => {
                        setShopProfile((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }));
                        setUnsavedChanges(true);
                      }}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shop-description">Description</Label>
                    <Textarea
                      id="shop-description"
                      value={shopProfile.description}
                      onChange={(e) => {
                        setShopProfile((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }));
                        setUnsavedChanges(true);
                      }}
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={() => handleSave("shop")}
                    className="w-full md:w-auto"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Shop Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Settings */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Profile</CardTitle>
                  <CardDescription>
                    Manage your personal account information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={userProfile.avatar || ""} />
                      <AvatarFallback className="text-2xl">
                        {userProfile.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Label htmlFor="user-avatar" className="cursor-pointer">
                        <Button variant="outline" asChild>
                          <span className="flex items-center space-x-2">
                            <Camera className="h-4 w-4" />
                            <span>Upload Photo</span>
                          </span>
                        </Button>
                        <Input
                          id="user-avatar"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload("avatar", e)}
                        />
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="user-name">Full Name</Label>
                      <Input
                        id="user-name"
                        value={userProfile.name}
                        onChange={(e) => {
                          setUserProfile((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-email">Email</Label>
                      <Input
                        id="user-email"
                        type="email"
                        value={userProfile.email}
                        onChange={(e) => {
                          setUserProfile((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-phone">Phone</Label>
                      <Input
                        id="user-phone"
                        value={userProfile.phone}
                        onChange={(e) => {
                          setUserProfile((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-role">Role</Label>
                      <Input id="user-role" value={userProfile.role} disabled />
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSave("profile")}
                    className="w-full md:w-auto"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to be notified
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={notifications.emailNotifications}
                        onCheckedChange={(checked) => {
                          setNotifications((prev) => ({
                            ...prev,
                            emailNotifications: checked,
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via SMS
                        </p>
                      </div>
                      <Switch
                        checked={notifications.smsNotifications}
                        onCheckedChange={(checked) => {
                          setNotifications((prev) => ({
                            ...prev,
                            smsNotifications: checked,
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive browser push notifications
                        </p>
                      </div>
                      <Switch
                        checked={notifications.pushNotifications}
                        onCheckedChange={(checked) => {
                          setNotifications((prev) => ({
                            ...prev,
                            pushNotifications: checked,
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Order Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about new orders and updates
                        </p>
                      </div>
                      <Switch
                        checked={notifications.orderUpdates}
                        onCheckedChange={(checked) => {
                          setNotifications((prev) => ({
                            ...prev,
                            orderUpdates: checked,
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Payment Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about payments and transactions
                        </p>
                      </div>
                      <Switch
                        checked={notifications.paymentAlerts}
                        onCheckedChange={(checked) => {
                          setNotifications((prev) => ({
                            ...prev,
                            paymentAlerts: checked,
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>System Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about system maintenance and updates
                        </p>
                      </div>
                      <Switch
                        checked={notifications.systemUpdates}
                        onCheckedChange={(checked) => {
                          setNotifications((prev) => ({
                            ...prev,
                            systemUpdates: checked,
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive promotional emails and offers
                        </p>
                      </div>
                      <Switch
                        checked={notifications.marketingEmails}
                        onCheckedChange={(checked) => {
                          setNotifications((prev) => ({
                            ...prev,
                            marketingEmails: checked,
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSave("notifications")}
                    className="w-full md:w-auto"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Notification Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Business Settings */}
            <TabsContent value="business" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Configuration</CardTitle>
                  <CardDescription>
                    Configure your business operations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select
                        value={businessSettings.currency}
                        onValueChange={(value) => {
                          setBusinessSettings((prev) => ({
                            ...prev,
                            currency: value,
                          }));
                          setUnsavedChanges(true);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                          <SelectItem value="USD">US Dollar ($)</SelectItem>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select
                        value={businessSettings.timezone}
                        onValueChange={(value) => {
                          setBusinessSettings((prev) => ({
                            ...prev,
                            timezone: value,
                          }));
                          setUnsavedChanges(true);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Kolkata">
                            Asia/Kolkata
                          </SelectItem>
                          <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                          <SelectItem value="America/New_York">
                            America/New_York
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="work-start">Working Hours Start</Label>
                      <Input
                        id="work-start"
                        type="time"
                        value={businessSettings.workingHours.start}
                        onChange={(e) => {
                          setBusinessSettings((prev) => ({
                            ...prev,
                            workingHours: {
                              ...prev.workingHours,
                              start: e.target.value,
                            },
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="work-end">Working Hours End</Label>
                      <Input
                        id="work-end"
                        type="time"
                        value={businessSettings.workingHours.end}
                        onChange={(e) => {
                          setBusinessSettings((prev) => ({
                            ...prev,
                            workingHours: {
                              ...prev.workingHours,
                              end: e.target.value,
                            },
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto Accept Orders</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically accept new orders
                        </p>
                      </div>
                      <Switch
                        checked={businessSettings.autoAcceptOrders}
                        onCheckedChange={(checked) => {
                          setBusinessSettings((prev) => ({
                            ...prev,
                            autoAcceptOrders: checked,
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Require Payment Upfront</Label>
                        <p className="text-sm text-muted-foreground">
                          Require payment before starting work
                        </p>
                      </div>
                      <Switch
                        checked={businessSettings.requirePaymentUpfront}
                        onCheckedChange={(checked) => {
                          setBusinessSettings((prev) => ({
                            ...prev,
                            requirePaymentUpfront: checked,
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSave("business")}
                    className="w-full md:w-auto"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Business Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing Settings */}
            <TabsContent value="pricing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Pricing</CardTitle>
                  <CardDescription>
                    Set your service rates and pricing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="bw-print">
                        Black & White Print (per page)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-sm">₹</span>
                        <Input
                          id="bw-print"
                          type="number"
                          value={pricingSettings.blackWhitePrint}
                          onChange={(e) => {
                            setPricingSettings((prev) => ({
                              ...prev,
                              blackWhitePrint: Number(e.target.value),
                            }));
                            setUnsavedChanges(true);
                          }}
                          className="pl-8"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color-print">
                        Color Print (per page)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-sm">₹</span>
                        <Input
                          id="color-print"
                          type="number"
                          value={pricingSettings.colorPrint}
                          onChange={(e) => {
                            setPricingSettings((prev) => ({
                              ...prev,
                              colorPrint: Number(e.target.value),
                            }));
                            setUnsavedChanges(true);
                          }}
                          className="pl-8"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="binding">Binding Service</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-sm">₹</span>
                        <Input
                          id="binding"
                          type="number"
                          value={pricingSettings.binding}
                          onChange={(e) => {
                            setPricingSettings((prev) => ({
                              ...prev,
                              binding: Number(e.target.value),
                            }));
                            setUnsavedChanges(true);
                          }}
                          className="pl-8"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lamination">Lamination (per page)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-sm">₹</span>
                        <Input
                          id="lamination"
                          type="number"
                          value={pricingSettings.lamination}
                          onChange={(e) => {
                            setPricingSettings((prev) => ({
                              ...prev,
                              lamination: Number(e.target.value),
                            }));
                            setUnsavedChanges(true);
                          }}
                          className="pl-8"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scanning">Scanning (per page)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-sm">₹</span>
                        <Input
                          id="scanning"
                          type="number"
                          value={pricingSettings.scanning}
                          onChange={(e) => {
                            setPricingSettings((prev) => ({
                              ...prev,
                              scanning: Number(e.target.value),
                            }));
                            setUnsavedChanges(true);
                          }}
                          className="pl-8"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="urgent-surcharge">
                        Urgent Job Surcharge (%)
                      </Label>
                      <div className="relative">
                        <Input
                          id="urgent-surcharge"
                          type="number"
                          value={pricingSettings.urgentJobSurcharge}
                          onChange={(e) => {
                            setPricingSettings((prev) => ({
                              ...prev,
                              urgentJobSurcharge: Number(e.target.value),
                            }));
                            setUnsavedChanges(true);
                          }}
                        />
                        <span className="absolute right-3 top-3 text-sm">
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSave("pricing")}
                    className="w-full md:w-auto"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Pricing Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Management */}
            <TabsContent value="data" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>
                    Export, import, and manage your data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Export Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Download your data for backup or migration purposes
                      </p>
                      <Button
                        onClick={exportData}
                        variant="outline"
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export All Data
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Import Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Import data from a previous backup or another system
                      </p>
                      <Button
                        onClick={importData}
                        variant="outline"
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Import Data
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-red-600">Danger Zone</h4>
                      <p className="text-sm text-muted-foreground">
                        These actions are irreversible. Please be careful.
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete All Data
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete all your shop data including
                              customers, orders, and settings.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                              Yes, delete everything
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
