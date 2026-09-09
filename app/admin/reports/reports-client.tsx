"use client";

import { useState } from "react";
import {
  Search,
  Trash2,
  Truck,
  CheckCircle2,
  Edit,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";

interface CrewMember {
  id: string;
  name: string;
  phone: string | null;
  quarter: string | null;
}

interface WasteReport {
  id: string;
  category: string;
  description: string | null;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
  quarter: string;
  address: string | null;
  status: "PENDING" | "ASSIGNED" | "RESOLVED";
  adminNotes: string | null;
  createdAt: string;
  user: { name: string; email: string; phone: string | null } | null;
  crewAssigned: { id: string; name: string; phone: string | null } | null;
}

const quarterFilterItems: Record<string, string> = {
  ALL: "All 5 Quarters",
  URO: "Uro Quarter",
  OKE_OSUN: "Oke-Osun",
  ODO_OJA: "Odo-Oja",
  OGBONTIORO: "Ogbontioro",
  OLOWO_IJESA: "Olowo-Ijesa",
};

const statusFilterItems: Record<string, string> = {
  ALL: "All Statuses",
  PENDING: "Pending Review",
  ASSIGNED: "Assigned Crew",
  RESOLVED: "Resolved / Cleared",
};

const modalStatusItems: Record<string, string> = {
  PENDING: "PENDING (Awaiting Review)",
  ASSIGNED: "ASSIGNED (Dispatched to Crew)",
  RESOLVED: "RESOLVED (Evacuated / Cleared)",
};

export function ReportsClient({
  initialReports,
  crewMembers,
}: {
  initialReports: WasteReport[];
  crewMembers: CrewMember[];
}) {
  const [reports, setReports] = useState<WasteReport[]>(initialReports);
  const [search, setSearch] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Selected report for modal details/actions
  const [activeReport, setActiveReport] = useState<WasteReport | null>(null);
  const [newStatus, setNewStatus] = useState<"PENDING" | "ASSIGNED" | "RESOLVED">("PENDING");
  const [assignedCrewId, setAssignedCrewId] = useState<string>("NONE");
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const crewItemsMap: Record<string, string> = {
    NONE: "-- Unassigned --",
    ...Object.fromEntries(
      crewMembers.map((c) => [c.id, `${c.name}${c.phone ? ` (${c.phone})` : ""}`])
    ),
  };

  const openActionModal = (report: WasteReport) => {
    setActiveReport(report);
    setNewStatus(report.status);
    setAssignedCrewId(report.crewAssigned?.id || "NONE");
    setNotes(report.adminNotes || "");
    setMessage(null);
  };

  const handleUpdate = async () => {
    if (!activeReport) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/reports/${activeReport.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          crewAssignedId: assignedCrewId === "NONE" ? null : assignedCrewId,
          adminNotes: notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update report.");
        setSaving(false);
        return;
      }

      setReports((prev) =>
        prev.map((r) => (r.id === activeReport.id ? data.report : r))
      );
      setActiveReport(data.report);
      setMessage("Report updated successfully!");
      setSaving(false);
    } catch {
      alert("Error updating report.");
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this waste report?")) return;

    try {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== id));
        if (activeReport?.id === id) {
          setActiveReport(null);
        }
      } else {
        alert("Failed to delete report.");
      }
    } catch {
      alert("Error deleting report.");
    }
  };

  const filteredReports = reports.filter((r) => {
    const quarterMatch = selectedQuarter === "ALL" || r.quarter === selectedQuarter;
    const statusMatch = selectedStatus === "ALL" || r.status === selectedStatus;
    const searchMatch =
      !search ||
      r.category.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase()) ||
      r.address?.toLowerCase().includes(search.toLowerCase()) ||
      r.user?.name.toLowerCase().includes(search.toLowerCase());

    return quarterMatch && statusMatch && searchMatch;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar */}
      <Card className="border shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search category, location, reporter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Quarter Filter with Shadcn Select */}
            <Select
              items={quarterFilterItems}
              value={selectedQuarter}
              onValueChange={(val) => val && setSelectedQuarter(val)}
            >
              <SelectTrigger className="h-9 text-xs min-w-36 bg-background">
                <SelectValue placeholder="Quarter" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(quarterFilterItems).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter with Shadcn Select */}
            <Select
              items={statusFilterItems}
              value={selectedStatus}
              onValueChange={(val) => val && setSelectedStatus(val)}
            >
              <SelectTrigger className="h-9 text-xs min-w-36 bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusFilterItems).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card className="border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                <th className="p-3.5">Category & Photo</th>
                <th className="p-3.5">Quarter & Address</th>
                <th className="p-3.5">Reporter</th>
                <th className="p-3.5">Assigned Crew</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No reports found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        {report.imageUrl ? (
                          <img
                            src={report.imageUrl}
                            alt="thumb"
                            className="size-10 rounded-md object-cover border shrink-0"
                          />
                        ) : (
                          <div className="size-10 rounded-md bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                            <Trash2 className="size-4" />
                          </div>
                        )}
                        <div className="truncate max-w-[180px]">
                          <span className="font-semibold block truncate">{report.category}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            ID: {report.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        <span className="font-medium block">{report.quarter.replace("_", " ")}</span>
                        <span className="text-[11px] text-muted-foreground truncate max-w-[180px] block">
                          {report.address || "Coordinates pinned"}
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div>
                        <span className="font-medium block">{report.user?.name || "Anonymous / Guest"}</span>
                        <span className="text-[11px] text-muted-foreground">{report.user?.phone || "No phone"}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      {report.crewAssigned ? (
                        <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                          <Truck className="size-3.5 shrink-0" />
                          <span className="truncate max-w-[140px]">{report.crewAssigned.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">Unassigned</span>
                      )}
                    </td>

                    <td className="p-3.5">
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
                    </td>

                    <td className="p-3.5 text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-3.5 text-right space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2.5"
                        onClick={() => openActionModal(report)}
                      >
                        <Edit className="size-3 mr-1" />
                        Manage
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(report.id)}
                        title="Delete report"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail & Action Modal Using ResponsiveDialog (Dialog on desktop, Drawer on mobile) */}
      <ResponsiveDialog
        open={!!activeReport}
        onOpenChange={(open) => !open && setActiveReport(null)}
      >
        <ResponsiveDialogContent className="sm:max-w-xl max-h-[88vh]">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Manage Waste Incident</ResponsiveDialogTitle>
            <ResponsiveDialogDescription className="font-mono text-[11px]">
              Ref: {activeReport?.id}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          {activeReport && (
            <ResponsiveDialogBody className="space-y-4 text-xs py-2">
              {message && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center gap-2">
                  <CheckCircle2 className="size-4" />
                  <span>{message}</span>
                </div>
              )}

              {/* Photo Evidence if available */}
              {activeReport.imageUrl && (
                <div className="rounded-xl overflow-hidden border">
                  <img
                    src={activeReport.imageUrl}
                    alt="Waste Evidence"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* Incident Info summary */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/30 border">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Category</span>
                  <span className="font-semibold text-sm">{activeReport.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Quarter</span>
                  <span className="font-semibold text-sm">{activeReport.quarter.replace("_", " ")}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block text-[11px]">Landmark / Coordinates</span>
                  <span className="font-medium">
                    {activeReport.address || "No address"} ({activeReport.latitude}, {activeReport.longitude})
                  </span>
                </div>
                {activeReport.description && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-[11px]">Description</span>
                    <p className="mt-0.5 text-muted-foreground">{activeReport.description}</p>
                  </div>
                )}
              </div>

              {/* Action Form */}
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <Label htmlFor="status-select" className="text-xs">Update Operational Status</Label>
                  <Select
                    items={modalStatusItems}
                    value={newStatus}
                    onValueChange={(val) => val && setNewStatus(val as any)}
                  >
                    <SelectTrigger id="status-select" className="w-full text-xs h-9">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(modalStatusItems).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="crew-select" className="text-xs">Assign Collection Crew</Label>
                  <Select
                    items={crewItemsMap}
                    value={assignedCrewId}
                    onValueChange={(val) => {
                      if (val) {
                        setAssignedCrewId(val);
                        if (val !== "NONE" && newStatus === "PENDING") {
                          setNewStatus("ASSIGNED");
                        }
                      }
                    }}
                  >
                    <SelectTrigger id="crew-select" className="w-full text-xs h-9">
                      <SelectValue placeholder="Assign Crew" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(crewItemsMap).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="admin-notes" className="text-xs">Admin / Dispatch Notes</Label>
                  <Textarea
                    id="admin-notes"
                    placeholder="e.g. Scheduled for Wednesday evacuation; vehicle #4 assigned."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="text-xs resize-none"
                  />
                </div>
              </div>
            </ResponsiveDialogBody>
          )}

          <ResponsiveDialogFooter className="flex items-center justify-between border-t pt-3">
            <Button variant="outline" size="sm" onClick={() => setActiveReport(null)}>
              Close
            </Button>
            <Button
              size="sm"
              onClick={handleUpdate}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saving ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
              {saving ? "Saving Changes..." : "Save Changes"}
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </div>
  );
}
