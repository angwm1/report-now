// File: /src/app/admin/page.js
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function AdminPage() {
  const { data: session } = useSession();
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    // Check role
    if (session?.user.role !== "department" && session?.user.role !== "admin") {
      // In a real app, redirect or show an error
      console.warn("Unauthorized access to Admin page");
    } else {
      fetch("/api/issues")
        .then((res) => res.json())
        .then((data) => setIssues(data));
    }
  }, [session]);

  async function updateIssueStatus(id, newStatus) {
    await fetch(`/api/issues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    // refresh
    setIssues((prev) =>
      prev.map((issue) => (issue.id === id ? { ...issue, status: newStatus } : issue))
    );
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Government/Staff Dashboard</h1>
      {issues.length === 0 ? (
        <p>No issues found.</p>
      ) : (
        <table className="min-w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">ID</th>
              <th className="border p-2 text-left">Title</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue.id}>
                <td className="border p-2">{issue.id}</td>
                <td className="border p-2">{issue.title}</td>
                <td className="border p-2">{issue.status}</td>
                <td className="border p-2">
                  {issue.status === "Pending" && (
                    <button
                      onClick={() => updateIssueStatus(issue.id, "In Progress")}
                      className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                    >
                      Approve
                    </button>
                  )}
                  {issue.status === "In Progress" && (
                    <button
                      onClick={() => updateIssueStatus(issue.id, "Done")}
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                    >
                      Mark Done
                    </button>
                  )}
                  {issue.status !== "Rejected" && (
                    <button
                      onClick={() => updateIssueStatus(issue.id, "Rejected")}
                      className="bg-red-500 text-white px-2 py-1 rounded ml-2 hover:bg-red-600"
                    >
                      Reject
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}