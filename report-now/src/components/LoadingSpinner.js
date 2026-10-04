"use client";

export default function LoadingSpinner({
  size = "normal",
  overlay = false,
  label = "Loading...",
}) {
  const spinnerSize =
    {
      small: "h-6 w-6 border-2",
      normal: "h-12 w-12 border-2",
      large: "h-16 w-16 border-3",
    }[size] || "h-12 w-12 border-2";

  if (overlay) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-0 flex items-center justify-center bg-gray-500/50 z-50 pointer-events-none"
      >
        <div
          className={`animate-spin rounded-full ${spinnerSize} border-t-white border-r-transparent border-b-white border-l-transparent`}
        />
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex justify-center items-center py-8"
    >
      <div
        className={`animate-spin rounded-full ${spinnerSize} border-t-blue-600 border-r-transparent border-b-blue-600 border-l-transparent`}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
