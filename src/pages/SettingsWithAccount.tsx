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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Store, Database, Save, Camera, User, Lock, Trash2, AlertTriangle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
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
import { changePassword } from "@/backend/account/changePassword";
import { checkPendingOrders } from "@/backend/account/checkPendingOrders";
import { deleteAccount } from "@/backend/account/deleteAccount";
import { supabase } from "@/auth/supabase";

export default function Settings() {
  const { user } = useAuth();
  const { show: showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);

  // Account management state
  const [shopId, setShopId] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [checkingOrders, setCheckingOrders] = useState(false);
  const [pendingOrdersInfo, setPendingOrdersInfo] = useState<{
    hasPending: boolean;
    count: number;
    statuses: string[];
  }>({ hasPending: false, count: 0, statuses: [] });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

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
    workingHours: {
      start: "09:00",
      end: "18:00",
    },
  });

  const [pricingSettings, setPricingSettings] = useState<Record<string, number>>({});
  const [services, setServices] = useState<any[]>([]);

  // Load shop data on component mount
  useEffect(() => {
    const loadShopData = async () => {
      try {
        if (!user) return;

        const { shop } = await fetchFullShopProfile();
        setShopId(shop.id);

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

        // Check pending orders
        await checkPendingOrdersStatus(shop.id);
      } catch (error) {
        console.error("Error loading shop data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadShopData();
  }, [user]);

  const checkPendingOrdersStatus = async (shopIdParam: string) => {
    try {
      setCheckingOrders(true);
      const result = await checkPendingOrders(shopIdParam);
      setPendingOrdersInfo({
        hasPending: result.hasPendingOrders,
        count: result.pendingCount,
        statuses: result.statuses,
      });
    } catch (error) {
      console.error("Error checking pending orders:", error);
    } finally {
      setCheckingOrders(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !currentPassword) {
      showToast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "error",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast({
        title: "Error",
        description: "New passwords do not match",
        variant: "error",
      });
      return;
    }

    if (newPassword.length < 6) {
      showToast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "error",
      });
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword({
        currentPassword,
        newPassword,
      });

      showToast({
        title: "Success",
        description: "Password changed successfully",
        variant: "success",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "error",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !shopId) return;

    try {
      setDeletingAccount(true);
      await deleteAccount(shopId, user.id);

      showToast({
        title: "Success",
        description: "Account deleted successfully",
        variant: "success",
      });

      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "error",
      });
      setDeletingAccount(false);
      setShowDeleteDialog(false);
    }
  };

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
      console.error(err);
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
        await updateServicePrice(service.id, pricingSettings[service.service_name]);
      }

      setUnsavedChanges(false);
      showToast({
        title: "Success",
        description: "Pricing updated successfully",
        variant: "success",
      });
    } catch (err) {
      console.error(err);
      showToast({
        title: "Error",
        description: "Failed to update pricing",
        variant: "error",
      });
    }
  };

  const handleImageUpload = (_type: "logo", event: React.ChangeEvent<HTMLInputElement>) => {
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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="shop" className="flex items-center space-x-2">
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">Shop</span>
              </TabsTrigger>

              <TabsTrigger value="resources" className="flex items-center space-x-2">
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">Resources</span>
              </TabsTrigger>

              <TabsTrigger value="services" className="flex items-center space-x-2">
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">Services</span>
              </TabsTrigger>

              <TabsTrigger value="pricing" className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Pricing</span>
              </TabsTrigger>

              <TabsTrigger value="account" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
            </TabsList>
