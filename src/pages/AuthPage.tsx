import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Eye,
  EyeOff,
  Printer,
  Users,
  Star,
  TrendingUp,
  Zap,
  Shield,
  Clock,
} from "lucide-react";
import { useToast } from "@/components/toast/useToast";
import fetchMyShop from "@/backend/shops/fetchMyShop";

export default function AuthPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [signupEmail, setSignupEmail] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { show } = useToast();

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(loginEmail.trim(), loginPassword);

      const shop = await fetchMyShop();
      if (!shop?.is_onboarded) {
        navigate("/onboarding");
        return;
      }

      navigate("/dashboard");
    } catch (err: any) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(signupEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (signupPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (signupPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await signup(signupEmail.trim(), signupPassword, signupName.trim());

      show({
        title: "Account created",
        description: "Welcome to Zaprint 🎉",
        variant: "success",
      });

      navigate("/onboarding");
    } catch (err: any) {
      setError(err?.message || "Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background via-background to-muted/20">
      {/* Left side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 flex-col justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-20 w-48 h-48 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full blur-2xl"></div>
        </div>

        <div className="text-primary-foreground relative z-10">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Printer className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-bold">Zaprint</h1>
            </div>
            <p className="text-xl opacity-90 leading-relaxed">
              Transform your print shop with intelligent management tools
              designed for modern businesses
            </p>
          </div>

          <div className="space-y-6 mb-12">
            <div className="flex items-center space-x-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="bg-white/20 p-3 rounded-lg">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  Smart Queue Management
                </h3>
                <p className="text-sm opacity-80">
                  AI-powered job scheduling and real-time tracking
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="bg-white/20 p-3 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Customer Experience</h3>
                <p className="text-sm opacity-80">
                  Seamless customer management and communication
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="bg-white/20 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Business Intelligence</h3>
                <p className="text-sm opacity-80">
                  Advanced analytics and performance insights
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="bg-white/20 p-3 rounded-lg">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Enterprise Security</h3>
                <p className="text-sm opacity-80">
                  Bank-level security with data encryption
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white/15 rounded-2xl backdrop-blur-sm border border-white/20">
            <div className="flex items-center space-x-2 mb-4">
              <Star className="h-5 w-5 text-yellow-300" />
              <p className="text-sm font-medium">
                Trusted by print shops worldwide
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">1,200+</div>
                <div className="text-xs opacity-80">Active Shops</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">250K+</div>
                <div className="text-xs opacity-80">Jobs Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">4.9★</div>
                <div className="text-xs opacity-80">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 dark:shadow-primary/10">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Printer className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">
                {isLogin ? "Welcome Back" : "Join Zaprint"}
              </CardTitle>
              <CardDescription className="text-base">
                {isLogin
                  ? "Sign in to access your print shop dashboard"
                  : "Create your account and start managing your print shop"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                  {error}
                </div>
              )}

              <Tabs value={isLogin ? "login" : "signup"} className="w-full">
                <TabsList className="grid grid-cols-2 w-full mb-8 h-12">
                  <TabsTrigger
                    value="login"
                    onClick={() => {
                      setIsLogin(true);
                      setError("");
                    }}
                    className="text-base"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    onClick={() => {
                      setIsLogin(false);
                      setError("");
                    }}
                    className="text-base"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-6">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="login-email"
                        className="text-base font-medium"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email address"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="h-12 text-base"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="login-password"
                        className="text-base font-medium"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="h-12 text-base pr-12"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowLoginPassword(!showLoginPassword)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showLoginPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      className="w-full h-12 text-base font-semibold"
                      disabled={loading}
                      variant="gradient"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        "Sign In to Dashboard"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-6">
                  <form onSubmit={handleSignup} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Full Name</Label>
                      <Input
                        value={signupName}
                        placeholder="Enter your full name"
                        onChange={(e) => setSignupName(e.target.value)}
                        className="h-12 text-base"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        Email Address
                      </Label>
                      <Input
                        type="email"
                        value={signupEmail}
                        placeholder="Enter your email address"
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="h-12 text-base"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">Password</Label>
                      <div className="relative">
                        <Input
                          type={showSignupPassword ? "text" : "password"}
                          value={signupPassword}
                          placeholder="Create a strong password"
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="h-12 text-base pr-12"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowSignupPassword(!showSignupPassword)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showSignupPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          placeholder="Confirm your password"
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-12 text-base pr-12"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      className="w-full h-12 text-base font-semibold"
                      disabled={loading}
                      variant="gradient"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Creating account...</span>
                        </div>
                      ) : (
                        "Create Your Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter className="justify-center text-base text-muted-foreground pt-6">
              {isLogin ? "New to Zaprint?" : "Already have an account?"}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="ml-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {isLogin ? "Create account" : "Sign in instead"}
              </button>
            </CardFooter>
          </Card>

          {/* Trust indicators */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4" />
                <span>Trusted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
