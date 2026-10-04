"use client";

import { useState } from "react";
import { FaStar, FaSpinner } from "react-icons/fa";

export default function LeaveReviewForm({ issueId, onReviewSubmit }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: "", isError: false });

  const handleReviewSubmit = async (e) => {
    e?.preventDefault();
    if (!rating) return;
    setLoading(true);
    setStatusMessage({ text: "", isError: false });

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueId: parseInt(issueId, 10),
          rating,
          comment: comment.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatusMessage({
          text: data.error || "Review submission failed.",
          isError: true,
        });
      } else {
        const newReview = await res.json();
        setStatusMessage({
          text: "Review submitted successfully! Thank you for your feedback.",
          isError: false,
        });
        setComment("");
        if (typeof onReviewSubmit === "function") {
          onReviewSubmit(newReview);
        }
      }
    } catch {
      setStatusMessage({
        text: "A network error occurred while submitting your review.",
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleReviewSubmit} className="mt-6 border-t pt-5">
      <h3 className="text-xl font-bold mb-3 text-gray-900">Leave a Review</h3>

      {/* Accessible Star rating */}
      <div className="mb-4">
        <label id="rating-label" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Rating:
        </label>
        <div
          role="radiogroup"
          aria-labelledby="rating-label"
          className="flex items-center gap-1"
        >
          {[1, 2, 3, 4, 5].map((starValue) => {
            const isFilled = (hoverRating || rating) >= starValue;
            return (
              <button
                key={starValue}
                type="button"
                role="radio"
                aria-checked={rating === starValue}
                aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(0)}
                onFocus={() => setHoverRating(starValue)}
                onBlur={() => setHoverRating(0)}
                className="p-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer transition-transform hover:scale-110"
              >
                <FaStar
                  size={24}
                  className="transition-colors duration-150"
                  color={isFilled ? "#FFD700" : "#d1d5db"}
                  aria-hidden="true"
                />
              </button>
            );
          })}
          <span className="ml-2 text-sm font-semibold text-gray-600" aria-live="polite">
            {hoverRating || rating} / 5
          </span>
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="review-comment"
          className="block text-sm font-semibold text-gray-700 mb-1.5"
        >
          Comments (Optional)
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share details about the quality or speed of the resolution..."
          rows={3}
          className="w-full border border-gray-300 p-2.5 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm shadow-xs cursor-pointer"
      >
        {loading ? (
          <>
            <FaSpinner className="animate-spin" aria-hidden="true" />
            <span>Submitting Review...</span>
          </>
        ) : (
          "Submit Review"
        )}
      </button>

      {statusMessage.text && (
        <div
          role="alert"
          className={`mt-3 rounded-lg p-3 text-sm font-medium ${
            statusMessage.isError
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
          }`}
        >
          {statusMessage.text}
        </div>
      )}
    </form>
  );
}