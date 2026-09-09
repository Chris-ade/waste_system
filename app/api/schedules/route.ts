import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { Quarter, Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const quarter = searchParams.get("quarter") as Quarter | null;

    const where: any = {};
    if (quarter && Object.values(Quarter).includes(quarter)) {
      where.quarter = quarter;
    }

    const schedules = await prisma.pickupSchedule.findMany({
      where,
      include: {
        crewUser: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: { quarter: "asc" },
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch pickup schedules." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { quarter, dayOfWeek, timeSlot, crewAssigned, crewUserId, isActive } = body;

    if (!quarter || !dayOfWeek) {
      return NextResponse.json(
        { error: "Quarter and day of the week are required." },
        { status: 400 }
      );
    }

    const schedule = await prisma.pickupSchedule.create({
      data: {
        quarter: quarter as Quarter,
        dayOfWeek,
        timeSlot: timeSlot || null,
        crewAssigned: crewAssigned || null,
        crewUserId: crewUserId || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ message: "Schedule created.", schedule }, { status: 201 });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { error: "Failed to create pickup schedule." },
      { status: 500 }
    );
  }
}
