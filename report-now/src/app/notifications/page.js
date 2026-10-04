"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaBell, FaInfoCircle } from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function NotificationsPage() {
  const { status: sessionStatus } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (sessionStatus !== "authenticated") {
      return;
    }

    let isSubscribed = true;

    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) {
          throw new Error("Failed to load notifications");
        }
        const data = await res.json();
        if (isSubscribed) {
          if (Array.isArray(data)) {
            setNotifications(data);
          } else if (Array.isArray(data?.notifications)) {
            setNotifications(data.notifications);
          } else {
            setNotifications([]);
          }
          setError("");
        }
      } catch (err) {
        if (isSubscribed) {
          setError(
            err instanceof Error ? err.message : "Unable to fetch notifications"
          );
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    fetchNotifications();

    return () => {
      isSubscribed = false;
    };
  }, [sessionStatus, reloadKey]);

  if (sessionStatus === "loading" || (sessionStatus === "authenticated" && loading)) {
    return (
      <div
        className="max-w-4xl mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]"
        role="status"
        aria-live="polite"
      >
        <LoadingSpinner size="large" label="Loading notifications..." />
        <p className="mt-4 text-sm font-medium text-gray-500">
          Loading notifications...
        </p>
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="max-w-md mx-auto p-6 my-12">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4 text-xl">
            🔒
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Sign In Required
          </h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Please sign in to view updates and official responses regarding your
            reported municipal issues.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <FaBell className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-500">
                Stay updated on the status of your reported issues
              </p>
            </div>
          </div>
          <Link
            href="/issues/my"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
          >
            My Issues
          </Link>
        </div>

        {error ? (
          <div
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 mb-4"
            role="alert"
          >
            <div className="flex items-center gap-2">
              <FaInfoCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <p>{error}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError("");
                setReloadKey((k) => k + 1);
              }}
              className="text-xs font-semibold underline text-red-700 self-start sm:self-auto cursor-pointer"
            >
              Try again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-gray-100 text-gray-400">
              <FaBell className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">
              No notifications yet
            </h2>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              You will be notified here whenever there are updates on your
              submitted reports.
            </p>
            <Link
              href="/issues/report"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors shadow-xs mt-4"
            >
              Report an Issue
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100" role="list">
            {notifications.map((note, idx) => (
              <li
                key={note.id || idx}
                className="py-3 px-2 rounded-lg transition hover:bg-gray-50/70"
              >
                <p className="text-sm font-medium text-gray-900">
                  {note.message || note.title}
                </p>
                {note.createdAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}