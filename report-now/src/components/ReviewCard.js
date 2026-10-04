// File: /src/components/ReviewCard.js
"use client";

import { User2 } from "lucide-react";

export default function ReviewCard({ review }) {
  const safeRating = Math.max(0, Math.min(5, Math.round(Number(review?.rating) || 0)));

  const stars = (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${safeRating} out of 5 stars`}
    >
      {Array.from({ length: safeRating }, (_, i) => (
        <span key={`filled-${i}`} className="text-amber-400 text-lg">
          ★
        </span>
      ))}
      {Array.from({ length: 5 - safeRating }, (_, i) => (
        <span key={`empty-${i}`} className="text-gray-200 text-lg">
          ★
        </span>
      ))}
    </div>
  );

  return (
    <div className="p-4 border border-gray-200 rounded-xl shadow-xs bg-white">
      <div className="flex items-center">
        <User2 className="h-5 w-5 mt-0.5 mr-3 text-gray-400 shrink-0" />
        <div className="flex flex-grow justify-between items-center">
          <div className="text-base font-semibold text-gray-900">
            {review?.userName || "Anonymous Resident"}
          </div>
          <div>{stars}</div>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
        {review?.comment || "No comment provided."}
      </p>
      {review?.createdAt && (
        <p className="mt-2 text-xs text-gray-400">
          {new Date(review.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      )}
    </div>
  );
}
