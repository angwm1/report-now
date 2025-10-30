// File: /src/app/issues/page.js
"use client";

import { useEffect, useState } from "react";
import FilterBar from "../../components/FilterBar";
import IssueCard from "../../components/IssueCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import Link from "next/link";

const DEFAULT_SORT = "upvotes";

export default function IssuesPage() {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get user location
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

  // Get all issues
  useEffect(() => {
    setLoading(true);
    fetch("/api/issues")
      .then((res) => res.json())
      .then((data) => {
        // Ensure data is valid
        const validData = Array.isArray(data) ? data : [];
        const defaultSorted = sortIssues(validData, DEFAULT_SORT);
        setIssues(validData);
        setFilteredIssues(defaultSorted);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching issues:", error);
        setLoading(false);
      });
  }, []);

  // Calculate distance function
  function haversineDistance(lat1, lon1, lat2, lon2) {
    // Ensure all parameters are not null/undefined
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
      return Infinity;
    }
    
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

  function sortIssues(list, sortType = DEFAULT_SORT) {
    const sortKey = sortType || DEFAULT_SORT;
    const result = [...list].filter((issue) => issue != null);

    switch (sortKey) {
      case "newest":
        return result.sort(
          (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
        );
      case "oldest":
        return result.sort(
          (a, b) => new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0)
        );
      case "nearest":
        if (
          userLocation &&
          userLocation.lat != null &&
          userLocation.lng != null
        ) {
          return result
            .map((issue) => {
              if (issue?.latitude == null || issue?.longitude == null) {
                return { ...issue, distance: Infinity };
              }
              const distance = haversineDistance(
                userLocation.lat,
                userLocation.lng,
                issue.latitude,
                issue.longitude
              );
              return { ...issue, distance };
            })
            .sort(
              (a, b) =>
                (a?.distance ?? Infinity) - (b?.distance ?? Infinity)
            );
        }
        return result;
      case "upvotes":
        return result.sort((a, b) => {
          const aVotes = Array.isArray(a?.upvotes) ? a.upvotes.length : 0;
          const bVotes = Array.isArray(b?.upvotes) ? b.upvotes.length : 0;
          return bVotes - aVotes;
        });
      case "random": {
        const shuffled = [...result];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      }
      default:
        return sortIssues(result, DEFAULT_SORT);
    }
  }

  // Handle filtering and sorting
  function handleFilter(filterObj) {
    if (!filterObj) {
      // If no filter, show issues sorted by default preference
      setFilteredIssues(sortIssues(issues, DEFAULT_SORT));
      return;
    }

    // First filter by status and category
    let result = [...issues].filter((issue) => issue != null); // Ensure all items are valid
    
    // Filter by status
    if (filterObj.status) {
      result = result.filter((issue) => issue.status === filterObj.status);
    }
    
    // Filter by category/department
    if (filterObj.category) {
      result = result.filter((issue) => issue.category === filterObj.category || 
                                       issue.categoryId === filterObj.category);
    }

    setFilteredIssues(sortIssues(result, filterObj.sort));
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Display loading overlay - Note we don't use conditional rendering, but show/hide based on loading state */}
      {loading && <LoadingSpinner overlay={true} />}
      
      {/* Header row with filter & map link */}
      <div className="flex items-center justify-between mb-4">
        <FilterBar onFilter={handleFilter} />
        <Link
          href="/issues/map"
          className="text-sm text-accent-500 hover:underline"
        >
          View on Map
        </Link>
      </div>

      {/* Issues list - Always displayed, but may be empty during loading */}
      <div className="space-y-4">
        {filteredIssues.length > 0 ? (
          filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))
        ) : !loading ? (
          <p className="text-center py-10 text-gray-500">No issues found matching your filters.</p>
        ) : null}
      </div>
    </div>
  );
}
