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
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

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
        () => {
          // Gracefully continue without user geolocation if permission denied or unavailable
        }
      );
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    async function loadIssues() {
      try {
        const res = await fetch("/api/issues");
        if (!res.ok) {
          throw new Error("Failed to load community issues.");
        }
        const data = await res.json();
        if (isSubscribed) {
          const validData = Array.isArray(data) ? data : [];
          const defaultSorted = sortIssues(
            validData,
            DEFAULT_SORT,
            userLocation
          );
          setIssues(validData);
          setFilteredIssues(defaultSorted);
          setError("");
        }
      } catch (err) {
        if (isSubscribed) {
          setError(
            err instanceof Error ? err.message : "Unable to load issues."
          );
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    loadIssues();

    return () => {
      isSubscribed = false;
    };
  }, [userLocation, reloadKey]);

  // Handle filtering and sorting
  function handleFilter(filterObj) {
    if (!filterObj) {
      setFilteredIssues(sortIssues(issues, DEFAULT_SORT, userLocation));
      return;
    }

    let result = [...issues].filter((issue) => issue != null);

    if (filterObj.status) {
      result = result.filter((issue) => issue.status === filterObj.status);
    }

    if (filterObj.category) {
      result = result.filter(
        (issue) =>
          issue.category === filterObj.category ||
          issue.categoryId === filterObj.category
      );
    }

    setFilteredIssues(sortIssues(result, filterObj.sort, userLocation));
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      {loading && <LoadingSpinner overlay={true} label="Updating issues..." />}

      {/* Header row with filter & actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <FilterBar onFilter={handleFilter} />
        <div className="flex items-center gap-3">
          <Link
            href="/issues/map"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
          >
            <span>🗺️</span> View on Map
          </Link>
          <Link
            href="/issues/report"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            + Report
          </Link>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-red-500 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setError("");
              setReloadKey((k) => k + 1);
            }}
            className="text-xs font-semibold underline hover:no-underline text-red-700 self-start sm:self-auto"
          >
            Try again
          </button>
        </div>
      ) : null}

      {/* Issues list */}
      <div className="space-y-4">
        {filteredIssues.length > 0 ? (
          filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))
        ) : !loading && !error ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-10 text-center">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              No issues found
            </h3>
            <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
              No community issues match the selected filter criteria.
            </p>
            <Link
              href="/issues/report"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              Report a New Issue
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
