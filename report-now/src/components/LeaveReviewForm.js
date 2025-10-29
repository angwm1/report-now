"use client";

import { useState } from "react";
import { FaStar } from "react-icons/fa"; // Import star icon from react-icons

export default function LeaveReviewForm({ issueId, onReviewSubmit }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const handleReviewSubmit = async () => {
    if (!rating) return;
    setLoading(true);
    setReviewMessage("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueId: parseInt(issueId, 10),
          rating,
          comment,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setReviewMessage(`Error: ${data.error || "Review submission failed"}`);
      } else {
        const newReview = await res.json();
        setReviewMessage("Review submitted successfully!");
        onReviewSubmit(newReview);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setReviewMessage("An error occurred while submitting review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-xl font-bold mb-2">Leave a Review</h3>
      
      {/* Star rating component */}
      <div className="flex items-center mb-4">
        <span className="font-semibold mr-2">Rating:</span>
        <div className="flex items-center">
          <div className="flex">
            {[...Array(5)].map((_, index) => {
              const starValue = index + 1;
              return (
                <FaStar
                  key={starValue}
                  size={24}
                  className="cursor-pointer transition-colors duration-200"
                  color={(hoverRating || rating) >= starValue ? "#FFD700" : "#e4e5e9"}
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              );
            })}
          </div>
          <span className="ml-2 text-gray-600 text-lg font-medium">
            {hoverRating || rating}
          </span>
        </div>
      </div>
      
      <div className="mt-4">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Enter your review..."
          rows={3}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
      </div>
      <button
        onClick={handleReviewSubmit}
        disabled={loading}
        className="mt-2 w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition disabled:opacity-50"
      >
        {loading ? "Submitting Review..." : "Submit Review"}
      </button>
      {reviewMessage && (
        <p className="text-sm text-gray-600 mt-2" role="alert">
          {reviewMessage}
        </p>
      )}
    </div>
  );
}