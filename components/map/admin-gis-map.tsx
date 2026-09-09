"use client";

import { useEffect, useState } from "react";
import { Loader2, Layers, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Report {
  id: string;
  category: string;
  description: string | null;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
  quarter: string;
  address: string | null;
  status: "PENDING" | "ASSIGNED" | "RESOLVED";
  createdAt: string;
}

interface AdminGisMapProps {
  reports: Report[];
  height?: string;
  onSelectReport?: (reportId: string) => void;
}

export default function AdminGisMap({
  reports,
  height = "520px",
  onSelectReport,
}: AdminGisMapProps) {
  const [loading, setLoading] = useState(true);
  const [selectedQuarter, setSelectedQuarter] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  useEffect(() => {
    let isMounted = true;

    async function initGisMap() {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      const container = document.getElementById("admin-gis-map-container");
      if (!container || !isMounted) return;

      if ((container as any)._leaflet_map) {
        (container as any)._leaflet_map.remove();
        delete (container as any)._leaflet_map;
      }

      // Default center: Ikere-Ekiti central coordinates
      const map = L.map("admin-gis-map-container").setView([7.498, 5.231], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);

      (container as any)._leaflet_map = map;
      (container as any)._leaflet_layer = markersLayer;

      setLoading(false);
      renderMarkers(L, map, markersLayer);
    }

    initGisMap();

    return () => {
      isMounted = false;
      const container = document.getElementById("admin-gis-map-container");
      if (container && (container as any)._leaflet_map) {
        (container as any)._leaflet_map.remove();
        delete (container as any)._leaflet_map;
      }
    };
  }, []);

  const renderMarkers = async (L: any, map: any, layer: any) => {
    layer.clearLayers();

    const filtered = reports.filter((r) => {
      const quarterMatch = selectedQuarter === "ALL" || r.quarter === selectedQuarter;
      const statusMatch = selectedStatus === "ALL" || r.status === selectedStatus;
      return quarterMatch && statusMatch;
    });

    const statusColors: Record<string, string> = {
      PENDING: "#ef4444",   // Red
      ASSIGNED: "#3b82f6",  // Blue
      RESOLVED: "#10b981",  // Green
    };

    filtered.forEach((report) => {
      const color = statusColors[report.status] || "#6b7280";
      const icon = L.divIcon({
        className: "gis-marker-icon",
        html: `
          <div style="
            background-color: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
          ">
            ${report.status === "RESOLVED" ? "✓" : "!"}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([report.latitude, report.longitude], { icon });

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 13px; min-width: 200px; max-width: 260px;">
          <div style="font-weight: bold; margin-bottom: 4px; font-size: 14px;">${report.category}</div>
          <div style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; color: white; background-color: ${color}; margin-bottom: 6px;">
            ${report.status}
          </div>
          <div style="color: #666; font-size: 11px; margin-bottom: 4px;">
            <strong>Quarter:</strong> ${report.quarter.replace("_", " ")}
          </div>
          ${report.address ? `<div style="color: #444; font-size: 11px; margin-bottom: 6px;">📍 ${report.address}</div>` : ""}
          ${report.description ? `<p style="margin: 6px 0; color: #333; font-size: 12px; line-height: 1.4;">${report.description}</p>` : ""}
          ${report.imageUrl ? `<img src="${report.imageUrl}" alt="Waste Evidence" style="width: 100%; height: 110px; object-fit: cover; border-radius: 6px; margin-top: 6px; margin-bottom: 6px;" />` : ""}
          <div style="font-size: 10px; color: #888; margin-top: 4px;">
            Reported: ${new Date(report.createdAt).toLocaleDateString()}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      layer.addLayer(marker);
    });

    if (filtered.length > 0 && map) {
      const group = new L.featureGroup(layer.getLayers());
      if (group.getBounds().isValid()) {
        map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 16 });
      }
    }
  };

  useEffect(() => {
    const container = document.getElementById("admin-gis-map-container");
    if (container && (container as any)._leaflet_map && (container as any)._leaflet_layer) {
      import("leaflet").then((L) => {
        renderMarkers(
          L.default,
          (container as any)._leaflet_map,
          (container as any)._leaflet_layer
        );
      });
    }
  }, [reports, selectedQuarter, selectedStatus]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-border bg-card shadow-xs">
      {/* Map Filter Controls Bar */}
      <div className="p-3 border-b bg-card/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-primary" />
          <span className="font-medium text-sm">Ikere-Ekiti Waste Heatmap & GIS Routes</span>
          <Badge variant="secondary" className="text-xs">
            {reports.length} Total Incidents
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quarter filter */}
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground text-xs">Quarter:</span>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="bg-background border rounded-md px-2 py-1 text-xs focus:outline-hidden"
            >
              <option value="ALL">All Quarters</option>
              <option value="URO">Uro</option>
              <option value="OKE_OSUN">Oke-Osun</option>
              <option value="ODO_OJA">Odo-Oja</option>
              <option value="OGBONTIORO">Ogbontioro</option>
              <option value="OLOWO_IJESA">Olowo-Ijesa</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground text-xs">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-background border rounded-md px-2 py-1 text-xs focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      <div
        id="admin-gis-map-container"
        style={{ height, width: "100%" }}
        className="z-0"
      />

      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/70 backdrop-blur-xs">
          <Loader2 className="size-7 animate-spin text-primary" />
          <span className="mt-2 text-xs text-muted-foreground">Loading GIS Map Layer...</span>
        </div>
      )}

      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 z-10 bg-background/90 backdrop-blur-md px-3 py-2 rounded-lg border text-xs shadow-md flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-red-500 inline-block" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-blue-500 inline-block" />
          <span>Assigned</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-emerald-500 inline-block" />
          <span>Resolved</span>
        </div>
      </div>
    </div>
  );
}
