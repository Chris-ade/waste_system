"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FileSpreadsheet,
  MapPin,
  Calendar,
  Users,
  Home,
  LogOut,
  Trash2,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/reports", label: "Waste Reports", icon: FileSpreadsheet },
  { href: "/admin/map", label: "GIS Route Map", icon: MapPin },
  { href: "/admin/schedules", label: "Pickup Schedules", icon: Calendar },
  { href: "/admin/crew", label: "Sanitation Crew", icon: Users },
];

export function AdminNav({ user }: { user: { name: string; email: string; role: string } }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-card">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-sm">
          <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Trash2 className="size-4" />
          </div>
          <span>Ikere Admin</span>
        </Link>
        <Button variant="ghost" size="sm" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/90 backdrop-blur-sm p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b">
              <span className="font-bold text-base">Ikere Waste Admin</span>
              <Button variant="ghost" size="sm" onClick={() => setMobileOpen(false)}>
                <X className="size-5" />
              </Button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t space-y-3">
            <div className="flex items-center gap-2 px-2">
              <div className="size-8 rounded-full bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold text-xs">
                {user.name[0]}
              </div>
              <div className="text-xs truncate">
                <span className="font-semibold block truncate">{user.name}</span>
                <span className="text-muted-foreground truncate">{user.email}</span>
              </div>
            </div>
            <form action="/api/auth/logout" method="POST">
              <Button type="submit" variant="outline" size="sm" className="w-full text-xs text-destructive">
                <LogOut className="size-3.5 mr-1.5" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r bg-card p-4 shrink-0">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-between px-2 pt-2">
            <Link href="/admin" className="flex items-center gap-2.5 font-bold text-base tracking-tight">
              <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <Trash2 className="size-4" />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight">Ikere<span className="text-emerald-600">Waste</span></span>
                <span className="text-[10px] text-muted-foreground font-normal">Administration Console</span>
              </div>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Management
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? "bg-emerald-600 text-white shadow-xs font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border text-xs">
            <div className="flex items-center gap-2 truncate">
              <div className="size-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user.name ? user.name[0] : "A"}
              </div>
              <div className="truncate text-left">
                <span className="font-semibold block truncate text-[11px]">{user.name}</span>
                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-emerald-600/30 text-emerald-700">
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button asChild variant="ghost" size="sm" className="w-full text-[11px] justify-start text-muted-foreground">
              <Link href="/">
                <Home className="size-3.5 mr-1.5" />
                Public Site
              </Link>
            </Button>
            <form action="/api/auth/logout" method="POST" className="shrink-0">
              <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive p-2" title="Sign Out">
                <LogOut className="size-3.5" />
              </Button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
