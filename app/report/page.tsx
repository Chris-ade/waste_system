"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Camera,
  MapPin,
  FileText,
  UploadCloud,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Dynamically import map to avoid SSR Leaflet issues
const LocationPickerMap = dynamic(
  () => import("@/components/map/location-picker-map"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[380px] w-full rounded-xl border flex flex-col items-center justify-center bg-muted/30">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span className="mt-2 text-xs text-muted-foreground">
          Initializing Ikere-Ekiti Map...
        </span>
      </div>
    ),
  },
);

const CATEGORIES = [
  "Household Waste Accumulation",
  "Illegal Open Dumpsite",
  "Commercial / Market Refuse",
  "Drainage / Gutter Blockage",
  "Bulky Items / Abandoned Junk",
  "Hazardous / Medical Waste",
  "Other",
];

const QUARTERS = [
  { value: "URO", label: "Uro Quarter" },
  { value: "OKE_OSUN", label: "Oke-Osun Quarter" },
  { value: "ODO_OJA", label: "Odo-Oja Quarter" },
  { value: "OGBONTIORO", label: "Ogbontioro Quarter" },
  { value: "OLOWO_IJESA", label: "Olowo-Ijesa Quarter" },
];

const categoryItems: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c, c]),
);
const quarterItems: Record<string, string> = Object.fromEntries(
  QUARTERS.map((q) => [q.value, q.label]),
);

