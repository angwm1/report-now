// File: /src/components/MapWithPanel.jsx
"use client";

import { useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Carousel CSS
import { Carousel } from "react-responsive-carousel";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Import router

// Configure Leaflet's default icon paths using images in /public/images
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/images/map-pin.png",
  iconUrl: "/images/map-pin.png",
  shadowUrl: "/images/marker-shadow.png",
});

// A small component to handle map clicks (to close bottom panel)
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click() {
      onMapClick();
    },
  });
  return null;
}

export default function MapWithPanel({ issues }) {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const router = useRouter(); // Initialize router

  // Default center and zoom; adjust as needed or compute from issues
  const defaultCenter = [1.3521, 103.8198];
  const defaultZoom = 12;

  // Function to navigate to issue details
  const navigateToIssueDetails = (issueId) => {
    router.push(`/issues/${issueId}`);
  };

  return (
    <div className="absolute top-0 left-0 w-full h-screen">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onMapClick={() => setSelectedIssue(null)} />
        {issues
          .filter((issue) => issue.latitude && issue.longitude)
          .map((issue) => (
            <Marker
              key={issue.id}
              position={[issue.latitude, issue.longitude]}
              eventHandlers={{
                click: () => {
                  console.log("Marker clicked!", issue);
                  setSelectedIssue(issue);
                },
              }}
            ></Marker>
          ))}
      </MapContainer>

      {/* Bottom Info Panel */}
      {selectedIssue && (
        <div className="absolute bottom-0 left-0 w-full sm:left-1/2 sm:-translate-x-1/2 sm:w-160 bg-white shadow-lg rounded-t-2xl z-[9998]">
          <div className="relative p-4 pt-6">
            <button
              type="button"
              aria-label="Close details panel"
              className="absolute top-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-600 hover:bg-gray-200 hover:text-gray-800 text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-white cursor-pointer z-9999"
              onClick={() => setSelectedIssue(null)}
            >
              ×
            </button>

            {/* Carousel for media if available */}
            {selectedIssue.mediaUrls && selectedIssue.mediaUrls.length > 0 && (
              <div className="mb-4">
                <Carousel
                  showThumbs={false}
                  infiniteLoop
                  autoPlay
                  dynamicHeight={false}
                  className="rounded"
                >
                  {selectedIssue.mediaUrls.map((url, idx) => (
                    <div
                      key={idx}
                      // 'relative' so Next/Image can fill the container
                      // 'h-48' fixes the container height to 12rem
                      className="relative w-full h-64"
                    >
                      <Image
                        src={url}
                        alt=""
                        fill
                        // 'object-contain' ensures no cropping
                        className="object-contain"
                      />
                      {/* Removed overlay code so no extra title below image */}
                    </div>
                  ))}
                </Carousel>
              </div>
            )}

            {/* Issue Details */}
            <div className="flex justify-between">
              <span className="mb-2 font-bold text-lg">{selectedIssue.title}</span>
              <span className="mb-2 text-xs">{new Date(selectedIssue.createdAt).toLocaleString()}</span>
            </div>
            
            <div className="text-sm text-gray-700 space-y-2">
              {/* <div>
                <span className="font-semibold">Status:</span>{" "}
                {selectedIssue.status}
              </div> */}
              <div
                  className={`text-xs font-medium px-2 py-1 rounded flex items-center w-fit ${
                    selectedIssue.status === "Done"
                      ? "bg-green-100 text-green-800"
                      : selectedIssue.status === "In Progress"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mr-1.5 ${
                    selectedIssue.status === "Done"
                      ? "bg-green-500"
                      : selectedIssue.status === "In Progress"
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                  }`}></span>
                  {selectedIssue.status}
              </div>
              <div>
                <span className="font-semibold">Latest Update:</span>{" "}
                {selectedIssue.latestUpdate || "No recent updates"}
              </div>
              <div>
                <span className="font-semibold">Description:</span>{" "}
                {selectedIssue.description}
              </div>
            </div>
            <button
              className="mt-4 w-full bg-[color:var(--color-primary)] text-white py-2 rounded hover:bg-[color:var(--color-primary-600)] transition cursor-pointer"
              onClick={() => navigateToIssueDetails(selectedIssue.id)}
            >
              See details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
