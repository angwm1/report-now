// File: /src/components/IssueCard.js
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaVideo } from "react-icons/fa"; // Import video icon

// Simple Haversine formula for distance in KM
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // in kilometers
}

export default function IssueCard({ issue }) {
  const router = useRouter();
  // We assume issue has { mediaUrls?: string[], mediaTypes?: string[], latitude?: number, longitude?: number, ... }

  // We track the user's location in state
  const [userLocation, setUserLocation] = useState(null);
  // Computed distance from user to this issue
  const [distanceKM, setDistanceKM] = useState(null);
  // Track if the media is a video
  const [isVideo, setIsVideo] = useState(false);

  // Attempt to get user location on mount (only if user grants permission)
  useEffect(() => {
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.error("Geolocation error:", err);
        }
      );
    }
  }, []);

  // Whenever we have userLocation AND the issue has lat/lng, compute the distance
  useEffect(() => {
    if (
      userLocation &&
      issue.latitude != null &&
      issue.longitude != null
    ) {
      const d = haversineDistance(
        userLocation.lat,
        userLocation.lng,
        issue.latitude,
        issue.longitude
      );
      // Round to one decimal place
      setDistanceKM(d.toFixed(1));
    }
  }, [userLocation, issue.latitude, issue.longitude]);

  // Determine the media type and source
  useEffect(() => {
    if (issue.mediaUrls && issue.mediaUrls.length > 0) {
      // Check if first media is a video (either from mediaTypes array or by URL)
      const firstMediaUrl = issue.mediaUrls[0];
      const isFirstMediaVideo = 
        (issue.mediaTypes && issue.mediaTypes[0]?.startsWith('video/')) ||
        firstMediaUrl.match(/\.(mp4|webm|ogg|mov)$/i);
      
      setIsVideo(isFirstMediaVideo);
    }
  }, [issue.mediaUrls, issue.mediaTypes]);

  // Use the first media URL or fallback
  const mediaSrc =
    issue.mediaUrls && issue.mediaUrls.length > 0
      ? issue.mediaUrls[0]
      : "/fallback.jpg";

  // dateReported or createdAt fallback
  const dateReported = issue.dateReported || issue.createdAt || "N/A";
  
  // Format date as DD/MM/YYYY HH:MM
  const formattedDate = dateReported !== "N/A" ? 
    (() => {
      const date = new Date(dateReported);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    })() : 
    "N/A";

  // Handle click to view issue details
  const handleClick = () => {
    router.push(`/issues/${issue.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center">
      {/* Left side: Image or Video */} 
      <div className="md:w-1/3 mb-4 md:mb-0 md:mr-4 relative h-32">
        {isVideo ? (
          <div className="flex items-center justify-center bg-gray-200 rounded h-full">
            <FaVideo className="text-gray-500 text-4xl" />
          </div>
        ) : (
          <Image
            src={mediaSrc}
            alt={issue.title}
            fill
            priority={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover rounded"
          />
        )}
      </div>

      {/* Right side: Title, location, status, distance */}
      <div className="flex-grow">
        <h2 className="text-lg font-bold text-gray-800">{issue.title}</h2>
        <p className="text-sm text-gray-500">
          Location: {issue.location || "Unknown"}
        </p>

        <div className="flex items-center justify-between mt-2">
          {/* Status label with colored dot */}
          <div
            className={`text-xs font-medium px-2 py-1 rounded flex items-center ${
              issue.status === "Done"
                ? "bg-green-100 text-green-800"
                : issue.status === "In Progress"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            <span className={`w-2 h-2 rounded-full mr-1.5 ${
              issue.status === "Done"
                ? "bg-green-500"
                : issue.status === "In Progress"
                ? "bg-yellow-500"
                : "bg-gray-500"
            }`}></span>
            {issue.status}
          </div>

          {/* Distance & Date */}
          <div className="text-sm text-gray-500">
            {distanceKM ? `${distanceKM} km` : "Locating..."}
            <span className="mx-1">•</span> {formattedDate}
          </div>
        </div>
        
        {/* View details button - right aligned */}
        <div className="flex justify-end mt-2">
          <button 
            onClick={handleClick}
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
