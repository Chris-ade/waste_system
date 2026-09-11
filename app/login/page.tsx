"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error || "Failed to sign in. Please check your credentials.",
        );
        setLoading(false);
        return;
      }

      // Check role and redirect
      if (data.user?.role === "ADMIN" || data.user?.role === "CREW") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch {
      setError("A network error occurred. Please try again.");
      setLoading(false);
    }
  };

  const fillCredentials = (type: "admin" | "crew" | "resident") => {
    if (type === "admin") {
      setEmail("admin@ikerewaste.ng");
      setPassword("Admin@12345");
    } else if (type === "crew") {
      setEmail("crew@ikerewaste.ng");
      setPassword("Crew@12345");
    } else {
      setEmail("resident@ikerewaste.ng");
      setPassword("Resident@12345");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-muted/20">
      <div className="w-full max-w-md space-y-4">
        <div className="flex flex-col items-center text-center space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl tracking-tight mb-6"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Trash2 className="size-5" />
            </div>
            <span>
              Ikere<span className="text-emerald-600">Waste</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to manage reports, schedules, and municipal operations
          </p>
        </div>

        <Card className="border shadow-xs">
          <form onSubmit={handleLogin}>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg">Account Login</CardTitle>
              <CardDescription className="text-xs">
                Enter your registered email address and password
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="resident@ikerewaste.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs">
                    Password
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : null}
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-0 border-t bg-muted/30 p-4">
              <div className="text-sm text-center text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-emerald-600 hover:underline font-semibold"
                >
                  Register as Resident
                </Link>
              </div>

              {/* Demo Account Quick-fill for project evaluators */}
              <div className="w-full pt-2 border-t border-border/50 text-left">
                <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
                  Quick Demo Accounts:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] px-2"
                    onClick={() => fillCredentials("admin")}
                  >
                    Admin
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] px-2"
                    onClick={() => fillCredentials("crew")}
                  >
                    Crew
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] px-2"
                    onClick={() => fillCredentials("resident")}
                  >
                    Resident
                  </Button>
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
