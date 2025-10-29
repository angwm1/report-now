// File: /src/components/ReviewCard.js
"use client";

export default function ReviewCard({ review }) {
  // Create an array of star icons based on the rating.
  const stars = Array.from({ length: review.rating }, (_, i) => (
    <span key={i} className="text-yellow-500">&#9733;</span>
  ));
  // If you want to display 5 stars with empty stars for the remainder, uncomment below:
  // const stars = (
  //   <>
  //     {Array.from({ length: review.rating }, (_, i) => (
  //       <span key={`filled-${i}`} className="text-yellow-500">&#9733;</span>
  //     ))}
  //     {Array.from({ length: 5 - review.rating }, (_, i) => (
  //       <span key={`empty-${i}`} className="text-gray-300">&#9733;</span>
  //     ))}
  //   </>
  // );

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold">
          {review.userName || "Anonymous"}
        </div>
        <div className="flex">{stars}</div>
      </div>
      <p className="mt-2 text-gray-700">{review.comment || "No comment provided."}</p>
      <p className="mt-1 text-xs text-gray-500">
        {new Date(review.createdAt).toLocaleString()}
      </p>
    </div>
  );
}