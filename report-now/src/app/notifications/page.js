// File: /src/app/notifications/page.js
"use client";

import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Fetch notifications for the user
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        // data might be an array of notifications
        setNotifications(data);
      });
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((note, idx) => (
            <li key={idx} className="border p-2 rounded hover:bg-gray-50">
              {note.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}