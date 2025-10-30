// File: /src/components/MapWithPanel.jsx
"use client";

import { useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Carousel CSS
import { Carousel } from "react-responsive-carousel";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Import router

// Configure Leaflet's default icon paths using images in /public/images
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/images/marker-icon-2x.png",
  iconUrl: "/images/marker-icon.png",
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
    <div className="relative w-full h-[600px]">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
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
        <div className="absolute bottom-0 left-0 w-full bg-white p-4 shadow-lg rounded-t-2xl z-[9999]">
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
                    className="relative w-full h-48"
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
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-lg">{selectedIssue.title}</h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedIssue(null)}
            >
              Close
            </button>
          </div>
          <div className="text-sm text-gray-700 space-y-2">
            <div>
              <span className="font-semibold">Status:</span>{" "}
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
            <div>
              <span className="font-semibold">Reported At:</span>{" "}
              {new Date(selectedIssue.createdAt).toLocaleString()}
            </div>
          </div>
          <button
            className="mt-4 w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition"
            onClick={() => navigateToIssueDetails(selectedIssue.id)}
          >
            See details
          </button>
        </div>
      )}
    </div>
  );
}
