// File: /src/components/MapWrapper.jsx
"use client";

import dynamic from "next/dynamic";

// Dynamically import the Leaflet map so it doesn't run on the server
const DynamicMap = dynamic(() => import("./MapWithPanel"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

export default function MapWrapper({ issues }) {
  return <DynamicMap issues={issues} />;
}