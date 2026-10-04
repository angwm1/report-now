// File: /src/app/issues/[id]/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import TimelineSection from "@/components/TimelineSection";
import EditStatusForm from "@/components/EditStatusForm";
import LeaveReviewForm from "@/components/LeaveReviewForm";
import ReviewCard from "@/components/ReviewCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FaStar, FaStarHalfAlt, FaRegStar, FaArrowUp } from "react-icons/fa";
import { normalizeIdList, normalizeUserId } from "@/lib/normalize";

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [editingStatus, setEditingStatus] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [upvoteIds, setUpvoteIds] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Fetch issue details from API
  useEffect(() => {
    if (!params.id) return;
    const fetchIssue = async () => {
      try {
        const res = await fetch(`/api/issues/${params.id}`);
        if (!res.ok) throw new Error("Issue not found.");
        const data = await res.json();
        setIssue(data);
        setUpvoteIds(normalizeIdList(data.upvotes));
      } catch (err) {
        console.error("Error fetching issue:", err);
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchIssue();
  }, [params.id]);

  // Handler for updating issue after status change
  const handleStatusUpdate = useCallback(
    (updatedIssue) => {
      setIssue(updatedIssue);
      setUpvoteIds(normalizeIdList(updatedIssue.upvotes));
      setEditingStatus(false);
    },
    []
  );

  // Handler for timeline update
  const handleTimelineUpdate = useCallback(
    (updatedIssue) => {
      setIssue(updatedIssue);
      setUpvoteIds(normalizeIdList(updatedIssue.upvotes));
    },
    []
  );

  // Handler for review submission (refresh issue data)
  const handleReviewSubmit = useCallback(() => {
    // Re-fetch issue details after review submission
    const refreshIssue = async () => {
      try {
        const res = await fetch(`/api/issues/${params.id}`);
        if (!res.ok) throw new Error("Issue not found.");
        const data = await res.json();
        setIssue(data);
        setUpvoteIds(normalizeIdList(data.upvotes));
      } catch (err) {
        console.error("Error refreshing issue:", err);
      }
    };
    refreshIssue();
  }, [params.id]);

  const handleDeleteIssue = useCallback(async () => {
    if (!issue) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this issue? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setDeleteError("");
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/issues/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const message = error?.error || "Failed to delete issue.";
        setDeleteError(message);
        return;
      }

      router.push("/issues");
      router.refresh();
    } catch (error) {
      console.error("Error deleting issue:", error);
      setDeleteError("An unexpected error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }, [issue, params.id, router]);

  // Function to navigate between media items
  const navigateMedia = (index) => {
    setActiveMediaIndex(index);
  };

  const renderStarRating = (rating) => {
    if (!rating) return null;

    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5

    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i - 0.5 === roundedRating) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }

    return (
      <div className="flex items-center">
        <div className="flex mr-2">{stars}</div>
        <span className="text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading || sessionStatus === "loading") {
    return (
      <div
        className="max-w-4xl mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]"
        role="status"
        aria-live="polite"
      >
        <LoadingSpinner size="large" label="Loading issue details..." />
        <p className="mt-4 text-sm font-medium text-gray-500">
          Loading issue details...
        </p>
      </div>
    );
  }
  if (fetchError || !issue) {
    return (
      <div className="max-w-xl mx-auto p-6 my-10">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-3">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-red-900 mb-1">
            Unable to Display Issue
          </h2>
          <p className="text-sm text-red-700 mb-5">
            {fetchError || "The requested issue could not be found or has been removed."}
          </p>
          <Link
            href="/issues"
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors shadow-sm"
          >
            ← Back to All Issues
          </Link>
        </div>
      </div>
    );
  }

  const userIdRaw = session?.user?.id ?? null;
  const userId = normalizeUserId(userIdRaw);
  const isVotingAllowed =
    issue.status !== "Done" && issue.status !== "Rejected";
  const hasUpvoted = userId != null && upvoteIds.includes(userId);
  const canVote = isVotingAllowed && userId != null;
  const voteCount = upvoteIds.length;
  const isReporter = userId != null && issue.reporterId === userId;
  const duplicateIssueId = issue.duplicateId ?? issue.duplicateOf?.id ?? null;
  const duplicateIssueTitle = issue.duplicateOf?.title ?? "";
  const duplicateReason = issue.duplicateReason;

  const handleVote = async () => {
    if (!canVote || isVoting) {
      return;
    }

    setIsVoting(true);
    try {
      const response = await fetch(`/api/issues/${issue.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vote: "up" }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("Voting error:", error);
        return;
      }

      const updatedIssue = await response.json();
      setIssue(updatedIssue);
      setUpvoteIds(normalizeIdList(updatedIssue.upvotes));
    } catch (error) {
      console.error("Error submitting vote:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const voteButtonClasses = `p-2 rounded-full border transition disabled:opacity-50 disabled:cursor-not-allowed ${
    hasUpvoted
      ? "bg-red-500 border-red-600 text-white hover:bg-red-600"
      : "border-gray-300 text-gray-600 hover:bg-gray-100"
  }`;

  // Check if current citizen user has already left a review
  const userHasReviewed =
    session &&
    session.user &&
    issue.reviews &&
    issue.reviews.some((review) => review.userId === session.user.id);

  return (
    <div className="max-w-2xl mx-auto p-10 space-y-6 bg-white rounded-sm">
      {/* Media Section - Images Only */}
      {issue.mediaUrls && issue.mediaUrls.length > 0 && (
        <div className="space-y-2">
          <div className="relative h-84 w-full rounded overflow-hidden bg-gray-100">
            <Image
              src={issue.mediaUrls[activeMediaIndex]}
              alt={issue.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Media Thumbnails - only show if more than one image */}
          {issue.mediaUrls.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto py-2">
              {issue.mediaUrls.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => navigateMedia(idx)}
                  className={`relative h-16 w-16 flex-shrink-0 cursor-pointer rounded overflow-hidden border-2 ${
                    idx === activeMediaIndex
                      ? "border-primary-500"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={url}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-2xl font-bold">{issue.title}</h1>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-gray-700">
              {voteCount}
            </span>
            <button
              type="button"
              onClick={handleVote}
              disabled={!canVote || isVoting}
              className={voteButtonClasses}
              aria-label="Toggle upvote for issue"
            >
              <FaArrowUp />
            </button>
            {isReporter && (
            <>
              <button
                type="button"
                onClick={handleDeleteIssue}
                disabled={isDeleting}
                className="flex items-center justify-center rounded bg-red-500 px-3 py-1 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete Issue"}
              </button>
              {deleteError && (
                <p className="max-w-xs text-right text-xs text-red-600">
                  {deleteError}
                </p>
              )}
            </>
          )}
          </div>
        </div>
      </div>

      {duplicateIssueId && (
        <div className="rounded border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
          <p>
            This issue may be a duplicate of{" "}
            <Link
              href={`/issues/${duplicateIssueId}`}
              className="font-semibold underline"
            >
              Issue #{duplicateIssueId}
              {duplicateIssueTitle ? `: ${duplicateIssueTitle}` : ""}
            </Link>
            .
          </p>
          {duplicateReason && (
            <p className="mt-1 text-xs text-yellow-800">{duplicateReason}</p>
          )}
        </div>
      )}

      <p className="text-gray-600">{issue.description}</p>

      {/* Location, Status, Date */}
      <div class="h-px w-full bg-slate-200 my-6"></div>
      <div className="flex items-center space-x-2">
        <span className="font-semibold">Location:</span>
        <p>{issue.location || "Unknown"}</p>
      </div>

      <div className="flex items-center space-x-2">
        <span className="font-semibold">Status:</span>
        <p>{issue.status}</p>
        {session &&
          session.user &&
          session.user.role === "governmentDepartment" &&
          !editingStatus && (
            <button
              onClick={() => setEditingStatus(true)}
              className="bg-primary-500 text-white px-2 py-1 rounded hover:bg-primary-600 transition"
            >
              Edit
            </button>
          )}
        {editingStatus && (
          <EditStatusForm
            issueId={params.id}
            currentStatus={issue.status}
            onUpdate={handleStatusUpdate}
            onCancel={() => setEditingStatus(false)}
          />
        )}
      </div>

      <div className="flex items-center space-x-2">
        <span className="font-semibold">Reported At:</span>
        <p>{new Date(issue.createdAt).toLocaleString()}</p>
      </div>

      {issue.latestUpdate && (
        <div className="flex items-center space-x-2">
          <span className="font-semibold">Latest Update:</span>
          <p>{issue.latestUpdate}</p>
        </div>
      )}

      <div class="h-px w-full bg-slate-200 my-6"></div>

      {/* Timeline Update Section */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2">Timeline Updates</h2>
        {issue.timeline && issue.timeline.length > 0 ? (
          <ul className="space-y-2">
            {issue.timeline.map((update, idx) => (
              <li key={idx} className="border p-2 rounded">
                <p className="text-sm">{update.text}</p>
                <p className="text-xs text-gray-500">
                  {new Date(update.timestamp).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 text-sm">No timeline updates yet.</p>
        )}
        {session &&
          session.user &&
          session.user.role === "governmentDepartment" && (
            <TimelineSection
              issueId={params.id}
              currentTimeline={issue.timeline}
              onTimelineUpdate={handleTimelineUpdate}
            />
          )}
      </div>

      {/* Leave Review Section for citizen users */}
      {session &&
        session.user &&
        session.user.role === "citizen" &&
        !userHasReviewed && (
          <div className="mt-6">
            <LeaveReviewForm
              issueId={params.id}
              onReviewSubmit={handleReviewSubmit}
            />
          </div>
        )}

      {/* Reviews Section */}
      {issue.reviews && issue.reviews.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Reviews</h2>
            {issue.averageRating !== null && (
              <div className="flex items-center">
                <span className="font-semibold mr-2">Average Rating:</span>
                {renderStarRating(issue.averageRating)}
                <span className="text-sm ml-2 text-gray-500">
                  (from {issue.reviews.length}{" "}
                  {issue.reviews.length === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}
          </div>
          <ul className="space-y-2">
            {issue.reviews.map((review) => (
              <li key={review.id}>
                <ReviewCard review={review} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
