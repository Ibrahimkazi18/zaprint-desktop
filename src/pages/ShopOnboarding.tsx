import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  Camera,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Clock,
} from "lucide-react";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const COMMON_SERVICES = [
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

const COMMON_RESOURCES = [
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

export default function ShopOnboarding() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [nonWorkingDays, setNonWorkingDays] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [servicePrices, setServicePrices] = useState<Record<string, number>>(
    {}
  );

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleNonWorkingDay = (day: string) => {
    setNonWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const toggleResource = (resource: string) => {
    setSelectedResources((prev) =>
      prev.includes(resource)
        ? prev.filter((r) => r !== resource)
        : [...prev, resource]
    );
  };

  const validateStep1 = () => {
    if (!shopName.trim()) {
      setError("Shop name is required");
      return false;
    }
    if (!phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!location.trim()) {
      setError("Shop location is required");
      return false;
    }
    if (!startTime.trim()) {
      setError("Start time is required");
      return false;
    }
    if (!endTime.trim()) {
      setError("End time is required");
      return false;
    }
    if (startTime >= endTime) {
      setError("End time must be after start time");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep2 = () => {
    if (selectedServices.length === 0) {
      setError("Please select at least one service");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep3 = () => {
    const missingPrices = selectedServices.filter(
      (service) => !servicePrices[service] || servicePrices[service] <= 0
    );
    if (missingPrices.length > 0) {
      setError(
        `Please set prices for all services: ${missingPrices.join(", ")}`
      );
      return false;
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      // Initialize default prices for selected services
      const defaultPrices: Record<string, number> = {};
      selectedServices.forEach((service) => {
        if (!servicePrices[service]) {
          // Set some reasonable default prices
          if (
            service.includes("Black & White") ||
            service.includes("Photocopy")
          ) {
            defaultPrices[service] = 2;
          } else if (service.includes("Color")) {
            defaultPrices[service] = 5;
          } else if (service.includes("Binding")) {
            defaultPrices[service] = 20;
          } else if (service.includes("Lamination")) {
            defaultPrices[service] = 10;
          } else if (service.includes("Scanning")) {
            defaultPrices[service] = 3;
          } else if (service.includes("Card")) {
            defaultPrices[service] = 15;
          } else {
            defaultPrices[service] = 10;
          }
        }
      });
      setServicePrices((prev) => ({ ...prev, ...defaultPrices }));
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      setStep(4);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simulate saving shop data
    const shopData = {
      shopName,
      phone,
      location,
      description,
      startTime,
      endTime,
      nonWorkingDays,
      imagePreview,
      services: selectedServices,
      resources: selectedResources,
      servicePrices,
      createdAt: new Date().toISOString(),
    };

    console.log("Shop Data:", shopData);

    // Navigate to dashboard
    navigate("/dashboard");
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
        <p className="text-muted-foreground">
          Let's start with your shop details
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <Avatar className="h-32 w-32 border-4 border-dashed border-muted-foreground/25">
          <AvatarImage src={imagePreview || ""} />
          <AvatarFallback className="text-2xl bg-muted">
            <Camera className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        <Label htmlFor="shop-image" className="cursor-pointer">
          <Button type="button" variant="outline" asChild>
            <span className="flex items-center space-x-2">
              <Camera className="h-4 w-4" />
              <span>Upload Shop Photo</span>
            </span>
          </Button>
          <Input
            id="shop-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </Label>
        <p className="text-xs text-muted-foreground">
          Optional - helps customers recognize your shop
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="shop-name" className="flex items-center space-x-2">
            <span>Shop Name</span>
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="shop-name"
            placeholder="e.g. QuickPrint Hub"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center space-x-2">
            <Phone className="h-4 w-4" />
            <span>Phone Number</span>
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="flex items-center space-x-2">
          <MapPin className="h-4 w-4" />
          <span>Shop Location / Address</span>
          <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="location"
          placeholder="Full address with landmarks..."
          rows={3}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Shop Description</Label>
        <Textarea
          id="description"
          placeholder="Tell customers about your shop, specialties, experience..."
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Optional - helps customers understand what makes your shop special
        </p>
      </div>

      <div className="space-y-4">
        <div className="text-lg font-semibold flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Operating Hours</span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start-time" className="flex items-center space-x-2">
              <span>Start Time</span>
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="start-time"
              type="time"
              placeholder="09:00"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              e.g. 09:00 for 9:00 AM, 13:00 for 1:00 PM
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-time" className="flex items-center space-x-2">
              <span>End Time</span>
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="end-time"
              type="time"
              placeholder="18:00"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              e.g. 18:00 for 6:00 PM, 21:00 for 9:00 PM
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Non Working Days</Label>
          <p className="text-xs text-muted-foreground">
            Select the days the shop will be closed
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day}`}
                  checked={nonWorkingDays.includes(day)}
                  onCheckedChange={() => toggleNonWorkingDay(day)}
                />
                <label
                  htmlFor={`day-${day}`}
                  className="text-sm font-medium cursor-pointer flex-1"
                >
                  {day}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Services & Equipment</h2>
        <p className="text-muted-foreground">What services do you offer?</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center space-x-2">
            <span>Services You Offer</span>
            <span className="text-red-500">*</span>
          </Label>
          <Badge variant="secondary">{selectedServices.length} selected</Badge>
        </div>
        <ScrollArea className="h-64 rounded-md border p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {COMMON_SERVICES.map((service) => (
              <div key={service} className="flex items-center space-x-2">
                <Checkbox
                  id={`service-${service}`}
                  checked={selectedServices.includes(service)}
                  onCheckedChange={() => toggleService(service)}
                />
                <label
                  htmlFor={`service-${service}`}
                  className="text-sm font-medium cursor-pointer flex-1"
                >
                  {service}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Resources & Equipment Available</Label>
          <Badge variant="outline">{selectedResources.length} selected</Badge>
        </div>
        <ScrollArea className="h-64 rounded-md border p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {COMMON_RESOURCES.map((resource) => (
              <div key={resource} className="flex items-center space-x-2">
                <Checkbox
                  id={`resource-${resource}`}
                  checked={selectedResources.includes(resource)}
                  onCheckedChange={() => toggleResource(resource)}
                />
                <label
                  htmlFor={`resource-${resource}`}
                  className="text-sm font-medium cursor-pointer flex-1"
                >
                  {resource}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
        <p className="text-xs text-muted-foreground">
          Optional - helps customers know what equipment you have
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Set Your Prices</h2>
        <p className="text-muted-foreground">
          Set competitive prices for your selected services
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center space-x-2">
            <span>Service Pricing</span>
            <span className="text-red-500">*</span>
          </Label>
          <Badge variant="secondary">
            {selectedServices.length} services to price
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {selectedServices.map((service) => (
            <div key={service} className="space-y-2">
              <Label
                htmlFor={`price-${service}`}
                className="text-sm font-medium"
              >
                {service}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-sm text-muted-foreground">
                  ₹
                </span>
                <Input
                  id={`price-${service}`}
                  type="number"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  value={servicePrices[service] || ""}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setServicePrices((prev) => ({ ...prev, [service]: value }));
                  }}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {service.includes("Print") && "Per page"}
                {service.includes("Binding") && "Per job"}
                {service.includes("Lamination") && "Per page"}
                {service.includes("Scanning") && "Per page"}
                {service.includes("Card") && "Per piece"}
                {!service.includes("Print") &&
                  !service.includes("Binding") &&
                  !service.includes("Lamination") &&
                  !service.includes("Scanning") &&
                  !service.includes("Card") &&
                  "Per job"}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Pricing Tips</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Research competitor prices in your area</li>
            <li>• Consider your costs: paper, ink, electricity, rent</li>
            <li>• Factor in a reasonable profit margin</li>
            <li>• You can always adjust prices later in settings</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Review Your Information</h2>
        <p className="text-muted-foreground">
          Please review your shop details before completing setup
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Shop Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={imagePreview || ""} />
                <AvatarFallback>
                  {shopName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{shopName}</h3>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {phone}
                </p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {location}
                </p>
              </div>
            </div>
            {description && (
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            )}
            <div>
              <h4 className="font-medium mb-2 flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Operating Hours</span>
              </h4>
              <p className="text-sm text-muted-foreground">
                {formatTime(startTime)} - {formatTime(endTime)}
              </p>
              {nonWorkingDays.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Closed on: {nonWorkingDays.join(", ")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Services & Pricing ({selectedServices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedServices.map((service) => (
                <div
                  key={service}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <span className="font-medium">{service}</span>
                  <Badge variant="secondary">
                    ₹{servicePrices[service] || 0}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedResources.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Equipment ({selectedResources.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedResources.map((resource) => (
                  <Badge key={resource} variant="outline">
                    {resource}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i === step
                      ? "bg-primary text-primary-foreground"
                      : i < step
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < step ? <CheckCircle className="h-4 w-4" /> : i}
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              Step {step} of 4
            </div>
          </div>
          <CardTitle className="text-3xl text-center">
            Complete Your Shop Profile
          </CardTitle>
          <CardDescription className="text-center text-lg">
            Set up your print shop so customers can find and connect with you
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </form>
        </CardContent>

        <CardFooter className="flex justify-between pt-6">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}

          <div className="ml-auto">
            {step < 4 ? (
              <Button type="button" onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" onClick={handleSubmit} className="px-8">
                Complete Setup & Go to Dashboard
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
