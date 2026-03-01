import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Printer as PrinterIcon,
  Plus,
  Edit,
  Trash2,
  TestTube,
  Wifi,
  WifiOff,
  AlertTriangle,
  RefreshCw,
  Activity,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useShopDashboard } from "@/hooks/useShopDashboard";
import { usePrinterMonitoring } from "@/hooks/usePrinterMonitoring";
import { Printer } from "@/types";
import updatePrinter from "@/backend/printers/updatePrinter";
import deletePrinter from "@/backend/printers/deletePrinter";
import toast from "react-hot-toast";

// Visual status mapping
const getStatusConfig = (status: Printer["status"]) => {
  switch (status) {
    case "online":
      return {
        icon: Wifi,
        color: "bg-green-500",
        textColor: "text-green-700",
        bgColor: "bg-green-50",
        label: "Online",
        variant: "default" as const,
      };
    case "offline":
      return {
        icon: WifiOff,
        color: "bg-yellow-500",
        textColor: "text-yellow-700",
        bgColor: "bg-yellow-50",
        label: "Offline",
        variant: "secondary" as const,
      };
    case "error":
      return {
        icon: AlertTriangle,
        color: "bg-red-500",
        textColor: "text-red-700",
        bgColor: "bg-red-50",
        label: "Error",
        variant: "destructive" as const,
      };
    default:
      return {
        icon: WifiOff,
        color: "bg-gray-500",
        textColor: "text-gray-700",
        bgColor: "bg-gray-50",
        label: "Unknown",
        variant: "secondary" as const,
      };
  }
};

// Printer type display mapping
const getPrinterTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    bw: "Black & White",
    color: "Color",
    photo: "Photo",
    passport: "Passport / ID",
    large_format: "Large Format",
  };
  return typeMap[type] || type;
};

const PRINTER_TYPES = [
  { label: "Black & White", value: "bw" },
  { label: "Color", value: "color" },
  { label: "Photo", value: "photo" },
  { label: "Passport / ID", value: "passport" },
  { label: "Large Format", value: "large_format" },
];

const SERVICES = [
  "Black & White Printing",
  "Color Printing",
  "Photocopy",
  "Photo Printing",
  "Passport Size Prints",
];

const PAPER_SIZES = ["A4", "A3", "A5", "Legal", "Letter", "Passport"];

