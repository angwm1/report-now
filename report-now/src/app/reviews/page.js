"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";

function renderStars(rating) {
  const stars = [];
  const rounded = Math.round(rating * 2) / 2;
  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) {
      stars.push(<FaStar key={i} className="text-amber-400" />);
    } else if (i - 0.5 === rounded) {
      stars.push(<FaStarHalfAlt key={i} className="text-amber-400" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-gray-300" />);
    }
  }
  return <div className="flex gap-0.5 items-center">{stars}</div>;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isSubscribed = true;

    async function fetchReviews() {
      try {
        const res = await fetch("/api/reviews");
        if (!res.ok) {
          throw new Error("Failed to load community reviews.");
        }
        const data = await res.json();
        if (isSubscribed) {
          const list = Array.isArray(data?.reviews)
            ? data.reviews
            : Array.isArray(data)
            ? data
            : [];
          setReviews(list);
          setError("");
        }
      } catch (err) {
        if (isSubscribed) {
          console.error("Error loading reviews:", err);
          setError(
            err instanceof Error ? err.message : "Unable to load reviews."
          );
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    fetchReviews();

    return () => {
      isSubscribed = false;
    };
  }, [reloadKey]);

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (
          reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) /
          totalReviews
        ).toFixed(1)
      : "0.0";

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Community Reviews
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Verified feedback from citizens on resolved neighborhood issues
          </p>
        </div>
        <Link
          href="/issues"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-xs self-start sm:self-auto"
        >
          View Issues
        </Link>
      </div>

      {/* Summary KPI Banner */}
      {!loading && !error && totalReviews > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Average Community Rating
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-gray-900">
                  {avgRating}
                </span>
                <span className="text-xs text-gray-400">/ 5.0</span>
                {renderStars(Number(avgRating))}
              </div>
            </div>
            <div className="text-3xl text-amber-400">★</div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Feedback Submitted
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalReviews}{" "}
                <span className="text-sm font-normal text-gray-500">
                  {totalReviews === 1 ? "review" : "reviews"}
                </span>
              </p>
            </div>
            <div className="text-3xl text-blue-500">💬</div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div
          className="flex flex-col items-center justify-center min-h-[40vh] p-8"
          role="status"
          aria-live="polite"
        >
          <LoadingSpinner size="large" label="Loading reviews..." />
          <p className="mt-4 text-sm font-medium text-gray-500">
            Loading community feedback...
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-red-500 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setError("");
              setReloadKey((k) => k + 1);
            }}
            className="text-xs font-semibold underline hover:no-underline text-red-700 self-start sm:self-auto"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && totalReviews === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-3 text-xl">
            💬
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            No reviews yet
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Once reported issues are resolved by municipal crews, citizens can
            leave ratings and feedback here.
          </p>
          <Link
            href="/issues"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            Browse Issues
          </Link>
        </div>
      )}

      {/* Reviews List */}
      {!loading && !error && totalReviews > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-xl border border-gray-200/90 bg-white p-5 shadow-xs transition hover:shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-700 font-semibold text-sm">
                    {(review.userName || "A")[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {review.userName || "Anonymous Resident"}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : "Recently"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {renderStars(Number(review.rating) || 5)}
                  <span className="text-xs font-semibold text-gray-700">
                    {Number(review.rating).toFixed(1)}
                  </span>
                </div>
              </div>

              {review.issue && (
                <div className="mb-2">
                  <Link
                    href={`/issues/${review.issue.id}`}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Regarding:</span>
                    <span className="font-semibold">{review.issue.title}</span>
                  </Link>
                </div>
              )}

              {review.comment ? (
                <p className="text-sm text-gray-700 leading-relaxed mt-2 whitespace-pre-wrap">
                  {review.comment}
                </p>
              ) : (
                <p className="text-xs italic text-gray-400 mt-1">
                  No written comment provided.
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
