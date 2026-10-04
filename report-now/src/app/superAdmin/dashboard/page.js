// File: /src/app/superAdmin/dashboard/page.js
"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import AdminInviteForm from "@/components/AdminInviteForm";
import RequestLogCard from "@/components/RequestLogCard";
import HintsCard from "@/components/HintsCard";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();

  const isSuper =
    session?.user?.role === "admin" || session?.user?.role === "superAdmin";

  if (status === "loading") {
    return (
      <div
        className="max-w-5xl mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]"
        role="status"
        aria-live="polite"
      >
        <LoadingSpinner size="large" label="Loading administration dashboard..." />
        <p className="mt-4 text-sm font-medium text-gray-500">
          Loading administration console...
        </p>
      </div>
    );
  }

  if (!session || !isSuper) {
    return (
      <div className="max-w-md mx-auto p-6 my-12">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4 text-xl">
            🔒
          </div>
          <h1 className="text-xl font-semibold text-red-900 mb-2">
            SuperAdmin Access Required
          </h1>
          <p className="text-sm text-red-700 mb-6 leading-relaxed">
            You need administrative authority to invite government department
            admins and inspect system audit telemetry.
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
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            SuperAdmin Dashboard
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Welcome, {session.user?.name || "Administrator"}. Manage staff invites
            and review real-time audit logs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
          >
            User Directory
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
          >
            Operations Triage
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Invite Section */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              Invite a Government Department Admin
            </h2>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              secure token
            </span>
          </div>

          <AdminInviteForm />

          <p className="mt-4 text-xs text-gray-500">
            Invites are time-limited cryptographically secure tokens sent via
            verified channels.
          </p>
        </section>

        {/* Right: Side cards */}
        <aside className="space-y-6">
          <RequestLogCard limit={8} />
          <HintsCard
            items={[
              "Add a 5–10s undo grace period after pressing Send.",
              "Show an expiry badge on outstanding invites (e.g., 'expires in 2d').",
              "Provide a Resend / Invalidate action on pending invites.",
              "Allow CSV export for admins and activity logs.",
              "Add debounced search for admins by email or role.",
            ]}
          />
        </aside>
      </div>
    </div>
  );
}
