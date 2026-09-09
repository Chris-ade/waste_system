"use client";

import { useEffect, useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onLocationSelect: (lat: number, lng: number) => void;
  height?: string;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onLocationSelect,
  height = "380px",
}: LocationPickerMapProps) {
  const [loading, setLoading] = useState(true);
  const [geoLocating, setGeoLocating] = useState(false);

  useEffect(() => {
    // Dynamic import to ensure window is defined
    let isMounted = true;

    async function initMap() {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // Fix leaflet's default icon path issue with Next.js/Webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const container = document.getElementById("location-map-container");
      if (!container || !isMounted) return;

      // If map is already initialized on this container, do not reinit
      if ((container as any)._leaflet_id) {
        return;
      }

      const map = L.map("location-map-container").setView([latitude, longitude], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom pulse marker icon
      const customIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div style="background-color: #ef4444; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5); transform: translate(-50%, -50%);"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const marker = L.marker([latitude, longitude], {
        draggable: true,
        icon: customIcon,
      }).addTo(map);

      marker.on("dragend", (e: any) => {
        const position = e.target.getLatLng();
        onLocationSelect(
          parseFloat(position.lat.toFixed(6)),
          parseFloat(position.lng.toFixed(6))
        );
      });

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        onLocationSelect(
          parseFloat(lat.toFixed(6)),
          parseFloat(lng.toFixed(6))
        );
      });

      // Save references on container for external updates
      (container as any)._leaflet_map = map;
      (container as any)._leaflet_marker = marker;

      setLoading(false);
    }

    initMap();

    return () => {
      isMounted = false;
      const container = document.getElementById("location-map-container");
      if (container && (container as any)._leaflet_map) {
        (container as any)._leaflet_map.remove();
        delete (container as any)._leaflet_map;
        delete (container as any)._leaflet_id;
      }
    };
  }, []);

  // Update marker position if external coordinates change
  useEffect(() => {
    const container = document.getElementById("location-map-container");
    if (container && (container as any)._leaflet_marker && (container as any)._leaflet_map) {
      const marker = (container as any)._leaflet_marker;
      const map = (container as any)._leaflet_map;
      const current = marker.getLatLng();
      if (
        Math.abs(current.lat - latitude) > 0.0001 ||
        Math.abs(current.lng - longitude) > 0.0001
      ) {
        marker.setLatLng([latitude, longitude]);
        map.panTo([latitude, longitude]);
      }
    }
  }, [latitude, longitude]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        onLocationSelect(lat, lng);
        setGeoLocating(false);
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        alert("Unable to retrieve location. Please click on the map to pin the position.");
        setGeoLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-border bg-muted/20">
      <div
        id="location-map-container"
        style={{ height, width: "100%" }}
        className="z-0"
      />

      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xs">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span className="mt-2 text-xs text-muted-foreground">Loading Ikere-Ekiti Map...</span>
        </div>
      )}

      {/* Floating control buttons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="shadow-md bg-card/90 hover:bg-card text-xs flex items-center gap-1.5 backdrop-blur-xs"
          onClick={handleGetCurrentLocation}
          disabled={geoLocating}
        >
          {geoLocating ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Navigation className="size-3.5 text-primary" />
          )}
          {geoLocating ? "Locating..." : "Locate Me"}
        </Button>
      </div>

      <div className="absolute bottom-3 left-3 right-3 z-10 bg-background/90 backdrop-blur-md px-3 py-2 rounded-lg border text-xs flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="size-3.5 text-red-500 shrink-0" />
          <span className="truncate">
            Pinned: <strong className="text-foreground">{latitude}, {longitude}</strong>
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          Click or drag marker to adjust
        </span>
      </div>
    </div>
  );
}
