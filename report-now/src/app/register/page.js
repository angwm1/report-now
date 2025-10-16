// src\app\register\page.js
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Retrieve invite token from query parameter if present
  const initialInviteToken = searchParams.get("invite") || "";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    contactNumber: "",
    inviteToken: initialInviteToken,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If the invite token query param changes, update formData
  useEffect(() => {
    const token = searchParams.get("invite") || "";
    setFormData((prev) => ({ ...prev, inviteToken: token }));
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/auth-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setLoading(false);
      if (res.ok) {
        // After successful registration, log in the user automatically.
        const res2 = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });
        if (res2?.error) {
          setError(res2.error);
        } else {
          const data = await res.json();
          if (data.user && data.user.role === "admin") {
            router.push("/superAdmin/dashboard");
          } else {
            router.push("/issues");
          }
        }
      } else {
        const data = await res.json();
        setError(data.error || "Registration failed");
      }
    } catch (error) {
      setLoading(false);
      console.error("Registration error:", error);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Register an account</h1>
        {error && (
          <p className="text-red-500 mb-4 text-center font-medium">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block mb-1 text-gray-700">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block mb-1 text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              placeholder="yourname@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-1 text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              placeholder="Create a password"
            />
          </div>
          <div>
            <label htmlFor="contactNumber" className="block mb-1 text-gray-700">
              Contact Number
            </label>
            <input
              id="contactNumber"
              type="text"
              required
              onChange={(e) =>
                setFormData({ ...formData, contactNumber: e.target.value })
              }
              className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              placeholder="e.g. 1234 5678"
            />
          </div>
          {/* Optionally, display the invite token (read-only) if present */}{" "}
          {formData.inviteToken && (
            <div className="text-xs text-gray-500">
              Invite Token: {formData.inviteToken}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded hover:bg-blue-600 transition-all"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-accent-500 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading search parameters...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
