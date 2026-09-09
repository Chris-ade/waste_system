import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.CREW)) {
      return NextResponse.json(
        { error: "Unauthorized. Admin or Crew access required." },
        { status: 403 }
      );
    }

    const crewMembers = await prisma.user.findMany({
      where: { role: Role.CREW },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        quarter: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ crew: crewMembers });
  } catch (error) {
    console.error("Error fetching crew members:", error);
    return NextResponse.json(
      { error: "Failed to fetch crew members." },
      { status: 500 }
    );
  }
}
