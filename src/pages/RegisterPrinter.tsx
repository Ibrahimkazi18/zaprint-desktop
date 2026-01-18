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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/printers")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Printers</span>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Register New Printer</h1>
          <p className="text-muted-foreground mt-2">
            Add a new printer to your shop. One printer = one real physical
            printer.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Printer Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Printer className="h-5 w-5" />
                  <span>Printer Details</span>
                </CardTitle>
                <CardDescription>
                  Basic information about your printer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="printer-name">Printer Name *</Label>
                  <Input
                    id="printer-name"
                    placeholder="e.g. HP LaserJet Pro, Canon Color Printer"
                    value={printerName}
                    onChange={(e) => {
                      setPrinterName(e.target.value);
                      if (validationErrors.printerName) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          printerName: undefined,
                        }));
                      }
                    }}
                    className={
                      validationErrors.printerName ? "border-red-500" : ""
                    }
                  />
                  {validationErrors.printerName && (
                    <p className="text-sm text-red-500 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{validationErrors.printerName}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="printer-type">Printer Type *</Label>
                  <Select
                    value={printerType}
                    onValueChange={(value) => {
                      setPrinterType(value);
                      if (validationErrors.printerType) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          printerType: undefined,
                        }));
                      }
                    }}
                  >
                    <SelectTrigger
                      className={
                        validationErrors.printerType ? "border-red-500" : ""
                      }
                    >
                      <SelectValue placeholder="Select printer type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRINTER_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {type.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.printerType && (
                    <p className="text-sm text-red-500 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{validationErrors.printerType}</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Supported Services */}
            <Card>
              <CardHeader>
                <CardTitle>Supported Services *</CardTitle>
                <CardDescription>
                  Select all services this printer can provide
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SERVICES.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center space-x-3"
                    >
                      <Checkbox
                        id={service.id}
                        checked={services.includes(service.id)}
                        onCheckedChange={() => toggleService(service.id)}
                      />
                      <Label
                        htmlFor={service.id}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <span>{service.label}</span>
                        {service.popular && (
                          <Badge variant="secondary" className="text-xs">
                            Popular
                          </Badge>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
                {validationErrors.services && (
                  <p className="text-sm text-red-500 flex items-center space-x-1 mt-2">
                    <AlertCircle className="h-3 w-3" />
                    <span>{validationErrors.services}</span>
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Supported Paper Sizes */}
            <Card>
              <CardHeader>
                <CardTitle>Supported Paper Sizes *</CardTitle>
                <CardDescription>
                  Select all paper sizes this printer supports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PAPER_SIZES.map((size) => (
                    <div key={size.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={size.id}
                        checked={sizes.includes(size.id)}
                        onCheckedChange={() => toggleSize(size.id)}
                      />
                      <Label
                        htmlFor={size.id}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <span>{size.label}</span>
                        {size.popular && (
                          <Badge variant="secondary" className="text-xs">
                            Popular
                          </Badge>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
                {validationErrors.sizes && (
                  <p className="text-sm text-red-500 flex items-center space-x-1 mt-2">
                    <AlertCircle className="h-3 w-3" />
                    <span>{validationErrors.sizes}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Registration Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Printer Name</Label>
                  <p className="text-sm text-muted-foreground">
                    {printerName || "Not specified"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm text-muted-foreground">
                    {printerType
                      ? PRINTER_TYPES.find((t) => t.value === printerType)
                          ?.label
                      : "Not selected"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Services ({services.length})
                  </Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {services.length > 0 ? (
                      services.map((service) => (
                        <Badge
                          key={service}
                          variant="outline"
                          className="text-xs"
                        >
                          {service}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        None selected
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Paper Sizes ({sizes.length})
                  </Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sizes.length > 0 ? (
                      sizes.map((size) => (
                        <Badge key={size} variant="outline" className="text-xs">
                          {size}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        None selected
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Remember:</strong> One printer registration = one real
                physical printer. Make sure all details are accurate before
                registering.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8">
          <Button
            variant="outline"
            onClick={() => navigate("/printers")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="min-w-[140px]"
          >
            {loading ? "Registering..." : "Register Printer"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
