// File: /src/app/superAdmin/dashboard/page.js
"use client";

import React from "react";
import { useSession } from "next-auth/react";
import AdminInviteForm from "@/components/AdminInviteForm";
import RequestLogCard from "@/components/RequestLogCard";
import HintsCard from "@/components/HintsCard";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="container mx-auto p-6">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!session || session.user?.role !== "admin") {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h1 className="text-lg font-semibold text-foreground">Not authorized</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You need admin access to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            SuperAdmin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome, {session.user?.name}. Manage admins and review activity.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Invite Section */}
        <section className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Invite a Government Department Admin
            </h2>
            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              secure
            </span>
          </div>

          <AdminInviteForm />

          <p className="mt-3 text-xs text-muted-foreground">
            Invites are time-limited.
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
