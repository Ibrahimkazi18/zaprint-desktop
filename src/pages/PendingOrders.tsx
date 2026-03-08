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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Clock,
  CheckCircle,
  Package,
  Phone,
  User,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useShopDashboard } from "@/hooks/useShopDashboard";
import fetchPendingOrders, {
  PendingOrder,
} from "@/backend/orders/fetchPendingOrders";
import verifyPickupOTP from "@/backend/orders/verifyPickupOTP";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function PendingOrders() {
  const { shop } = useShopDashboard();
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadOrders = async () => {
    if (!shop?.id) return;
    try {
      setLoading(true);
      const data = await fetchPendingOrders(shop.id);
      setOrders(data);
    } catch (error: any) {
      console.error("Error loading pending orders:", error);
      if (error.message) {
        toast.error(`Failed to load pending orders: ${error.message}`);
      } else {
        toast.error("Failed to load pending orders.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [shop?.id]);

  const handleVerifyOTP = async () => {
    if (!selectedOrder) return;
    if (otpInput.length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }
    setVerifying(true);
    try {
      const result = await verifyPickupOTP(selectedOrder.id, otpInput);
      if (result.success) {
        toast.success("Order completed successfully!");
        setDialogOpen(false);
        setOtpInput("");
        setSelectedOrder(null);
        loadOrders();
      } else {
        toast.error(result.error || "Invalid OTP");
      }
    } catch (error: any) {
      toast.error("Failed to verify OTP");
    } finally {
      setVerifying(false);
    }
  };

  const openVerifyDialog = (order: PendingOrder) => {
    setSelectedOrder(order);
    setOtpInput("");
    setDialogOpen(true);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const avgWait =
    orders.length > 0
      ? Math.floor(
          orders.reduce((sum, o) => {
            const diffMs =
              new Date().getTime() - new Date(o.updated_at).getTime();
            return sum + diffMs / 60000;
          }, 0) / orders.length,
        )
      : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-6 py-8 animate-fade-in">
          <div className="mb-8">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid gap-5 md:grid-cols-3 mb-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="stat-card">
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardHeader>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8 animate-slide-up">
        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Pending Orders</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Orders ready for customer pickup — verify OTP to complete
          </p>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid gap-5 md:grid-cols-3 mb-8">
          {/* Ready for pickup */}
          <Card className="stat-card relative overflow-hidden border-border/60">
            <div className="absolute inset-0 bg-amber-500 opacity-[0.03]" />
            <CardHeader className="pb-2 relative">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Ready for Pickup
              </CardTitle>
            </CardHeader>
            <CardContent className="relative flex items-center justify-between">
              <p className="text-3xl font-bold">{orders.length}</p>
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <Package className="h-5 w-5 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          {/* Total Value */}
          <Card className="stat-card relative overflow-hidden border-border/60">
            <div className="absolute inset-0 bg-emerald-500 opacity-[0.03]" />
            <CardHeader className="pb-2 relative">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent className="relative flex items-center justify-between">
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                ₹
                {orders
                  .reduce((sum, o) => sum + o.total_amount, 0)
                  .toLocaleString()}
              </p>
              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          {/* Avg Wait Time */}
          <Card className="stat-card relative overflow-hidden border-border/60">
            <div className="absolute inset-0 bg-blue-500 opacity-[0.03]" />
            <CardHeader className="pb-2 relative">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Avg Wait Time
              </CardTitle>
            </CardHeader>
            <CardContent className="relative flex items-center justify-between">
              <p className="text-3xl font-bold">
                {avgWait}
                <span className="text-lg font-medium text-muted-foreground ml-1">
                  min
                </span>
              </p>
              <div className="p-2.5 rounded-xl bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Orders Table ── */}
        <Card className="border-border/60">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Ready Orders
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Enter customer's OTP to complete their order
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadOrders}
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex p-5 rounded-2xl bg-muted/40 mb-4">
                  <Package className="h-9 w-9 text-muted-foreground/40" />
                </div>
                <h3 className="text-sm font-semibold mb-1">
                  No pending orders
                </h3>
                <p className="text-xs text-muted-foreground">
                  Orders ready for pickup will appear here
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold pl-6">
                      Order ID
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Customer
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Contact
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Amount
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Ready Since
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="border-border/40 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-mono text-xs font-medium pl-6">
                        #{order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-muted/60">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <span className="font-medium text-sm">
                            {order.customer_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {order.customer_phone || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                          ₹{order.total_amount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatTime(order.updated_at)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => openVerifyDialog(order)}
                          className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Verify OTP
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* ── Verify OTP Dialog ── */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2.5 rounded-xl bg-emerald-500/10">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <DialogTitle className="text-base">
                    Verify Customer OTP
                  </DialogTitle>
                  <DialogDescription className="text-xs mt-0.5">
                    Ask the customer for their 6-digit OTP
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-4">
                {/* Order summary */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-2.5">
                  {[
                    {
                      label: "Order ID",
                      value: `#${selectedOrder.id.slice(0, 8)}`,
                    },
                    { label: "Customer", value: selectedOrder.customer_name },
                    {
                      label: "Amount",
                      value: `₹${selectedOrder.total_amount.toLocaleString()}`,
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex justify-between items-center"
                    >
                      <span className="text-xs text-muted-foreground">
                        {label}
                      </span>
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          label === "Amount" &&
                            "text-emerald-600 dark:text-emerald-400",
                        )}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* OTP input */}
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-medium">
                    Enter OTP
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={otpInput}
                    onChange={(e) =>
                      setOtpInput(e.target.value.replace(/\D/g, ""))
                    }
                    className="text-center text-2xl font-mono tracking-[0.5em] h-14 rounded-xl border-border/60 bg-muted/30 focus-visible:ring-emerald-500"
                    autoFocus
                  />
                  <p className="text-[11px] text-muted-foreground text-center">
                    Customer received this OTP when their order was ready
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 mt-2">
              <Button
                variant="ghost"
                onClick={() => setDialogOpen(false)}
                disabled={verifying}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifyOTP}
                disabled={verifying || otpInput.length !== 6}
                className={cn(
                  "flex-1 gap-1.5",
                  "bg-emerald-600 hover:bg-emerald-700 text-white",
                  "disabled:bg-muted disabled:text-muted-foreground",
                )}
              >
                {verifying ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3.5 w-3.5" />
                    Complete Order
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
