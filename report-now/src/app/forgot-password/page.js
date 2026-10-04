"use client";

import { useState } from "react";
import Link from "next/link";
import { FaSpinner } from "react-icons/fa";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    // Simulate password reset request handling
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">
          Reset Your Password
        </h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Enter your registered email address and we will send you password reset
          instructions.
        </p>

        {submitted ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 mb-3 text-xl">
              ✓
            </div>
            <h2 className="text-base font-semibold text-green-900 mb-1">
              Check Your Inbox
            </h2>
            <p className="text-xs text-green-700 mb-5 leading-relaxed">
              If an account with <strong>{email}</strong> exists, password reset
              instructions have been sent. If you do not receive an email shortly,
              please reach out to your municipal administrator.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors shadow-xs"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="reset-email"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="border border-gray-300 w-full p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm shadow-xs"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Sending instructions...</span>
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
