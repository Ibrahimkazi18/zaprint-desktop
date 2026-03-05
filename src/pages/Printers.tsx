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
import { cn } from "@/lib/utils";

const getStatusConfig = (status: Printer["status"]) => {
  switch (status) {
    case "online":
      return {
        icon: Wifi,
        dot: "bg-emerald-500",
        text: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500/8 dark:bg-emerald-500/10",
        border: "border-emerald-500/20",
        label: "Online",
        badgeVariant: "default" as const,
        badgeClass:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
      };
    case "offline":
      return {
        icon: WifiOff,
        dot: "bg-amber-500",
        text: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-500/8 dark:bg-amber-500/10",
        border: "border-amber-500/20",
        label: "Offline",
        badgeVariant: "secondary" as const,
        badgeClass:
          "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
      };
    case "error":
      return {
        icon: AlertTriangle,
        dot: "bg-red-500",
        text: "text-red-600 dark:text-red-400",
        bg: "bg-red-500/8 dark:bg-red-500/10",
        border: "border-red-500/20",
        label: "Error",
        badgeVariant: "destructive" as const,
        badgeClass:
          "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30",
      };
    default:
      return {
        icon: WifiOff,
        dot: "bg-slate-400",
        text: "text-slate-600",
        bg: "bg-slate-500/8",
        border: "border-slate-500/20",
        label: "Unknown",
        badgeVariant: "secondary" as const,
        badgeClass: "",
      };
  }
};

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

  const {
    printers: monitoredPrinters,
    systemPrinters,
    isMonitoring,
    loading: monitoringLoading,
    error: monitoringError,
    detectSystemPrinters,
    syncPrinterStatus,
  } = usePrinterMonitoring(shop?.id);

  const printers =
    monitoredPrinters.length > 0 ? monitoredPrinters : registeredPrinters;
  const loading = dashboardLoading || monitoringLoading;

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
      toast.error("Select at least one service");
      return;
    }
    if (editForm.supported_sizes.length === 0) {
      toast.error("Select at least one paper size");
      return;
    }

    setEditLoading(true);
    try {
      await updatePrinter(editingPrinter.id, {
        printer_name: editForm.printer_name.trim(),
        printer_type: editForm.printer_type,
        supported_services: editForm.supported_services,
        supported_sizes: editForm.supported_sizes,
      });
      toast.success("Printer updated successfully!");
      setEditDialogOpen(false);
      await refreshPrinters();
      if (isMonitoring) await syncPrinterStatus();
    } catch (error: any) {
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
      await refreshPrinters();
      if (isMonitoring) await syncPrinterStatus();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete printer");
    }
  };

  const handleTestPrinter = async (printer: Printer) => {
    if (!window.printerAPI) {
      toast.error("Printer API not available. Please run in Electron app.");
      return;
    }
    if (printer.status !== "online") {
      toast.error("Printer must be online to test print");
      return;
    }
    try {
      toast.loading("Sending test page...", { id: "test-print" });
      const result = await window.printerAPI.testPrint({
        printerName: printer.printer_name,
        shopName: shop?.shop_name || "Print Shop",
        printerType: getPrinterTypeLabel(printer.printer_type),
      });
      if (result.success) {
        toast.success("Test page sent!", { id: "test-print" });
      } else {
        toast.error(result.error || "Failed", { id: "test-print" });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to print test page", {
        id: "test-print",
      });
    }
  };

  const handleRefreshStatus = async () => {
    await syncPrinterStatus();
  };
  const handleDetectPrinters = async () => {
    await detectSystemPrinters();
  };

  const onlineCount = printers.filter((p) => p.status === "online").length;
  const offlineCount = printers.filter((p) => p.status === "offline").length;
  const errorCount = printers.filter((p) => p.status === "error").length;

  if (loading && printers.length === 0) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-6 py-8 animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-5 w-64" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="stat-card">
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-20 w-full rounded-xl" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <div className="flex gap-2">
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
      <div className="container mx-auto px-6 py-8 animate-slide-up">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Printers</h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Manage all printers registered for your shop
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isMonitoring && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                <Activity className="h-3 w-3 animate-pulse" />
                Live Monitoring
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshStatus}
              disabled={loading}
              className="h-9 gap-1.5 text-sm"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", loading && "animate-spin")}
              />
              Sync Status
            </Button>
            <Button
              onClick={() => navigate("/register-printer")}
              size="sm"
              className="h-9 gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Printer
            </Button>
          </div>
        </div>

        {/* ── Error Banner ── */}
        {monitoringError && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-destructive">
                Monitoring Error
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {monitoringError}
              </p>
            </div>
          </div>
        )}

        {/* ── Stats Cards ── */}
        {printers.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            <Card className="stat-card border-border/60">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                  Total
                </CardDescription>
                <CardTitle className="text-3xl">{printers.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="stat-card relative overflow-hidden border-border/60">
              <div className="absolute inset-0 bg-emerald-500 opacity-[0.03]" />
              <CardHeader className="pb-2 relative">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </CardDescription>
                <CardTitle className="text-3xl text-emerald-600 dark:text-emerald-400">
                  {onlineCount}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="stat-card relative overflow-hidden border-border/60">
              <div className="absolute inset-0 bg-amber-500 opacity-[0.03]" />
              <CardHeader className="pb-2 relative">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Offline
                </CardDescription>
                <CardTitle className="text-3xl text-amber-600 dark:text-amber-400">
                  {offlineCount}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="stat-card relative overflow-hidden border-border/60">
              <div className="absolute inset-0 bg-red-500 opacity-[0.03]" />
              <CardHeader className="pb-2 relative">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Errors
                </CardDescription>
                <CardTitle className="text-3xl text-red-600 dark:text-red-400">
                  {errorCount}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* ── System Printers ── */}
        {systemPrinters.length > 0 && (
          <Card className="mb-6 border-blue-500/20 bg-blue-500/3 dark:bg-blue-500/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    System Printers Detected
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {systemPrinters.length} printer(s) found in your operating
                    system
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDetectPrinters}
                  disabled={loading}
                  className="h-8 gap-1.5 text-xs"
                >
                  <RefreshCw
                    className={cn("h-3 w-3", loading && "animate-spin")}
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
                    className="rounded-xl p-3 border border-border/60 bg-card/80 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {printer.name}
                      </p>
                      {printer.driver && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {printer.driver}
                        </p>
                      )}
                      {printer.isDefault && (
                        <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full mt-1 inline-block">
                          Default
                        </span>
                      )}
                    </div>
                    <Badge
                      variant={
                        printer.status === "online" ? "default" : "secondary"
                      }
                      className="text-[10px] flex-shrink-0"
                    >
                      {printer.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Empty State ── */}
        {printers.length === 0 ? (
          <Card className="border-dashed border-2 border-border">
            <CardContent className="text-center py-16">
              <div className="inline-flex p-5 rounded-2xl bg-muted/40 mb-4">
                <PrinterIcon className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-base font-semibold mb-2">
                No printers registered
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                Add your first printer to get started.
              </p>
              <Button
                onClick={() => navigate("/register-printer")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Your First Printer
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* ── Printer Cards Grid ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {printers.map((printer: Printer) => {
              const sc = getStatusConfig(printer.status);
              const StatusIcon = sc.icon;

              return (
                <Card
                  key={printer.id}
                  className="stat-card border-border/60 overflow-hidden"
                >
                  {/* Color-coded top strip */}
                  <div className={cn("h-1 w-full", sc.dot)} />

                  <CardHeader className="pb-3 pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-primary/10 flex-shrink-0">
                          <PrinterIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base font-semibold truncate">
                            {printer.printer_name}
                          </CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            {getPrinterTypeLabel(printer.printer_type)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={sc.badgeVariant}
                        className={cn(
                          "text-[10px] gap-1 flex-shrink-0 font-semibold px-2 py-0.5 rounded-full",
                          sc.badgeClass,
                        )}
                      >
                        <StatusIcon className="h-2.5 w-2.5" />
                        {sc.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Status box */}
                    <div
                      className={cn("p-3 rounded-xl border", sc.bg, sc.border)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full flex-shrink-0",
                            sc.dot,
                            printer.status === "online" && "animate-pulse",
                          )}
                        />
                        <span className={cn("text-xs font-medium", sc.text)}>
                          {printer.status === "online" &&
                            "Printer is ready and online"}
                          {printer.status === "offline" &&
                            "Printer is currently offline"}
                          {printer.status === "error" &&
                            "Printer error detected"}
                        </span>
                      </div>
                      {printer.last_heartbeat && (
                        <p className="text-[10px] text-muted-foreground mt-1.5 ml-4">
                          Last checked:{" "}
                          {new Date(
                            printer.last_heartbeat,
                          ).toLocaleTimeString()}
                        </p>
                      )}
                    </div>

                    {/* Services */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Services
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {printer.supported_services.map((service) => (
                          <Badge
                            key={service}
                            variant="outline"
                            className="text-[10px] rounded-full font-medium"
                          >
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Paper Sizes */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Paper Sizes
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {printer.supported_sizes.map((size) => (
                          <Badge
                            key={size}
                            variant="outline"
                            className="text-[10px] rounded-full font-medium"
                          >
                            {size}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPrinter(printer)}
                        className="flex-1 h-8 gap-1.5 text-xs"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestPrinter(printer)}
                        disabled={printer.status !== "online"}
                        className="flex-1 h-8 gap-1.5 text-xs"
                      >
                        <TestTube className="h-3 w-3" />
                        Test
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      {/* ── Edit Printer Dialog ── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Printer</DialogTitle>
            <DialogDescription>
              Update printer details and capabilities
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="edit-printer-name"
                className="text-sm font-medium"
              >
                Printer Name
              </Label>
              <Input
                id="edit-printer-name"
                value={editForm.printer_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, printer_name: e.target.value })
                }
                placeholder="e.g. HP LaserJet Pro"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="edit-printer-type"
                className="text-sm font-medium"
              >
                Printer Type
              </Label>
              <Select
                value={editForm.printer_type}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, printer_type: value })
                }
              >
                <SelectTrigger className="rounded-xl">
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

            <div className="space-y-3">
              <Label className="text-sm font-medium">Supported Services</Label>
              <div className="grid grid-cols-2 gap-3 p-4 border border-border/60 rounded-xl bg-muted/20">
                {SERVICES.map((service) => (
                  <div key={service} className="flex items-center gap-2.5">
                    <Checkbox
                      id={`edit-service-${service}`}
                      checked={editForm.supported_services.includes(service)}
                      onCheckedChange={() => toggleEditService(service)}
                    />
                    <Label
                      htmlFor={`edit-service-${service}`}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {service}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Supported Paper Sizes
              </Label>
              <div className="grid grid-cols-3 gap-3 p-4 border border-border/60 rounded-xl bg-muted/20">
                {PAPER_SIZES.map((size) => (
                  <div key={size} className="flex items-center gap-2.5">
                    <Checkbox
                      id={`edit-size-${size}`}
                      checked={editForm.supported_sizes.includes(size)}
                      onCheckedChange={() => toggleEditSize(size)}
                    />
                    <Label
                      htmlFor={`edit-size-${size}`}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {size}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={editLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={editLoading}
              className="gap-2"
            >
              {editLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
