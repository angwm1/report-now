// File: /src/app/admin/page.js
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);

  const isStaff =
    session?.user?.role === "department" ||
    session?.user?.role === "admin" ||
    session?.user?.role === "superAdmin";

  useEffect(() => {
    if (sessionStatus !== "authenticated" || !isStaff) {
      return;
    }

    let isSubscribed = true;

    async function fetchIssues() {
      try {
        const res = await fetch("/api/issues");
        if (!res.ok) {
          throw new Error("Failed to load issues for administration.");
        }
        const data = await res.json();
        if (isSubscribed) {
          setIssues(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (err) {
        if (isSubscribed) {
          console.error("Error loading admin issues:", err);
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

    fetchIssues();

    return () => {
      isSubscribed = false;
    };
  }, [sessionStatus, isStaff, reloadKey]);

  async function updateIssueStatus(id, newStatus) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status.");
      }

      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === id ? { ...issue, status: newStatus } : issue
        )
      );
    } catch (err) {
      console.error("Error updating issue status:", err);
      alert(err.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (sessionStatus === "loading" || (isStaff && loading)) {
    return (
      <div
        className="max-w-5xl mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]"
        role="status"
        aria-live="polite"
      >
        <LoadingSpinner size="large" label="Loading staff dashboard..." />
        <p className="mt-4 text-sm font-medium text-gray-500">
          Loading staff dashboard...
        </p>
      </div>
    );
  }

  if (sessionStatus === "unauthenticated" || !isStaff) {
    return (
      <div className="max-w-md mx-auto p-6 my-12">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4 text-xl">
            🔒
          </div>
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            Staff Access Required
          </h2>
          <p className="text-sm text-red-700 mb-6 leading-relaxed">
            You must be logged in with a department or administrative account to
            access this operations dashboard.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors shadow-xs"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Operations &amp; Triage Dashboard
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Review, approve, and resolve citizen reported municipal issues
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
          >
            Users
          </Link>
          <Link
            href="/issues"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            Public Feed
          </Link>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <span className="text-sm font-medium">{error}</span>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setError("");
              setReloadKey((k) => k + 1);
            }}
            className="text-xs font-semibold underline text-red-700 self-start sm:self-auto"
          >
            Try again
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-xs">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {issues.length > 0 ? (
              issues.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50/60 transition">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    #{issue.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <Link
                      href={`/issues/${issue.id}`}
                      className="hover:text-blue-600 hover:underline"
                    >
                      {issue.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        issue.status === "Done"
                          ? "bg-green-100 text-green-800"
                          : issue.status === "In Progress"
                          ? "bg-amber-100 text-amber-800"
                          : issue.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {issue.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {issue.status === "Pending" && (
                        <button
                          type="button"
                          disabled={updatingId === issue.id}
                          onClick={() =>
                            updateIssueStatus(issue.id, "In Progress")
                          }
                          className="rounded bg-amber-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-amber-600 transition disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                      {issue.status === "In Progress" && (
                        <button
                          type="button"
                          disabled={updatingId === issue.id}
                          onClick={() => updateIssueStatus(issue.id, "Done")}
                          className="rounded bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 transition disabled:opacity-50"
                        >
                          Mark Done
                        </button>
                      )}
                      {issue.status !== "Rejected" && (
                        <button
                          type="button"
                          disabled={updatingId === issue.id}
                          onClick={() => updateIssueStatus(issue.id, "Rejected")}
                          className="rounded bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 transition disabled:opacity-50"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No issues currently queued.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}