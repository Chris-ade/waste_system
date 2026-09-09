"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [quarter, setQuarter] = useState("URO");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, quarter }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error occurred during registration. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-muted/20">
      <div className="w-full max-w-md space-y-4">
        <div className="flex flex-col items-center text-center space-y-1">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight mb-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Trash2 className="size-5" />
            </div>
            <span>
              Ikere<span className="text-emerald-600">Waste</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Resident Registration</h1>
          <p className="text-xs text-muted-foreground">Register your household in Ikere-Ekiti for updates and report tracking</p>
        </div>

        <Card className="border shadow-xs">
          <form onSubmit={handleRegister}>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg">Create Resident Profile</CardTitle>
              <CardDescription className="text-xs">
                Fill in your details to register your resident portal
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3.5">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g. Babatunde Adeyemi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="resident@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="080 1234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="quarter" className="text-xs">Ikere-Ekiti Quarter</Label>
                <select
                  id="quarter"
                  value={quarter}
                  onChange={(e) => setQuarter(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-hidden"
                >
                  <option value="URO">Uro Quarter</option>
                  <option value="OKE_OSUN">Oke-Osun Quarter</option>
                  <option value="ODO_OJA">Odo-Oja Quarter</option>
                  <option value="OGBONTIORO">Ogbontioro Quarter</option>
                  <option value="OLOWO_IJESA">Olowo-Ijesa Quarter</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium mt-2"
              >
                {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </CardContent>

            <CardFooter className="pt-0 border-t bg-muted/30 p-4">
              <div className="text-xs text-center text-muted-foreground w-full">
                Already registered?{" "}
                <Link href="/login" className="text-emerald-600 hover:underline font-semibold">
                  Sign in here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
