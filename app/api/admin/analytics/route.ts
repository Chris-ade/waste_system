import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { ReportStatus, Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.CREW)) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 },
      );
    }

    const [
      totalReports,
      pendingReports,
      assignedReports,
      resolvedReports,
      totalUsers,
      totalCrew,
      quarterCounts,
      recentReports,
    ] = await Promise.all([
      prisma.wasteReport.count(),
      prisma.wasteReport.count({ where: { status: ReportStatus.PENDING } }),
      prisma.wasteReport.count({ where: { status: ReportStatus.ASSIGNED } }),
      prisma.wasteReport.count({ where: { status: ReportStatus.RESOLVED } }),
      prisma.user.count({ where: { role: Role.RESIDENT } }),
      prisma.user.count({ where: { role: Role.CREW } }),
      prisma.wasteReport.groupBy({
        by: ["quarter"],
        _count: { id: true },
      }),
      prisma.wasteReport.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          crewAssigned: { select: { name: true } },
        },
      }),
    ]);

    const resolutionRate =
      totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

    // Format quarter distribution
    const quarterMap: Record<string, number> = {
      URO: 0,
      OKE_OSUN: 0,
      ODO_OJA: 0,
      OGBONTIORO: 0,
      OLOWO_IJESA: 0,
    };
    quarterCounts.forEach((q) => {
      quarterMap[q.quarter] = q._count.id;
    });

    return NextResponse.json({
      metrics: {
        totalReports,
        pendingReports,
        assignedReports,
        resolvedReports,
        resolutionRate,
        totalUsers,
        totalCrew,
      },
      quarterDistribution: quarterMap,
      recentReports,
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json(
      { error: "Failed to generate analytics." },
      { status: 500 },
    );
  }
}
