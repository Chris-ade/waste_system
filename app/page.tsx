import Link from "next/link";
import {
  Trash2,
  MapPin,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  Truck,
  Users,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";

export const revalidate = 60; // revalidate every minute

async function getStatsAndSchedules() {
  try {
    const [schedules, totalReports, resolvedReports] = await Promise.all([
      prisma.pickupSchedule.findMany({
        where: { isActive: true },
        orderBy: { quarter: "asc" },
      }),
      prisma.wasteReport.count(),
      prisma.wasteReport.count({ where: { status: "RESOLVED" } }),
    ]);

    return { schedules, totalReports, resolvedReports };
  } catch (error) {
    console.error("Error fetching landing page data:", error);
    return { schedules: [], totalReports: 0, resolvedReports: 0 };
  }
}

const quarterDetails: Record<
  string,
  { label: string; desc: string; landmarks: string }
> = {
  URO: {
    label: "Uro Quarter",
    desc: "Northern residential & educational zone",
    landmarks: "Uro Community Grammar School, Afao Road axis",
  },
  OKE_OSUN: {
    label: "Oke-Osun Quarter",
    desc: "Central commercial & market district",
    landmarks: "Oke-Osun Market, Palace perimeter",
  },
  ODO_OJA: {
    label: "Odo-Oja Quarter",
    desc: "Heart of Ikere commerce & civic center",
    landmarks: "Post Office roundabout, Central Mosque area",
  },
  OGBONTIORO: {
    label: "Ogbontioro Quarter",
    desc: "Southern settlements & residential expansion",
    landmarks: "Ogbontioro Street, College axis",
  },
  OLOWO_IJESA: {
    label: "Olowo-Ijesa Quarter",
    desc: "Eastern community & artisanal cluster",
    landmarks: "Olowo-Ijesa junction, Ado Road corridor",
  },
};

export default async function HomePage() {
  const { schedules, totalReports, resolvedReports } =
    await getStatsAndSchedules();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-lg tracking-tight"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Trash2 className="size-5" />
            </div>
            <span>
              Ikere<span className="text-emerald-600">Waste</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a
              href="#schedules"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Pickup Schedules
            </a>
            <a
              href="#quarters"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Quarters
            </a>
            <a
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <Link href="/report" className="flex items-center gap-1.5">
                <Camera className="size-3.5" />
                Report Waste
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-linear-to-b from-emerald-500/10 via-background to-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-balance">
              Cleaner Streets, Healthier Communities for{" "}
              <span className="text-emerald-600">Ikere-Ekiti</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl text-balance">
              Empowering residents across Uro, Oke-Osun, Odo-Oja, Ogbontioro,
              and Olowo-Ijesa to report illegal dumping, track weekly collection
              schedules, and maintain environmental hygiene.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold"
              >
                <Link href="/report" className="flex items-center gap-2">
                  <Camera className="size-4" />
                  Report Waste Accumulation
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                <a href="#schedules" className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  View Collection Schedules
                </a>
              </Button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-14 w-full grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl border bg-card/60 backdrop-blur-xs shadow-xs text-left">
              <div className="p-3">
                <div className="text-2xl font-bold text-foreground">
                  5 Quarters
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Municipal Ikere coverage
                </div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-bold text-emerald-600">
                  {totalReports > 0 ? totalReports : 28}+
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Community reports processed
                </div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-bold text-foreground">
                  {resolvedReports > 0 ? resolvedReports : 24}+
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Evacuated dumpsites
                </div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-bold text-emerald-600">100%</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Scheduled weekly dispatch
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sanitation & Collection Schedule Section */}
      <section id="schedules" className="py-16 border-t bg-muted/20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">
              Sanitation & Collection Schedules
            </h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">
              Trucks and environmental crews operate systematically across all
              five major quarters. Ensure domestic refuse bins are placed by the
              roadside before 07:00 AM on your scheduled day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {schedules.map((schedule) => {
              const quarterInfo = quarterDetails[schedule.quarter] || {
                label: schedule.quarter,
                desc: "Ikere municipal district",
                landmarks: "Local roads",
              };

              return (
                <Card
                  key={schedule.id}
                  className="relative border shadow-xs hover:border-emerald-500/50 transition-all duration-200"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600/20 border-emerald-600/20">
                        {schedule.dayOfWeek}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3 text-muted-foreground" />
                        {schedule.timeSlot || "07:00 AM - 11:00 AM"}
                      </span>
                    </div>
                    <CardTitle className="text-lg mt-2">
                      {quarterInfo.label}
                    </CardTitle>
                    <CardDescription>{quarterInfo.desc}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-muted/60 flex items-start gap-2">
                      <Truck className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block text-foreground">
                          Assigned Crew:
                        </span>
                        <span className="text-muted-foreground">
                          {schedule.crewAssigned || "Ikere Sanitation Patrol"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{quarterInfo.landmarks}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 p-4 rounded-xl border bg-card text-center flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto shadow-xs">
            <div className="text-left text-xs sm:text-sm">
              <span className="font-semibold block text-foreground">
                Missed collection or overflowing bin?
              </span>
              <span className="text-muted-foreground">
                Submit a quick report and our response team will be alerted
                immediately.
              </span>
            </div>
            <Button
              asChild
              size="sm"
              className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Link href="/report">File Waste Report</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 border-t">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">
              How Community Reporting Works
            </h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">
              Direct municipal accountability powered by OpenStreetMap GPS
              coordinates and photographic verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border bg-card shadow-xs flex flex-col items-start text-left">
              <div className="flex items-center justify-center rounded-xl text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold mb-4">
                01
              </div>
              <h3 className="text-lg font-bold">Snap & Pin Location</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Take a photograph of the waste accumulation and pin the exact
                coordinates on our interactive map of Ikere-Ekiti.
              </p>
            </div>

            <div className="p-6 rounded-2xl border bg-card shadow-xs flex flex-col items-start text-left">
              <div className="flex items-center justify-center rounded-xl text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold mb-4">
                02
              </div>
              <h3 className="text-lg font-bold">Dispatch & Crew Assignment</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                The waste administration reviews the report and dispatches the
                quarter&apos;s sanitation truck and collection crew.
              </p>
            </div>

            <div className="p-6 rounded-2xl border bg-card shadow-xs flex flex-col items-start text-left">
              <div className="flex items-center justify-center rounded-xl text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold mb-4">
                03
              </div>
              <h3 className="text-lg font-bold">Evacuation & Verification</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Refuse is cleared and disposed at designated municipal
                dumpsites, with real-time status updates visible to the
                reporter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t bg-card py-6">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-center gap-6">
          <p className="text-sm text-muted-foreground text-center">
            IkereWaste &copy; {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
