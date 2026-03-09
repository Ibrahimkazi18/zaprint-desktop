import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Printer, CheckCircle, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import fetchMyShop from "@/backend/shops/fetchMyShop";
import registerPrinter from "@/backend/printers/registerPrinter";
import fetchShopPrinters from "@/backend/printers/fetchPrinters";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const PRINTER_TYPES = [
  {
    label: "Black & White",
    value: "bw",
    description: "Standard monochrome printing",
  },
  {
    label: "Color",
    value: "color",
    description: "Full color printing capabilities",
  },
  {
    label: "Photo",
    value: "photo",
    description: "High-quality photo printing",
  },
  {
    label: "Passport / ID",
    value: "passport",
    description: "Specialized ID and passport photos",
  },
  {
    label: "Large Format",
    value: "large_format",
    description: "Posters and large documents",
  },
];

const SERVICES = [
  {
    id: "Black & White Printing",
    label: "Black & White Printing",
    popular: true,
  },
  { id: "Color Printing", label: "Color Printing", popular: true },
  { id: "Photocopy", label: "Photocopy", popular: true },
  { id: "Photo Printing", label: "Photo Printing", popular: false },
  { id: "Passport Size Prints", label: "Passport Size Prints", popular: false },
];

const PAPER_SIZES = [
  { id: "A4", label: "A4", popular: true },
  { id: "A3", label: "A3", popular: false },
  { id: "A5", label: "A5", popular: false },
  { id: "Legal", label: "Legal", popular: false },
  { id: "Letter", label: "Letter", popular: false },
  { id: "Passport", label: "Passport", popular: false },
];

interface ValidationErrors {
  printerName?: string;
  printerType?: string;
  services?: string;
  sizes?: string;
}

