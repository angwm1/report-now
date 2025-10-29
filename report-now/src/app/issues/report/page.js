// File: /src/app/issues/report/page.js
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/images/map-pin.png",
  iconUrl: "/images/map-pin.png",
  shadowUrl: "/images/marker-shadow.png",
});

// shadcn/ui
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ReportIssuePage() {
  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Files + previews
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]); // [{ file, preview }]

  // Drag state
  const [dragging, setDragging] = useState(false);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  // Location
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  // Feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // ---------- Helpers ----------
  function isValidFile(file) {
    // only images, up to 100MB
    const isValidType = file.type?.startsWith("image/");
    const isValidSize = file.size <= 100 * 1024 * 1024;
    return !!isValidType && isValidSize;
  }

  function createPreview(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleFileChange(e) {
    const selected = Array.from(e.target.files || []);
    const validFiles = [];
    const nextPreviews = [];

    for (const file of selected) {
      if (!isValidFile(file)) {
        setError("One or more files are invalid (wrong type or too large).");
        continue;
      }
      validFiles.push(file);
      try {
        const preview = await createPreview(file);
        nextPreviews.push({ file, preview });
      } catch (err) {
        console.error(err);
      }
    }

    if (validFiles.length) {
      setFiles((prev) => [...prev, ...validFiles]);
      setPreviews((prev) => [...prev, ...nextPreviews]);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  async function handleDrop(e) {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files || []);
    const validFiles = [];
    const nextPreviews = [];

    for (const file of dropped) {
      if (!isValidFile(file)) {
        setError("One or more files are invalid (wrong type or too large).");
        continue;
      }
      validFiles.push(file);
      try {
        const preview = await createPreview(file);
        nextPreviews.push({ file, preview });
      } catch (err) {
        console.error(err);
      }
    }

    if (validFiles.length) {
      setFiles((prev) => [...prev, ...validFiles]);
      setPreviews((prev) => [...prev, ...nextPreviews]);
    }
  }

  const handleDragStart = (index) => {
    dragItem.current = index;
    setDragging(true);
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (
      dragItem.current !== null &&
      dragOverItem.current !== null &&
      dragItem.current !== dragOverItem.current
    ) {
      const filesCopy = [...files];
      const previewsCopy = [...previews];

      const [draggedFile] = filesCopy.splice(dragItem.current, 1);
      const [draggedPreview] = previewsCopy.splice(dragItem.current, 1);

      filesCopy.splice(dragOverItem.current, 0, draggedFile);
      previewsCopy.splice(dragOverItem.current, 0, draggedPreview);

      setFiles(filesCopy);
      setPreviews(previewsCopy);
    }

    dragItem.current = null;
    dragOverItem.current = null;
    setDragging(false);
  };

  const handleRemoveFile = (index) => {
    const filesCopy = [...files];
    const previewsCopy = [...previews];
    filesCopy.splice(index, 1);
    previewsCopy.splice(index, 1);
    setFiles(filesCopy);
    setPreviews(previewsCopy);
  };

  function handleEnableGPS() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      (err) => {
        console.error(err);
        alert("Unable to retrieve your location.");
      }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (lat != null && lng != null) {
        formData.append("latitude", String(lat));
        formData.append("longitude", String(lng));
      }
      files.forEach((file) => formData.append("media", file));

      const res = await fetch("/api/issues", { method: "POST", body: formData });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to submit the issue.");
      }

      setSuccess("Issue reported successfully!");
      setTimeout(() => router.push("/issues"), 1200);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const hasError = Boolean(error);

  return (
    <div className="container-page flex items-center justify-center px-4">
      <div className="card w-full max-w-xl">
        <form onSubmit={handleSubmit} noValidate>
          <FieldSet>
            {/* Title */}
            <FieldLegend className="text-xl font-semibold text-left mb-2">
              Report Issue
            </FieldLegend>
  
            {/* Top messages */}
            <FieldGroup>
              {hasError && (
                <Field data-invalid>
                  <FieldError>{error}</FieldError>
                </Field>
              )}
              {success && (
                <Field>
                  <div className="badge badge-success">{success}</div>
                </Field>
              )}
            </FieldGroup>
  
            {/* Media */}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="media">Upload Images</FieldLabel>
                <FieldDescription>
                  Tap or drag &amp; drop photos. Max size: 100MB each.
                </FieldDescription>
  
                {/* Dropzone */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="relative flex h-32 w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-border bg-gray-50 text-sm text-muted"
                >
                  <span className="pointer-events-none">
                    Tap to pick or drop files here
                  </span>
                  <Input
                    id="media"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-describedby="media-help"
                  />
                </div>
                <FieldDescription id="media-help">
                  First image becomes the main preview.
                </FieldDescription>
              </Field>
  
              {previews.length > 0 && (
                <Field>
                  <FieldLabel>Preview &amp; Order</FieldLabel>
                  <FieldDescription>
                    Drag to reorder. Click × to remove.
                  </FieldDescription>
  
                  <div className="mt-1 grid grid-cols-3 gap-2">
                    {previews.map(({ file, preview }, idx) => (
                      <div
                        key={`${file.name}-${idx}`}
                        className={`relative h-24 w-full overflow-hidden rounded border border-border bg-gray-100 ${
                          dragging && dragItem.current === idx
                            ? "opacity-50 ring-2"
                            : ""
                        }`}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragEnter={() => handleDragEnter(idx)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        aria-label={`Image ${idx + 1}: ${file.name}`}
                      >
                        <Image
                          src={preview}
                          alt={file.name}
                          fill
                          className="object-cover"
                          sizes="100vw"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full text-white"
                          style={{ background: "var(--color-danger-500)" }}
                          aria-label={`Remove ${file.name}`}
                        >
                          ×
                        </button>
                        {idx === 0 && (
                          <span
                            className="absolute bottom-1 left-1 rounded px-1 text-xs text-white"
                            style={{ background: "var(--color-primary)" }}
                          >
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </Field>
              )}
            </FieldGroup>
  
            <FieldSeparator />
  
            {/* Details */}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g. Fire Alert in Punggol"
                  required
                  aria-invalid={hasError && !title ? true : undefined}
                />
              </Field>
  
              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details about the incident..."
                  rows={4}
                  required
                  aria-invalid={hasError && !description ? true : undefined}
                  className="resize-y"
                />
              </Field>
            </FieldGroup>
  
            <FieldSeparator />
  
            {/* Location */}
            <FieldGroup>
              <Field>
                <FieldLabel>Location</FieldLabel>
                <FieldDescription>
                  Use GPS to attach coordinates to this report.
                </FieldDescription>
  
                <div className="mt-1 grid gap-2">
                  <div className="h-28 overflow-hidden rounded border border-border bg-gray-50">
                    {lat != null && lng != null ? (
                      <MapContainer
                        key={`${lat}-${lng}`}
                        center={[lat, lng]}
                        zoom={16}
                        minZoom={16}
                        maxZoom={16}
                        style={{ height: "100%", width: "100%" }}
                        dragging={false}
                        touchZoom={false}
                        doubleClickZoom={false}
                        scrollWheelZoom={false}
                        boxZoom={false}
                        keyboard={false}
                        zoomControl={false}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[lat, lng]} />
                      </MapContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted">
                        <p>Enable GPS to select on the map</p>
                      </div>
                    )}
                  </div>
  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleEnableGPS}
                      className="btn btn-outline w-10 h-10 !p-0.5"
                    >
                    <svg 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg" 
                      stroke="#525252" 
                      className="w-6 h-6"
                    >
                      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g> 
                      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" ></g>
                      <g id="SVGRepo_iconCarrier">
                        <path 
                          fillRule="evenodd" 
                          clipRule="evenodd" 
                          d="M11 2a1 1 0 0 1 2 0v2.062A8.004 8.004 0 0 1 19.938 11H22a1 1 0 0 1 0 2h-2.062A8.004 8.004 0 0 1 13 19.938V22a1 1 0 0 1-2 0v-2.062A8.004 8.004 0 0 1 4.062 13H2a1 1 0 0 1 0-2h2.062A8.004 8.004 0 0 1 11 4.062V2zm7 10a6 6 0 1 0-12 0 6 6 0 0 0 12 0zm-3 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" 
                          fill="#525252">
                        </path>
                      </g>
                    </svg>
                    </Button>
                    {lat != null && lng != null && (
                      <Button
                        type="button"
                        onClick={() => {
                          setLat(null);
                          setLng(null);
                        }}
                        className="btn btn-outline"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </Field>
            </FieldGroup>
  
            {/* Submit */}
            <Field className="space-y-1">
              <Button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </Field>
          </FieldSet>
        </form>
      </div>
    </div>
  );
  
}
