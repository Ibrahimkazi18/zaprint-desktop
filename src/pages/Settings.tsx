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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Store, Database, Save, Camera } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { fetchFullShopProfile } from "@/backend/shops/fetchFullShopProfile";
import fetchShopServices from "@/backend/shops/fetchShopServices";

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
    logo: null as string | null,
    workingHours: {
      start: "09:00",
      end: "18:00",
    },
  });

  // Pricing Settings - will be populated from API
  const [pricingSettings, setPricingSettings] = useState<
    Record<string, number>
  >({});
  const [services, setServices] = useState<any[]>([]);

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
          logo: shop.image_url || null,
          workingHours: {
            start: shop.start_time || "09:00",
            end: shop.end_time || "18:00",
          },
        });

        // Load services and pricing
        const shopServices = await fetchShopServices(shop.id);
        setServices(shopServices);

        // Convert services to pricing settings
        const pricing: Record<string, number> = {};
        shopServices.forEach((service: any) => {
          pricing[service.service_name] = service.price || 0;
        });
        setPricingSettings(pricing);
      } catch (error) {
        console.error("Error loading shop data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadShopData();
  }, [user]);

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
    type: "logo",
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setShopProfile((prev) => ({
          ...prev,
          logo: reader.result as string,
        }));
        setUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    }
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="shop" className="flex items-center space-x-2">
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">Shop</span>
              </TabsTrigger>
              <TabsTrigger
                value="pricing"
                className="flex items-center space-x-2"
              >
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Pricing</span>
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

                  {/* Working Hours */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      Working Hours
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="work-start">Start Time</Label>
                        <Input
                          id="work-start"
                          type="time"
                          value={shopProfile.workingHours.start}
                          onChange={(e) => {
                            setShopProfile((prev) => ({
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
                        <Label htmlFor="work-end">End Time</Label>
                        <Input
                          id="work-end"
                          type="time"
                          value={shopProfile.workingHours.end}
                          onChange={(e) => {
                            setShopProfile((prev) => ({
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

            {/* Pricing Settings */}
            <TabsContent value="pricing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Pricing</CardTitle>
                  <CardDescription>
                    Set your service rates and pricing for all available
                    services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {services.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No services found. Add services to your shop to set
                        pricing.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {services.map((service) => (
                        <div key={service.id} className="space-y-2">
                          <Label htmlFor={`price-${service.id}`}>
                            {service.service_name}
                          </Label>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              ₹
                            </span>
                            <Input
                              id={`price-${service.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={pricingSettings[service.service_name] || 0}
                              onChange={(e) => {
                                setPricingSettings((prev) => ({
                                  ...prev,
                                  [service.service_name]:
                                    parseFloat(e.target.value) || 0,
                                }));
                                setUnsavedChanges(true);
                              }}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={() => handleSave("pricing")}
                    className="w-full md:w-auto"
                    disabled={services.length === 0}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Pricing Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
