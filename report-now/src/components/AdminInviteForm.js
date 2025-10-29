// src/components/AdminInviteForm.jsx
'use client';
import React, { useState } from 'react';

export default function AdminInviteForm() {
  const [inviteEmail, setInviteEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: 'governmentDepartment',
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Invitation failed');
      }
      setMessage('Invitation sent successfully');
      setInviteEmail('');
    } catch (err) {
      setMessage(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded-md bg-gray-100 mt-6">
      <h3 className="text-lg font-bold mb-2 text-center">
        Invite Government Department
      </h3>
      <form onSubmit={handleInvite} className="flex flex-col gap-2">
        <input
          type="email"
          placeholder="Enter email address"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          required
          className="p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
        >
          {loading ? 'Sending...' : 'Send Invitation'}
        </button>
      </form>
      {message && (
        <p className="mt-2 text-sm text-center text-gray-700">{message}</p>
      )}
    </div>
  );
}