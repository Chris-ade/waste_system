import Link from "next/link";
import {
  FileSpreadsheet,
  AlertCircle,
  Truck,
  CheckCircle2,
  MapPin,
  ArrowRight,
  Layers,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import AdminGisMap from "@/components/map/admin-gis-map";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [
    totalReports,
    pendingReports,
    assignedReports,
    resolvedReports,
    allReports,
    quarterCounts,
    recentReports,
  ] = await Promise.all([
    prisma.wasteReport.count(),
    prisma.wasteReport.count({ where: { status: "PENDING" } }),
    prisma.wasteReport.count({ where: { status: "ASSIGNED" } }),
    prisma.wasteReport.count({ where: { status: "RESOLVED" } }),
    prisma.wasteReport.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
    }),
    prisma.wasteReport.groupBy({
      by: ["quarter"],
      _count: { id: true },
    }),
    prisma.wasteReport.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, phone: true } },
        crewAssigned: { select: { name: true } },
      },
    }),
  ]);

  const resolutionRate =
    totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

  const serializedReports = allReports.map((r) => ({
    id: r.id,
    category: r.category,
    description: r.description,
    imageUrl: r.imageUrl,
    latitude: r.latitude,
    longitude: r.longitude,
    quarter: r.quarter,
    address: r.address,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));

  const quarterData: Record<string, number> = {
    URO: 0,
    OKE_OSUN: 0,
    ODO_OJA: 0,
    OGBONTIORO: 0,
    OLOWO_IJESA: 0,
  };
  quarterCounts.forEach((q) => {
    quarterData[q.quarter] = q._count.id;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Municipal Command Center
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ikere-Ekiti Waste & Refuse Operational Intelligence & GIS Dispatch
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="text-xs">
            <Link href="/admin/reports">
              <FileSpreadsheet className="size-3.5 mr-1.5" />
              Manage All Reports
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
          >
            <Link href="/admin/map">
              <MapPin className="size-3.5 mr-1.5" />
              Full GIS Route Map
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Cards conforming to admin-dashboard styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="border shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">
                Total Incidents Reported
              </CardDescription>
              <div className="size-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                <FileSpreadsheet className="size-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">{totalReports}</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground pt-0">
            Across 5 Ikere quarters
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">
                Pending Dispatch
              </CardDescription>
              <div className="size-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <AlertCircle className="size-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-amber-600">
              {pendingReports}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground pt-0">
            Requires crew assignment
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">
                Active Crew Dispatches
              </CardDescription>
              <div className="size-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Truck className="size-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-blue-600">
              {assignedReports}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground pt-0">
            Assigned to sanitation units
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">
                Resolution Rate
              </CardDescription>
              <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="size-4" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl font-bold text-emerald-600">
                {resolutionRate}%
              </CardTitle>
              <Badge className="bg-emerald-600/10 text-emerald-700 border-emerald-600/20 text-[10px] py-0">
                {resolvedReports} Cleared
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground pt-0">
            Evacuated & confirmed
          </CardContent>
        </Card>
      </div>

      {/* Quarter Distribution Grid */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">
                Quarter Breakdown across Ikere-Ekiti
              </CardTitle>
              <CardDescription className="text-xs">
                Incident density and reports logged per municipal administrative
                quarter
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { code: "URO", name: "Uro Quarter", count: quarterData.URO },
              {
                code: "OKE_OSUN",
                name: "Oke-Osun",
                count: quarterData.OKE_OSUN,
              },
              { code: "ODO_OJA", name: "Odo-Oja", count: quarterData.ODO_OJA },
              {
                code: "OGBONTIORO",
                name: "Ogbontioro",
                count: quarterData.OGBONTIORO,
              },
              {
                code: "OLOWO_IJESA",
                name: "Olowo-Ijesa",
                count: quarterData.OLOWO_IJESA,
              },
            ].map((q) => (
              <div
                key={q.code}
                className="p-3 rounded-xl border bg-muted/20 text-center space-y-1"
              >
                <span className="text-[11px] font-semibold text-muted-foreground block truncate">
                  {q.name}
                </span>
                <span className="text-xl font-bold text-foreground">
                  {q.count}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  incidents
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* GIS Mapping Route Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-emerald-600" />
            <h2 className="text-base font-bold tracking-tight">
              Active GIS Incident Locations
            </h2>
          </div>
          <Link
            href="/admin/map"
            className="text-xs text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
          >
            Open Full Screen Map
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <AdminGisMap reports={serializedReports} height="440px" />
      </div>

      {/* Recent Incoming Reports Table */}
      <Card className="border shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-0">
          <div>
            <CardTitle className="text-base">
              Recent Incident Submissions
            </CardTitle>
            <CardDescription className="text-xs">
              Latest reports logged by Ikere residents
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs">
            <Link href="/admin/reports">View All ({totalReports})</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs hover:bg-muted/10 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{report.category}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        report.status === "RESOLVED"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : report.status === "ASSIGNED"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}
                    >
                      {report.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                    <span>Quarter: {report.quarter.replace("_", " ")}</span>
                    <span>•</span>
                    <span>
                      Reporter: {report.user?.name || "Guest Resident"}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                  >
                    <Link href={`/admin/reports?id=${report.id}`}>Manage</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
