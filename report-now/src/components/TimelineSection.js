"use client";

import { useState } from "react";

export default function TimelineSection({ issueId, onTimelineUpdate }) {
  const [newUpdate, setNewUpdate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timelineUpdate: newUpdate.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(`Error: ${data.error || "Failed to add update"}`);
      } else {
        const updatedIssue = await res.json();
        setMessage("Timeline updated successfully!");
        onTimelineUpdate(updatedIssue);
        setNewUpdate("");
      }
    } catch (error) {
      console.error("Error adding timeline update:", error);
      setMessage("An error occurred while updating timeline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 pt-4">
      <div className="h-px w-full bg-slate-200"></div>
      <div className="mt-4">
        <textarea
          value={newUpdate}
          onChange={(e) => setNewUpdate(e.target.value)}
          placeholder="Enter a new timeline update..."
          rows={3}
          aria-label="New timeline update entry"
          className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
        />
        <button
          type="button"
          onClick={handleAddUpdate}
          disabled={loading || !newUpdate.trim()}
          className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium cursor-pointer"
        >
          {loading ? "Adding update..." : "Add Update"}
        </button>
        {message && (
          <p
            className={`text-sm mt-2 font-medium ${
              message.startsWith("Error") ? "text-red-600" : "text-green-700"
            }`}
            role="alert"
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
