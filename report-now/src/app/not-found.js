import Link from "next/link";
import { FaExclamationTriangle, FaHome, FaListAlt, FaPlusCircle } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-6">
        <FaExclamationTriangle className="h-10 w-10" aria-hidden="true" />
      </div>

      <p className="text-sm font-semibold uppercase tracking-wider text-primary">404 Error</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Page Not Found
      </h1>
      <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
        The page you are looking for doesn&apos;t exist, has been removed, or is temporarily unavailable.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <FaHome className="h-4 w-4" aria-hidden="true" />
          Home
        </Link>
        <Link
          href="/issues"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <FaListAlt className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Browse Issues
        </Link>
        <Link
          href="/issues/report"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <FaPlusCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Report Issue
        </Link>
      </div>
    </div>
  );
}
