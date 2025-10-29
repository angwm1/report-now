"use client"
import { useState } from "react";

export default function EditStatusForm({ issueId, currentStatus, onUpdate, onCancel }) {
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  const handleUpdate = async () => {
    setLoading(true);
    setUpdateMessage("");
    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        setUpdateMessage(`Error: ${data.error || "Update failed"}`);
      } else {
        const updatedIssue = await res.json();
        setUpdateMessage("Status updated successfully!");
        onUpdate(updatedIssue);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setUpdateMessage("An error occurred while updating.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-4 inline-flex items-center space-x-2">
      <select
        value={newStatus}
        onChange={(e) => setNewStatus(e.target.value)}
        className="border p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      >
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Done">Done</option>
        <option value="Rejected">Rejected</option>
      </select>
      <button
        onClick={handleUpdate}
        disabled={loading}
        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update"}
      </button>
      <button
        onClick={onCancel}
        className="bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400 transition"
      >
        Cancel
      </button>
      {updateMessage && (
        <p className="text-sm text-gray-600" role="alert">
          {updateMessage}
        </p>
      )}
    </div>
  );
}