export default function RegisterPrinter() {
  const navigate = useNavigate();

  const [shopId, setShopId] = useState<string | null>(null);
  const [existingPrinters, setExistingPrinters] = useState<any[]>([]);

  const [printerName, setPrinterName] = useState("");
  const [printerType, setPrinterType] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );

  useEffect(() => {
    const loadShopData = async () => {
      try {
        const shop = await fetchMyShop();
        setShopId(shop.id);

        // Load existing printers for duplicate name validation
        const printers = await fetchShopPrinters(shop.id);
        setExistingPrinters(printers);
      } catch (error) {
        console.error("Error loading shop data:", error);
        toast.error("Failed to load shop data");
      }
    };
    loadShopData();
  }, []);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Printer name validation
    if (!printerName.trim()) {
      errors.printerName = "Printer name is required";
    } else if (printerName.trim().length < 3) {
      errors.printerName = "Printer name must be at least 3 characters";
    } else if (
      existingPrinters.some(
        (p) =>
          p.printer_name.toLowerCase() === printerName.trim().toLowerCase(),
      )
    ) {
      errors.printerName = "A printer with this name already exists";
    }

    // Printer type validation
    if (!printerType) {
      errors.printerType = "Please select a printer type";
    }

    // Services validation
    if (services.length === 0) {
      errors.services = "Please select at least one service";
    }

    // Paper sizes validation
    if (sizes.length === 0) {
      errors.sizes = "Please select at least one paper size";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const toggleService = (serviceId: string) => {
    setServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((s) => s !== serviceId)
        : [...prev, serviceId],
    );
    // Clear validation error when user makes a selection
    if (validationErrors.services) {
      setValidationErrors((prev) => ({ ...prev, services: undefined }));
    }
  };

  const toggleSize = (sizeId: string) => {
    setSizes((prev) =>
      prev.includes(sizeId)
        ? prev.filter((s) => s !== sizeId)
        : [...prev, sizeId],
    );
    // Clear validation error when user makes a selection
    if (validationErrors.sizes) {
      setValidationErrors((prev) => ({ ...prev, sizes: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!shopId) return;

    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setLoading(true);

    try {
      await registerPrinter({
        shop_id: shopId,
        printer_name: printerName.trim(),
        printer_type: printerType,
        supported_services: services,
        supported_sizes: sizes,
      });

      toast.success("Printer registered successfully!");
      navigate("/printers");
    } catch (err: any) {
      console.error("Registration error:", err);
      toast.error(err.message || "Failed to register printer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-7xl animate-fade-in">
        
        {/* Sticky Header with Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 -mt-4 border-b border-border/40">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/printers")}
              className="rounded-full h-10 w-10 border-border/60 hover:bg-muted/50 hover:border-black/20 dark:hover:border-white/20 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Register Printer</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Add a physical printer to your shop's digital inventory
              </p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-3">
             <Button
                variant="outline"
                onClick={() => navigate("/printers")}
                disabled={loading}
                className="rounded-full px-6 border-border/60 font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-full px-8 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all font-semibold"
              >
                {loading ? "Registering..." : "Register Printer"}
              </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* ── Main Form Area (Left Column) ── */}
          <div className="lg:col-span-8 space-y-8 pb-20 sm:pb-0">
            
            {/* 1. Printer Details */}
            <Card className="border-border/40 shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/80" />
              <CardHeader className="pb-4 pt-6 px-6 sm:px-8">
                <CardTitle className="flex items-center space-x-2 text-xl font-bold">
                  <Printer className="h-5 w-5 text-primary" />
                  <span>Basic Details</span>
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  Name and categorize this specific printer unit.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 sm:px-8 pb-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <Label htmlFor="printer-name" className="text-sm font-semibold flex justify-between">
                      Printer Name
                      {validationErrors.printerName && (
                        <span className="text-xs text-destructive flex items-center gap-1 font-medium animate-pulse">
                          <AlertCircle className="h-3 w-3" /> {validationErrors.printerName}
                        </span>
                      )}
                    </Label>
                    <Input
                      id="printer-name"
                      placeholder="e.g. Front Desk LaserJet"
                      value={printerName}
                      onChange={(e) => {
                        setPrinterName(e.target.value);
                        if (validationErrors.printerName) {
                          setValidationErrors((prev) => ({ ...prev, printerName: undefined }));
                        }
                      }}
                      className={cn(
                        "rounded-xl bg-background/50 h-12 border-border/60 focus-visible:ring-primary/30 focus-visible:border-primary transition-all shadow-sm",
                        validationErrors.printerName && "border-destructive focus-visible:ring-destructive/30 focus-visible:border-destructive"
                      )}
                    />
                  </div>

                  {/* Type Select */}
                  <div className="space-y-2">
                    <Label htmlFor="printer-type" className="text-sm font-semibold flex justify-between">
                      Printer Capability Type
                      {validationErrors.printerType && (
                        <span className="text-xs text-destructive flex items-center gap-1 font-medium animate-pulse">
                          <AlertCircle className="h-3 w-3" /> {validationErrors.printerType}
                        </span>
                      )}
                    </Label>
                    <Select
                      value={printerType}
                      onValueChange={(value) => {
                        setPrinterType(value);
                        if (validationErrors.printerType) {
                          setValidationErrors((prev) => ({ ...prev, printerType: undefined }));
                        }
                      }}
                    >
                      <SelectTrigger
                        className={cn(
                          "rounded-xl bg-background/50 h-12 border-border/60 focus:ring-primary/30 focus:border-primary transition-all shadow-sm",
                          validationErrors.printerType && "border-destructive focus:ring-destructive/30 focus:border-destructive"
                        )}
                      >
                        <SelectValue placeholder="Select primary capability" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-xl border-border/40">
                        {PRINTER_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="py-3 px-4 cursor-pointer focus:bg-primary/5 focus:text-primary rounded-lg transition-colors my-1 mx-1">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-sm select-none">{type.label}</span>
                              <span className="text-xs text-muted-foreground select-none">{type.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Supported Services */}
            <Card className="border-border/40 shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/80" />
              <CardHeader className="pb-4 pt-6 px-6 sm:px-8">
                <CardTitle className="text-xl font-bold flex items-center justify-between">
                  <span>Supported Services</span>
                  {validationErrors.services && (
                      <span className="text-xs text-destructive flex items-center gap-1 font-medium bg-destructive/10 px-2 py-1 rounded-full">
                        <AlertCircle className="h-3 w-3" /> Required
                      </span>
                  )}
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  What print jobs can you assign to this machine?
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 sm:px-8 pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SERVICES.map((service) => {
                    const isSelected = services.includes(service.id);
                    return (
                      <div
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        className={cn(
                          "group p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-start gap-3 shadow-sm hover:shadow-md relative overflow-hidden",
                          isSelected
                            ? "border-primary bg-primary/5 dark:bg-primary/10"
                            : "border-border/40 hover:border-primary/40 bg-background/50"
                        )}
                      >
                        {service.popular && !isSelected && (
                           <div className="absolute top-0 right-0 py-0.5 px-2 bg-muted/60 text-[10px] font-medium text-muted-foreground rounded-bl-lg border-l border-b border-border/40">
                             Popular
                           </div>
                        )}
                        <div className="flex items-start justify-between w-full">
                           <span className={cn("text-sm font-semibold select-none z-10", isSelected ? "text-primary" : "text-foreground")}>
                            {service.label}
                           </span>
                           <div className={cn("h-5 w-5 rounded-full flex items-center justify-center transition-all flex-shrink-0 z-10", isSelected ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground border border-border/60 group-hover:border-primary/50")}>
                             {isSelected && <CheckCircle className="h-3.5 w-3.5" />}
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 3. Supported Paper Sizes */}
            <Card className="border-border/40 shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/80" />
              <CardHeader className="pb-4 pt-6 px-6 sm:px-8">
                <CardTitle className="text-xl font-bold flex items-center justify-between">
                  <span>Paper Source Capacities</span>
                  {validationErrors.sizes && (
                      <span className="text-xs text-destructive flex items-center gap-1 font-medium bg-destructive/10 px-2 py-1 rounded-full">
                        <AlertCircle className="h-3 w-3" /> Required
                      </span>
                  )}
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  Which physical paper dimensions does the tray support?
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 sm:px-8 pb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {PAPER_SIZES.map((size) => {
                     const isSelected = sizes.includes(size.id);
                     return (
                        <div
                          key={size.id}
                          onClick={() => toggleSize(size.id)}
                          className={cn(
                            "group p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between shadow-sm hover:shadow-md",
                            isSelected
                              ? "border-primary bg-primary/5 dark:bg-primary/10"
                              : "border-border/40 hover:border-primary/40 bg-background/50"
                          )}
                        >
                          <span className={cn("text-base font-bold select-none", isSelected ? "text-primary" : "text-foreground/80")}>
                            {size.label}
                          </span>
                           <div className={cn("h-5 w-5 rounded flex items-center justify-center transition-all flex-shrink-0", isSelected ? "bg-primary text-primary-foreground scale-110" : "bg-muted border border-border/60 group-hover:border-primary/50")}>
                             {isSelected && <CheckCircle className="h-3.5 w-3.5" />}
                           </div>
                        </div>
                     )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Summary Sidebar (Right Column) ── */}
          <div className="lg:col-span-4 h-full relative">
            <div className="sticky top-32 space-y-6">
              
              <Card className="border-border/60 shadow-lg bg-card overflow-hidden rounded-2xl">
                <CardHeader className="bg-muted/30 border-b border-border/40 pb-4">
                  <CardTitle className="text-lg font-bold">Summary</CardTitle>
                  <CardDescription className="text-xs">Live configuration overview</CardDescription>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-border/40">
                  
                  {/* Name Summary */}
                  <div className="p-5 flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Identity</span>
                    <div className="flex items-center gap-3 mt-1">
                       <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                         <Printer className="h-4 w-4" />
                       </div>
                       <p className="font-semibold text-foreground line-clamp-1">
                         {printerName || "Unnamed Printer"}
                       </p>
                    </div>
                  </div>

                  {/* Type Summary */}
                  <div className="p-5 flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</span>
                    <p className="font-semibold text-foreground mt-1">
                      {printerType
                        ? PRINTER_TYPES.find((t) => t.value === printerType)?.label
                        : "Not selected"}
                    </p>
                  </div>

                  {/* Arrays Summary */}
                  <div className="p-5 grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 rounded-xl p-3 text-center border border-border/40">
                      <p className="text-2xl font-bold text-primary">{services.length}</p>
                      <p className="text-xs font-medium text-muted-foreground mt-0.5">Services</p>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-3 text-center border border-border/40">
                      <p className="text-2xl font-bold text-primary">{sizes.length}</p>
                      <p className="text-xs font-medium text-muted-foreground mt-0.5">Sizes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert className="border-border/60 bg-muted/40 backdrop-blur-sm rounded-xl py-3 px-4">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <AlertDescription className="text-xs text-muted-foreground leading-relaxed ml-2">
                  Double check selections. You can always edit this printer's configuration later from the Printers dashboard.
                </AlertDescription>
              </Alert>

            </div>
          </div>
        </div>

        {/* Mobile Action Bar (Sticky Bottom) */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-4 z-50 flex items-center gap-3 justify-end">
           <Button
              variant="outline"
              onClick={() => navigate("/printers")}
              disabled={loading}
              className="rounded-xl flex-1 border-border/60 font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-xl flex-1 shadow-lg shadow-primary/25 font-bold"
            >
              {loading ? "..." : "Confirm"}
            </Button>
        </div>

      </div>
    </DashboardLayout>
  );
}
