import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";
import AdminGisMap from "@/components/map/admin-gis-map";

export const dynamic = "force-dynamic";

export default async function AdminMapPage() {
  const reports = await prisma.wasteReport.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serializedReports = reports.map((r) => ({
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

  const pendingCount = reports.filter((r) => r.status === "PENDING").length;
  const assignedCount = reports.filter((r) => r.status === "ASSIGNED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            GIS Route Planning & Heatmap
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Spatial distribution of waste accumulation across Ikere-Ekiti for
            manual truck route planning
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-xs">
            {pendingCount} Pending Sites
          </Badge>
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">
            {assignedCount} In Progress
          </Badge>
        </div>
      </div>

      {/* Full GIS Map View */}
      <AdminGisMap reports={serializedReports} height="600px" />

      {/* Manual Route Optimization Hints */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <Card className="border shadow-xs">
          <CardHeader className="px-4 pt-2">
            <CardTitle className="text-md font-semibold flex items-center gap-2">
              North Corridor (Uro)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-muted-foreground leading-relaxed">
            Dispatch via Afao Road. Recommended truck route proceeds through Uro
            Community Grammar School toward the northern municipal boundary.
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="px-4 pt-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              Commercial Spine (Oke-Osun & Odo-Oja)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-muted-foreground leading-relaxed">
            High waste volume density around Central Market and Post Office
            roundabout. Recommended collection hours are 06:00 - 08:30 AM before
            market congestion.
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="px-4 pt-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              South-East Cluster (Ogbontioro & Olowo-Ijesa)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-muted-foreground leading-relaxed">
            Route trucks along Ado Road corridor and loop through Ogbontioro
            residential streets to reach eastern dumpsites without backtracking.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
