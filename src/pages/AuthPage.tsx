import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/toast/useToast";
import fetchMyShop from "@/backend/shops/fetchMyShop";
import TravelConnectSignIn from "@/components/ui/travel-connect-signin";

export default function AuthPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { show } = useToast();

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignIn = async (email: string, password: string) => {
    if (!isValidEmail(email)) {
      show({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "error",
      });
      return;
    }

    setLoading(true);

    try {
      await login(email.trim(), password);

      const shop = await fetchMyShop();
      if (!shop?.is_onboarded) {
        navigate("/onboarding");
        return;
      }

      navigate("/dashboard");
    } catch (err: any) {
      show({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    if (!isValidEmail(email)) {
      show({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "error",
      });
      return;
    }

    if (password.length < 6) {
      show({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "error",
      });
      return;
    }

    if (password !== confirmPassword) {
      show({
        title: "Passwords don't match",
        description: "Passwords do not match",
        variant: "error",
      });
      return;
    }

    setLoading(true);

    try {
      await signup(email.trim(), password, name.trim());

      show({
        title: "Account created",
        description: "Welcome to Zaprint 🎉",
        variant: "success",
      });

      navigate("/onboarding");
    } catch (err: any) {
      show({
        title: "Signup failed",
        description: err?.message || "Unable to create account. Please try again.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    show({
      title: "Coming soon",
      description: "Google sign-in will be available soon",
      variant: "error",
    });
  };

  return (
    <TravelConnectSignIn
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      loading={loading}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      name={name}
      setName={setName}
      confirmPassword={confirmPassword}
      setConfirmPassword={setConfirmPassword}
      onGoogleSignIn={handleGoogleSignIn}
      brandName="Zaprint"
      brandTagline="Sign in to access your print shop dashboard and manage your business"
      signInTagline="Sign in to your account"
      signUpTagline="Create your account to get started"
    />
  );
}
