"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface AuthFormProps {
  mode: "login" | "signup";
  userType?: "patient" | "doctor";
}

export const AuthForm = ({ mode, userType = "patient" }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        const checkResponse = await fetch(
          `/api/doctors/check?email=${encodeURIComponent(email)}`
        );
        const checkResult = await checkResponse.json();

        if (checkResult.exists) {
          if (userType === "doctor" && checkResult.role === "patient") {
            setError(
              "This email is registered as a patient. Please login as patient or use a different email."
            );
            setLoading(false);
            return;
          }
          if (userType === "patient" && checkResult.role === "doctor") {
            setError(
              "This email is registered as a doctor. Please login as doctor or use a different email."
            );
            setLoading(false);
            return;
          }
        }

        const { error: loginError } = await authClient.signIn.email({
          email,
          password,
        });
        if (loginError) throw loginError;

        if (userType === "doctor") {
          await fetch("/api/user/role", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: "doctor" }),
          });
          const redirectPath = checkResult.profileComplete
            ? "/doctor/dashboard"
            : "/doctor/onboarding";
          router.push(redirectPath);
        } else {
          const redirectPath = checkResult.profileComplete
            ? "/patient/dashboard"
            : "/patient/medical_session";
          router.push(redirectPath);
        }
      } else {
        const checkResponse = await fetch(
          `/api/doctors/check?email=${encodeURIComponent(email)}`
        );
        const checkResult = await checkResponse.json();

        if (checkResult.exists) {
          if (userType === "doctor" && checkResult.role === "patient") {
            setError(
              "This email is already registered as a patient. Please use a different email."
            );
            setLoading(false);
            return;
          }
          if (userType === "patient" && checkResult.role === "doctor") {
            setError(
              "This email is already registered as a doctor. Please use a different email."
            );
            setLoading(false);
            return;
          }
          setError("This email is already registered. Please login instead.");
          setLoading(false);
          return;
        }

        const { error: signupError } = await authClient.signUp.email({
          email,
          password,
          name,
        });
        if (signupError) throw signupError;

        await fetch("/api/user/role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: userType }),
        });

        const redirectPath =
          userType === "doctor"
            ? "/doctor/onboarding"
            : "/patient/medical_session";
        router.push(redirectPath);
      }

      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");

    if (typeof window !== "undefined") {
      localStorage.setItem("pendingUserType", userType);
    }

    const callbackURL =
      userType === "doctor" ? "/doctor/onboarding" : "/patient/medical_session";

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        variant="outline"
        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-border rounded-xl bg-surface text-sm font-bold text-foreground hover:bg-[rgba(15,17,23,0.02)] transition-all shadow-sm"
      >
        {googleLoading ? (
          <Loader2 className="animate-spin w-5 h-5" />
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </>
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-surface text-muted-foreground font-medium">
            or continue with email
          </span>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {mode === "signup" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <label
              htmlFor="name"
              className="block text-sm font-bold text-foreground mb-2"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 transition-all bg-[rgba(15,17,23,0.02)] focus:bg-white"
                placeholder="Enter your full name"
              />
            </div>
          </motion.div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-bold text-foreground mb-2"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 transition-all bg-[rgba(15,17,23,0.02)] focus:bg-white"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-bold text-foreground mb-2"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-12 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 transition-all bg-[rgba(15,17,23,0.02)] focus:bg-white"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {mode === "signup" && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Must be at least 8 characters
            </p>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#EF4444] text-sm font-bold bg-[#EF4444]/10 p-3 rounded-xl border border-[#EF4444]/20"
          >
            {error}
          </motion.div>
        )}

        <Button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full py-6 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-xl shadow-[0_4px_24px_rgba(5,150,105,0.18)] hover:shadow-[0_6px_28px_rgba(5,150,105,0.28)] transition-all hover:-translate-y-0.5"
        >
          {loading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : mode === "login" ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </Button>

        <div className="text-center text-sm pt-4">
          {mode === "login" ? (
            <p className="text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-bold text-[#059669] hover:text-[#047857]"
              >
                Sign up
              </Link>
            </p>
          ) : (
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-[#059669] hover:text-[#047857]"
              >
                Sign in
              </Link>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
