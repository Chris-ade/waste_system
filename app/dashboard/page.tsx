import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Trash2,
  PlusCircle,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  MapPin,
  Calendar,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";

export const dynamic = "force-dynamic";

export default async function ResidentDashboardPage() {
  const session = await getCurrentUser();

  if (!session) {
    redirect("/login?redirect=/dashboard");
  }

  // Fetch resident profile and reports
  const [user, reports, schedule] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, quarter: true, phone: true },
    }),
    prisma.wasteReport.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      include: {
        crewAssigned: { select: { name: true, phone: true } },
      },
    }),
    session.quarter
      ? prisma.pickupSchedule.findFirst({
          where: { quarter: session.quarter, isActive: true },
        })
      : null,
  ]);

  const totalReports = reports.length;
  const pendingReports = reports.filter((r) => r.status === "PENDING").length;
  const assignedReports = reports.filter((r) => r.status === "ASSIGNED").length;
  const resolvedReports = reports.filter((r) => r.status === "RESOLVED").length;

  const statusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return (
          <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-emerald-600/30">
            Resolved
          </Badge>
        );
      case "ASSIGNED":
        return (
          <Badge className="bg-blue-600/15 text-blue-700 dark:text-blue-300 border-blue-600/30">
            Assigned to Crew
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-600/15 text-amber-700 dark:text-amber-300 border-amber-600/30">
            Pending Review
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-base tracking-tight">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
              <Trash2 className="size-4" />
            </div>
            <span>
              Ikere<span className="text-emerald-600">Waste</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground border-r pr-3">
              <UserIcon className="size-3.5 text-primary" />
              <span className="font-medium text-foreground">{user?.name}</span>
              {user?.quarter && (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                  {user.quarter.replace("_", " ")}
                </Badge>
              )}
            </div>

            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
              <Link href="/report" className="flex items-center gap-1.5">
                <PlusCircle className="size-4" />
                <span className="hidden xs:inline">New</span> Report
              </Link>
            </Button>

            <LogoutButton
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-destructive"
              text="Sign Out"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Resident Portal</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Track your waste incident reports and stay updated on Ikere-Ekiti sanitation operations.
            </p>
          </div>

          {schedule && (
            <div className="p-3 rounded-xl border bg-card/80 backdrop-blur-xs flex items-center gap-3 shadow-xs">
              <div className="size-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Calendar className="size-5" />
              </div>
              <div className="text-xs">
                <span className="font-semibold block text-foreground">
                  Your Pickup: Every {schedule.dayOfWeek}
                </span>
                <span className="text-muted-foreground">
                  {schedule.timeSlot || "07:00 AM - 11:00 AM"} ({user?.quarter?.replace("_", " ")})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-xs border">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs">Total Reports</CardDescription>
              <CardTitle className="text-2xl font-bold">{totalReports}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-muted-foreground">
              Submitted across Ikere
            </CardContent>
          </Card>

          <Card className="shadow-xs border">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs">Pending Review</CardDescription>
              <CardTitle className="text-2xl font-bold text-amber-600">{pendingReports}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-muted-foreground">
              Awaiting admin dispatch
            </CardContent>
          </Card>

          <Card className="shadow-xs border">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs">Assigned to Crew</CardDescription>
              <CardTitle className="text-2xl font-bold text-blue-600">{assignedReports}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-muted-foreground">
              Scheduled for collection
            </CardContent>
          </Card>

          <Card className="shadow-xs border">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs">Resolved & Cleared</CardDescription>
              <CardTitle className="text-2xl font-bold text-emerald-600">{resolvedReports}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-muted-foreground">
              Evacuation confirmed
            </CardContent>
          </Card>
        </div>

        {/* My Reports Table / Cards */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="text-lg">My Submitted Incidents</CardTitle>
              <CardDescription className="text-xs">
                History of refuse and dumping reports filed by your account
              </CardDescription>
            </div>
            <Button asChild size="sm" variant="outline" className="text-xs">
              <Link href="/report">
                <PlusCircle className="size-3.5 mr-1" />
                New Report
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            {reports.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  <Trash2 className="size-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">No waste reports yet</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Help keep Ikere-Ekiti spotless by reporting overflowing bins or illegal dumpsites.
                  </p>
                </div>
                <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Link href="/report">Submit Your First Report</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {reports.map((report) => (
                  <div key={report.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                    <div className="flex items-start gap-3.5">
                      {report.imageUrl ? (
                        <img
                          src={report.imageUrl}
                          alt="Report photo"
                          className="size-16 rounded-lg object-cover border shrink-0"
                        />
                      ) : (
                        <div className="size-16 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                          <Trash2 className="size-6" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-sm">{report.category}</span>
                          {statusBadge(report.status)}
                        </div>

                        {report.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {report.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3 text-red-500" />
                            {report.quarter.replace("_", " ")}
                            {report.address ? ` • ${report.address}` : ""}
                          </span>
                          <span>•</span>
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>

                        {report.adminNotes && (
                          <div className="mt-2 p-2 rounded-md bg-muted/60 text-[11px] text-foreground flex items-start gap-1.5 border">
                            <Truck className="size-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <span><strong>Admin Update:</strong> {report.adminNotes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 w-full sm:w-auto">
                      <span className="font-mono text-[10px] text-muted-foreground block">
                        ID: {report.id.slice(0, 10)}...
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
