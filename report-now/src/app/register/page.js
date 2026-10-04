// src/app/register/page.js
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { FaSpinner } from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Retrieve invite token from query parameter if present
  const inviteToken = searchParams.get("invite") || "";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    contactNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/auth-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, inviteToken }),
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
    } catch (err) {
      setLoading(false);
      console.error("Registration error:", err);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-900">
          Create an Account
        </h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Join ReportNow to report and monitor neighborhood issues
        </p>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm mb-5 text-center font-medium"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="register-name"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              id="register-name"
              type="text"
              required
              autoComplete="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="border border-gray-300 p-2.5 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="register-email"
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="border border-gray-300 p-2.5 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              placeholder="yourname@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="register-password"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="register-password"
              type="password"
              required
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="border border-gray-300 p-2.5 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              placeholder="Create a strong password"
            />
          </div>

          <div>
            <label
              htmlFor="register-contact"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Contact Number
            </label>
            <input
              id="register-contact"
              type="tel"
              required
              autoComplete="tel"
              value={formData.contactNumber}
              onChange={(e) =>
                setFormData({ ...formData, contactNumber: e.target.value })
              }
              className="border border-gray-300 p-2.5 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              placeholder="e.g. 1234 5678"
            />
          </div>

          {inviteToken && (
            <div className="rounded-md bg-blue-50 p-2.5 text-xs text-blue-700 border border-blue-200">
              Invite token applied: <span className="font-mono">{inviteToken}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm shadow-xs"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Registering...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/"
            className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="large" label="Loading registration..." />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
