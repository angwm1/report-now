// File: /src/app/reviews/[issueId]/page.js
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      issueId: parseInt(params.issueId),
      userId: 1, // Replace with actual logged-in user ID
      rating,
      comment,
    };
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push(`/issues/${params.issueId}`);
    } else {
      const d = await res.json();
      setError(d.error || "Failed to submit review");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Leave a Review</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">Rating (1-5):</label>
        <input
          type="number"
          min="1"
          max="5"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border p-2 mb-4 w-full"
        />
        <label className="block mb-2">Comment:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border p-2 mb-4 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Submit Review
        </button>
      </form>
    </div>
  );
}