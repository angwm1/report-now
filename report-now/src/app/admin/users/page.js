// File: /src/app/admin/users/page.js
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminUsersPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const isStaff =
    session?.user?.role === "admin" ||
    session?.user?.role === "superAdmin" ||
    session?.user?.role === "department";

  useEffect(() => {
    if (sessionStatus !== "authenticated" || !isStaff) {
      return;
    }

    let isSubscribed = true;

    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load users list.");
        }
        const data = await res.json();
        if (isSubscribed) {
          setUsers(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (err) {
        if (isSubscribed) {
          console.error("Error fetching users:", err);
          setError(
            err instanceof Error ? err.message : "Unable to load users."
          );
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      isSubscribed = false;
    };
  }, [sessionStatus, isStaff, reloadKey]);

  if (sessionStatus === "loading" || (isStaff && loading)) {
    return (
      <div
        className="max-w-4xl mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]"
        role="status"
        aria-live="polite"
      >
        <LoadingSpinner size="large" label="Loading user directory..." />
        <p className="mt-4 text-sm font-medium text-gray-500">
          Loading user directory...
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
            Access Restricted
          </h2>
          <p className="text-sm text-red-700 mb-6 leading-relaxed">
            You do not have staff or administrator privileges to view the user
            directory.
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
          <h1 className="text-2xl font-bold text-gray-900">User Directory</h1>
          <p className="text-sm text-gray-600 mt-1">
            Registered citizens, municipal staff, and system administrators
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-xs self-start sm:self-auto"
        >
          Staff Dashboard
        </Link>
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
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/60 transition">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    #{user.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {user.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        user.role === "admin" || user.role === "superAdmin"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "department"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {user.contactNumber || "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}