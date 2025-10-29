// File: /src/components/IssueCard.js
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaVideo, FaArrowUp } from "react-icons/fa"; // Import icons for media and voting

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

function normalizeIdList(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }

  const numericValues = raw
    .map((value) => {
      if (typeof value === "number") {
        return value;
      }
      if (typeof value === "string") {
        const parsed = Number.parseInt(value, 10);
        return Number.isNaN(parsed) ? null : parsed;
      }
      return null;
    })
    .filter((value) => typeof value === "number" && Number.isInteger(value));

  return Array.from(new Set(numericValues));
}

function normalizeUserId(raw) {
  if (typeof raw === "number" && Number.isInteger(raw)) {
    return raw;
  }

  if (typeof raw === "string") {
    const parsed = Number.parseInt(raw, 10);
    return Number.isInteger(parsed) ? parsed : null;
  }

  return null;
}

export default function IssueCard({ issue }) {
  const router = useRouter();
  const { data: session } = useSession();
  // We assume issue has { mediaUrls?: string[], mediaTypes?: string[], latitude?: number, longitude?: number, ... }

  // We track the user's location in state
  const [userLocation, setUserLocation] = useState(null);
  // Computed distance from user to this issue
  const [distanceKM, setDistanceKM] = useState(null);
  // Track if the media is a video
  const [isVideo, setIsVideo] = useState(false);
  const [upvoteIds, setUpvoteIds] = useState(() => normalizeIdList(issue.upvotes));
  const [isVoting, setIsVoting] = useState(false);

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

  useEffect(() => {
    setUpvoteIds(normalizeIdList(issue.upvotes));
  }, [issue.upvotes]);

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

  const isVotingAllowed =
    issue.status !== "Done" && issue.status !== "Rejected";

  const userIdRaw = session?.user?.id ?? null;
  const userId = normalizeUserId(userIdRaw);
  const hasUpvoted = userId != null && upvoteIds.includes(userId);
  const canVote = isVotingAllowed && userId != null;
  const voteCount = upvoteIds.length;

  const handleVote = async () => {
    if (!canVote || isVoting) {
      return;
    }

    setIsVoting(true);
    try {
      const response = await fetch(`/api/issues/${issue.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vote: "up" }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("Voting error:", error);
        return;
      }

      const updatedIssue = await response.json();
      setUpvoteIds(normalizeIdList(updatedIssue.upvotes));
    } catch (error) {
      console.error("Error submitting vote:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const voteButtonClasses = `p-2 rounded-full border transition disabled:opacity-50 disabled:cursor-not-allowed ${
    hasUpvoted
      ? "bg-red-500 border-red-600 text-white hover:bg-red-600"
      : "border-gray-300 text-gray-600 hover:bg-gray-100"
  }`;

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-stretch md:h-50">
      <div className="mr-4 mb-2 flex items-center justify-center md:flex-col md:justify-center w-fill space-x-4 md:space-x-0 md:space-y-2">
        <button
          type="button"
          onClick={handleVote}
          disabled={!canVote || isVoting}
          className={voteButtonClasses}
          aria-label="Toggle upvote for issue"
        >
          <FaArrowUp />
        </button>
        <span className="text-lg font-semibold text-gray-700">{voteCount}</span>
      </div>
      {/* Left side: Image or Video */} 
      <div className="relative mb-4 md:mb-0 md:mr-4 md:w-1/3 h-40 md:h-auto overflow-hidden">
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
            sizes="(max-width: 768px) 100vw, 30vw"
            className="object-cover rounded"
          />
        )}
      </div>

      {/* Right side: Title, location, status, distance */}
      <div className="flex-grow content-between h-full">
        <h2 className="text-lg font-bold text-gray-800">{issue.title}</h2>
        <p className="text-sm text-gray-500">
          {issue.description || "Unknown"}
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
            <span className="mx-1">|</span> {formattedDate}
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
