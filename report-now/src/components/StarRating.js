// File: /src/components/StarRating.js
"use client";

import { useState } from "react";

export default function StarRating({ onChange, initialValue = 0 }) {
  const [rating, setRating] = useState(initialValue);

  function handleClick(stars) {
    setRating(stars);
    if (onChange) onChange(stars);
  }

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          onClick={() => handleClick(star)}
          xmlns="http://www.w3.org/2000/svg"
          fill={star <= rating ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 cursor-pointer text-yellow-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 17.75l-5.451 3.191 1.08-5.772L2.25 10.23l5.88-.492L12 4.5l3.87 5.238 5.88.492-3.379 4.939 1.08 5.772z"
          />
        </svg>
      ))}
    </div>
  );
}