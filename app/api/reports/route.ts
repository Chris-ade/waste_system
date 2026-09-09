import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { Quarter, ReportStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const quarter = searchParams.get("quarter") as Quarter | null;
    const status = searchParams.get("status") as ReportStatus | null;
    const userId = searchParams.get("userId");
    const crewId = searchParams.get("crewId");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (quarter && Object.values(Quarter).includes(quarter)) {
      where.quarter = quarter;
    }

    if (status && Object.values(ReportStatus).includes(status)) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    if (crewId) {
      where.crewAssignedId = crewId;
    }

    if (search) {
      where.OR = [
        { category: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    const [reports, totalCount] = await Promise.all([
      prisma.wasteReport.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          crewAssigned: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.wasteReport.count({ where }),
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching waste reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch waste reports." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const body = await req.json();

    const {
      category,
      description,
      imageUrl,
      latitude,
      longitude,
      quarter,
      address,
    } = body;

    if (!category || !latitude || !longitude || !quarter) {
      return NextResponse.json(
        { error: "Category, coordinates (latitude & longitude), and quarter are required." },
        { status: 400 }
      );
    }

    if (!Object.values(Quarter).includes(quarter)) {
      return NextResponse.json(
        { error: "Invalid quarter provided. Must be one of URO, OKE_OSUN, ODO_OJA, OGBONTIORO, OLOWO_IJESA." },
        { status: 400 }
      );
    }

    const report = await prisma.wasteReport.create({
      data: {
        category,
        description: description || null,
        imageUrl: imageUrl || null,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        quarter: quarter as Quarter,
        address: address || null,
        userId: user ? user.userId : null,
        status: ReportStatus.PENDING,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    return NextResponse.json(
      { message: "Waste report submitted successfully.", report },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating waste report:", error);
    return NextResponse.json(
      { error: "Failed to submit waste report." },
      { status: 500 }
    );
  }
}
