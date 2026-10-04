// File: /src/app/reviews/[issueId]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaStar, FaSpinner } from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";

const RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const [issue, setIssue] = useState(null);
  const [loadingIssue, setLoadingIssue] = useState(true);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!params.issueId) return;

    let isSubscribed = true;

    async function fetchIssue() {
      try {
        const res = await fetch(`/api/issues/${params.issueId}`);
        if (res.ok) {
          const data = await res.json();
          if (isSubscribed) {
            setIssue(data);
          }
        }
      } catch (err) {
        console.error("Error fetching issue details for review:", err);
      } finally {
        if (isSubscribed) {
          setLoadingIssue(false);
        }
      }
    }

    fetchIssue();

    return () => {
      isSubscribed = false;
    };
  }, [params.issueId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError("Please select a rating.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueId: parseInt(params.issueId, 10),
          rating,
          comment,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit review.");
      }

      router.push(`/issues/${params.issueId}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (sessionStatus === "loading" || loadingIssue) {
    return (
      <div
        className="max-w-2xl mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]"
        role="status"
        aria-live="polite"
      >
        <LoadingSpinner size="large" label="Loading review page..." />
        <p className="mt-4 text-sm font-medium text-gray-500">
          Loading review page...
        </p>
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="max-w-md mx-auto p-6 my-12">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
            🔒
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Sign In Required
          </h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Please sign in to leave verified feedback for this resolved issue.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 my-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        {/* Back Link */}
        <Link
          href={`/issues/${params.issueId}`}
          className="text-xs font-medium text-blue-600 hover:underline mb-4 inline-flex items-center gap-1"
        >
          ← Back to Issue
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Leave a Community Review
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Share your experience regarding the resolution of this issue.
        </p>

        {issue && (
          <div className="rounded-xl bg-gray-50 border border-gray-200/80 p-4 mb-6">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Issue Being Reviewed
            </span>
            <h2 className="text-base font-semibold text-gray-900">
              {issue.title}
            </h2>
            {issue.category && (
              <span className="inline-block mt-2 text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                {issue.category}
              </span>
            )}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700 mb-6"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating Picker */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    <FaStar
                      size={28}
                      className="transition-colors duration-150 cursor-pointer"
                      color={
                        (hoverRating || rating) >= star ? "#f59e0b" : "#d1d5db"
                      }
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm font-medium text-gray-600">
                {RATING_LABELS[hoverRating || rating] || ""}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label
              htmlFor="review-comment"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Feedback Comments
            </label>
            <textarea
              id="review-comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How well was this issue resolved? Let the city and community know..."
              className="border border-gray-300 w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm shadow-xs cursor-pointer"
          >
            {submitting ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Submitting Feedback...</span>
              </>
            ) : (
              "Submit Review"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}