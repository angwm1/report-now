"use client";

import React, { useState } from "react";
import { FaSpinner } from "react-icons/fa";

export default function AdminInviteForm() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: "governmentDepartment",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Invitation delivery failed.");
      }

      setMessage({
        text: "Invitation sent successfully! The agency administrator will receive an onboard link.",
        type: "success",
      });
      setInviteEmail("");
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Failed to send invitation.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-xl bg-gray-50/60 mt-4">
      <h3 className="text-base font-semibold text-gray-900 mb-3">
        Send Secure Agency Invitation
      </h3>
      <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2.5">
        <div className="flex-1">
          <label htmlFor="dept-invite-email" className="sr-only">
            Department email address
          </label>
          <input
            id="dept-invite-email"
            type="email"
            placeholder="agency.officer@gov.sg"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            aria-label="Department email address"
            className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !inviteEmail.trim()}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer shrink-0 shadow-xs"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            "Send Invitation"
          )}
        </button>
      </form>
      {message.text && (
        <div
          role="alert"
          className={`mt-3 p-3 rounded-lg text-xs font-medium border ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
