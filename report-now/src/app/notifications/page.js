"use client";

import { useEffect, useState } from "react";
import { FaBell, FaInfoCircle } from "react-icons/fa";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchNotifications() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/notifications");
        if (!res.ok) {
          throw new Error("Failed to load notifications");
        }
        const data = await res.json();
        if (!ignore) {
          if (Array.isArray(data)) {
            setNotifications(data);
          } else if (Array.isArray(data?.notifications)) {
            setNotifications(data.notifications);
          } else {
            setNotifications([]);
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Unable to fetch notifications");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchNotifications();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary">
            <FaBell className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">Stay updated on the status of your reported issues</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground" role="status">
            <p className="animate-pulse text-sm">Loading notifications…</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive" role="alert">
            <FaInfoCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-gray-100 text-gray-400">
              <FaBell className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="text-base font-medium text-foreground">No notifications yet</p>
            <p className="text-sm text-muted-foreground">You will be notified here when updates occur on your reports.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border" role="list">
            {notifications.map((note, idx) => (
              <li key={note.id || idx} className="py-3 px-2 rounded-lg transition hover:bg-gray-50">
                <p className="text-sm font-medium text-foreground">{note.message || note.title}</p>
                {note.createdAt && (
                  <p className="text-xs text-muted-foreground mt-1">
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