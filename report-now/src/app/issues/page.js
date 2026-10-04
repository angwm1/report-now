// File: /src/app/issues/page.js
"use client";

import { useEffect, useState } from "react";
import FilterBar from "../../components/FilterBar";
import IssueCard from "../../components/IssueCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import Link from "next/link";

import { sortIssues, DEFAULT_SORT } from "../../lib/issue-sorting";

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

  // Handle filtering and sorting
  function handleFilter(filterObj) {
    if (!filterObj) {
      // If no filter, show issues sorted by default preference
      setFilteredIssues(sortIssues(issues, DEFAULT_SORT, userLocation));
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

    setFilteredIssues(sortIssues(result, filterObj.sort, userLocation));
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
