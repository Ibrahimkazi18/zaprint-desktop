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
import {
  Store,
  Database,
  Save,
  Camera,
  Package,
  CheckCircle2,
  Clock,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { fetchFullShopProfile } from "@/backend/shops/fetchFullShopProfile";
import fetchShopServices from "@/backend/shops/fetchShopServices";
import { useToast } from "@/components/toast/useToast";
import updateShop from "@/backend/shops/updateShop";
import updateServicePrice from "@/backend/shops/updateServicePrice";
import addNewService from "@/backend/shops/addNewService";
import deleteService from "@/backend/shops/deleteService";
import addResource from "@/backend/shops/addResource";
import deleteResource from "@/backend/shops/deleteResource";
import fetchShopResources from "@/backend/shops/fetchShopResources";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { user } = useAuth();
  const { show: showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);

  const AVAILABLE_SERVICES = [
    "Black & White Printing",
    "Color Printing",
    "Spiral Binding",
    "Hard Binding",
    "Lamination",
    "Stapling",
    "Folding",
    "Cutting / Trimming",
    "Large Format (Poster/Banner)",
    "ID Card Printing",
    "Scanning",
    "Photocopy",
    "Thesis Binding",
    "Booklet Making",
    "Business Card Printing",
    "Envelope Printing",
    "Sticker Printing",
    "Certificate Printing",
  ];

  const AVAILABLE_RESOURCES = [
    "A4 Paper",
    "A3 Paper",
    "A5 Paper",
    "Legal Size",
    "Letter Size",
    "Glossy Paper",
    "Matte Paper",
    "Card Stock",
    "Sticker Paper",
    "Color Printer",
    "B/W Printer",
    "High-Speed Printer",
    "Laser Printer",
    "Inkjet Printer",
    "Large Format Printer",
    "Laminating Machine",
    "Binding Machine",
    "Paper Cutter",
    "Scanner",
  ];

  const [shopProfile, setShopProfile] = useState({
    name: "",
    phone: "",
    address: "",
    description: "",
    logo: null as string | null,
    workingHours: { start: "09:00", end: "18:00" },
  });

  const [pricingSettings, setPricingSettings] = useState<
    Record<string, number>
  >({});
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const loadShopData = async () => {
      try {
        if (!user) return;
        const { shop } = await fetchFullShopProfile();
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
        const shopServices = await fetchShopServices(shop.id);
        setServices(shopServices);
        setSelectedServices(shopServices.map((s: any) => s.service_name));
        const shopResources = await fetchShopResources(shop.id);
        setResources(shopResources);
        setSelectedResources(shopResources.map((r: any) => r.resource_name));
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

  const handleSaveShop = async () => {
    try {
      const { shop } = await fetchFullShopProfile();
      await updateShop({
        shop_id: shop.id,
        shop_name: shopProfile.name,
        phone: shopProfile.phone,
        location: shopProfile.address,
        description: shopProfile.description,
        image_url: shopProfile.logo,
        start_time: shopProfile.workingHours.start,
        end_time: shopProfile.workingHours.end,
      });
      setUnsavedChanges(false);
      showToast({
        title: "Success",
        description: "Shop updated successfully",
        variant: "success",
      });
    } catch (err) {
      showToast({
        title: "Error",
        description: "Failed to update shop",
        variant: "error",
      });
    }
  };

  const handleSavePricing = async () => {
    try {
      for (const service of services) {
        await updateServicePrice(
          service.id,
          pricingSettings[service.service_name],
        );
      }
      setUnsavedChanges(false);
      showToast({
        title: "Success",
        description: "Pricing updated successfully",
        variant: "success",
      });
    } catch (err) {
      showToast({
        title: "Error",
        description: "Failed to update pricing",
        variant: "error",
      });
    }
  };

  const handleImageUpload = (
    _type: "logo",
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setShopProfile((prev) => ({ ...prev, logo: reader.result as string }));
        setUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8 animate-slide-up">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Manage your shop preferences and configuration
            </p>
          </div>
          {unsavedChanges && (
            <Badge
              variant="secondary"
              className="animate-pulse rounded-full px-3 text-xs font-semibold"
            >
              Unsaved Changes
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Loading settings...
              </p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="shop" className="space-y-6">
            <TabsList className="h-11 p-1 rounded-xl bg-muted/50 border border-border/60">
              <TabsTrigger
                value="shop"
                className="rounded-lg gap-2 text-sm font-medium"
              >
                <Store className="h-3.5 w-3.5" />
                Shop
              </TabsTrigger>
              <TabsTrigger
                value="resources"
                className="rounded-lg gap-2 text-sm font-medium"
              >
                <Package className="h-3.5 w-3.5" />
                Resources
              </TabsTrigger>
              <TabsTrigger
                value="services"
                className="rounded-lg gap-2 text-sm font-medium"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Services
              </TabsTrigger>
              <TabsTrigger
                value="pricing"
                className="rounded-lg gap-2 text-sm font-medium"
              >
                <Database className="h-3.5 w-3.5" />
                Pricing
              </TabsTrigger>
            </TabsList>

            {/* ── Shop Settings ── */}
            <TabsContent value="shop" className="space-y-6">
              <Card className="border-border/60">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-base font-semibold">
                    Shop Information
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Update your shop details and branding
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Logo upload */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-20 w-20 ring-2 ring-border">
                        <AvatarImage src={shopProfile.logo || ""} />
                        <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                          {shopProfile.name.charAt(0) || "S"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <Label htmlFor="shop-logo" className="cursor-pointer">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="gap-2"
                        >
                          <span>
                            <Camera className="h-3.5 w-3.5" />
                            Upload Logo
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
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        Recommended: 200×200px, PNG or JPG
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="shop-name"
                        className="text-sm font-medium"
                      >
                        Shop Name
                      </Label>
                      <Input
                        id="shop-name"
                        value={shopProfile.name}
                        onChange={(e) => {
                          setShopProfile((p) => ({
                            ...p,
                            name: e.target.value,
                          }));
                          setUnsavedChanges(true);
                        }}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="shop-phone"
                        className="text-sm font-medium"
                      >
                        Phone
                      </Label>
                      <Input
                        id="shop-phone"
                        value={shopProfile.phone}
                        onChange={(e) => {
                          setShopProfile((p) => ({
                            ...p,
                            phone: e.target.value,
                          }));
                          setUnsavedChanges(true);
                        }}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="shop-address"
                      className="text-sm font-medium"
                    >
                      Address
                    </Label>
                    <Textarea
                      id="shop-address"
                      value={shopProfile.address}
                      onChange={(e) => {
                        setShopProfile((p) => ({
                          ...p,
                          address: e.target.value,
                        }));
                        setUnsavedChanges(true);
                      }}
                      rows={3}
                      className="rounded-xl resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="shop-description"
                      className="text-sm font-medium"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="shop-description"
                      value={shopProfile.description}
                      onChange={(e) => {
                        setShopProfile((p) => ({
                          ...p,
                          description: e.target.value,
                        }));
                        setUnsavedChanges(true);
                      }}
                      rows={4}
                      className="rounded-xl resize-none"
                    />
                  </div>

                  {/* Working Hours */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Working Hours
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="work-start"
                          className="text-xs text-muted-foreground font-medium"
                        >
                          Start Time
                        </Label>
                        <Input
                          id="work-start"
                          type="time"
                          value={shopProfile.workingHours.start}
                          onChange={(e) => {
                            setShopProfile((p) => ({
                              ...p,
                              workingHours: {
                                ...p.workingHours,
                                start: e.target.value,
                              },
                            }));
                            setUnsavedChanges(true);
                          }}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="work-end"
                          className="text-xs text-muted-foreground font-medium"
                        >
                          End Time
                        </Label>
                        <Input
                          id="work-end"
                          type="time"
                          value={shopProfile.workingHours.end}
                          onChange={(e) => {
                            setShopProfile((p) => ({
                              ...p,
                              workingHours: {
                                ...p.workingHours,
                                end: e.target.value,
                              },
                            }));
                            setUnsavedChanges(true);
                          }}
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSaveShop} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Shop Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Services Tab ── */}
            <TabsContent value="services" className="space-y-6">
              <Card className="border-border/60">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-base font-semibold">
                    Manage Services
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Select the services your shop provides — click to toggle
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {AVAILABLE_SERVICES.map((service) => {
                      const isSelected = selectedServices.includes(service);
                      return (
                        <div
                          key={service}
                          className={cn(
                            "p-3.5 rounded-xl border cursor-pointer transition-all duration-150 flex items-center justify-between gap-3",
                            isSelected
                              ? "border-primary/40 bg-primary/5 dark:bg-primary/10"
                              : "border-border/60 hover:border-border hover:bg-muted/30",
                          )}
                          onClick={async () => {
                            if (isSelected) {
                              const existing = services.find(
                                (s) => s.service_name === service,
                              );
                              if (existing) {
                                await deleteService(existing.id);
                                setServices((prev) =>
                                  prev.filter((s) => s.id !== existing.id),
                                );
                              }
                              setSelectedServices((prev) =>
                                prev.filter((s) => s !== service),
                              );
                            } else {
                              const { shop } = await fetchFullShopProfile();
                              let defaultPrice = 10;
                              if (
                                service.includes("Black & White") ||
                                service.includes("Photocopy")
                              )
                                defaultPrice = 2;
                              else if (service.includes("Color"))
                                defaultPrice = 5;
                              else if (service.includes("Binding"))
                                defaultPrice = 20;
                              else if (service.includes("Lamination"))
                                defaultPrice = 10;
                              else if (service.includes("Scanning"))
                                defaultPrice = 3;
                              else if (service.includes("Card"))
                                defaultPrice = 15;
                              await addNewService(
                                shop.id,
                                service,
                                defaultPrice,
                              );
                              const updatedServices = await fetchShopServices(
                                shop.id,
                              );
                              setServices(updatedServices);
                              setSelectedServices((prev) => [...prev, service]);
                              setPricingSettings((prev) => ({
                                ...prev,
                                [service]: defaultPrice,
                              }));
                            }
                          }}
                        >
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isSelected ? "text-primary" : "text-foreground",
                            )}
                          >
                            {service}
                          </span>
                          {isSelected ? (
                            <div className="p-1 rounded-full bg-primary/15 flex-shrink-0">
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                            </div>
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-border/60 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Resources Tab ── */}
            <TabsContent value="resources" className="space-y-6">
              <Card className="border-border/60">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-base font-semibold">
                    Manage Resources
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Select the resources available in your shop — click to
                    toggle
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {AVAILABLE_RESOURCES.map((resource) => {
                      const isSelected = selectedResources.includes(resource);
                      return (
                        <div
                          key={resource}
                          className={cn(
                            "p-3.5 rounded-xl border cursor-pointer transition-all duration-150 flex items-center justify-between gap-3",
                            isSelected
                              ? "border-primary/40 bg-primary/5 dark:bg-primary/10"
                              : "border-border/60 hover:border-border hover:bg-muted/30",
                          )}
                          onClick={async () => {
                            if (isSelected) {
                              const existing = resources.find(
                                (r) => r.resource_name === resource,
                              );
                              if (existing) {
                                await deleteResource(existing.id);
                                setResources((prev) =>
                                  prev.filter((r) => r.id !== existing.id),
                                );
                              }
                              setSelectedResources((prev) =>
                                prev.filter((r) => r !== resource),
                              );
                            } else {
                              const { shop } = await fetchFullShopProfile();
                              await addResource(shop.id, resource);
                              const updatedResources = await fetchShopResources(
                                shop.id,
                              );
                              setResources(updatedResources);
                              setSelectedResources((prev) => [
                                ...prev,
                                resource,
                              ]);
                            }
                          }}
                        >
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isSelected ? "text-primary" : "text-foreground",
                            )}
                          >
                            {resource}
                          </span>
                          {isSelected ? (
                            <div className="p-1 rounded-full bg-primary/15 flex-shrink-0">
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                            </div>
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-border/60 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Pricing Tab ── */}
            <TabsContent value="pricing" className="space-y-6">
              <Card className="border-border/60">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-base font-semibold">
                    Service Pricing
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Set your service rates for all available services
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {services.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="inline-flex p-4 rounded-2xl bg-muted/40 mb-3">
                        <Database className="h-7 w-7 text-muted-foreground/40" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No services found. Add services to your shop to set
                        pricing.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {services.map((service) => (
                        <div key={service.id} className="space-y-2">
                          <Label
                            htmlFor={`price-${service.id}`}
                            className="text-sm font-medium"
                          >
                            {service.service_name}
                          </Label>
                          <div className="flex items-center rounded-xl border border-border/60 overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0">
                            <span className="px-3 py-2.5 bg-muted/50 text-sm font-semibold text-muted-foreground border-r border-border/60 flex-shrink-0">
                              ₹
                            </span>
                            <Input
                              id={`price-${service.id}`}
                              type="number"
                              min="0"
                              step="0.1"
                              value={pricingSettings[service.service_name] || 0}
                              onChange={(e) => {
                                setPricingSettings((prev) => ({
                                  ...prev,
                                  [service.service_name]:
                                    parseFloat(e.target.value) || 0,
                                }));
                                setUnsavedChanges(true);
                              }}
                              className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {services.length > 0 && (
                    <Button
                      onClick={handleSavePricing}
                      className="mt-6 gap-2"
                      disabled={services.length === 0}
                    >
                      <Save className="h-4 w-4" />
                      Save Pricing Settings
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
