"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Trash2,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  Edit,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  const [assignedCrewId, setAssignedCrewId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const openActionModal = (report: WasteReport) => {
    setActiveReport(report);
    setNewStatus(report.status);
    setAssignedCrewId(report.crewAssigned?.id || "");
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
          crewAssignedId: assignedCrewId || null,
          adminNotes: notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update report.");
        setSaving(false);
        return;
      }

      // Update state
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

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Quarter Filter */}
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus:outline-hidden"
            >
              <option value="ALL">All 5 Quarters</option>
              <option value="URO">Uro Quarter</option>
              <option value="OKE_OSUN">Oke-Osun</option>
              <option value="ODO_OJA">Odo-Oja</option>
              <option value="OGBONTIORO">Ogbontioro</option>
              <option value="OLOWO_IJESA">Olowo-Ijesa</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="ASSIGNED">Assigned Crew</option>
              <option value="RESOLVED">Resolved / Cleared</option>
            </select>
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

      {/* Detail & Action Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-card border rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-bold text-base">Manage Waste Report</h3>
                <span className="text-xs text-muted-foreground font-mono">Ref: {activeReport.id}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveReport(null)}>
                <X className="size-4" />
              </Button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
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
                  <select
                    id="status-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus:outline-hidden"
                  >
                    <option value="PENDING">PENDING (Awaiting Review)</option>
                    <option value="ASSIGNED">ASSIGNED (Dispatched to Crew)</option>
                    <option value="RESOLVED">RESOLVED (Evacuated / Cleared)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="crew-select" className="text-xs">Assign Collection Crew</Label>
                  <select
                    id="crew-select"
                    value={assignedCrewId}
                    onChange={(e) => {
                      setAssignedCrewId(e.target.value);
                      if (e.target.value && newStatus === "PENDING") {
                        setNewStatus("ASSIGNED");
                      }
                    }}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus:outline-hidden"
                  >
                    <option value="">-- Select Crew Member --</option>
                    {crewMembers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.phone ? `(${c.phone})` : ""}
                      </option>
                    ))}
                  </select>
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
            </div>

            <div className="flex items-center justify-between p-4 border-t bg-muted/20">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
