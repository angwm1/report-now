"use client";
import { useState } from "react";

export default function TimelineSection({ issueId, currentTimeline, onTimelineUpdate }) {
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
        body: JSON.stringify({ timelineUpdate: newUpdate }),
      });
      if (!res.ok) {
        const data = await res.json();
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
    <div className="mt-6 border-t pt-4">
      <h3 className="text-xl font-bold mb-2">Timeline Updates</h3>
      {currentTimeline && currentTimeline.length > 0 ? (
        <ul className="space-y-2">
          {currentTimeline.map((update, idx) => (
            <li key={idx} className="border p-2 rounded">
              <p className="text-sm">{update.text}</p>
              <p className="text-xs text-gray-500">
                {new Date(update.timestamp).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 text-sm">No timeline updates yet.</p>
      )}
      <div className="mt-4">
        <textarea
          value={newUpdate}
          onChange={(e) => setNewUpdate(e.target.value)}
          placeholder="Enter a new timeline update..."
          rows={3}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <button
          onClick={handleAddUpdate}
          disabled={loading}
          className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? "Adding update..." : "Add Update"}
        </button>
        {message && (
          <p className="text-sm text-gray-600 mt-2" role="alert">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}