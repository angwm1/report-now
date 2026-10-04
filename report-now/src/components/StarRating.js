// File: /src/components/StarRating.js
"use client";

import { useState } from "react";

export default function StarRating({ onChange, initialValue = 0 }) {
  const [rating, setRating] = useState(initialValue);
  const [hoverRating, setHoverRating] = useState(0);

  function handleClick(stars) {
    setRating(stars);
    if (onChange) onChange(stars);
  }

  return (
    <div className="flex space-x-1" role="radiogroup" aria-label="Rating selector">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={rating === star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={star <= (hoverRating || rating) ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 cursor-pointer text-amber-400 hover:scale-110 transition-transform"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 17.75l-5.451 3.191 1.08-5.772L2.25 10.23l5.88-.492L12 4.5l3.87 5.238 5.88.492-3.379 4.939 1.08 5.772z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}