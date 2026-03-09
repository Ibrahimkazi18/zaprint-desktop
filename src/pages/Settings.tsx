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
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-7xl animate-fade-in relative">
        {/* Sticky Action Bar for Unsaved Changes */}
        {unsavedChanges && (
          <div className="fixed bottom-6 right-6 z-50 animate-slide-up bg-background/80 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-4 flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <p className="text-sm font-medium text-foreground">You have unsaved changes</p>
            </div>
            {/* The save actions are handled contextually below, but we can have a primary save that saves the current tab's content. We'll rely on the contextual save buttons in the content for simplicity. */}
          </div>
        )}

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2 text-base sm:text-lg max-w-2xl">
            Manage your shop preferences, services, resources, and pricing all in one place.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32 rounded-3xl border border-dashed border-border/60 bg-muted/20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-6" />
              <p className="text-muted-foreground font-medium animate-pulse">
                Loading your preferences...
              </p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="shop" className="flex flex-col md:flex-row gap-7 lg:gap-10 items-start" orientation="vertical">
            {/* ── Left Sidebar: Navigation ── */}
            <TabsList className="flex md:flex-col bg-transparent justify-start h-auto w-full md:w-64 flex-shrink-0 gap-2 p-0 sticky top-24 overflow-x-auto no-scrollbar border-b md:border-b-0 border-border pb-4 md:pb-0">
              <TabsTrigger
                value="shop"
                className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm hover:bg-muted/60"
              >
                <Store className="h-5 w-5" />
                Shop Profile
              </TabsTrigger>
              <TabsTrigger
                value="resources"
                className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm hover:bg-muted/60"
              >
                <Package className="h-5 w-5" />
                Resources
              </TabsTrigger>
              <TabsTrigger
                value="services"
                className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm hover:bg-muted/60"
              >
                <CheckCircle2 className="h-5 w-5" />
                Services
              </TabsTrigger>
              <TabsTrigger
                value="pricing"
                className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm hover:bg-muted/60"
              >
                <Database className="h-5 w-5" />
                Pricing List
              </TabsTrigger>
            </TabsList>

            {/* ── Right Content Pane ── */}
            <div className="flex-1 w-full min-w-0">
              {/* ── Shop Settings ── */}
              <TabsContent value="shop" className="space-y-6 mt-0 animate-slide-up focus-visible:outline-none focus-visible:ring-0">
                <Card className="border-border/40 shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl">
                  <div className="h-2 w-full bg-gradient-to-r from-primary/80 via-primary to-accent"></div>
                  <CardHeader className="border-b border-border/40 pb-6 pt-8 px-8 bg-muted/5">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                      Shop Profile
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      Update your shop's core identity and operational hours.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-10">
                    {/* Branding Section */}
                    <section className="space-y-6">
                      <h3 className="text-lg font-semibold border-b border-border/40 pb-2">Branding</h3>
                      <div className="flex items-center gap-8">
                        <div className="relative group">
                          <Avatar className="h-28 w-28 ring-4 ring-background shadow-lg transition-transform group-hover:scale-105 duration-300">
                            <AvatarImage src={shopProfile.logo || ""} className="object-cover" />
                            <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-accent text-primary-foreground">
                              {shopProfile.name.charAt(0) || "S"}
                            </AvatarFallback>
                          </Avatar>
                          <Label htmlFor="shop-logo-overlay" className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-300 backdrop-blur-[2px]">
                            <Camera className="h-6 w-6 text-white mb-1" />
                            <span className="text-[10px] font-semibold text-white uppercase tracking-wider">Change</span>
                            <Input
                              id="shop-logo-overlay"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload("logo", e)}
                            />
                          </Label>
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="font-medium text-foreground">Shop Logo</p>
                          <p className="text-sm text-muted-foreground">
                            This logo will appear on your receipts, PDF exports, and public shop profile.
                            Recommended size: 256x256px.
                          </p>
                          <Label htmlFor="shop-logo-btn" className="inline-block mt-2">
                            <Button variant="secondary" size="sm" asChild className="gap-2 cursor-pointer hover:bg-secondary/80">
                              <span>
                                <Camera className="h-4 w-4" />
                                Upload New Image
                              </span>
                            </Button>
                            <Input
                              id="shop-logo-btn"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload("logo", e)}
                            />
                          </Label>
                        </div>
                      </div>
                    </section>

                    {/* Basic Info Section */}
                    <section className="space-y-6">
                      <h3 className="text-lg font-semibold border-b border-border/40 pb-2">Basic Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="shop-name" className="text-sm font-semibold">
                            Shop Name
                          </Label>
                          <Input
                            id="shop-name"
                            value={shopProfile.name}
                            onChange={(e) => {
                              setShopProfile((p) => ({ ...p, name: e.target.value }));
                              setUnsavedChanges(true);
                            }}
                            className="rounded-xl bg-background/50 h-11 border-border/60 focus-visible:ring-primary/30 focus-visible:border-primary transition-all shadow-sm"
                            placeholder="e.g., Zenith Printers"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shop-phone" className="text-sm font-semibold">
                            Phone Number
                          </Label>
                          <Input
                            id="shop-phone"
                            value={shopProfile.phone}
                            onChange={(e) => {
                              setShopProfile((p) => ({ ...p, phone: e.target.value }));
                              setUnsavedChanges(true);
                            }}
                            className="rounded-xl bg-background/50 h-11 border-border/60 focus-visible:ring-primary/30 focus-visible:border-primary transition-all shadow-sm"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shop-address" className="text-sm font-semibold">
                          Physical Address
                        </Label>
                        <Textarea
                          id="shop-address"
                          value={shopProfile.address}
                          onChange={(e) => {
                            setShopProfile((p) => ({ ...p, address: e.target.value }));
                            setUnsavedChanges(true);
                          }}
                          rows={2}
                          className="rounded-xl resize-none bg-background/50 border-border/60 focus-visible:ring-primary/30 focus-visible:border-primary transition-all shadow-sm"
                          placeholder="123 Printing Lane, Block B..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shop-description" className="text-sm font-semibold">
                          Shop Description
                        </Label>
                        <Textarea
                          id="shop-description"
                          value={shopProfile.description}
                          onChange={(e) => {
                            setShopProfile((p) => ({ ...p, description: e.target.value }));
                            setUnsavedChanges(true);
                          }}
                          rows={3}
                          className="rounded-xl resize-none bg-background/50 border-border/60 focus-visible:ring-primary/30 focus-visible:border-primary transition-all shadow-sm"
                          placeholder="Describe your specialties, e.g., High-quality large format printing and thesis binding."
                        />
                      </div>
                    </section>

                    {/* Operational Hours Section */}
                    <section className="space-y-6">
                      <h3 className="text-lg font-semibold border-b border-border/40 pb-2">Operational Hours</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 p-6 rounded-2xl border border-border/40">
                        <div className="space-y-3">
                          <Label htmlFor="work-start" className="text-sm font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" /> Opening Time
                          </Label>
                          <Input
                            id="work-start"
                            type="time"
                            value={shopProfile.workingHours.start}
                            onChange={(e) => {
                              setShopProfile((p) => ({
                                ...p,
                                workingHours: { ...p.workingHours, start: e.target.value },
                              }));
                              setUnsavedChanges(true);
                            }}
                            className="rounded-xl h-11 bg-background"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="work-end" className="text-sm font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" /> Closing Time
                          </Label>
                          <Input
                            id="work-end"
                            type="time"
                            value={shopProfile.workingHours.end}
                            onChange={(e) => {
                              setShopProfile((p) => ({
                                ...p,
                                workingHours: { ...p.workingHours, end: e.target.value },
                              }));
                              setUnsavedChanges(true);
                            }}
                            className="rounded-xl h-11 bg-background"
                          />
                        </div>
                      </div>
                    </section>

                    <div className="pt-4 border-t border-border/40 flex justify-end">
                      <Button onClick={handleSaveShop} className="h-11 px-8 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all gap-2 text-base font-semibold group">
                        <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        Save Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── Resources Tab ── */}
              <TabsContent value="resources" className="space-y-6 mt-0 animate-slide-up focus-visible:outline-none focus-visible:ring-0">
                <Card className="border-border/40 shadow-xl bg-card/50 backdrop-blur-sm rounded-2xl">
                  <div className="h-2 w-full bg-gradient-to-r from-accent via-primary/50 to-primary"></div>
                  <CardHeader className="border-b border-border/40 pb-6 pt-8 px-8 bg-muted/5">
                    <CardTitle className="text-2xl font-bold">Equipment & Resources</CardTitle>
                    <CardDescription className="text-base mt-2">
                      Select the physical equipment and paper types available in your shop. This helps surface accurate capabilities to customers.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {AVAILABLE_RESOURCES.map((resource) => {
                        const isSelected = selectedResources.includes(resource);
                        return (
                          <div
                            key={resource}
                            className={cn(
                              "p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 shadow-sm hover:shadow-md",
                              isSelected
                                ? "border-primary bg-primary/5 dark:bg-primary/10"
                                : "border-border/40 hover:border-primary/40 bg-background/50"
                            )}
                            onClick={async () => {
                              if (isSelected) {
                                const existing = resources.find((r) => r.resource_name === resource);
                                if (existing) {
                                  await deleteResource(existing.id);
                                  setResources((prev) => prev.filter((r) => r.id !== existing.id));
                                }
                                setSelectedResources((prev) => prev.filter((r) => r !== resource));
                              } else {
                                const { shop } = await fetchFullShopProfile();
                                await addResource(shop.id, resource);
                                const updatedResources = await fetchShopResources(shop.id);
                                setResources(updatedResources);
                                setSelectedResources((prev) => [...prev, resource]);
                              }
                            }}
                          >
                            <span className={cn("text-sm font-semibold select-none", isSelected ? "text-primary" : "text-foreground/80")}>
                              {resource}
                            </span>
                            <div className={cn("h-6 w-6 rounded-full flex items-center justify-center transition-all", isSelected ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground border border-border")}>
                              {isSelected && <CheckCircle2 className="h-4 w-4" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── Services Tab ── */}
              <TabsContent value="services" className="space-y-6 mt-0 animate-slide-up focus-visible:outline-none focus-visible:ring-0">
                <Card className="border-border/40 shadow-xl bg-card/50 backdrop-blur-sm rounded-2xl">
                  <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-primary/80 to-primary"></div>
                  <CardHeader className="border-b border-border/40 pb-6 pt-8 px-8 bg-muted/5">
                    <CardTitle className="text-2xl font-bold">Provided Services</CardTitle>
                    <CardDescription className="text-base mt-2">
                      Enable the services you offer. You can set the exact pricing for these on the Pricing tab.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {AVAILABLE_SERVICES.map((service) => {
                        const isSelected = selectedServices.includes(service);
                        return (
                          <div
                            key={service}
                            className={cn(
                              "p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 shadow-sm hover:shadow-md",
                              isSelected
                                ? "border-primary bg-primary/5 dark:bg-primary/10"
                                : "border-border/40 hover:border-primary/40 bg-background/50"
                            )}
                            onClick={async () => {
                              if (isSelected) {
                                const existing = services.find((s) => s.service_name === service);
                                if (existing) {
                                  await deleteService(existing.id);
                                  setServices((prev) => prev.filter((s) => s.id !== existing.id));
                                }
                                setSelectedServices((prev) => prev.filter((s) => s !== service));
                              } else {
                                const { shop } = await fetchFullShopProfile();
                                let defaultPrice = 10;
                                if (service.includes("Black & White") || service.includes("Photocopy")) defaultPrice = 2;
                                else if (service.includes("Color")) defaultPrice = 5;
                                else if (service.includes("Binding")) defaultPrice = 20;
                                else if (service.includes("Lamination")) defaultPrice = 10;
                                else if (service.includes("Scanning")) defaultPrice = 3;
                                else if (service.includes("Card")) defaultPrice = 15;
                                await addNewService(shop.id, service, defaultPrice);
                                const updatedServices = await fetchShopServices(shop.id);
                                setServices(updatedServices);
                                setSelectedServices((prev) => [...prev, service]);
                                setPricingSettings((prev) => ({ ...prev, [service]: defaultPrice }));
                              }
                            }}
                          >
                            <span className={cn("text-sm font-semibold select-none line-clamp-1", isSelected ? "text-primary" : "text-foreground/80")}>
                              {service}
                            </span>
                            <div className={cn("h-6 w-6 rounded-full flex items-center justify-center transition-all flex-shrink-0", isSelected ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground border border-border")}>
                              {isSelected && <CheckCircle2 className="h-4 w-4" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── Pricing Tab ── */}
              <TabsContent value="pricing" className="space-y-6 mt-0 animate-slide-up focus-visible:outline-none focus-visible:ring-0">
                <Card className="border-border/40 shadow-xl bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden">
                  <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-primary to-purple-500"></div>
                  <CardHeader className="border-b border-border/40 pb-6 pt-8 px-8 bg-muted/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl font-bold">Service Pricing</CardTitle>
                      <CardDescription className="text-base mt-2">
                        Configure the base rates for your active services.
                      </CardDescription>
                    </div>
                    {services.length > 0 && (
                      <Button onClick={handleSavePricing} className="h-11 px-6 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all gap-2 font-semibold">
                        <Save className="h-4 w-4" />
                        Save Pricing
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="p-0">
                    {services.length === 0 ? (
                      <div className="text-center py-20 px-8">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted/40 mb-6 shadow-inner">
                          <Database className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">No active services</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Head over to the Services tab and enable some services first before setting their prices here.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/40 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {services.map((service, index) => (
                          <div key={service.id} className={cn("p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-muted/10", index % 2 === 0 ? "bg-background/20" : "bg-transparent")}>
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                                <Database className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-base text-foreground">{service.service_name}</h4>
                                <p className="text-sm text-muted-foreground mt-0.5">Base Rate</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                              <div className="relative flex-1 sm:w-48 group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold group-focus-within:text-primary transition-colors">₹</span>
                                <Input
                                  id={`price-${service.id}`}
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={pricingSettings[service.service_name] || 0}
                                  onChange={(e) => {
                                    setPricingSettings((prev) => ({
                                      ...prev,
                                      [service.service_name]: parseFloat(e.target.value) || 0,
                                    }));
                                    setUnsavedChanges(true);
                                  }}
                                  className="h-12 pl-10 pr-4 text-right text-lg font-bold rounded-xl border-border/60 bg-background/50 focus-visible:ring-primary/40 focus-visible:border-primary shadow-sm tabular-nums"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  {services.length > 0 && (
                    <div className="p-6 bg-muted/10 border-t border-border/40 text-sm text-muted-foreground text-center">
                      Tip: These base rates will be used as defaults when generating invoices or new print jobs.
                    </div>
                  )}
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>

      {/* Adding custom scrollbar style for the pricing table to make it look premium */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: var(--border);
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: var(--muted-foreground);
        }
      `}} />
    </DashboardLayout>
  );
}
