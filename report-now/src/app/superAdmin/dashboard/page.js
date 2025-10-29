// File: /src/app/superAdmin/dashboard/page.jsx
'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import AdminInviteForm from '@/components/AdminInviteForm';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  // Check if the user is authenticated and has the "admin" role.
  // Adjust the property names as needed based on how your session object is structured.
  if (!session || session.user.role !== 'admin') {
    return <p>Not authorized</p>;
  }

  return (
    <div className="container p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-4">Welcome, {session.user.name} (Admin)</p>
      <AdminInviteForm />
      {/* Render additional admin functionality as needed */}
    </div>
  );
}