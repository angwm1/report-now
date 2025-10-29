// File: /src/components/RequestLogCard.js
"use client";

import React from "react";

export default function RequestLogCard({ limit = 8, pollMs = 0 }) {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const fetchData = React.useCallback(async () => {
    try {
      setError("");
      const res = await fetch(`/api/admin/activity?limit=${limit}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to load activity (${res.status})`);
      }
      const data = await res.json();
      setItems(Array.isArray(data?.events) ? data.events : []);
    } catch (e) {
      setError(e.message || "Failed to load activity");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  React.useEffect(() => {
    if (!pollMs || pollMs < 1000) return;
    const id = setInterval(fetchData, pollMs);
    return () => clearInterval(id);
  }, [fetchData, pollMs]);

  return (
    <div className="rounded-3xl border border-border bg-gray-100 p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground">Recent Activity</h3>
        <button
          onClick={fetchData}
          className="rounded-xl border border-primary-200 bg-primary px-2 py-1 text-md text-gray-50 hover:bg-primary-hover hover:cursor-pointer"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recent actions.</p>
      ) : (
        <ul className="mt-2 space-y-2 text-sm">
          {items.map((it, idx) => (
            <li
              key={idx}
              className="flex items-center gap-3"
            >
              {/* Left: text block */}
              <div className="min-w-0 flex-1">
                {/* Top line: title/summary only, no status words, truncated */}
                <div className="truncate text-foreground">
                  {formatTitleLine(it)}
                </div>
                {/* Second line: who + timestamp (no 'Reporter', no IDs) */}
                <div className="text-xs text-muted-foreground">
                  {formatSubLine(it)}
                </div>
              </div>

              {/* Right: status pill; no shrink so it stays visible, and prevent overlap */}
              <div className="flex-none">
                <span className={pillClasses(it)}>
                  {formatStatus(it)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Title line */
function formatTitleLine(it) {
  if (it.type === "invite") {
    // e.g., "Invite sent · email@example.com"
    return `${it.summary} · ${it.subject}`;
  }
  if (it.type === "issue") {
    // summary is the issue title (from API); no status text here
    return it.summary || "Issue";
  }
  if (it.type === "review") {
    // show issue title (in summary) and reviewer (subject) if short enough
    return `${it.summary} · ${it.subject}`;
  }
  return it.summary || "";
}

/** Sub line: show user/email and timestamp */
function formatSubLine(it) {
  const ts = formatWhen(it.tsISO || it.ts);
  if (it.type === "invite") {
    const role = it?.meta?.role ? ` · Role: ${it.meta.role}` : "";
    const exp = it?.meta?.expiresAt ? ` · Expires ${formatWhen(it.meta.expiresAt)}` : "";
    return `${ts}${role}${exp}`;
  }
  if (it.type === "issue") {
    const who = it?.meta?.user || it.subject || "unknown";
    return `${who} · ${ts}`;
  }
  if (it.type === "review") {
    const who = it?.meta?.user || it.subject || "anonymous";
    const rating = typeof it?.meta?.rating === "number" ? ` · ${it.meta.rating}/5` : "";
    return `${who} · ${ts}${rating}`;
  }
  return ts;
}

function formatWhen(isoOrDate) {
  const d = new Date(isoOrDate);
  return isNaN(d) ? "" : d.toLocaleString();
}

function formatStatus(it) {
  if (it.type === "invite") return it.status; // pending | used | expired
  if (it.type === "issue") return it.status || "updated"; // shown in pill only
  if (it.type === "review") return "ok";
  return "ok";
}

function pillClasses(it) {
  const base = "inline-block rounded px-2 py-0.5 text-xs";
  if (it.type === "invite") {
    if (it.status === "pending") return `${base} bg-primary/10 text-primary`;
    if (it.status === "expired") return `${base} bg-destructive/10 text-destructive`;
    if (it.status === "used") return `${base} bg-accent text-foreground`;
    return `${base} bg-accent text-foreground`;
  }
  if (it.type === "issue") {
    const s = (it.status || "").toLowerCase();
    if (s.includes("pending"))
      return `${base} bg-warning-500/10 text-warning-500`;
    if (s.includes("done"))
      return `${base} bg-success-500/10 text-success-500`;
    if (s.includes("rejected"))
      return `${base} bg-danger-500/10 text-danger-500`;
    if (s.includes("progress"))
      return `${base} bg-info-500/10 text-info-500`;
    return `${base} bg-gray-200 text-foreground`;
  }
  return `${base} bg-accent text-foreground`;
}
