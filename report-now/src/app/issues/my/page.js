"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import IssueCard from "@/components/IssueCard";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function MyIssuesPage() {
  const { data: session, status } = useSession();
  const [issues, setIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      return;
    }

    let isSubscribed = true;

    async function loadIssues() {
      try {
        const res = await fetch("/api/issues");
        if (!res.ok) {
          throw new Error("Failed to load your submitted issues.");
        }
        const data = await res.json();
        if (isSubscribed) {
          const userId = parseInt(session.user.id, 10);
          const validData = Array.isArray(data) ? data : [];
          const filteredIssues = validData.filter(
            (issue) => issue.reporterId === userId
          );
          setIssues(filteredIssues);
          setError("");
        }
      } catch (err) {
        if (isSubscribed) {
          console.error("Error fetching my issues:", err);
          setError(
            err instanceof Error ? err.message : "Something went wrong."
          );
        }
      } finally {
        if (isSubscribed) {
          setLoadingIssues(false);
        }
      }
    }

    loadIssues();

    return () => {
      isSubscribed = false;
    };
  }, [session, status, reloadKey]);

  if (status === "loading" || (status === "authenticated" && loadingIssues)) {
    return (
      <div
        className="max-w-3xl mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]"
        role="status"
        aria-live="polite"
      >
        <LoadingSpinner size="large" label="Loading your submitted issues..." />
        <p className="mt-4 text-sm font-medium text-gray-500">
          Loading your submitted issues...
        </p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            Please sign in to view and track the community issues you have
            submitted.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            Go to Home / Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Submitted Issues
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Track progress and updates on issues you have reported
          </p>
        </div>
        <Link
          href="/issues/report"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          + Report New Issue
        </Link>
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
              setLoadingIssues(true);
              setError("");
              setReloadKey((k) => k + 1);
            }}
            className="text-xs font-semibold underline hover:no-underline text-red-700 self-start sm:self-auto"
          >
            Try again
          </button>
        </div>
      ) : null}

      {issues.length === 0 && !error ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-3">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            No issues reported yet
          </h3>
          <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
            Spot a problem in your neighborhood? Submit a report with photos and
            location to get it resolved quickly.
          </p>
          <Link
            href="/issues/report"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            Report an Issue
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}
