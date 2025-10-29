"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import IssueCard from "../../../components/IssueCard"; // 确保路径正确

export default function MyIssuesPage() {
  const { data: session, status } = useSession();
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    // Only fetch issues if the session is loaded
    if (status === "loading") return;
    fetch("/api/issues")
      .then((res) => res.json())
      .then((data) => {
        // If session exists, filter issues by reporterId.
        if (session && session.user && session.user.id) {
          const userId = parseInt(session.user.id, 10);
          const filteredIssues = data.filter(
            (issue) => issue.reporterId === userId
          );
          setIssues(filteredIssues);
        } else {
          // If no session, show no issues or you could redirect
          setIssues([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching issues:", err);
      });
  }, [session, status]);

  if (status === "loading") {
    return <p className="p-4">Loading session...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Submitted Issues</h1>
      {issues.length === 0 ? (
        <p>No issues found.</p>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}
