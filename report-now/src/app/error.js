"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FaExclamationCircle, FaRedo, FaHome } from "react-icons/fa";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log unexpected errors to an error reporting service if available
    console.error("Global application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 mb-6">
        <FaExclamationCircle className="h-10 w-10" aria-hidden="true" />
      </div>

      <p className="text-sm font-semibold uppercase tracking-wider text-red-600">Application Error</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Something Went Wrong
      </h1>
      <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
        An unexpected error occurred while loading this page. You can try refreshing the page or navigating back home.
      </p>

      {error?.message && (
        <pre className="mx-auto mt-4 max-w-lg overflow-x-auto rounded-lg bg-gray-100 p-3 text-xs text-red-800 border border-red-200">
          {error.message}
        </pre>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <FaRedo className="h-4 w-4" aria-hidden="true" />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <FaHome className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
