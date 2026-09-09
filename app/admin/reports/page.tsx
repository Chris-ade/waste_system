import prisma from "@/lib/prisma";
import { ReportsClient } from "./reports-client";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const [reports, crewMembers] = await Promise.all([
    prisma.wasteReport.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        crewAssigned: { select: { id: true, name: true, phone: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: Role.CREW },
      select: { id: true, name: true, phone: true, quarter: true },
      orderBy: { name: "asc" },
    }),
  ]);

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
    adminNotes: r.adminNotes,
    createdAt: r.createdAt.toISOString(),
    user: r.user,
    crewAssigned: r.crewAssigned,
  }));

  const serializedCrew = crewMembers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    quarter: c.quarter,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Waste Incident Complaints</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Review, filter, assign crews, and manage resolution statuses across all Ikere-Ekiti quarters
        </p>
      </div>

      <ReportsClient
        initialReports={serializedReports}
        crewMembers={serializedCrew}
      />
    </div>
  );
}