export default function Printers() {
  const navigate = useNavigate();
  const {
    shop,
    printers: registeredPrinters,
    loading: dashboardLoading,
    refreshPrinters,
  } = useShopDashboard();

  // Initialize printer monitoring
  const {
    printers: monitoredPrinters,
    systemPrinters,
    isMonitoring,
    loading: monitoringLoading,
    error: monitoringError,
    detectSystemPrinters,
    syncPrinterStatus,
  } = usePrinterMonitoring(shop?.id);

  // Use monitored printers if available, otherwise fallback to registered printers
  const printers =
    monitoredPrinters.length > 0 ? monitoredPrinters : registeredPrinters;
  const loading = dashboardLoading || monitoringLoading;

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [editForm, setEditForm] = useState({
    printer_name: "",
    printer_type: "",
    supported_services: [] as string[],
    supported_sizes: [] as string[],
  });
  const [editLoading, setEditLoading] = useState(false);

  const handleEditPrinter = (printer: Printer) => {
    setEditingPrinter(printer);
    setEditForm({
      printer_name: printer.printer_name,
      printer_type: printer.printer_type,
      supported_services: [...printer.supported_services],
      supported_sizes: [...printer.supported_sizes],
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPrinter) return;

    if (!editForm.printer_name.trim()) {
      toast.error("Printer name is required");
      return;
    }

    if (editForm.supported_services.length === 0) {
      toast.error("Please select at least one service");
      return;
    }

    if (editForm.supported_sizes.length === 0) {
      toast.error("Please select at least one paper size");
      return;
    }

    setEditLoading(true);

    try {
      const updatedPrinter = await updatePrinter(editingPrinter.id, {
        printer_name: editForm.printer_name.trim(),
        printer_type: editForm.printer_type,
        supported_services: editForm.supported_services,
        supported_sizes: editForm.supported_sizes,
      });

      toast.success("Printer updated successfully!");
      setEditDialogOpen(false);
      
      // Refresh both printer sources to ensure UI is updated
      // The realtime subscription should also trigger, but we do this for immediate feedback
      await refreshPrinters();
      
      // Sync printer status if monitoring is active
      if (isMonitoring) {
        await syncPrinterStatus();
      }
    } catch (error: any) {
      console.error("Error updating printer:", error);
      toast.error(error.message || "Failed to update printer");
    } finally {
      setEditLoading(false);
    }
  };

  const toggleEditService = (service: string) => {
    setEditForm((prev) => ({
      ...prev,
      supported_services: prev.supported_services.includes(service)
        ? prev.supported_services.filter((s) => s !== service)
        : [...prev.supported_services, service],
    }));
  };

  const toggleEditSize = (size: string) => {
    setEditForm((prev) => ({
      ...prev,
      supported_sizes: prev.supported_sizes.includes(size)
        ? prev.supported_sizes.filter((s) => s !== size)
        : [...prev.supported_sizes, size],
    }));
  };

  const handleDeletePrinter = async (printer: Printer) => {
    try {
      await deletePrinter(printer.id);
      toast.success("Printer deleted successfully!");
      
      // Refresh printer list to ensure UI is updated
      // The realtime subscription should also trigger, but we do this for immediate feedback
      await refreshPrinters();
      
      // Sync printer status if monitoring is active
      if (isMonitoring) {
        await syncPrinterStatus();
      }
    } catch (error: any) {
      console.error("Error deleting printer:", error);
      toast.error(error.message || "Failed to delete printer");
    }
  };

  const handleTestPrinter = (printer: Printer) => {
    console.log("Test printer:", printer.id);
    alert("Test print functionality coming soon!");
  };

  const handleRefreshStatus = async () => {
    const updatedPrinters = await syncPrinterStatus();
    // Force a re-render by updating the state
    if (updatedPrinters && updatedPrinters.length > 0) {
      console.log("Status synced successfully, printers updated");
    }
  };

  const handleDetectPrinters = async () => {
    await detectSystemPrinters();
  };

  // Calculate stats
  const onlineCount = printers.filter((p) => p.status === "online").length;
  const offlineCount = printers.filter((p) => p.status === "offline").length;
  const errorCount = printers.filter((p) => p.status === "error").length;

  if (loading && printers.length === 0) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-6 py-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-5 w-64" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Printer Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Printers</h1>
            <p className="text-muted-foreground mt-2">
              Manage all printers registered for your shop
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Monitoring Status Indicator */}
            {isMonitoring && (
              <Badge variant="outline" className="flex items-center gap-2">
                <Activity className="h-3 w-3 animate-pulse text-green-500" />
                <span>Live Monitoring</span>
              </Badge>
            )}
            <Button
              variant="outline"
              onClick={handleRefreshStatus}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Sync Status
            </Button>
            <Button onClick={() => navigate("/register-printer")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Printer
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {monitoringError && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">
                    Monitoring Error
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {monitoringError}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        {printers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Printers</CardDescription>
                <CardTitle className="text-3xl">{printers.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Online
                </CardDescription>
                <CardTitle className="text-3xl text-green-600">
                  {onlineCount}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  Offline
                </CardDescription>
                <CardTitle className="text-3xl text-yellow-600">
                  {offlineCount}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  Errors
                </CardDescription>
                <CardTitle className="text-3xl text-red-600">
                  {errorCount}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* System Printers Debug Info (Optional) */}
        {systemPrinters.length > 0 && (
          <Card className="mb-6 bg-blue-50/50 border-blue-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    System Printers Detected
                  </CardTitle>
                  <CardDescription>
                    {systemPrinters.length} printer(s) found in your operating
                    system
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDetectPrinters}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-3 w-3 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Detect Again
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {systemPrinters.map((printer, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg p-3 border border-blue-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{printer.name}</p>
                      <Badge
                        variant={
                          printer.status === "online" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {printer.status}
                      </Badge>
                    </div>
                    {printer.driver && (
                      <p className="text-xs text-muted-foreground">
                        Driver: {printer.driver}
                      </p>
                    )}
                    {printer.isDefault && (
                      <Badge variant="outline" className="text-xs mt-2">
                        Default Printer
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {printers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <PrinterIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No printers registered
              </h3>
              <p className="text-muted-foreground mb-6">
                No printers registered. Add your first printer to get started.
              </p>
              <Button onClick={() => navigate("/register-printer")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Printer
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Printer Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {printers.map((printer: Printer) => {
              const statusConfig = getStatusConfig(printer.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={printer.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <PrinterIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {printer.printer_name}
                          </CardTitle>
                          <CardDescription>
                            {getPrinterTypeLabel(printer.printer_type)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={statusConfig.variant}
                        className="flex items-center space-x-1"
                      >
                        <StatusIcon className="h-3 w-3" />
                        <span>{statusConfig.label}</span>
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Status Details */}
                    <div className={`p-3 rounded-lg ${statusConfig.bgColor}`}>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${statusConfig.color} ${
                            printer.status === "online" ? "animate-pulse" : ""
                          }`}
                        ></div>
                        <span
                          className={`text-sm font-medium ${statusConfig.textColor}`}
                        >
                          {printer.status === "online" &&
                            "Printer is ready and online"}
                          {printer.status === "offline" &&
                            "Printer is currently offline"}
                          {printer.status === "error" &&
                            "Printer error detected"}
                        </span>
                      </div>
                      {printer.last_heartbeat && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Last checked:{" "}
                          {new Date(
                            printer.last_heartbeat,
                          ).toLocaleTimeString()}
                        </p>
                      )}
                    </div>

                    {/* Supported Services */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Supported Services
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {printer.supported_services.map((service) => (
                          <Badge
                            key={service}
                            variant="outline"
                            className="text-xs"
                          >
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Supported Paper Sizes */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Paper Sizes</h4>
                      <div className="flex flex-wrap gap-1">
                        {printer.supported_sizes.map((size) => (
                          <Badge
                            key={size}
                            variant="outline"
                            className="text-xs"
                          >
                            {size}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPrinter(printer)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestPrinter(printer)}
                        disabled={printer.status !== "online"}
                        className="flex-1"
                      >
                        <TestTube className="h-3 w-3 mr-1" />
                        Test
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="px-2">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Printer</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "
                              {printer.printer_name}"? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePrinter(printer)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Printer Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Printer</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update printer details and capabilities
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Printer Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-printer-name" className="text-sm font-medium text-foreground">
                Printer Name
              </Label>
              <Input
                id="edit-printer-name"
                value={editForm.printer_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, printer_name: e.target.value })
                }
                placeholder="e.g. HP LaserJet Pro"
                className="bg-background text-foreground"
              />
            </div>

            {/* Printer Type */}
            <div className="space-y-2">
              <Label htmlFor="edit-printer-type" className="text-sm font-medium text-foreground">
                Printer Type
              </Label>
              <Select
                value={editForm.printer_type}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, printer_type: value })
                }
              >
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="Select printer type" />
                </SelectTrigger>
                <SelectContent>
                  {PRINTER_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Supported Services */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                Supported Services
              </Label>
              <div className="grid grid-cols-2 gap-3 p-4 border border-border rounded-lg bg-card">
                {SERVICES.map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-service-${service}`}
                      checked={editForm.supported_services.includes(service)}
                      onCheckedChange={() => toggleEditService(service)}
                    />
                    <Label
                      htmlFor={`edit-service-${service}`}
                      className="cursor-pointer text-sm font-normal text-foreground"
                    >
                      {service}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Supported Paper Sizes */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                Supported Paper Sizes
              </Label>
              <div className="grid grid-cols-3 gap-3 p-4 border border-border rounded-lg bg-card">
                {PAPER_SIZES.map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-size-${size}`}
                      checked={editForm.supported_sizes.includes(size)}
                      onCheckedChange={() => toggleEditSize(size)}
                    />
                    <Label
                      htmlFor={`edit-size-${size}`}
                      className="cursor-pointer text-sm font-normal text-foreground"
                    >
                      {size}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={editLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={editLoading}>
              {editLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
