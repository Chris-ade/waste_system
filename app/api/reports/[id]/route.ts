import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { ReportStatus, Role } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = await prisma.wasteReport.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        crewAssigned: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.CREW)) {
      return NextResponse.json(
        { error: "Unauthorized. Admin or Crew privileges required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { status, crewAssignedId, adminNotes } = body;

    const data: any = {};

    if (status && Object.values(ReportStatus).includes(status)) {
      data.status = status;
      if (status === ReportStatus.RESOLVED) {
        data.resolvedAt = new Date();
      } else if (status === ReportStatus.PENDING) {
        data.resolvedAt = null;
      }
    }

    if (crewAssignedId !== undefined) {
      data.crewAssignedId = crewAssignedId || null;
      if (crewAssignedId && !status) {
        data.status = ReportStatus.ASSIGNED;
      }
    }

    if (adminNotes !== undefined) {
      data.adminNotes = adminNotes;
    }

    const updated = await prisma.wasteReport.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        crewAssigned: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    return NextResponse.json({
      message: "Report updated successfully.",
      report: updated,
    });
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    await prisma.wasteReport.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Report deleted successfully." });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}