export default function ReportWastePage() {
  const router = useRouter();

  // Multi-step: 1 = Details, 2 = Photo, 3 = Location, 4 = Review & Submit
  const [step, setStep] = useState(1);

  // Form states
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [quarter, setQuarter] = useState("ODO_OJA");
  const [address, setAddress] = useState("");
  // Default centered in Ikere-Ekiti (lat: 7.498, lng: 5.231)
  const [latitude, setLatitude] = useState<number>(7.498);
  const [longitude, setLongitude] = useState<number>(5.231);

  // File upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submittedReport, setSubmittedReport] = useState<any | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      let imageUrl: string | null = null;

      // 1. Upload image if provided
      if (imageFile) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.url;
        }
        setUploadingImage(false);
      }

      // 2. Submit report
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          description,
          quarter,
          address,
          latitude,
          longitude,
          imageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit waste report.");
        setSubmitting(false);
        return;
      }

      setSubmittedReport(data.report);
      setSubmitting(false);
    } catch {
      setError("An unexpected error occurred while submitting.");
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  if (submittedReport) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
        <Card className="max-w-lg w-full border shadow-sm text-center p-6 space-y-5">
          <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="size-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Report Received
            </h2>
            <p className="text-xs text-muted-foreground">
              Thank you for keeping Ikere-Ekiti clean. The municipal sanitation
              administration has been notified.
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-muted/40 text-left text-xs space-y-2">
            <div className="flex justify-between items-center py-1 border-b">
              <span className="text-muted-foreground">Reference ID:</span>
              <span className="font-mono font-medium">
                {submittedReport.id}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b">
              <span className="text-muted-foreground">Quarter:</span>
              <span className="font-medium">
                {submittedReport.quarter.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b">
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium">{submittedReport.category}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Initial Status:</span>
              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                PENDING REVIEW
              </Badge>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <Button
              asChild
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Link href="/dashboard">View in Resident Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-1.5 font-bold text-sm">
            <div className="size-6 rounded-md bg-emerald-600 text-white flex items-center justify-center">
              <Trash2 className="size-3.5" />
            </div>
            <span>Ikere Waste Portal</span>
          </div>
          <div className="w-16" /> {/* spacer */}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Report Waste Incident
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Pin the accumulation site and upload evidence for swift municipal
            dispatch
          </p>
        </div>

        {/* Step Progress Tracker */}
        <div className="flex items-center justify-between mb-8 px-2 max-w-md mx-auto">
          {[
            { num: 1, label: "Category", icon: FileText },
            { num: 2, label: "Evidence", icon: Camera },
            { num: 3, label: "Location", icon: MapPin },
          ].map((s) => {
            const Icon = s.icon;
            const active = step === s.num;
            const completed = step > s.num;
            return (
              <div key={s.num} className="flex flex-col items-center">
                <div
                  className={`size-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    completed
                      ? "bg-emerald-600 text-white"
                      : active
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                </div>
                <span
                  className={`text-[11px] mt-1.5 ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Card className="border shadow-xs">
          {/* STEP 1: Details */}
          {step === 1 && (
            <div>
              <CardHeader>
                <CardTitle className="text-lg">Incident Details</CardTitle>
                <CardDescription className="text-xs">
                  Specify the type of refuse and any helpful description for the
                  sanitation team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-sm mt-4">
                    Waste Category
                  </Label>
                  <Select
                    items={categoryItems}
                    value={category}
                    onValueChange={(val) => val && setCategory(val)}
                  >
                    <SelectTrigger
                      id="category"
                      className="w-full text-sm h-10"
                    >
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-sm">
                    Description & Landmark Details (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the accumulation size, proximity to gutters or buildings, hazards, etc."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="text-sm resize-none"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-2 border-t bg-muted/20">
                <Button
                  onClick={() => setStep(2)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Next: Photo Evidence
                  <ArrowRight className="size-4 ml-1.5" />
                </Button>
              </CardFooter>
            </div>
          )}

          {/* STEP 2: Photo Upload */}
          {step === 2 && (
            <div>
              <CardHeader>
                <CardTitle className="text-lg">Photographic Evidence</CardTitle>
                <CardDescription className="text-sm">
                  A photo helps the sanitation supervisor estimate the truck
                  size and crew required
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 my-4">
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border">
                    <img
                      src={imagePreview}
                      alt="Waste Preview"
                      className="w-full h-64 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                      title="Remove image"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center bg-muted/10 hover:bg-muted/30 transition-colors">
                    <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
                      <Camera className="size-6" />
                    </div>
                    <span className="text-sm font-semibold">
                      Take a photo or upload from device
                    </span>
                    <span className="text-xs text-muted-foreground mt-1 max-w-xs">
                      Supports JPG, PNG, WEBP (Max 10MB)
                    </span>
                    <label className="mt-4">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold cursor-pointer hover:bg-secondary/80 border">
                        <UploadCloud className="size-4" />
                        Select Photograph
                      </span>
                    </label>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between pt-2 border-t bg-muted/20">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="size-4 mr-1.5" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Next: Pin Location
                  <ArrowRight className="size-4 ml-1.5" />
                </Button>
              </CardFooter>
            </div>
          )}

          {/* STEP 3: Map Location Picking */}
          {step === 3 && (
            <div>
              <CardHeader>
                <CardTitle className="text-lg">
                  Location & Quarter Pin
                </CardTitle>
                <CardDescription className="text-xs">
                  Click or drag the marker on the Ikere-Ekiti map to set the
                  exact refuse site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 my-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="quarter-select" className="text-sm">
                      Quarter
                    </Label>
                    <Select
                      items={quarterItems}
                      value={quarter}
                      onValueChange={(val) => val && setQuarter(val)}
                    >
                      <SelectTrigger
                        id="quarter-select"
                        className="w-full text-sm h-9"
                      >
                        <SelectValue placeholder="Select Quarter" />
                      </SelectTrigger>
                      <SelectContent>
                        {QUARTERS.map((q) => (
                          <SelectItem key={q.value} value={q.value}>
                            {q.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="address-input" className="text-sm">
                      Street / Notable Landmark
                    </Label>
                    <Input
                      id="address-input"
                      placeholder="e.g. Opposite Palace entrance, Ado road"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm flex items-center justify-between">
                    <span>Map Coordinate Picker</span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Lat: {latitude} | Lng: {longitude}
                    </span>
                  </Label>
                  <LocationPickerMap
                    latitude={latitude}
                    longitude={longitude}
                    onLocationSelect={handleLocationSelect}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2 border-t bg-muted/20">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="size-4 mr-1.5" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {submitting ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : null}
                  {submitting ? "Submitting Report..." : "Submit Waste Report"}
                </Button>
              </CardFooter>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
