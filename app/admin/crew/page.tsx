import prisma from "@/lib/prisma";
import { Users, Phone, Mail, MapPin, UserPlus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminCrewPage() {
  const crewMembers = await prisma.user.findMany({
    where: { role: Role.CREW },
    include: {
      assignedTasks: {
        where: { status: "ASSIGNED" },
        select: { id: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Sanitation Personnel & Crews
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Registered municipal field crew units in Ikere-Ekiti
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {crewMembers.map((crew) => (
          <Card key={crew.id} className="border shadow-xs">
            <CardHeader className="py-2 px-4 pb-3">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/20"
                >
                  Field Crew
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {crew.assignedTasks.length} Active Tasks
                </Badge>
              </div>
              <CardTitle className="text-base mt-2">{crew.name}</CardTitle>
              <CardDescription className="text-xs">
                {crew.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-3.5 text-primary" />
                <span>{crew.phone || "No phone registered"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-3.5 text-primary" />
                <span>
                  Base:{" "}
                  {crew.quarter
                    ? crew.quarter.replace("_", " ")
                    : "Municipal Central"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
