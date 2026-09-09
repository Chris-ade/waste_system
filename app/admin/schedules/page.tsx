import prisma from "@/lib/prisma";
import { Clock, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminSchedulesPage() {
  const schedules = await prisma.pickupSchedule.findMany({
    orderBy: { quarter: "asc" },
    include: {
      crewUser: { select: { name: true, phone: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Quarter Pickup Schedules
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure designated pickup timetables and crew dispatch assignments
            across Ikere quarters
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schedules.map((schedule) => (
          <Card key={schedule.id} className="border shadow-xs">
            <CardHeader className="py-2 px-4 pb-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                  {schedule.dayOfWeek}
                </Badge>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" />
                  {schedule.timeSlot || "07:00 AM - 11:00 AM"}
                </span>
              </div>
              <CardTitle className="text-base mt-2">
                {schedule.quarter.replace("_", " ")} Quarter
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-muted/40 border space-y-1">
                <span className="text-muted-foreground block text-[11px]">
                  Assigned Disposal Team
                </span>
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Truck className="size-3.5 text-primary" />
                  {schedule.crewAssigned || "Unassigned Unit"}
                </span>
                {schedule.crewUser && (
                  <span className="text-muted-foreground block text-[11px]">
                    Crew Contact: {schedule.crewUser.name} (
                    {schedule.crewUser.phone || "No phone"})
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
