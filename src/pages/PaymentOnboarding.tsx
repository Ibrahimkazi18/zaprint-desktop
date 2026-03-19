import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { supabase } from "@/auth/supabase";
import fetchMyShop from "@/backend/shops/fetchMyShop";
import toast from "react-hot-toast";

export default function PaymentOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [razorpayAccountId, setRazorpayAccountId] = useState("");

  const handleSubmit = async () => {
    if (!razorpayAccountId.trim()) {
      setError("Razorpay Account ID is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const shop = await fetchMyShop();

      if (!shop) {
        setError("Shop not found. Please complete shop onboarding first.");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from("shops")
        .update({
          razorpay_account_id: razorpayAccountId.trim(),
          is_payment_onboarded: true,
        })
        .eq("id", shop.id);

      if (updateError) throw updateError;

      toast.success("Payment onboarding completed!");
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during payment onboarding");
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
          <CreditCard className="h-8 w-8 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Payment Setup</h2>
        <p className="text-muted-foreground">
          Set up Razorpay to receive payments from customers
        </p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg space-y-3">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="font-semibold text-sm">Why is this required?</p>
        </div>
        <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1.5 pl-7">
          <li>• Customers pay online before submitting print jobs</li>
          <li>• Payments are securely processed via Razorpay</li>
          <li>• Your shop will only appear on the website after payment setup</li>
          <li>• Funds are transferred directly to your bank account</li>
        </ul>
      </div>

      <div className="bg-muted/50 p-5 rounded-lg space-y-4">
        <h3 className="font-semibold">Steps to set up Razorpay:</h3>
        <ol className="space-y-4 text-sm">
          <li className="flex gap-3">
            <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
              1
            </span>
            <div>
              <p className="font-medium">Create a Razorpay Account</p>
              <p className="text-muted-foreground mt-0.5">
                Sign up at{" "}
                <a
                  href="https://dashboard.razorpay.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  dashboard.razorpay.com
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
              2
            </span>
            <div>
              <p className="font-medium">Complete KYC Verification</p>
              <p className="text-muted-foreground mt-0.5">
                Submit your business details, PAN, and bank account information
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
              3
            </span>
            <div>
              <p className="font-medium">Get your Account ID</p>
              <p className="text-muted-foreground mt-0.5">
                Go to Settings → Account & Settings → Your Account ID starts with 'acc_'
              </p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="h-8 w-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Enter Your Razorpay ID</h2>
        <p className="text-muted-foreground">
          Enter your Razorpay Account ID to link your payment account
        </p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="razorpay-id" className="flex items-center space-x-2">
          <span>Razorpay Account ID</span>
          <span className="text-red-500">*</span>
        </Label>
        <Input
          id="razorpay-id"
          placeholder="acc_XXXXXXXXXXXXXX"
          value={razorpayAccountId}
          onChange={(e) => setRazorpayAccountId(e.target.value)}
          className="font-mono text-lg h-12"
        />
        <p className="text-xs text-muted-foreground">
          Found in Razorpay Dashboard → Settings → Account & Settings
        </p>
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 mb-2">
          <ShieldCheck className="h-4 w-4" />
          <p className="font-semibold text-sm">Secure & Private</p>
        </div>
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          Your Razorpay Account ID is only used to identify your account for settlements. 
          We never store your API keys or secret credentials on our servers.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              {[1, 2].map((i) => (
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
            <Badge variant="outline" className="text-xs">
              <CreditCard className="h-3 w-3 mr-1" />
              Payment Setup
            </Badge>
          </div>
          <CardTitle className="text-3xl text-center">
            Payment Onboarding
          </CardTitle>
          <CardDescription className="text-center text-lg">
            Complete payment setup to start receiving online orders
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              {error}
            </div>
          )}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
        </CardContent>

        <CardFooter className="flex justify-between pt-6">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStep(step - 1);
                setError("");
              }}
            >
              Back
            </Button>
          )}

          <div className="ml-auto flex gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="text-muted-foreground"
            >
              Skip for Now
            </Button>

            {step < 2 ? (
              <Button type="button" onClick={() => setStep(2)}>
                I Have a Razorpay Account
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !razorpayAccountId.trim()}
                className="px-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
