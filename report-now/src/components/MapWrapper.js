// File: /src/components/MapWrapper.jsx
"use client";

import dynamic from "next/dynamic";

// Dynamically import the Leaflet map so it doesn't run on the server
const DynamicMap = dynamic(() => import("./MapWithPanel"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-screen w-full items-center justify-center bg-gray-50"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
        <span className="text-sm font-medium">Loading map and incidents...</span>
      </div>
    </div>
  ),
});

export default function MapWrapper({ issues }) {
  return <DynamicMap issues={issues} />;
}