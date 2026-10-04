// File: /src/components/LoginCard.js
"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaSpinner } from "react-icons/fa";

export default function LoginCard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/issues");
    }
  }

  if (status === "authenticated" && session?.user) {
    const displayName = session.user.name || session.user.email || "Member";
    const initial = displayName.charAt(0).toUpperCase();

    return (
      <div className="bg-white w-full p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">
              Welcome, {displayName}!
            </h2>
            <p className="text-xs text-gray-500 truncate">
              {session.user.email}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-5">
          You are signed in. Quick access to community reporting services:
        </p>

        <div className="flex flex-col space-y-2.5">
          <Link
            href="/issues"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-center text-sm shadow-xs transition-colors"
          >
            Browse Community Issues
          </Link>
          <Link
            href="/issues/report"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-medium text-center text-sm shadow-xs transition-colors"
          >
            + Report New Incident
          </Link>
          <Link
            href="/issues/my"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-lg font-medium text-center text-sm transition-colors"
          >
            My Submitted Issues
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
          <Link href="/account" className="hover:text-blue-600 hover:underline">
            Manage Account
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-red-500 hover:text-red-700 hover:underline cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full p-8 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">
        Welcome Back!
      </h2>
      <p className="text-sm text-gray-500 mb-6 text-center">
        Sign in to manage and report community issues
      </p>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm mb-5 text-center font-medium"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="flex flex-col space-y-4">
        <div>
          <label
            htmlFor="login-email"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            className="border border-gray-300 w-full p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            className="border border-gray-300 w-full p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm shadow-xs"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Not a member yet?{" "}
        <Link
          href="/register"
          className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          Register now
        </Link>
      </p>
    </div>
  );
}
