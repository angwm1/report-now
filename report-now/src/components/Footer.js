// File: /src/components/Footer.js
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white/95 text-gray-600 text-sm">
      <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/issues" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <Image
                  src="/ReportNow.png"
                  alt="ReportNow logo"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
              </span>
              <span className="text-lg font-bold text-gray-900 tracking-tight">
                ReportNow
              </span>
            </Link>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
              Empowering citizens to report, track, and resolve municipal and
              community problems in real-time. Built for transparency, speed,
              and civic collaboration.
            </p>
          </div>

          {/* Civic Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 mb-3">
              Explore
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/issues"
                  className="hover:text-blue-600 transition-colors"
                >
                  Community Issues Feed
                </Link>
              </li>
              <li>
                <Link
                  href="/issues/map"
                  className="hover:text-blue-600 transition-colors"
                >
                  Interactive Map View
                </Link>
              </li>
              <li>
                <Link
                  href="/issues/report"
                  className="hover:text-blue-600 transition-colors"
                >
                  Report an Incident
                </Link>
              </li>
              <li>
                <Link
                  href="/reviews"
                  className="hover:text-blue-600 transition-colors"
                >
                  Verified Community Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Citizen Account */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 mb-3">
              Citizen Portal
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/issues/my"
                  className="hover:text-blue-600 transition-colors"
                >
                  My Submitted Reports
                </Link>
              </li>
              <li>
                <Link
                  href="/notifications"
                  className="hover:text-blue-600 transition-colors"
                >
                  Notification Center
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="hover:text-blue-600 transition-colors"
                >
                  Account Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {currentYear} ReportNow. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Designed for accessible, inclusive civic participation.
          </p>
        </div>
      </div>
    </footer>
  );
}
