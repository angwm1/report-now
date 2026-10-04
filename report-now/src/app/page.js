import Link from "next/link";
import HeroSection from "../components/HeroSection";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />

      {/* Value Proposition & Feature Showcase */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              Empowering Safer, Cleaner Communities
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              ReportNow connects residents directly with municipal teams to
              identify, track, and resolve neighborhood problems faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-8 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 text-2xl mb-6 font-bold">
                📸
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                1. Snap &amp; Report
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Take a quick photo, tag your GPS coordinates, and describe the
                problem. We route it straight to the responsible team.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-8 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 text-2xl mb-6 font-bold">
                📍
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                2. Live Civic Tracking
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Follow real-time status updates from triaged to in-progress.
                Upvote issues nearby to prioritize community urgent needs.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-8 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 text-2xl mb-6 font-bold">
                ✅
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                3. Verified Resolution
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Receive instant notifications when municipal crews complete the
                job. Leave feedback and rate completed repairs.
              </p>
            </div>
          </div>

          {/* Call to action buttons */}
          <div className="mt-14 pt-8 border-t border-gray-200/60 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/issues"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Browse Active Issues
            </Link>
            <Link
              href="/issues/map"
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-xs hover:bg-gray-50 transition-colors"
            >
              Interactive Map
            </Link>
            <Link
              href="/issues/report"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              Report an Issue Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
