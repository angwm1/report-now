import LoadingSpinner from "../components/LoadingSpinner";

export default function Loading() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[50vh] px-4"
      role="status"
      aria-live="polite"
    >
      <LoadingSpinner size="large" label="Loading page..." />
      <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">
        Loading content...
      </p>
    </div>
  );
}
