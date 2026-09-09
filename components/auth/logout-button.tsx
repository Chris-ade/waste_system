"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";

interface LogoutButtonProps {
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default";
  className?: string;
  showText?: boolean;
  text?: string;
}

export function LogoutButton({
  variant = "ghost",
  size = "sm",
  className = "",
  showText = true,
  text = "Sign Out",
}: LogoutButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setOpen(false);
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
      setLoading(false);
      window.location.href = "/login";
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          className={className}
          title="Sign Out"
        >
          <LogOut className="size-3.5" />
          {showText && <span className="ml-1.5">{text}</span>}
        </Button>
      </ResponsiveDialogTrigger>

      <ResponsiveDialogContent className="sm:max-w-md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2 text-foreground">
            <div className="size-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <LogOut className="size-4" />
            </div>
            Confirm Sign Out
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Are you sure you want to end your session? You will be redirected to the login page.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <ResponsiveDialogFooter className="flex sm:justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            disabled={loading}
            className="gap-1.5"
          >
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <LogOut className="size-3.5" />
            )}
            {loading ? "Signing Out..." : "Confirm Sign Out"}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
